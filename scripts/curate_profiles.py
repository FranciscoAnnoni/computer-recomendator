#!/usr/bin/env python3
"""
curate_profiles.py — Phase 13 profile curation script.

Three-stage pipeline:
  Stage 1: Enrich laptops (compute recommendation_score, fill missing influencer_note)
  Stage 2: Select 5 laptops per profile (OS -> budget -> workload -> lifestyle -> score -> brand diversity)
  Stage 3: PATCH profiles.laptop_ids for all 81 profiles

Usage:
  python3 scripts/curate_profiles.py --dry-run    # default — no DB writes
  python3 scripts/curate_profiles.py --apply      # writes to Supabase
  python3 scripts/curate_profiles.py --verbose    # per-laptop detail
"""
from __future__ import annotations
import argparse
import json
import os
import re
import sys
import urllib.parse
import urllib.request
from collections import defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from refresh_basics import load_env

# ── Module-level constants ────────────────────────────────────────────────────

EFFECTIVE_TIERS = {
    "esencial":    (0,         600_000),
    "equilibrado": (600_001,   1_500_000),
    "premium":     (1_500_001, 99_999_999),
}

GPU_KEYWORDS = ["rtx", "rx 6", "rx 7", "gtx", "radeon rx", "geforce"]

# Devices that require an external monitor + keyboard — never recommend to mobile/nomadic profiles
DESKTOP_ONLY_KEYWORDS = ["mini pc", "mac mini", "mac studio", "pc gamer", "nucbox", "minisforum", "gmktec"]

AFFILIATE_LINK_RE = re.compile(r"https://www\.mercadolibre\.com\.ar/p/MLA\d+\?matt_d2id=")

# ── Pure helpers ──────────────────────────────────────────────────────────────


def score_laptop(laptop: dict) -> int:
    """Returns 1-10 quality score. Deterministic — same input always yields same output."""
    score = 5

    # Affiliate link quality
    link = laptop.get("affiliate_link") or ""
    if AFFILIATE_LINK_RE.match(link):
        score += 2
    elif "mercadolibre.com.ar" not in link:
        score -= 2

    # influencer_note presence (>=30 chars)
    note = (laptop.get("influencer_note") or "").strip()
    if len(note) >= 30:
        score += 1

    # Description quality (>=40 words)
    desc = (laptop.get("description") or "").strip()
    if len(desc.split()) >= 40:
        score += 1

    # Hardware tier — GPU
    name_lower = (laptop.get("name") or "").lower()
    gpu_lower = (laptop.get("gpu") or "").lower()
    combined = name_lower + " " + gpu_lower
    if any(g in combined for g in ["rtx 40", "rtx 50", "rx 7", "m3", "m4"]):
        score += 2
    elif any(g in combined for g in ["rtx 3", "rtx 5", "rx 6", "m2"]):
        score += 1

    # RAM
    ram = (laptop.get("ram") or "").lower()
    if "32gb" in ram or "64gb" in ram:
        score += 1
    elif "4gb" in ram:
        score -= 1

    return max(1, min(10, score))


def has_dedicated_gpu(laptop: dict) -> bool:
    name = (laptop.get("name") or "").lower()
    gpu = (laptop.get("gpu") or "").lower()
    combined = name + " " + gpu
    return any(k in combined for k in GPU_KEYWORDS)


def is_desktop_only(laptop: dict) -> bool:
    """True for devices that need an external monitor + keyboard (mini PCs, Mac minis, PC Gamers)."""
    name = (laptop.get("name") or "").lower()
    return any(k in name for k in DESKTOP_ONLY_KEYWORDS)


