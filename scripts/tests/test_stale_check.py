"""Tests for scripts.refresh_basics.is_product_active."""
from scripts.refresh_basics import is_product_active


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
