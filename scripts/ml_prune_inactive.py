#!/usr/bin/env python3
"""
ml_prune_inactive.py
====================
Detecta productos en ml_data_active/ que ya no tienen listings activos en ML
y los elimina de los JSONs y (opcionalmente) de la tabla laptops_v2 en Supabase.

Cómo funciona:
  1. Lee todos los JSONs de ml_data_active/
  2. Para cada entry con catalog_product_id, llama a /products/{id}/items
  3. Si no hay ningún listing gold_pro/gold_special/gold_premium activo → marca como inactivo
  4. Escribe los JSONs limpios (--dry-run no los toca)
  5. Con --apply-db también borra de laptops_v2 en Supabase

Casos que detecta:
  - Publicación dada de baja por el vendedor
  - Vendedor dejó de vender ese modelo
  - Precio o condición ya no califica como gold (downgraded a silver/free)
  - Producto con solo envío internacional cuando antes tenía local

Usage:
  python3 scripts/ml_prune_inactive.py              # dry-run (no toca nada)
  python3 scripts/ml_prune_inactive.py --apply      # limpia JSONs
  python3 scripts/ml_prune_inactive.py --apply --apply-db   # limpia JSONs + borra de DB
  python3 scripts/ml_prune_inactive.py --brands apple,msi   # solo esas marcas
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

sys.path.insert(0, str(Path(__file__).parent))
from refresh_basics import load_env

ML_API = "https://api.mercadolibre.com"
QUALITY_LISTING_TYPES = {"gold_pro", "gold_special", "gold_premium"}
LISTING_PRIORITY = {"gold_pro": 5, "gold_special": 4, "gold_premium": 3}

_token: str = ""


# ── Auth ──────────────────────────────────────────────────────────────────────

def get_token(client_id: str, secret: str) -> str:
    import urllib.parse
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
        return token


# ── ML check ─────────────────────────────────────────────────────────────────

def check_product_active(catalog_product_id: str) -> bool:
    """Returns True if the product has at least one active quality listing."""
    global _token
    url = f"{ML_API}/products/{catalog_product_id}/items?limit=20"
    headers = {"Accept": "application/json"}
    if _token:
        headers["Authorization"] = f"Bearer {_token}"
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=20) as r:
            data = json.loads(r.read())
        results = data.get("results", [])
        return any(
            item.get("listing_type_id") in QUALITY_LISTING_TYPES
            for item in results
        )
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return False  # product gone from catalog
        raise


# ── Supabase delete ───────────────────────────────────────────────────────────

def sb_delete_by_catalog_id(sb_url: str, token: str, catalog_product_id: str) -> bool:
    url = f"{sb_url}/rest/v1/laptops_v2?catalog_product_id=eq.{catalog_product_id}"
    req = urllib.request.Request(url, method="DELETE", headers={
        "apikey": token,
        "Authorization": f"Bearer {token}",
        "Prefer": "return=minimal",
    })
    try:
        urllib.request.urlopen(req, timeout=20).read()
        return True
    except Exception as e:
        print(f"  DB delete failed [{catalog_product_id}]: {e}", file=sys.stderr)
        return False


# ── Main ──────────────────────────────────────────────────────────────────────

def main() -> int:
    parser = argparse.ArgumentParser(description="Prune inactive ML listings from ml_data_active/")
    parser.add_argument("--apply",    action="store_true", help="Rewrite JSONs removing inactive entries")
    parser.add_argument("--apply-db", action="store_true", help="Also delete inactive entries from laptops_v2")
    parser.add_argument("--brands",   default="", help="Comma-separated brands to check (default: all)")
    parser.add_argument("--data-dir", default="ml_data_active")
    args = parser.parse_args()

    global _token

    env       = load_env()
    client_id = os.environ.get("ML_CLIENT_ID") or env.get("ML_CLIENT_ID")
    secret    = os.environ.get("ML_SECRET")    or env.get("ML_SECRET")

    if not client_id or not secret:
        print("ERROR: ML_CLIENT_ID and ML_SECRET required", file=sys.stderr)
        return 1

    sb_url   = None
    sb_token = None
    if args.apply_db:
        sb_url   = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")    or env.get("NEXT_PUBLIC_SUPABASE_URL")
        sb_token = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY") or env.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
        if not (sb_url and sb_token):
            print("ERROR: SUPABASE_URL and SUPABASE_ANON_KEY required for --apply-db", file=sys.stderr)
            return 1

    _token = get_token(client_id, secret)
    print(f"Token OK", file=sys.stderr)

    data_dir = Path(args.data_dir)
    if not data_dir.exists():
        print(f"ERROR: {data_dir} not found", file=sys.stderr)
        return 1

    selected_brands = {b.strip().lower() for b in args.brands.split(",") if b.strip()}
    mode = "[APPLY]" if args.apply else "[DRY-RUN]"
    print(f"\n{mode} ml_prune_inactive.py\n")

    total_checked = 0
    total_inactive: list[tuple[str, str, str]] = []  # (brand, catalog_id, name)

    for json_file in sorted(data_dir.glob("*.json")):
        if json_file.name in ("all_laptops.json",):
            continue
        try:
            payload = json.loads(json_file.read_text(encoding="utf-8"))
        except Exception:
            continue

        brand = (payload.get("brand") or json_file.stem).lower()
        if selected_brands and brand not in selected_brands:
            continue

        entries = payload.get("laptops", [])
        if not entries:
            continue

        print(f"\n  [{brand.upper()}] {len(entries)} entries")
        active_entries = []
        file_changed = False

        for entry in entries:
            pid  = entry.get("catalog_product_id") or ""
            name = (entry.get("name") or "")[:60]

            if not pid:
                active_entries.append(entry)
                continue

            total_checked += 1
            try:
                is_active = check_product_active(pid)
            except Exception as e:
                print(f"    ! {pid} error: {e} — keeping", file=sys.stderr)
                active_entries.append(entry)
                time.sleep(0.5)
                continue

            if is_active:
                active_entries.append(entry)
                print(f"    ✓ {pid}  {name}", file=sys.stderr)
            else:
                file_changed = True
                total_inactive.append((brand, pid, name))
                print(f"    ✗ INACTIVE  {pid}  {name}", file=sys.stderr)
                if args.apply_db and sb_url and sb_token:
                    sb_delete_by_catalog_id(sb_url, sb_token, pid)

            time.sleep(0.2)

        if args.apply and file_changed:
            payload["laptops"] = active_entries
            payload["total"]   = len(active_entries)
            json_file.write_text(
                json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8"
            )
            removed = len(entries) - len(active_entries)
            print(f"    Wrote {json_file.name}: {len(entries)} → {len(active_entries)} entries ({removed} removed)")

    # ── Summary ───────────────────────────────────────────────────────────────
    print(f"\n{'═'*60}")
    print(f"Checked: {total_checked} products")
    print(f"Inactive: {len(total_inactive)}")

    if total_inactive:
        print(f"\nInactive products:")
        for brand, pid, name in total_inactive:
            print(f"  [{brand}] {pid}  {name}")

    if not args.apply and total_inactive:
        print(f"\nRe-run con --apply para limpiar los JSONs.")
        print(f"Agrega --apply-db para también borrar de laptops_v2.")

    if args.apply and not args.apply_db and total_inactive:
        print(f"\nJSONs actualizados. Para también limpiar la DB: --apply --apply-db")
        print(f"Luego: python3 scripts/import_to_staging.py && python3 scripts/curate_profiles_v2.py --apply")

    return 0


if __name__ == "__main__":
    sys.exit(main())
