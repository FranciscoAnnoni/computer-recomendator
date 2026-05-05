#!/usr/bin/env python3
"""
import_to_staging.py
====================
Lee los JSONs de ml_data_active/ y hace UPSERT en laptops_v2 (tabla de staging).

No toca la tabla laptops de producción.

Usage:
  python3 scripts/import_to_staging.py                    # importa todo ml_data_active/
  python3 scripts/import_to_staging.py --dry-run          # muestra qué va a insertar sin escribir
  python3 scripts/import_to_staging.py --brands apple,lenovo
  python3 scripts/import_to_staging.py --clear            # vacía laptops_v2 antes de importar
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from refresh_basics import load_env, make_affiliate_link

# ── Constants ─────────────────────────────────────────────────────────────────

DESKTOP_KEYWORDS = ["mini pc", "mac mini", "mac studio", "nucbox", "minisforum", "gmktec", "desktop"]
GPU_DEDICATED_KEYWORDS = ["rtx", "gtx", "rx 6", "rx 7", "radeon rx", "geforce", "arc a", "rtx 50", "rtx 40"]

PRICE_TIERS = {
    "barata":  (0,           700_000),
    "mediana": (700_001,   1_800_000),
    "cara":    (1_800_001, 99_999_999),
}

# ── Helpers ───────────────────────────────────────────────────────────────────

def infer_form_factor(name: str) -> str:
    n = name.lower()
    if any(k in n for k in DESKTOP_KEYWORDS):
        return "mini_pc"
    return "laptop"


def has_dedicated_gpu(gpu_text: str, name: str) -> bool:
    combined = (gpu_text + " " + name).lower()
    return any(k in combined for k in GPU_DEDICATED_KEYWORDS)


def extract_ram_gb(ram_text: str) -> int:
    m = re.search(r"(\d+)\s*gb", (ram_text or "").lower())
    return int(m.group(1)) if m else 0


def infer_usage_profiles(name: str, gpu: str) -> list[str]:
    text = (name + " " + gpu).lower()
    profiles = []
    if any(k in text for k in ["gaming", "rog", "tuf", "nitro", "legion", "predator", "omen", "victus", "alienware", "rtx", "gtx"]):
        profiles.append("gaming_rendimiento")
    if any(k in text for k in ["oled", "creator", "studio", "pro", "xps", "macbook", "spectre", "zenbook", "thinkpad", "matebook"]):
        profiles.append("creacion_desarrollo")
    if not profiles or any(k in text for k in ["ideapad", "vivobook", "aspire", "inspiron", "stream", "exo", "noblex", "bgh"]):
        profiles.append("productividad_estudio")
    return list(dict.fromkeys(profiles))  # dedupe preserving order


def infer_score(price: int | None, cpu: str, ram_gb: int, has_gpu: bool, listing_type: str) -> int:
    score = 5
    if price:
        if price > 3_000_000:   score += 2
        elif price > 1_500_000: score += 1
    cpu_lower = (cpu or "").lower()
    if any(k in cpu_lower for k in ["ryzen 7", "i7", "i9", "m3", "m4", "ultra 7", "core 7", "ryzen 9"]):
        score += 1
    if any(k in cpu_lower for k in ["m3 pro", "m4 pro", "m3 max", "m4 max", "rtx 40", "rtx 50"]):
        score += 1
    if ram_gb >= 32:   score += 1
    elif ram_gb <= 4:  score -= 1
    if has_gpu:        score += 1
    if listing_type == "gold_pro": score += 1
    return max(1, min(10, score))


def build_staging_row(entry: dict, d2id: str | None) -> dict:
    name         = entry.get("name") or ""
    gpu          = entry.get("gpu") or "Integrada"
    cpu          = entry.get("cpu") or ""
    ram          = entry.get("ram") or ""
    price        = entry.get("price")
    listing_type = entry.get("listing_type") or ""
    prod_id      = entry.get("catalog_product_id") or ""

    ram_gb       = extract_ram_gb(ram)
    dedicated_gpu = has_dedicated_gpu(gpu, name)
    form_factor  = infer_form_factor(name)
    profiles     = infer_usage_profiles(name, gpu)
    score        = infer_score(price, cpu, ram_gb, dedicated_gpu, listing_type)
    affiliate    = make_affiliate_link(prod_id, d2id) if prod_id else entry.get("permalink") or ""

    return {
        "name":                 name[:200],
        "brand":                entry.get("brand") or "Other",
        "price":                price,
        "original_price":       entry.get("original_price"),
        "cpu":                  cpu,
        "ram":                  ram,
        "gpu":                  gpu,
        "storage":              entry.get("storage") or "",
        "os":                   entry.get("os") or "",
        "screen_size":          entry.get("screen_size"),
        "weight":               entry.get("weight"),
        "battery":              None,
        "color":                entry.get("color"),
        "form_factor":          form_factor,
        "simplified_tags":      entry.get("simplified_tags") or [],
        "usage_profiles":       profiles,
        "recommendation_score": score,
        "influencer_note":      "",
        "description":          entry.get("description") or "",
        "affiliate_link":       affiliate,
        "image_url":            entry.get("image_url") or "",
        "gallery_images":       entry.get("gallery_images") or [],
        "catalog_product_id":   prod_id or None,
        "item_id":              entry.get("item_id") or "",
        "listing_type":         listing_type,
        "is_international":     entry.get("international_delivery") or False,
        "permalink":            entry.get("permalink") or "",
        "seller_nickname":      entry.get("seller_nickname") or "",
        "seller_power_status":  entry.get("seller_power_status") or "",
        "seller_level":         entry.get("seller_level") or "",
        "seller_transactions":  entry.get("seller_transactions") or 0,
        "highlight_rank":       entry.get("highlight_rank"),
        "availability_warning": False,
    }


# ── Supabase helpers ──────────────────────────────────────────────────────────

def sb_request(url: str, token: str, method: str = "GET", body: dict | None = None) -> dict | list | None:
    headers = {
        "apikey": token,
        "Authorization": f"Bearer {token}",
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
    }
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, method=method, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            content = r.read()
            return json.loads(content) if content else None
    except Exception as e:
        print(f"  HTTP error [{method} {url}]: {e}", file=sys.stderr)
        return None


def clear_staging(sb_url: str, token: str) -> None:
    url = f"{sb_url}/rest/v1/laptops_v2?id=neq.00000000-0000-0000-0000-000000000000"
    sb_request(url, token, method="DELETE")
    print("  laptops_v2 cleared.", file=sys.stderr)


def upsert_laptop(sb_url: str, token: str, row: dict) -> bool:
    url = f"{sb_url}/rest/v1/laptops_v2"
    headers = {
        "apikey": token,
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates,return=minimal",
    }
    data = json.dumps(row).encode()
    req = urllib.request.Request(url, data=data, method="POST", headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            r.read()
        return True
    except Exception as e:
        print(f"  UPSERT failed [{row.get('name', '')[:40]}]: {e}", file=sys.stderr)
        return False


# ── Main ──────────────────────────────────────────────────────────────────────

def main() -> int:
    parser = argparse.ArgumentParser(description="Import ML scraped data into laptops_v2 staging table")
    parser.add_argument("--dry-run",  action="store_true", help="Show rows without writing to DB")
    parser.add_argument("--clear",    action="store_true", help="Delete all rows in laptops_v2 before import")
    parser.add_argument("--brands",   default="", help="Comma-separated brands to import (default: all)")
    parser.add_argument("--data-dir", default="ml_data_active", help="Directory with brand JSONs")
    args = parser.parse_args()

    env       = load_env()
    sb_url    = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")    or env.get("NEXT_PUBLIC_SUPABASE_URL")
    sb_token  = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY") or env.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    d2id      = os.environ.get("ML_AFFILIATE_D2ID")            or env.get("ML_AFFILIATE_D2ID")

    if not (sb_url and sb_token):
        print("ERROR: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY required", file=sys.stderr)
        return 1

    mode = "[DRY-RUN]" if args.dry_run else "[APPLY]"
    print(f"\n{mode} import_to_staging.py\n")

    data_dir = Path(args.data_dir)
    if not data_dir.exists():
        print(f"ERROR: {data_dir} not found. Run ml_fetch_active.py first.", file=sys.stderr)
        return 1

    selected_brands = {b.strip().lower() for b in args.brands.split(",") if b.strip()}

    # Collect all entries from JSON files
    all_entries: list[dict] = []
    for json_file in sorted(data_dir.glob("*.json")):
        if json_file.name in ("all_laptops.json",):
            continue
        try:
            data = json.loads(json_file.read_text(encoding="utf-8"))
        except Exception:
            continue
        entries = data.get("laptops", [])
        brand = (data.get("brand") or json_file.stem).lower()
        if selected_brands and brand not in selected_brands:
            continue
        all_entries.extend(entries)

    print(f"  Found {len(all_entries)} entries across {data_dir}/")

    # Clear staging if requested
    if args.clear and not args.dry_run:
        clear_staging(sb_url, sb_token)

    # Build rows and import
    inserted = 0
    skipped  = 0

    for entry in all_entries:
        row = build_staging_row(entry, d2id)

        if args.dry_run:
            tier = next(
                (k for k, (lo, hi) in PRICE_TIERS.items() if lo <= (row["price"] or 0) <= hi),
                "unknown"
            )
            dedicated = has_dedicated_gpu(row["gpu"], row["name"])
            print(
                f"  [{row['brand']:<10}] [{tier:<7}] [{row['form_factor']:<8}] "
                f"[gpu={'ded' if dedicated else 'int'}] "
                f"${row['price'] or 0:>12,.0f}  {row['name'][:50]}"
            )
            inserted += 1
            continue

        if upsert_laptop(sb_url, sb_token, row):
            inserted += 1
        else:
            skipped += 1
        time.sleep(0.05)

    print(f"\n{'Would insert' if args.dry_run else 'Inserted/updated'}: {inserted} laptops")
    if skipped:
        print(f"  Failed: {skipped}")
    if not args.dry_run:
        print(f"\nNext: python3 scripts/curate_profiles_v2.py --dry-run")
    return 0


if __name__ == "__main__":
    sys.exit(main())
