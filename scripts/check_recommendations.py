#!/usr/bin/env python3
"""
check_recommendations.py
========================
Audits every laptop assigned to at least one user profile.

For each recommended laptop:
  1. Verifies the ML affiliate link resolves correctly (not 404/redirected to category)
  2. Checks data quality: description, influencer_note, specs (cpu/ram/storage)
  3. Detects laptops hidden from users by the profile page's display filter bug

Outputs:
  - Console (PASS / WARN / FAIL per laptop)
  - scripts/recommendation_audit.json
  - scripts/recommendation_audit.md

Usage:
  cd /Users/FranciscoAnnoni/Proyectos/computer-recomendator
  python3 scripts/check_recommendations.py
  python3 scripts/check_recommendations.py --skip-links   # skip HTTP checks (faster)
  python3 scripts/check_recommendations.py --profile-id <uuid>
"""

import json
import os
import sys
import time
import argparse
import urllib.request
import urllib.error
import urllib.parse
from pathlib import Path
from datetime import datetime


# ── Constants ─────────────────────────────────────────────────────────────────

AFFILIATE_D2ID = "a3e2a9a0-f26e-4b8f-acf6-96f2b4d77f85"

# ML URLs that indicate a product redirect went to a bad destination
ML_BAD_DESTINATIONS = [
    "/listado/",
    "/categorias/",
    "/home/",
    "mercadolibre.com.ar/$",
    "/ofertas/",
    "mercadolibre.com.ar/?",
]

BROWSER_HEADERS = {
    "User-Agent":      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept":          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "es-AR,es;q=0.9,en;q=0.8",
}


# ── Env loader ────────────────────────────────────────────────────────────────

def load_env(path=".env.local") -> dict:
    env = {}
    try:
        with open(path) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    env[k.strip()] = v.strip().strip('"').strip("'")
    except FileNotFoundError:
        pass
    return env


# ── HTTP helpers ───────────────────────────────────────────────────────────────

class NoRedirectHandler(urllib.request.HTTPRedirectHandler):
    """Stop at the first redirect — capture status + Location without following."""
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None  # don't follow


def check_link(url: str, retries: int = 3) -> dict:
    """
    Returns:
      status:       "ok" | "redirect_ok" | "redirect_bad" | "not_found" | "blocked" | "no_link" | "error"
      http_code:    int
      final_url:    str
      redirect_to:  str or None
      notes:        list[str]
    """
    if not url or not url.strip():
        return {"status": "no_link", "http_code": 0, "final_url": "", "redirect_to": None, "notes": ["Sin affiliate_link"]}

    # Build opener that does NOT follow redirects
    no_follow_opener = urllib.request.build_opener(NoRedirectHandler())

    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers=BROWSER_HEADERS)
            with no_follow_opener.open(req, timeout=20) as r:
                # Got 200 directly (uncommon for ML catalog pages, but valid)
                final_url = r.url
                return {
                    "status":      "ok",
                    "http_code":   200,
                    "final_url":   final_url,
                    "redirect_to": None,
                    "notes":       [],
                }
        except urllib.error.HTTPError as e:
            code = e.code
            location = e.headers.get("Location", "")

            if code in (301, 302, 303, 307, 308):
                # Redirect — decide if it's good or bad
                if location:
                    bad = any(bad_frag in location for bad_frag in ML_BAD_DESTINATIONS)
                    # Also bad if redirect goes to mercadolibre homepage
                    if location.rstrip("/") in (
                        "https://www.mercadolibre.com.ar",
                        "https://mercadolibre.com.ar",
                    ):
                        bad = True
                    status = "redirect_bad" if bad else "redirect_ok"
                else:
                    status = "redirect_ok"
                return {
                    "status":      status,
                    "http_code":   code,
                    "final_url":   url,
                    "redirect_to": location,
                    "notes":       [f"Redirige a {location[:100]}"] if location else [],
                }

            if code == 404:
                return {"status": "not_found", "http_code": 404, "final_url": url, "redirect_to": None, "notes": ["404 — producto no encontrado"]}

            if code in (403, 406):
                # ML blocks bots aggressively — might still be valid
                if attempt < retries - 1:
                    time.sleep(4 + attempt * 3)
                    continue
                return {"status": "blocked", "http_code": code, "final_url": url, "redirect_to": None, "notes": [f"HTTP {code} — ML bloquea bots (puede ser válido)"]}

            if code in (429, 503):
                wait = 5 + 3 * attempt
                print(f" [rate-limit {code}, esperando {wait}s]", end="", flush=True)
                time.sleep(wait)
                continue

            return {"status": "error", "http_code": code, "final_url": url, "redirect_to": None, "notes": [f"HTTP {code}"]}

        except Exception as ex:
            if attempt < retries - 1:
                time.sleep(2)
                continue
            return {"status": "error", "http_code": 0, "final_url": url, "redirect_to": None, "notes": [str(ex)[:100]]}

    return {"status": "error", "http_code": 0, "final_url": url, "redirect_to": None, "notes": ["Max retries reached"]}


