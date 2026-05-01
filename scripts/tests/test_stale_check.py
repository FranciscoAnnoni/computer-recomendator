"""Stub tests for stale-seller detection — Plan 02 fills these in."""
import pytest

refresh_catalog = pytest.importorskip(
    "scripts.refresh_catalog",
    reason="scripts/refresh_catalog.py is created in Plan 02",
)


def test_active_product_returns_true(ml_product_items_active, monkeypatch):
    monkeypatch.setattr(refresh_catalog, "fetch", lambda url, *a, **kw: ml_product_items_active)
    assert refresh_catalog.is_product_active("MLA37740033") is True


def test_empty_listings_returns_false(ml_product_items_empty, monkeypatch):
    monkeypatch.setattr(refresh_catalog, "fetch", lambda url, *a, **kw: ml_product_items_empty)
    assert refresh_catalog.is_product_active("MLA99999999") is False


def test_404_returns_false(monkeypatch):
    monkeypatch.setattr(refresh_catalog, "fetch", lambda url, *a, **kw: None)
    assert refresh_catalog.is_product_active("MLA00000000") is False


def test_detect_stale_finds_stale_rows(db_laptops_sample, monkeypatch):
    """Given DB rows, returns IDs whose products are no longer active."""
    def fake_active(cpid):
        return cpid == "MLA37740033"  # only the first sample row is active
    monkeypatch.setattr(refresh_catalog, "is_product_active", fake_active)
    stale = refresh_catalog.detect_stale_products(db_laptops_sample)
    stale_ids = {row["id"] for row in stale}
    assert "22222222-2222-2222-2222-222222222222" in stale_ids
    assert "11111111-1111-1111-1111-111111111111" not in stale_ids
    # Rows with NULL catalog_product_id are SKIPPED (cannot be checked):
    assert "33333333-3333-3333-3333-333333333333" not in stale_ids
