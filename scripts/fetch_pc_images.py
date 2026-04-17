#!/usr/bin/env python3
"""
fetch_pc_images.py
==================
Fetches images for PCs that have empty image_url in Supabase.
Uses ML credentials from .env.local.

Usage:
  python3 scripts/fetch_pc_images.py
"""

import json
import os
import sys
import time
import urllib.request
import urllib.error
import urllib.parse
from pathlib import Path

ML_API = "https://api.mercadolibre.com"

# Map: Supabase UUID → ML product ID
PC_PRODUCTS = [
    {"id": "aa000001-0000-0000-0000-000000000001", "ml_id": "MLA44005785"},
    {"id": "aa000002-0000-0000-0000-000000000002", "ml_id": "MLA44123036"},
    {"id": "aa000003-0000-0000-0000-000000000003", "ml_id": "MLA64970949"},
    {"id": "aa000004-0000-0000-0000-000000000004", "ml_id": "MLA64663793"},
    {"id": "aa000005-0000-0000-0000-000000000005", "ml_id": "MLA51143808"},
    {"id": "aa000006-0000-0000-0000-000000000006", "ml_id": "MLA26013524"},  # RTX 3070 Ti (universal → try catalog)
    {"id": "aa000007-0000-0000-0000-000000000007", "ml_id": "MLA48791009"},
    {"id": "aa000008-0000-0000-0000-000000000008", "ml_id": "MLA48422891"},
    {"id": "aa000009-0000-0000-0000-000000000009", "ml_id": "MLA51114697"},
]


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


def get_token(client_id: str, secret: str) -> str:
    payload = urllib.parse.urlencode({
        "grant_type": "client_credentials",
        "client_id": client_id,
        "client_secret": secret,
    }).encode()
    req = urllib.request.Request(
        f"{ML_API}/oauth/token",
        data=payload,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=15) as r:
        data = json.loads(r.read())
    token = data.get("access_token")
    if not token:
        print(f"Auth error: {data}", file=sys.stderr)
        sys.exit(1)
    print(f"✓ Token OK", file=sys.stderr)
    return token


def fetch(url: str, token: str, retries: int = 3):
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers={
                "Accept": "application/json",
                "Authorization": f"Bearer {token}",
            })
            with urllib.request.urlopen(req, timeout=20) as r:
                return json.loads(r.read())
        except urllib.error.HTTPError as e:
            if e.code == 429:
                time.sleep(2 ** attempt)
                continue
            if e.code == 404:
                return None
            body = e.read().decode()
            print(f"HTTP {e.code} {url[:80]}: {body[:200]}", file=sys.stderr)
            return None
        except Exception as ex:
            if attempt < retries - 1:
                time.sleep(1)
                continue
            print(f"Error {url[:80]}: {ex}", file=sys.stderr)
            return None
    return None


def get_image_for_product(ml_id: str, token: str) -> str:
    """Fetch the main image URL for an ML catalog product."""
    data = fetch(f"{ML_API}/products/{ml_id}", token)
    if not data:
        print(f"  ✗ Product {ml_id} not found", file=sys.stderr)
        return ""

    pictures = data.get("pictures") or data.get("main_pictures") or []
    if pictures:
        url = pictures[0].get("url", "")
        # Use high-resolution version
        url = url.replace("-I.jpg", "-O.jpg").replace("-I.webp", "-O.webp")
        print(f"  ✓ {ml_id}: {url[:80]}", file=sys.stderr)
        return url

    print(f"  ✗ {ml_id}: no pictures found", file=sys.stderr)
    return ""


def update_supabase(supabase_url: str, anon_key: str, record_id: str, image_url: str) -> bool:
    """Update image_url for a laptop in Supabase via REST API."""
    url = f"{supabase_url}/rest/v1/laptops?id=eq.{record_id}"
    payload = json.dumps({"image_url": image_url}).encode()
    req = urllib.request.Request(
        url,
        data=payload,
        headers={
            "Content-Type": "application/json",
            "apikey": anon_key,
            "Authorization": f"Bearer {anon_key}",
            "Prefer": "return=minimal",
        },
        method="PATCH",
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            return r.status in (200, 204)
    except Exception as e:
        print(f"  Supabase error for {record_id}: {e}", file=sys.stderr)
        return False


def main():
    env = load_env()
    client_id = env.get("ML_CLIENT_ID") or os.environ.get("ML_CLIENT_ID", "")
    secret = env.get("ML_SECRET") or os.environ.get("ML_SECRET", "")
    supabase_url = env.get("NEXT_PUBLIC_SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "")
    anon_key = env.get("NEXT_PUBLIC_SUPABASE_ANON_KEY") or os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY", "")

    if not client_id or not secret:
        print("Missing ML_CLIENT_ID or ML_SECRET in .env.local", file=sys.stderr)
        sys.exit(1)
    if not supabase_url or not anon_key:
        print("Missing Supabase credentials in .env.local", file=sys.stderr)
        sys.exit(1)

    token = get_token(client_id, secret)

    updated = 0
    failed = []

    for pc in PC_PRODUCTS:
        rec_id = pc["id"]
        ml_id = pc["ml_id"]
        print(f"\n[{ml_id}]", file=sys.stderr)

        image_url = get_image_for_product(ml_id, token)
        if not image_url:
            failed.append(ml_id)
            continue

        ok = update_supabase(supabase_url, anon_key, rec_id, image_url)
        if ok:
            print(f"  ✓ Updated Supabase: {rec_id}", file=sys.stderr)
            updated += 1
        else:
            failed.append(ml_id)

        time.sleep(0.3)

    print(f"\n{'='*50}", file=sys.stderr)
    print(f"Updated: {updated}/{len(PC_PRODUCTS)}", file=sys.stderr)
    if failed:
        print(f"Failed: {failed}", file=sys.stderr)


if __name__ == "__main__":
    main()