def http_get_json(url: str, token: str = None) -> tuple:
    headers = {"Accept": "application/json", "User-Agent": "Mozilla/5.0"}
    if token:
        headers["apikey"] = token
        headers["Authorization"] = f"Bearer {token}"
    for attempt in range(3):
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=20) as r:
                return r.status, json.loads(r.read())
        except urllib.error.HTTPError as e:
            if e.code in (429, 503):
                time.sleep(3 + 2 ** attempt)
                continue
            if e.code == 404:
                return 404, None
            return e.code, {"error": e.read().decode("utf-8", errors="ignore")[:200]}
        except Exception as ex:
            if attempt < retries - 1:
                time.sleep(1)
                continue
            return 0, {"error": str(ex)}
    return 0, None


# ── Supabase helpers ───────────────────────────────────────────────────────────

def sb_get(base_url: str, token: str, path: str, params: dict = None) -> list:
    url = f"{base_url}/rest/v1/{path}"
    if params:
        url += "?" + urllib.parse.urlencode(params)
    status, data = http_get_json(url, token=token)
    if status != 200 or data is None:
        print(f"  Supabase error ({status}): {path}", file=sys.stderr)
        if isinstance(data, dict) and "message" in data:
            print(f"  Detail: {data['message']}", file=sys.stderr)
        return []
    return data if isinstance(data, list) else []


# ── Quality scorers ────────────────────────────────────────────────────────────

def score_description(desc: str) -> dict:
    if not desc or len(desc.strip()) < 20:
        return {"grade": "poor", "issues": ["Sin descripción o demasiado corta"]}
    stripped = desc.strip()
    word_count = len(stripped.split())
    is_autogen = stripped.startswith("Notebook ") and word_count < 12
    if is_autogen:
        return {"grade": "basic", "issues": ["Descripción auto-generada (solo repite el nombre)"]}
    if word_count < 20:
        return {"grade": "basic", "issues": [f"Descripción muy corta ({word_count} palabras)"]}
    if word_count < 40:
        return {"grade": "basic", "issues": [f"Descripción corta ({word_count} palabras)"]}
    return {"grade": "good", "issues": []}


def score_influencer_note(note: str) -> dict:
    if not note or not note.strip():
        return {"present": False, "grade": "missing", "issues": ["Sin influencer_note — falta el hint de recomendación"]}
    stripped = note.strip()
    if len(stripped) < 30:
        return {"present": True, "grade": "weak", "issues": ["Influencer note muy corta (menos de 30 chars)"]}
    return {"present": True, "grade": "good", "issues": []}


def score_specs(laptop: dict) -> dict:
    issues = []
    for field, label in [("cpu", "CPU"), ("ram", "RAM"), ("storage", "Almacenamiento")]:
        val = (laptop.get(field) or "").strip()
        if not val or val.lower() in ("ver descripción", "ver descripcion"):
            issues.append(f"{label} faltante o genérico")
    return {"issues": issues}


def link_status_to_verdict_factor(link: dict) -> str:
    """Return 'fail'|'warn'|'ok' based on link check."""
    s = link.get("status", "")
    if s in ("not_found", "redirect_bad", "no_link"):
        return "fail"
    if s in ("blocked", "error"):
        return "warn"
    return "ok"  # ok, redirect_ok


