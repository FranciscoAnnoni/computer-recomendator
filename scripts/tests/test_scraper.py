"""Stub tests for scripts/refresh_catalog.py — Plan 02 fills these in."""
import pytest

refresh_catalog = pytest.importorskip(
    "scripts.refresh_catalog",
    reason="scripts/refresh_catalog.py is created in Plan 02",
)


def test_scrape_active_products_returns_list(ml_products_search_apple, monkeypatch):
    """Scraper should return a list of laptop dicts when ML returns products."""
    monkeypatch.setattr(refresh_catalog, "fetch", lambda url, *a, **kw: ml_products_search_apple)
    results = refresh_catalog.scrape_active_products(brands=["apple"], per_brand=5)
    assert isinstance(results, list)
    if results:
        assert "catalog_product_id" in results[0]
        assert "affiliate_link" in results[0]


def test_scrape_dedups_by_catalog_id(ml_products_search_apple, monkeypatch):
    """Repeated catalog product IDs must be deduplicated."""
    monkeypatch.setattr(refresh_catalog, "fetch", lambda url, *a, **kw: ml_products_search_apple)
    results = refresh_catalog.scrape_active_products(brands=["apple"], per_brand=5)
    ids = [r.get("catalog_product_id") for r in results]
    assert len(ids) == len(set(ids)), "duplicate catalog_product_ids in output"
