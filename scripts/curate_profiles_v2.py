#!/usr/bin/env python3
"""
curate_profiles_v2.py
=====================
Genera las recomendaciones para los 36 perfiles usando un árbol de filtros
y un mix de tiers por budget. Lee de laptops_v2, escribe en profile_recommendations.

Árbol de filtros (en orden):
  1. OS preference  → apple (macOS) o windows
  2. Lifestyle      → nómada (solo laptops) o escritorio (todo)
  3. Workload       → specs mínimos por categoría (productividad / diseño / gaming)
  4. Budget mix     → proporciones de tiers barata/mediana/cara por perfil

Budget mix:
  esencial:    3 baratas + 1 mediana + 1 cara
  equilibrado: 1 barata  + 3 medianas + 1 cara
  premium:     0 baratas + 2 medianas + 3 caras

Usage:
  python3 scripts/curate_profiles_v2.py                  # dry-run (default)
  python3 scripts/curate_profiles_v2.py --dry-run        # genera recommendation_preview.md
  python3 scripts/curate_profiles_v2.py --apply          # escribe en profile_recommendations
  python3 scripts/curate_profiles_v2.py --profile gaming_rendimiento,maxima_portabilidad,premium,windows
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
import urllib.request
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from refresh_basics import load_env

# ── Tiers de precio ───────────────────────────────────────────────────────────
# Estos rangos se calibran según los precios reales en la DB.
# Ajustar si el catálogo cambia mucho de precio (inflación ARS).

PRICE_TIERS = {
    "barata":  (0,           700_000),
    "mediana": (700_001,   1_800_000),
    "cara":    (1_800_001, 99_999_999),
}

# ── Mix de tiers por budget ───────────────────────────────────────────────────
# (tier, cantidad) — se leen en orden de preferencia para seleccionar las 5 laptops.

BUDGET_MIX: dict[str, list[tuple[str, int]]] = {
    "esencial":    [("barata", 3), ("mediana", 1), ("cara", 1)],
    "equilibrado": [("barata", 1), ("mediana", 3), ("cara", 1)],
    "premium":     [("mediana", 2), ("cara", 3)],
}

# ── Keywords para detectar GPU dedicada ──────────────────────────────────────
GPU_DEDICATED_KW = ["rtx", "gtx", "rx 6", "rx 7", "radeon rx", "geforce", "arc a"]

# ── Keywords para detectar desktops/mini PCs (excluidos en maxima_portabilidad)
DESKTOP_KW = ["mini pc", "mac mini", "mac studio", "nucbox", "minisforum", "gmktec", "desktop"]

# ── Helpers ───────────────────────────────────────────────────────────────────

def has_dedicated_gpu(laptop: dict) -> bool:
    combined = ((laptop.get("gpu") or "") + " " + (laptop.get("name") or "")).lower()
    return any(k in combined for k in GPU_DEDICATED_KW)


def is_desktop(laptop: dict) -> bool:
    return (laptop.get("form_factor") or "laptop") != "laptop"


def ram_gb(laptop: dict) -> int:
    m = re.search(r"(\d+)\s*gb", (laptop.get("ram") or "").lower())
    return int(m.group(1)) if m else 0


def tier_of(price: float | None) -> str:
    p = price or 0
    for tier, (lo, hi) in PRICE_TIERS.items():
        if lo <= p <= hi:
            return tier
    return "cara"


def price_fmt(price: float | None) -> str:
    if not price:
        return "—"
    return f"${price:,.0f}"


# ── Lógica de selección ───────────────────────────────────────────────────────

def select_for_profile(
    profile: dict,
    laptops: list[dict],
) -> list[dict]:
    """
    Devuelve hasta 5 laptops para el perfil, con campo 'tier' agregado.
    Si no hay suficientes en algún tier, se completa con el más cercano.
    """
    workload   = profile["workload"]
    lifestyle  = profile["lifestyle"]
    budget     = profile["budget"]
    os_pref    = profile["os_preference"]

    # ── Paso 1: OS ────────────────────────────────────────────────────────────
    if os_pref == "macos":
        pool = [l for l in laptops if "mac" in (l.get("os") or "").lower()]
    else:
        pool = [l for l in laptops if "windows" in (l.get("os") or "").lower()]

    # ── Paso 2: Lifestyle ─────────────────────────────────────────────────────
    if lifestyle == "maxima_portabilidad":
        pool = [l for l in pool if not is_desktop(l)]

    # ── Paso 3: Workload ──────────────────────────────────────────────────────
    if workload == "gaming_rendimiento" and os_pref != "macos":
        with_gpu = [l for l in pool if has_dedicated_gpu(l)]
        if len(with_gpu) >= 3:
            pool = with_gpu
        elif with_gpu:
            # Fallback: ponemos los con GPU primero, completamos con el resto
            pool = with_gpu + [l for l in pool if not has_dedicated_gpu(l)]

    elif workload == "creacion_desarrollo" and os_pref != "macos":
        # GPU dedicada O RAM >= 16GB
        quality = [l for l in pool if has_dedicated_gpu(l) or ram_gb(l) >= 16]
        if len(quality) >= 3:
            pool = quality + [l for l in pool if l not in quality]

    elif workload == "productividad_estudio" and budget in ("equilibrado", "premium"):
        # Excluir las de solo 4 GB RAM para perfiles no esenciales
        decent_ram = [l for l in pool if ram_gb(l) >= 8]
        if len(decent_ram) >= 5:
            pool = decent_ram

    # ── Ordenar por score DESC dentro del pool ────────────────────────────────
    pool = sorted(pool, key=lambda l: (-(l.get("recommendation_score") or 0), l.get("price") or 0))

    # ── Caso especial: gaming + escritorio_fijo — mezclar desktops + laptops ──
    if workload == "gaming_rendimiento" and lifestyle == "escritorio_fijo" and os_pref != "macos":
        desktop_pool = [l for l in pool if is_desktop(l)]
        laptop_pool  = [l for l in pool if not is_desktop(l)]
        n_desktops   = min(2, len(desktop_pool))
        n_laptops    = 5 - n_desktops
        picks        = desktop_pool[:n_desktops] + laptop_pool[:n_laptops]
        # Complete si quedamos cortos
        used = {l["id"] for l in picks}
        for l in pool:
            if len(picks) >= 5:
                break
            if l["id"] not in used:
                picks.append(l)
                used.add(l["id"])
        return [dict(l, _tier=tier_of(l.get("price"))) for l in picks[:5]]

    # ── Paso 4: Mix de tiers ──────────────────────────────────────────────────
    mix = BUDGET_MIX[budget]
    tiers_pool: dict[str, list[dict]] = {
        "barata":  [l for l in pool if tier_of(l.get("price")) == "barata"],
        "mediana": [l for l in pool if tier_of(l.get("price")) == "mediana"],
        "cara":    [l for l in pool if tier_of(l.get("price")) == "cara"],
    }

    selected: list[dict] = []
    used_ids: set[str] = set()

    for tier_name, count in mix:
        candidates = [l for l in tiers_pool[tier_name] if l["id"] not in used_ids]
        picked = candidates[:count]
        for l in picked:
            l_copy = dict(l)
            l_copy["_tier"] = tier_name
            selected.append(l_copy)
            used_ids.add(l["id"])

    # Fallback si quedamos cortos: completar desde el pool general
    if len(selected) < 5:
        for l in pool:
            if l["id"] not in used_ids:
                l_copy = dict(l)
                l_copy["_tier"] = tier_of(l.get("price"))
                selected.append(l_copy)
                used_ids.add(l["id"])
                if len(selected) == 5:
                    break

    return selected[:5]


# ── Supabase helpers ──────────────────────────────────────────────────────────

def sb_get(url: str, token: str) -> list:
    req = urllib.request.Request(url, headers={
        "apikey": token, "Authorization": f"Bearer {token}", "Accept": "application/json",
    })
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.loads(r.read())


def sb_delete_profile_recs(sb_url: str, token: str, profile_id: str) -> None:
    url = f"{sb_url}/rest/v1/profile_recommendations?profile_id=eq.{profile_id}"
    req = urllib.request.Request(url, method="DELETE", headers={
        "apikey": token, "Authorization": f"Bearer {token}", "Prefer": "return=minimal",
    })
    urllib.request.urlopen(req, timeout=20).read()


def sb_insert_recs(sb_url: str, token: str, rows: list[dict]) -> bool:
    url = f"{sb_url}/rest/v1/profile_recommendations"
    data = json.dumps(rows).encode()
    req = urllib.request.Request(url, data=data, method="POST", headers={
        "apikey": token, "Authorization": f"Bearer {token}",
        "Content-Type": "application/json", "Prefer": "return=minimal",
    })
    try:
        urllib.request.urlopen(req, timeout=20).read()
        return True
    except Exception as e:
        print(f"  INSERT failed: {e}", file=sys.stderr)
        return False


# ── Main ──────────────────────────────────────────────────────────────────────

def main() -> int:
    parser = argparse.ArgumentParser(description="Curate profile recommendations v2")
    group  = parser.add_mutually_exclusive_group()
    group.add_argument("--dry-run", action="store_true", help="Generate preview file (default)")
    group.add_argument("--apply",   action="store_true", help="Write to profile_recommendations table")
    parser.add_argument(
        "--profile", default="",
        help="Run for a single profile: workload,lifestyle,budget,os_preference",
    )
    args   = parser.parse_args()
    apply  = args.apply

    env      = load_env()
    sb_url   = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")       or env.get("NEXT_PUBLIC_SUPABASE_URL")
    sb_token = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")  or env.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

    if not (sb_url and sb_token):
        print("ERROR: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY required", file=sys.stderr)
        return 1

    mode = "[APPLY]" if apply else "[DRY-RUN]"
    print(f"\n{mode} curate_profiles_v2.py\n")

    # Fetch data
    print("  Fetching laptops_v2 ...", end=" ", flush=True)
    laptops = sb_get(
        f"{sb_url}/rest/v1/laptops_v2?select=id,name,brand,price,cpu,ram,gpu,os,"
        f"form_factor,usage_profiles,recommendation_score,affiliate_link,image_url&limit=500",
        sb_token,
    )
    print(f"{len(laptops)} laptops")

    print("  Fetching profiles ...", end=" ", flush=True)
    all_profiles = sb_get(
        f"{sb_url}/rest/v1/profiles?select=id,workload,lifestyle,budget,os_preference,profile_name&limit=200",
        sb_token,
    )
    print(f"{len(all_profiles)} profiles")

    # Filter to single profile if --profile given
    if args.profile:
        parts = [p.strip() for p in args.profile.split(",")]
        if len(parts) != 4:
            print("ERROR: --profile needs exactly 4 values: workload,lifestyle,budget,os_preference", file=sys.stderr)
            return 1
        wl, ls, bd, os_ = parts
        all_profiles = [
            p for p in all_profiles
            if p["workload"] == wl and p["lifestyle"] == ls
            and p["budget"] == bd and p["os_preference"] == os_
        ]
        if not all_profiles:
            print(f"ERROR: No profile found for {args.profile}", file=sys.stderr)
            return 1

    # ── Run selection ─────────────────────────────────────────────────────────
    results: list[tuple[dict, list[dict]]] = []
    gaps: list[str] = []

    for profile in sorted(all_profiles, key=lambda p: (p["workload"], p["os_preference"], p["budget"])):
        picks = select_for_profile(profile, laptops)
        if len(picks) < 5:
            gaps.append(
                f"  GAP [{len(picks)}/5]: {profile.get('profile_name', '')} "
                f"({profile['workload']} + {profile['lifestyle']} + {profile['budget']} + {profile['os_preference']})"
            )
        results.append((profile, picks))

    # ── Output ────────────────────────────────────────────────────────────────
    if apply:
        patched = 0
        for profile, picks in results:
            sb_delete_profile_recs(sb_url, sb_token, profile["id"])
            rows = [
                {
                    "profile_id": profile["id"],
                    "laptop_id":  l["id"],
                    "rank":       i + 1,
                    "tier":       l["_tier"],
                }
                for i, l in enumerate(picks)
            ]
            if sb_insert_recs(sb_url, sb_token, rows):
                patched += 1
            time.sleep(0.05)
        print(f"\n  Written: {patched}/{len(results)} profiles → profile_recommendations")
    else:
        # Generate preview markdown
        lines = [
            f"# Recommendation Preview — {datetime.now().strftime('%Y-%m-%d %H:%M')}",
            f"",
            f"**Laptops en staging:** {len(laptops)}  |  **Perfiles:** {len(results)}",
            f"",
        ]

        current_workload = None
        for profile, picks in results:
            if profile["workload"] != current_workload:
                current_workload = profile["workload"]
                lines.append(f"\n---\n## {current_workload.upper()}\n")

            lines.append(
                f"### {profile.get('profile_name', 'Sin nombre')}  "
                f"`{profile['lifestyle']} · {profile['budget']} · {profile['os_preference']}`"
            )
            lines.append("")
            lines.append("| # | Tier    | Laptop                                        | Precio ARS   | CPU                  | RAM   | GPU                  |")
            lines.append("|---|---------|-----------------------------------------------|--------------|----------------------|-------|----------------------|")
            for i, l in enumerate(picks):
                tier   = l.get("_tier", "?")
                name   = (l.get("name") or "")[:45]
                price  = price_fmt(l.get("price"))
                cpu    = (l.get("cpu") or "")[:20]
                ram    = (l.get("ram") or "")[:5]
                gpu    = (l.get("gpu") or "")[:20]
                lines.append(f"| {i+1} | {tier:<7} | {name:<45} | {price:<12} | {cpu:<20} | {ram:<5} | {gpu:<20} |")
            lines.append("")

        if gaps:
            lines.append("\n---\n## GAPS (perfiles con < 5 laptops)\n")
            lines.extend(gaps)

        preview_path = Path("recommendation_preview.md")
        preview_path.write_text("\n".join(lines), encoding="utf-8")
        print(f"\n  Preview guardado en: {preview_path.resolve()}")
        print(f"  Revisá el archivo y luego corré: python3 scripts/curate_profiles_v2.py --apply")

    if gaps and not apply:
        print(f"\n  Gaps encontrados: {len(gaps)}")
        for g in gaps:
            print(g)

    return 0


if __name__ == "__main__":
    sys.exit(main())