def is_hidden_by_filter(laptop: dict) -> bool:
    """
    Profile page filters: only shows Apple OR (Windows AND no battery).
    Windows laptops WITH battery are invisible to users.
    Returns True if this laptop would be hidden.
    """
    brand = (laptop.get("brand") or "").lower()
    os_val = (laptop.get("os") or "").lower()
    battery = laptop.get("battery") or ""

    if "apple" in brand:
        return False  # always shown

    is_windows = "windows" in os_val
    has_battery = bool(battery and battery.strip())

    if is_windows and has_battery:
        return True  # HIDDEN by filter!

    if not is_windows:
        return True  # non-Apple non-Windows = also hidden (Mac mini, desktop PCs, Linux)

    return False


def compute_verdict(link_factor: str, desc_grade: str, note: dict, specs: dict) -> str:
    if link_factor == "fail":
        return "FAIL"
    all_issues = desc_grade == "poor" or not note.get("present") or link_factor == "warn"
    spec_issues = len(specs.get("issues", [])) >= 2
    if all_issues or spec_issues:
        return "WARN"
    if desc_grade == "basic" or specs.get("issues"):
        return "WARN"
    return "PASS"


# ── Report ─────────────────────────────────────────────────────────────────────

ICON = {"PASS": "✅", "WARN": "⚠️ ", "FAIL": "❌"}

def print_laptop(laptop: dict, link: dict, desc: dict, note: dict, specs: dict, verdict: str, n_profiles: int, hidden: bool):
    icon = ICON.get(verdict, "?")
    name = (laptop.get("name") or "")[:60]
    price = laptop.get("price") or 0
    lk_status = link.get("status", "?")
    lk_code = link.get("http_code", 0)
    lk_note = "; ".join(link.get("notes", []))

    print(f"{icon} [{verdict}] {name}")
    print(f"     Precio: ${price:,.0f}  |  Perfiles: {n_profiles}  |  Link: {lk_status} (HTTP {lk_code})")
    if lk_note:
        print(f"     🔗 {lk_note}")
    if hidden:
        print(f"     🚫 OCULTA en UI — filtro de profile page la excluye (OS={laptop.get('os')!r}, battery={laptop.get('battery')!r})")
    for iss in desc.get("issues", []) + note.get("issues", []) + specs.get("issues", []):
        print(f"     ⚡ {iss}")
    print()


def build_markdown(report: dict) -> str:
    ts = report["generated_at"]
    s = report["summary"]
    lines = [
        f"# Auditoría de Recomendaciones — {ts}",
        "",
        f"**{s['total']}** laptops · ✅ {s['pass']} PASS · ⚠️  {s['warn']} WARN · ❌ {s['fail']} FAIL",
    ]
    if s.get("hidden"):
        lines.append(f"⚠️  **{s['hidden']} laptops ocultas** por el filtro de profile/page.tsx")
    if s.get("missing_in_db"):
        lines.append(f"🔴 **{s['missing_in_db']} IDs fantasma** (en perfil pero no en DB)")
    lines += ["", "---", ""]

    for item in sorted(report["laptops"], key=lambda x: ("PASS" == x["verdict"], x["name"])):
        verdict = item["verdict"]
        icon = ICON.get(verdict, "?")
        price = item.get("price", 0)
        link = item.get("link_check", {})
        lines += [
            f"## {icon} {item['name']}",
            f"**Brand**: {item.get('brand','')}  |  **Veredicto**: {verdict}  |  **Perfiles**: {item.get('n_profiles',0)}",
            "",
            "| Campo | Valor |",
            "|-------|-------|",
            f"| Precio DB | ${price:,.0f} |",
            f"| Link status | {link.get('status','?')} (HTTP {link.get('http_code',0)}) |",
            f"| Descripción | {item.get('desc_grade','?')} |",
            f"| Influencer note | {'✓ presente' if item.get('has_influencer_note') else '✗ FALTA'} |",
            f"| CPU | {item.get('cpu','')} |",
            f"| RAM | {item.get('ram','')} |",
            f"| Storage | {item.get('storage','')} |",
            f"| OS | {item.get('os','')} |",
            f"| Battery | {item.get('battery','') or '(no especificado)'} |",
            f"| Oculta por filtro UI | {'🚫 SÍ' if item.get('hidden_by_filter') else 'No'} |",
            f"| Affiliate link | `{item.get('affiliate_link','')[:90]}` |",
            "",
        ]
        if item.get("influencer_note"):
            lines.append(f"> **Hint**: {item['influencer_note']}")
            lines.append("")
        all_issues = item.get("all_issues", [])
        if all_issues:
            lines.append("**Problemas:**")
            for iss in all_issues:
                lines.append(f"- {iss}")
            lines.append("")
        redirect_to = link.get("redirect_to")
        if redirect_to:
            lines.append(f"**Link redirige a**: `{redirect_to[:120]}`")
            lines.append("")
        lines += ["---", ""]

    return "\n".join(lines)