def _get_apple_pins(pool: list[dict], budget: str, lifestyle: str) -> list[str]:
    """Returns ordered IDs to pin at the top of an Apple profile's recommendations.

    Rules (explicit from product spec):
      esencial → cheapest MacBook Neo is the 10/10 pick for any lifestyle
      premium + escritorio_fijo → Mac mini M4 (10/10) then MacBook Air M5 (9/10)
      premium + mobile → MacBook Air M5 (10/10)
    """
    pins: list[str] = []

    if budget == "esencial":
        neo = min(
            [l for l in pool if "macbook neo" in (l.get("name") or "").lower()],
            key=lambda l: l.get("price") or 99_999_999,
            default=None,
        )
        if neo:
            pins.append(neo["id"])

    elif budget == "premium":
        if lifestyle == "escritorio_fijo":
            mac_mini = min(
                [l for l in pool if "mac mini" in (l.get("name") or "").lower()],
                key=lambda l: l.get("price") or 99_999_999,
                default=None,
            )
            m5_air = next(
                (l for l in pool
                 if "m5" in (l.get("name") or "").lower()
                 and "air" in (l.get("name") or "").lower()),
                None,
            )
            for pick in [mac_mini, m5_air]:
                if pick:
                    pins.append(pick["id"])
        else:
            m5_air = next(
                (l for l in pool
                 if "m5" in (l.get("name") or "").lower()
                 and "air" in (l.get("name") or "").lower()),
                None,
            )
            if m5_air:
                pins.append(m5_air["id"])

    return pins


def generate_influencer_note(laptop: dict) -> str:
    brand = laptop.get("brand") or "Esta laptop"
    cpu = laptop.get("cpu") or ""
    ram = laptop.get("ram") or ""
    price = laptop.get("price") or 0
    tier = "gama alta" if price > 1_500_000 else "gama media" if price > 600_000 else "gama entrada"
    note = f"{brand} con {cpu}" if cpu else brand
    if ram:
        note += f" y {ram} RAM"
    note += f". Buena opcion de {tier} para este perfil."
    # Pad to >=30 chars if needed
    if len(note) < 30:
        note += " Recomendable para uso diario."
    return note[:200]


def _portability_score(laptop: dict) -> int:
    """Higher = more portable. Used as a soft sort key for maxima_portabilidad lifestyle."""
    weight = laptop.get("weight") or 999
    screen = laptop.get("screen_size") or 999
    s = 0
    if isinstance(weight, (int, float)) and weight <= 1.5:
        s += 2
    elif isinstance(weight, (int, float)) and weight <= 2.0:
        s += 1
    if isinstance(screen, (int, float)) and 13 <= screen <= 14.5:
        s += 2
    elif isinstance(screen, (int, float)) and 14.5 < screen <= 15:
        s += 1
    # Penalize PC Gamer desktop entries for portable profiles
    name = (laptop.get("name") or "").lower()
    if name.startswith("pc gamer"):
        s -= 5
    return s


def select_laptops_for_profile(profile: dict, all_laptops: list[dict],
                               effective_tiers: dict) -> list[str]:
    """Returns up to 5 laptop UUIDs for the profile. Algorithm per 13-RESEARCH.md."""
    workload = profile.get("workload")
    budget = profile.get("budget")
    os_pref = profile.get("os_preference")
    lifestyle = profile.get("lifestyle")

    # Step 1: OS filter
    if os_pref == "macos":
        pool = [l for l in all_laptops if "mac" in (l.get("os") or "").lower()]
    else:  # windows OR abierto both use Windows pool
        pool = [l for l in all_laptops if "windows" in (l.get("os") or "").lower()]

    # Step 2: Exclude desktop-only devices (mini PCs, Mac minis, PC Gamers) from portable profiles
    if lifestyle != "escritorio_fijo":
        pool = [l for l in pool if not is_desktop_only(l)]

    # Step 3: Gaming GPU requirement (windows/abierto only — Macs lack dedicated GPU)
    if workload == "gaming_rendimiento" and os_pref != "macos":
        gpu_pool = [l for l in pool if has_dedicated_gpu(l)]
        if len(gpu_pool) >= 5:
            pool = gpu_pool
        elif len(gpu_pool) > 0:
            # Fallback 1: keep gpu_pool, will pad later with non-gpu (warning logged in caller)
            pool = gpu_pool + [l for l in pool if not has_dedicated_gpu(l)]
    # gaming + macos: skip GPU filter — documented gap

    # Step 4: Budget filter with revised effective tiers
    tier_min, tier_max = effective_tiers.get(budget, (0, 99_999_999))
    budget_pool = [l for l in pool if tier_min <= (l.get("price") or 0) <= tier_max]
    if len(budget_pool) >= 5:
        pool = budget_pool
    elif len(budget_pool) > 0:
        # Keep budget pool plus widen by adding next-tier laptops
        pool = budget_pool + [l for l in pool if l not in budget_pool]
    # else: keep full pool (budget fallback)

    # Step 5: Workload preference (soft — usage_profiles array)
    workload_pool = [l for l in pool if workload in (l.get("usage_profiles") or [])]
    if len(workload_pool) >= 5:
        pool = workload_pool

    # Step 6: Lifestyle weighting (soft sort)
    if lifestyle == "maxima_portabilidad":
        pool = sorted(pool, key=_portability_score, reverse=True)

    # Step 7: Sort by recommendation_score DESC, then price ASC tiebreak
    pool = sorted(pool, key=lambda l: (
        -(l.get("recommendation_score") or 0),
        l.get("price") or 0,
    ))

    # Step 8: Brand diversity cap (max 2 per brand).
    # Pinned picks (profile-curated top choices) go first unconditionally.
    # Remaining slots: canonical affiliate links before non-canonical.
    pin_ids = _get_apple_pins(pool, budget, lifestyle) if os_pref == "macos" else []
    pinned = [l for pid in pin_ids for l in pool if l["id"] == pid]
    pin_id_set = set(pin_ids)
    rest = [l for l in pool if l["id"] not in pin_id_set]
    canonical_rest = [l for l in rest if AFFILIATE_LINK_RE.match(l.get("affiliate_link") or "")]
    non_canonical_rest = [l for l in rest if not AFFILIATE_LINK_RE.match(l.get("affiliate_link") or "")]
    ordered = pinned + canonical_rest + non_canonical_rest

    selected: list[str] = []
    brand_counts: dict[str, int] = defaultdict(int)
    for l in ordered:
        brand = (l.get("brand") or "unknown").lower()
        if brand_counts[brand] >= 2:
            continue
        selected.append(l["id"])
        brand_counts[brand] += 1
        if len(selected) == 5:
            break

    # Pad if still < 5 (relax brand cap)
    if len(selected) < 5:
        for l in ordered:
            if l["id"] not in selected:
                selected.append(l["id"])
                if len(selected) == 5:
                    break

    return selected

