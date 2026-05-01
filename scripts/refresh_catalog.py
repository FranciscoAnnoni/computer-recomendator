#!/usr/bin/env python3
"""
refresh_catalog.py — Phase 12 annual catalog refresh orchestrator.

Pipeline:
  1. Load credentials from .env.local
  2. Fetch ML token (skipped in --dry-run --no-network)
  3. scrape_active_products() — pulls fresh catalog products by brand
     (delegates to ml_fetch_active.search_catalog_products + get_best_item)
  4. attach_affiliate_links() — sets row.affiliate_link via make_affiliate_link()
  5. fetch_db_catalog_rows() — reads existing DB rows w/ catalog_product_id
  6. detect_stale_products() — finds rows whose products are no longer active
  7. flag_stale() — sets availability_warning=true (NEVER deletes)
  8. upsert_to_db() — POST with Prefer: resolution=merge-duplicates,
     preserves manually-curated influencer_note and recommendation_score
  9. (optional --audit) run check_recommendations.py on the new state

Single-command annual run:
  python3 scripts/refresh_catalog.py
Dry-run (no DB writes):
  python3 scripts/refresh_catalog.py --dry-run --brands apple --per-brand 5
"""

from __future__ import annotations
import argparse
import json
import os
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

# Reuse existing, proven logic — DO NOT rewrite.
# (ml_fetch_active.py uses module-globals for token; we wrap it.)
sys.path.insert(0, str(Path(__file__).parent))
import ml_fetch_active as mlfa  # type: ignore

from refresh_basics import (
    ML_API,
    QUALITY_LISTING_TYPES,
    fetch,
    is_product_active,
    load_env,
    make_affiliate_link,
)


# ── Step 1: Scrape fresh catalog products ─────────────────────────────────
def scrape_active_products(brands: list[str] | None, per_brand: int,
                           ml_token: str | None = None) -> list[dict]:
    """
    Returns list of laptop dicts for the requested brands.
    Reuses ml_fetch_active.search_catalog_products + get_best_item +
    get_product_details + build_entry. Sets ml_fetch_active._token globally
    because that's how the existing module is wired (this is the single
    point of contact with that legacy state).
    """
    if ml_token:
        mlfa._token = ml_token
    out: list[dict] = []
    seen: set[str] = set()
    # Use the proven BRAND_SEARCHES table from ml_fetch_active
    for query, canonical_brand, brand_attr in mlfa.BRAND_SEARCHES:
        if brands and canonical_brand.lower() not in {b.lower() for b in brands}:
            continue
        products = mlfa.search_catalog_products(query, brand_attr or "", per_brand)
        for p in products:
            pid = p.get("id", "")
            if not pid or pid in seen:
                continue
            seen.add(pid)
            best = mlfa.get_best_item(pid)
            if not best:
                continue
            detail = mlfa.get_product_details(pid) or p
            entry = mlfa.build_entry(detail, best, {}, canonical_brand)
            # entry already has catalog_product_id; clear the empty affiliate_link
            # — Step 2 (attach_affiliate_links) fills it in.
            out.append(entry)
            time.sleep(0.25)
    return out


# ── Step 2: Attach affiliate links ────────────────────────────────────────
def attach_affiliate_links(rows: list[dict], d2id: str) -> list[dict]:
    for r in rows:
        cpid = r.get("catalog_product_id")
        if cpid:
            r["affiliate_link"] = make_affiliate_link(cpid, d2id)
    return rows


# ── Step 3: Fetch existing DB catalog rows ────────────────────────────────
def fetch_db_catalog_rows(supabase_url: str, token: str) -> list[dict]:
    """Reads up to 1000 laptops rows. Returns minimal projection for stale check."""
    url = (
        f"{supabase_url}/rest/v1/laptops"
        f"?select=id,catalog_product_id,name,influencer_note,recommendation_score,availability_warning"
        f"&limit=1000"
    )
    req = urllib.request.Request(url, headers={
        "apikey": token,
        "Authorization": f"Bearer {token}",
        "Accept": "application/json",
    })
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.loads(r.read())


