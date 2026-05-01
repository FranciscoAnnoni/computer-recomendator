"""
refresh_basics.py
=================
Pure, testable helpers used by scripts/refresh_catalog.py.

No I/O at import time. No module-global mutable state (unlike ml_fetch_active.py).
"""

from __future__ import annotations
import json
import time
import urllib.error
import urllib.request
from pathlib import Path
from typing import Optional

ML_API = "https://api.mercadolibre.com"
ML_CATALOG_BASE = "https://www.mercadolibre.com.ar/p"

# Quality tiers we accept as "active sellers" — same set as ml_fetch_active.py
QUALITY_LISTING_TYPES = {"gold_pro", "gold_special", "gold_premium"}


def load_env(path: str = ".env.local") -> dict:
    """Read KEY=VALUE pairs from a dotenv-style file. Returns {} if file missing."""
    env: dict[str, str] = {}
    try:
        for line in Path(path).read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            env[k.strip()] = v.strip()
    except FileNotFoundError:
        pass
    return env


def make_affiliate_link(catalog_product_id: str, d2id: Optional[str]) -> str:
    """
    Build the canonical ML catalog product affiliate URL.
    Empty / None d2id returns the bare permalink (no `?matt_d2id` segment).
    """
    base = f"{ML_CATALOG_BASE}/{catalog_product_id}"
    if d2id:
        return f"{base}?matt_d2id={d2id}"
    return base


def fetch(url: str, token: Optional[str] = None, retries: int = 4):
    """
    HTTP GET with backoff. Returns parsed JSON dict, or None on 404 / final failure.
    Mirrors ml_fetch_active.fetch but takes token as an explicit argument
    instead of reading a module global — this makes monkeypatching trivial in tests.
    """
    for attempt in range(retries):
        try:
            headers = {"Accept": "application/json"}
            if token:
                headers["Authorization"] = f"Bearer {token}"
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=20) as r:
                return json.loads(r.read())
        except urllib.error.HTTPError as e:
            if e.code == 429:
                time.sleep(8 + attempt * 4)
                continue
            if e.code == 404:
                return None
            if attempt == retries - 1:
                return None
            time.sleep(1.5 * (attempt + 1))
        except Exception:
            if attempt == retries - 1:
                return None
            time.sleep(1.5 * (attempt + 1))
    return None


def is_product_active(catalog_product_id: str, token: Optional[str] = None,
                      fetch_fn=None) -> bool:
    """
    Returns True iff the ML catalog product has at least ONE local quality listing.
    Uses /products/{id}/items?limit=20.

    `fetch_fn` is an injection point for tests (defaults to module fetch).
    """
    f = fetch_fn or fetch
    url = f"{ML_API}/products/{catalog_product_id}/items?limit=20"
    data = f(url, token) if fetch_fn is None else f(url)
    if not data or not data.get("results"):
        return False
    for item in data["results"]:
        if (item.get("listing_type_id") in QUALITY_LISTING_TYPES
                and item.get("international_delivery_mode", "none") == "none"):
            return True
    return False