# ── Supabase HTTP helpers ─────────────────────────────────────────────────────


def fetch_laptops(sb_url: str, token: str) -> list[dict]:
    url = (
        f"{sb_url}/rest/v1/laptops"
        f"?select=id,name,brand,price,cpu,ram,gpu,storage,os,screen_size,weight,battery,"
        f"usage_profiles,affiliate_link,description,influencer_note,recommendation_score"
        f"&limit=1000"
    )
    req = urllib.request.Request(url, headers={
        "apikey": token, "Authorization": f"Bearer {token}", "Accept": "application/json",
    })
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.loads(r.read())


def fetch_profiles(sb_url: str, token: str) -> list[dict]:
    url = (
        f"{sb_url}/rest/v1/profiles"
        f"?select=id,workload,lifestyle,budget,os_preference,profile_name,laptop_ids"
        f"&limit=200"
    )
    req = urllib.request.Request(url, headers={
        "apikey": token, "Authorization": f"Bearer {token}", "Accept": "application/json",
    })
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.loads(r.read())


def patch_profile_laptops(sb_url: str, token: str, profile_id: str,
                          laptop_ids: list[str]) -> bool:
    url = f"{sb_url}/rest/v1/profiles?id=eq.{profile_id}"
    data = json.dumps({"laptop_ids": laptop_ids}).encode()
    req = urllib.request.Request(url, data=data, method="PATCH", headers={
        "apikey": token, "Authorization": f"Bearer {token}",
        "Content-Type": "application/json", "Prefer": "return=minimal",
    })
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            r.read()
        return True
    except Exception as e:
        print(f"  PATCH failed for profile {profile_id}: {e}", file=sys.stderr)
        return False


def patch_laptop(sb_url: str, token: str, laptop_id: str, updates: dict) -> bool:
    url = f"{sb_url}/rest/v1/laptops?id=eq.{laptop_id}"
    data = json.dumps(updates).encode()
    req = urllib.request.Request(url, data=data, method="PATCH", headers={
        "apikey": token, "Authorization": f"Bearer {token}",
        "Content-Type": "application/json", "Prefer": "return=minimal",
    })
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            r.read()
        return True
    except Exception as e:
        print(f"  PATCH failed for laptop {laptop_id}: {e}", file=sys.stderr)
        return False