# ── Main ───────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--skip-links",  action="store_true", help="Skip HTTP link checks (faster)")
    parser.add_argument("--profile-id",  default="",         help="Audit only one profile UUID")
    parser.add_argument("--out-json",    default="scripts/recommendation_audit.json")
    parser.add_argument("--out-md",      default="scripts/recommendation_audit.md")
    args = parser.parse_args()

    env = load_env()
    sb_url   = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")       or env.get("NEXT_PUBLIC_SUPABASE_URL")
    sb_token = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")  or env.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

    if not sb_url or not sb_token:
        print("Error: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY required")
        sys.exit(1)

    print("\n══════════════════════════════════════════════")
    print("  Auditoría de Recomendaciones de Laptops")
    print("══════════════════════════════════════════════\n")

    # 1. Load profiles
    print("1. Cargando perfiles desde Supabase…")
    profiles = sb_get(sb_url, sb_token, "profiles", {
        "select": "id,profile_name,laptop_ids,workload,lifestyle,budget,os_preference",
        "limit":  "200",
    })
    if not profiles:
        print("  Error: no profiles returned")
        sys.exit(1)
    print(f"   → {len(profiles)} perfiles")

    if args.profile_id:
        profiles = [p for p in profiles if p.get("id") == args.profile_id]
        if not profiles:
            print(f"  Profile {args.profile_id} not found")
            sys.exit(1)

    # 2. Build laptop → profiles map
    laptop_to_profiles: dict = {}
    for p in profiles:
        for lid in (p.get("laptop_ids") or []):
            if lid not in laptop_to_profiles:
                laptop_to_profiles[lid] = []
            laptop_to_profiles[lid].append({"id": p["id"], "profile_name": p.get("profile_name", "")})

    unique_ids = list(laptop_to_profiles.keys())
    print(f"\n2. {len(unique_ids)} laptops únicas asignadas a perfiles")

    # 3. Fetch laptop records
    all_laptops = {}
    BATCH = 50
    for i in range(0, len(unique_ids), BATCH):
        batch = unique_ids[i:i+BATCH]
        ids_str = "(" + ",".join(batch) + ")"
        laptops = sb_get(sb_url, sb_token, "laptops", {
            "select": "id,name,brand,price,cpu,ram,storage,os,battery,affiliate_link,description,influencer_note,image_url",
            "id":     f"in.{ids_str}",
            "limit":  str(BATCH),
        })
        for l in laptops:
            all_laptops[l["id"]] = l
        time.sleep(0.1)

    print(f"   → {len(all_laptops)} laptops cargadas de DB")

    missing_ids = [lid for lid in unique_ids if lid not in all_laptops]
    if missing_ids:
        print(f"   🔴 {len(missing_ids)} IDs fantasma (en perfil pero no en DB):")
        for mid in missing_ids[:5]:
            profs = [p["profile_name"] for p in laptop_to_profiles[mid][:2]]
            print(f"      {mid} → usado en: {', '.join(profs)}")

    # 4. Audit
    print(f"\n3. Auditando {len(all_laptops)} laptops…")
    if args.skip_links:
        print("   (--skip-links: sin chequeo de HTTP)\n")
    else:
        print("   (chequeando links — puede tardar ~2-3 min…)\n")

    results = []
    counts  = {"PASS": 0, "WARN": 0, "FAIL": 0}
    n_hidden = 0

    for laptop_id, laptop in sorted(all_laptops.items(), key=lambda x: x[1].get("name", "")):
        name         = laptop.get("name", "Sin nombre")
        affiliate    = laptop.get("affiliate_link") or ""
        stored_price = laptop.get("price") or 0
        n_profiles   = len(laptop_to_profiles.get(laptop_id, []))

        print(f"  {name[:65]}…", end="", flush=True)

        # Link check
        if args.skip_links:
            link = {"status": "skipped", "http_code": 0, "final_url": affiliate, "redirect_to": None, "notes": []}
        else:
            link = check_link(affiliate)
            time.sleep(1.5)  # polite delay

        # Data quality
        desc  = score_description(laptop.get("description") or "")
        note  = score_influencer_note(laptop.get("influencer_note") or "")
        specs = score_specs(laptop)

        # Hidden by UI filter?
        hidden = is_hidden_by_filter(laptop)
        if hidden:
            n_hidden += 1

        # Verdict
        lf      = link_status_to_verdict_factor(link)
        verdict = compute_verdict(lf, desc["grade"], note, specs)
        # Hidden laptops always at least WARN
        if hidden and verdict == "PASS":
            verdict = "WARN"

        counts[verdict] = counts.get(verdict, 0) + 1
        print(f" {ICON.get(verdict)} {verdict}")

        print_laptop(laptop, link, desc, note, specs, verdict, n_profiles, hidden)

        all_issues = (
            (["Link inválido o no encontrado"] if lf == "fail" else []) +
            (["Link bloqueado — verificar manualmente"] if lf == "warn" else []) +
            desc.get("issues", []) +
            note.get("issues", []) +
            specs.get("issues", []) +
            (["OCULTA en UI — filtro de profile page la excluye"] if hidden else [])
        )

        results.append({
            "id":                laptop_id,
            "name":              name,
            "brand":             laptop.get("brand", ""),
            "price":             stored_price,
            "cpu":               laptop.get("cpu", ""),
            "ram":               laptop.get("ram", ""),
            "storage":           laptop.get("storage", ""),
            "os":                laptop.get("os", ""),
            "battery":           laptop.get("battery", ""),
            "affiliate_link":    affiliate,
            "influencer_note":   laptop.get("influencer_note") or "",
            "description":       (laptop.get("description") or "")[:200],
            "has_influencer_note": bool((laptop.get("influencer_note") or "").strip()),
            "desc_grade":        desc["grade"],
            "link_check":        link,
            "verdict":           verdict,
            "all_issues":        all_issues,
            "n_profiles":        n_profiles,
            "profiles":          laptop_to_profiles.get(laptop_id, []),
            "hidden_by_filter":  hidden,
        })

    # 5. Summary
    print("\n══════════════════════════════════════════════")
    print(f"  RESUMEN FINAL — {len(results)} laptops auditadas")
    print(f"  ✅ PASS : {counts.get('PASS', 0)}")
    print(f"  ⚠️  WARN : {counts.get('WARN', 0)}")
    print(f"  ❌ FAIL : {counts.get('FAIL', 0)}")
    if n_hidden:
        print(f"  🚫 OCULTAS (filtro UI): {n_hidden}")
    if missing_ids:
        print(f"  🔴 IDs fantasma: {len(missing_ids)}")
    print("══════════════════════════════════════════════\n")

    fails = [r for r in results if r["verdict"] == "FAIL"]
    warns = [r for r in results if r["verdict"] == "WARN"]

    if fails:
        print(f"❌ CRÍTICOS ({len(fails)}):")
        for r in fails:
            print(f"   • {r['name'][:60]}")
            for iss in r["all_issues"][:2]:
                print(f"       → {iss}")
        print()

    if warns:
        print(f"⚠️  ADVERTENCIAS ({len(warns)}):")
        for r in warns:
            print(f"   • {r['name'][:60]}")
            top_issues = r["all_issues"][:3]
            for iss in top_issues:
                print(f"       → {iss}")
        print()

    # 6. Save outputs
    report = {
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "summary": {
            "total":         len(results),
            "pass":          counts.get("PASS", 0),
            "warn":          counts.get("WARN", 0),
            "fail":          counts.get("FAIL", 0),
            "hidden":        n_hidden,
            "missing_in_db": len(missing_ids),
        },
        "laptops":     results,
        "missing_ids": missing_ids,
    }

    out_json = Path(args.out_json)
    out_json.parent.mkdir(parents=True, exist_ok=True)
    with open(out_json, "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
    print(f"✓ JSON: {out_json}")

    md_text = build_markdown(report)
    out_md = Path(args.out_md)
    with open(out_md, "w", encoding="utf-8") as f:
        f.write(md_text)
    print(f"✓ Markdown: {out_md}")


if __name__ == "__main__":
    main()