# ── Step 4: Detect stale products ─────────────────────────────────────────
def detect_stale_products(db_rows: list[dict],
                          ml_token: str | None = None,
                          is_active_fn=None) -> list[dict]:
    """
    Returns subset of db_rows whose catalog_product_id is non-NULL but no
    longer has a quality local listing. Rows with NULL catalog_product_id
    are SKIPPED — manually-inserted laptops are preserved as-is.

    is_active_fn is an injection point for tests.
    """
    check = is_active_fn or (lambda cpid: is_product_active(cpid, token=ml_token))
    stale = []
    for row in db_rows:
        cpid = row.get("catalog_product_id")
        if not cpid:
            continue  # cannot check rows with NULL catalog ID
        if not check(cpid):
            stale.append(row)
        time.sleep(0.2)  # rate-limit-friendly
    return stale


# ── Step 5: Mark stale rows (NEVER delete) ────────────────────────────────
def flag_stale(stale_rows: list[dict], supabase_url: str, token: str,
               dry_run: bool = False) -> int:
    """PATCHes availability_warning=true. Returns count of rows updated."""
    count = 0
    for row in stale_rows:
        row_id = row["id"]
        if dry_run:
            print(f"  [dry-run] flag stale: {row_id} ({row.get('name', '')[:50]})")
            count += 1
            continue
        url = f"{supabase_url}/rest/v1/laptops?id=eq.{row_id}"
        req = urllib.request.Request(
            url,
            data=json.dumps({"availability_warning": True}).encode(),
            method="PATCH",
            headers={
                "apikey": token,
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
                "Prefer": "return=minimal",
            },
        )
        with urllib.request.urlopen(req, timeout=20) as r:
            r.read()
        count += 1
    return count


# ── Step 6: Upsert with merge-duplicates ──────────────────────────────────
def _to_upsert_row(laptop: dict) -> dict:
    """
    Build a row payload for POST /rest/v1/laptops. Includes catalog_product_id
    (the conflict target) and the fields we want to refresh. Does NOT include
    influencer_note or recommendation_score — those are preserved by the
    merge-duplicates strategy because we don't send them.
    """
    return {
        "catalog_product_id":   laptop.get("catalog_product_id"),
        "name":                 (laptop.get("name") or "")[:200] or "Sin nombre",
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
        "affiliate_link":       laptop.get("affiliate_link") or "",
        "image_url":            laptop.get("image_url") or "",
        "description":          laptop.get("description") or "",
        "gallery_images":       laptop.get("gallery_images") or [],
        "availability_warning": False,  # fresh scrape = active
    }


def upsert_to_db(rows: list[dict], supabase_url: str, token: str,
                 dry_run: bool = False) -> int:
    """
    POST with Prefer: resolution=merge-duplicates. Conflict target is
    catalog_product_id (UNIQUE per migration 06). Rows without
    catalog_product_id are skipped — they cannot be merged.
    """
    rows_with_id = [r for r in rows if r.get("catalog_product_id")]
    if not rows_with_id:
        return 0
    payloads = [_to_upsert_row(r) for r in rows_with_id]
    if dry_run:
        for p in payloads:
            print(f"  [dry-run] upsert: {p['catalog_product_id']:<14} ${p['price']:>10}  {p['name'][:55]}")
        return len(payloads)
    url = f"{supabase_url}/rest/v1/laptops"
    # Batch 50 at a time, same as ml_import_db.py
    BATCH = 50
    total = 0
    for i in range(0, len(payloads), BATCH):
        chunk = payloads[i : i + BATCH]
        req = urllib.request.Request(
            url,
            data=json.dumps(chunk).encode(),
            method="POST",
            headers={
                "apikey": token,
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
                "Prefer": "resolution=merge-duplicates,return=minimal",
            },
        )
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                r.read()
            total += len(chunk)
            print(f"  upserted {total}/{len(payloads)}")
        except urllib.error.HTTPError as e:
            body = e.read().decode()
            print(f"  HTTP {e.code}: {body[:300]}", file=sys.stderr)
            raise
        time.sleep(0.2)
    return total


