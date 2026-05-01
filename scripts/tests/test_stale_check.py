"""Tests for refresh_basics.is_product_active and refresh_catalog.detect_stale_products."""
from scripts.refresh_basics import is_product_active
import scripts.refresh_catalog as rc


def test_active_product_returns_true(ml_product_items_active):
    assert is_product_active("MLA37740033",
                             fetch_fn=lambda url: ml_product_items_active) is True


def test_empty_listings_returns_false(ml_product_items_empty):
    assert is_product_active("MLA99999999",
                             fetch_fn=lambda url: ml_product_items_empty) is False


def test_404_returns_false():
    assert is_product_active("MLA00000000", fetch_fn=lambda url: None) is False


def test_only_international_returns_false():
    only_intl = {"results": [
        {"item_id": "X", "price": 1, "listing_type_id": "gold_pro",
         "international_delivery_mode": "international"}
    ]}
    assert is_product_active("X", fetch_fn=lambda url: only_intl) is False


def test_only_silver_returns_false():
    only_silver = {"results": [
        {"item_id": "Y", "price": 1, "listing_type_id": "silver",
         "international_delivery_mode": "none"}
    ]}
    assert is_product_active("Y", fetch_fn=lambda url: only_silver) is False


def test_detect_stale_finds_stale_rows(db_laptops_sample):
    # Only the first sample row's product is "active"
    def fake_active(cpid):
        return cpid == "MLA37740033"
    stale = rc.detect_stale_products(db_laptops_sample, is_active_fn=fake_active)
    stale_ids = {row["id"] for row in stale}
    assert "22222222-2222-2222-2222-222222222222" in stale_ids
    assert "11111111-1111-1111-1111-111111111111" not in stale_ids
    # NULL catalog_product_id rows must be skipped (cannot be checked)
    assert "33333333-3333-3333-3333-333333333333" not in stale_ids


def test_detect_stale_skips_null_catalog_ids():
    rows = [{"id": "abc", "catalog_product_id": None, "name": "Manual entry"}]
    stale = rc.detect_stale_products(rows, is_active_fn=lambda c: False)
    assert stale == []