# ── Orchestrator ──────────────────────────────────────────────────────────────


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Phase 13 profile curation")
    group = parser.add_mutually_exclusive_group()
    group.add_argument("--dry-run", action="store_true",
                       help="Print proposed assignments without writing (default)")
    group.add_argument("--apply", action="store_true",
                       help="Write scores + notes (Stage 1) and laptop_ids (Stage 3) to Supabase")
    parser.add_argument("--verbose", action="store_true", help="Per-laptop scoring detail")
    args = parser.parse_args(argv)

    # Default mode = dry-run
    apply_mode = args.apply
    dry_run = not apply_mode

    env = load_env()
    sb_url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL") or env.get("NEXT_PUBLIC_SUPABASE_URL")
    sb_token = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY") or env.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    if not (sb_url and sb_token):
        print("ERROR: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY required", file=sys.stderr)
        return 1

    mode_label = "[DRY-RUN]" if dry_run else "[APPLY]"
    print(f"\n{mode_label} curate_profiles.py — Phase 13 profile curation\n")

    # ── Stage 1: Enrich ───────────────────────────────────────────────
    print("== STAGE 1: Enrich laptop quality data ==")
    laptops = fetch_laptops(sb_url, sb_token)
    print(f"  fetched {len(laptops)} laptops")
    scored_count = 0
    notes_count = 0
    for l in laptops:
        new_score = score_laptop(l)
        old_score = l.get("recommendation_score")
        updates: dict = {}
        if old_score != new_score:
            updates["recommendation_score"] = new_score
            scored_count += 1
        current_note = (l.get("influencer_note") or "").strip()
        if not current_note:
            new_note = generate_influencer_note(l)
            updates["influencer_note"] = new_note
            l["influencer_note"] = new_note
            notes_count += 1
        l["recommendation_score"] = new_score  # in-memory for Stage 2
        if updates and apply_mode:
            patch_laptop(sb_url, sb_token, l["id"], updates)
        if args.verbose:
            print(f"  {l.get('name', '')[:50]:<50} score={new_score} updates={list(updates.keys())}")
    print(f"  -> scored {scored_count} laptops, generated {notes_count} influencer notes")

    # ── Stage 2: Select ───────────────────────────────────────────────
    print("\n== STAGE 2: Select 5 laptops per profile ==")
    profiles = fetch_profiles(sb_url, sb_token)
    print(f"  fetched {len(profiles)} profiles")

    assignments: list[tuple[dict, list[str]]] = []
    gaps: list[str] = []
    by_archetype: dict = defaultdict(list)

    for p in profiles:
        ids = select_laptops_for_profile(p, laptops, EFFECTIVE_TIERS)
        if len(ids) < 5:
            gaps.append(f"  GAP: {p.get('profile_name', p['id'])} got {len(ids)} laptops (workload={p['workload']}, os={p['os_preference']}, budget={p['budget']})")
        # gaming + macos warning
        if p.get("workload") == "gaming_rendimiento" and p.get("os_preference") == "macos":
            gaps.append(f"  GAMING-MAC GAP: {p.get('profile_name', p['id'])} — Macs have no dedicated GPU; assigned best macOS by score.")
        assignments.append((p, ids))
        key = (p.get("workload"), p.get("os_preference"))
        by_archetype[key].append((p.get("profile_name", p["id"]), ids))

    # Print archetype summary
    for (wl, os_p), entries in sorted(by_archetype.items()):
        print(f"\n  [{wl} + {os_p}]  ({len(entries)} profiles)")
        for name, ids in entries[:3]:  # sample first 3 per archetype
            print(f"    {name[:45]:<45} -> {len(ids)} laptops")
    if gaps:
        print("\n  Gaps:")
        for g in gaps:
            print(g)

    # ── Stage 3: Assign ───────────────────────────────────────────────
    print("\n== STAGE 3: PATCH profiles.laptop_ids ==")
    patched = 0
    if apply_mode:
        for p, ids in assignments:
            if patch_profile_laptops(sb_url, sb_token, p["id"], ids):
                patched += 1
        print(f"  -> PATCHed {patched}/{len(assignments)} profiles")
    else:
        print(f"  [dry-run] would PATCH {len(assignments)} profiles (use --apply to write)")
        patched = 0

    print(f"\n{len(profiles)} profiles processed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