# ── CLI ────────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="Annual MercadoLibre catalog refresh")
    parser.add_argument("--dry-run", action="store_true",
                        help="Print planned writes without hitting Supabase")
    parser.add_argument("--brands", default="",
                        help="Comma-separated brand names (default: all)")
    parser.add_argument("--per-brand", type=int, default=20,
                        help="Catalog products to query per brand (default: 20)")
    parser.add_argument("--skip-stale-check", action="store_true",
                        help="Skip /products/{id}/items checks against existing DB rows")
    parser.add_argument("--no-upsert", action="store_true",
                        help="Skip the upsert step (useful for diagnosing scrape only)")
    parser.add_argument("--audit", action="store_true",
                        help="Run scripts/check_recommendations.py at the end")
    args = parser.parse_args()

    env = load_env()
    ml_client_id = env.get("ML_CLIENT_ID") or os.environ.get("ML_CLIENT_ID")
    ml_secret    = env.get("ML_SECRET")    or os.environ.get("ML_SECRET")
    d2id         = env.get("ML_AFFILIATE_D2ID") or os.environ.get("ML_AFFILIATE_D2ID", "")
    sb_url       = env.get("NEXT_PUBLIC_SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    sb_token     = env.get("NEXT_PUBLIC_SUPABASE_ANON_KEY") or os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

    if not (ml_client_id and ml_secret):
        print("ERROR: ML_CLIENT_ID and ML_SECRET required (.env.local)", file=sys.stderr)
        sys.exit(1)
    if not (sb_url and sb_token):
        print("ERROR: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY required", file=sys.stderr)
        sys.exit(1)
    if not d2id:
        print("WARNING: ML_AFFILIATE_D2ID not set — affiliate links will lack tracking", file=sys.stderr)

    ml_token = mlfa.get_token(ml_client_id, ml_secret)
    mlfa._token = ml_token

    brands = [b.strip() for b in args.brands.split(",") if b.strip()] or None

    print("\n== STEP 1: Scrape active catalog products ==")
    fresh = scrape_active_products(brands=brands, per_brand=args.per_brand, ml_token=ml_token)
    print(f"  -> {len(fresh)} active catalog products scraped")

    print("\n== STEP 2: Attach affiliate links ==")
    attach_affiliate_links(fresh, d2id)
    with_links = sum(1 for r in fresh if r.get("affiliate_link"))
    print(f"  -> {with_links}/{len(fresh)} rows have affiliate_link set")

    if not args.skip_stale_check:
        print("\n== STEP 3: Detect stale products in existing DB ==")
        db_rows = fetch_db_catalog_rows(sb_url, sb_token)
        print(f"  -> {len(db_rows)} existing DB rows fetched")
        stale = detect_stale_products(db_rows, ml_token=ml_token)
        print(f"  -> {len(stale)} stale (no quality local listing)")
        print("\n== STEP 4: Flag stale rows (availability_warning=true) ==")
        flagged = flag_stale(stale, sb_url, sb_token, dry_run=args.dry_run)
        print(f"  -> {flagged} rows flagged")
    else:
        print("\n[skipped stale check]")

    if not args.no_upsert:
        print("\n== STEP 5: Upsert fresh data (preserves influencer_note + recommendation_score) ==")
        upserted = upsert_to_db(fresh, sb_url, sb_token, dry_run=args.dry_run)
        print(f"  -> {upserted} rows upserted")
    else:
        print("\n[skipped upsert]")

    if args.audit and not args.dry_run:
        print("\n== STEP 6: Audit ==")
        os.system("python3 scripts/check_recommendations.py --skip-links")

    print("\nRefresh complete.")


if __name__ == "__main__":
    main()
