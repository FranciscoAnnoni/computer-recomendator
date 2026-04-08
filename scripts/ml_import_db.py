#!/usr/bin/env python3
"""
ml_import_db.py
Reads ml_data/*.json and inserts/upserts laptops into Supabase.

Usage:
  export $(grep SUPABASE .env.local | xargs)
  python3 scripts/ml_import_db.py

  python3 scripts/ml_import_db.py --dir ml_data --dry-run

Options:
  --dir PATH      Directory with brand JSON files (default: ml_data)
  --brands        Comma-separated brands to import (default: all files in dir)
  --dry-run       Print what would be inserted, don't write to DB
  --clear         DELETE all laptops from DB before importing
  --only-with-affiliate  Only import laptops that have an affiliate_link set
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


# ── Load env ──────────────────────────────────────────────────────────────────

def load_env(path=".env.local") -> dict:
    env = {}
    try:
        with open(path) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    env[k.strip()] = v.strip()
    except FileNotFoundError:
        pass
    return env


# ── Supabase REST helpers ─────────────────────────────────────────────────────

def supabase_request(url: str, method: str, token: str, body=None) -> dict:
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(
        url,
        data=data,
        method=method,
        headers={
            "apikey": token,
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Prefer": "return=minimal",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            resp = r.read()
            return json.loads(resp) if resp.strip() else {}
    except urllib.error.HTTPError as e:
        body_str = e.read().decode()
        print(f"HTTP {e.code}: {body_str[:300]}", file=sys.stderr)
        raise


def clear_laptops(base_url: str, token: str):
    url = f"{base_url}/rest/v1/laptops?id=neq.00000000-0000-0000-0000-000000000000"
    supabase_request(url, "DELETE", token)
    print("✓ Cleared all laptops from DB", file=sys.stderr)


def insert_batch(base_url: str, token: str, rows: list, dry_run: bool):
    if dry_run:
        for r in rows:
            print(f"  [dry-run] {r['brand']:<12} | {r['price']:>10,} ARS | {r['name'][:60]}")
        return len(rows)

    url = f"{base_url}/rest/v1/laptops"
    # Use upsert via POST with Prefer: resolution=merge-duplicates not available on anon
    # Simple insert — if you re-run, clear first or use --clear
    req = urllib.request.Request(
        url,
        data=json.dumps(rows).encode(),
        method="POST",
        headers={
            "apikey": token,
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Prefer": "return=minimal",
        },
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        r.read()
    return len(rows)


# ── Map JSON fields to DB columns ─────────────────────────────────────────────

def to_db_row(laptop: dict) -> dict:
    """Map a laptop JSON entry to the laptops table schema."""
    # Use affiliate_link if filled, otherwise fall back to permalink
    affiliate = laptop.get("affiliate_link") or laptop.get("permalink") or ""

    return {
        "name":                 laptop.get("name") or "Sin nombre",
        "brand":                laptop.get("brand") or "Desconocida",
        "price":                laptop.get("price") or 0,
        "cpu":                  laptop.get("cpu") or "Ver descripción",
        "ram":                  laptop.get("ram") or "Ver descripción",
        "gpu":                  laptop.get("gpu") or "Integrada",
        "storage":              laptop.get("storage") or "Ver descripción",
        "os":                   laptop.get("os"),
        "screen_size":          laptop.get("screen_size"),
        "weight":               laptop.get("weight"),
        "battery":              laptop.get("battery"),
        "simplified_tags":      laptop.get("simplified_tags") or [],
        "usage_profiles":       laptop.get("usage_profiles") or [],
        "influencer_note":      laptop.get("influencer_note") or "",
        "recommendation_score": laptop.get("recommendation_score") or 6,
        "affiliate_link":       affiliate,
        "image_url":            laptop.get("image_url") or "",
        "description":          laptop.get("description") or "",
        "gallery_images":       laptop.get("gallery_images") or [],
        "availability_warning": laptop.get("availability_warning") or False,
    }


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dir",                  default="ml_data")
    parser.add_argument("--brands",               default="")
    parser.add_argument("--dry-run",              action="store_true")
    parser.add_argument("--clear",                action="store_true")
    parser.add_argument("--only-with-affiliate",  action="store_true")
    args = parser.parse_args()

    env = load_env()
    supabase_url   = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")   or env.get("NEXT_PUBLIC_SUPABASE_URL")
    supabase_token = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY") or env.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

    if not supabase_url or not supabase_token:
        print("Error: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY required", file=sys.stderr)
        sys.exit(1)

    data_dir = Path(args.dir)
    if not data_dir.exists():
        print(f"Error: directory '{args.dir}' not found. Run ml_scrape_laptops.py first.", file=sys.stderr)
        sys.exit(1)

    # Pick files to import
    if args.brands:
        files = [data_dir / f"{b.strip()}.json" for b in args.brands.split(",") if b.strip()]
    else:
        files = sorted(data_dir.glob("*.json"))

    if not files:
        print(f"No JSON files found in {args.dir}", file=sys.stderr)
        sys.exit(1)

    if args.dry_run:
        print("[DRY RUN — no writes to DB]\n")

    if args.clear and not args.dry_run:
        clear_laptops(supabase_url, supabase_token)

    total_inserted = 0
    total_skipped  = 0

    for json_file in files:
        if not json_file.exists():
            print(f"File not found: {json_file}, skipping.", file=sys.stderr)
            continue

        with open(json_file, encoding="utf-8") as f:
            data = json.load(f)

        brand    = data.get("brand", json_file.stem)
        laptops  = data.get("laptops", [])
        print(f"\n── {brand} ({len(laptops)} entries in file)")

        rows = []
        skipped = 0
        for laptop in laptops:
            if args.only_with_affiliate and not laptop.get("affiliate_link"):
                skipped += 1
                continue
            rows.append(to_db_row(laptop))

        if skipped:
            print(f"   Skipped {skipped} without affiliate_link")
        if not rows:
            print(f"   Nothing to insert.")
            total_skipped += skipped
            continue

        # Insert in batches of 50
        BATCH = 50
        for i in range(0, len(rows), BATCH):
            batch = rows[i : i + BATCH]
            inserted = insert_batch(supabase_url, supabase_token, batch, args.dry_run)
            total_inserted += inserted
            if not args.dry_run:
                print(f"   Inserted {i + inserted}/{len(rows)}")
            time.sleep(0.1)

        total_skipped += skipped

    print(f"\n{'═'*50}")
    print(f"Done. Inserted: {total_inserted} | Skipped: {total_skipped}")
    if not args.dry_run:
        print(f"Check your Supabase dashboard to verify.")


if __name__ == "__main__":
    main()
