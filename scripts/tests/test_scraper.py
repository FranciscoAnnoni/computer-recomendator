"""Tests for scripts.refresh_catalog scrape and detect_stale_products."""
import scripts.refresh_catalog as rc
import scripts.refresh_basics as rb


def test_scrape_active_products_smoke(monkeypatch, ml_products_search_apple,
                                      ml_product_items_active):
    """Smoke test: monkeypatch ml_fetch_active to return canned data."""
    # Patch the search to return our fixture's results list
    monkeypatch.setattr(rc.mlfa, "search_catalog_products",
                        lambda q, b, lim: ml_products_search_apple["results"])
    monkeypatch.setattr(rc.mlfa, "get_best_item",
                        lambda pid: ml_product_items_active["results"][0])
    monkeypatch.setattr(rc.mlfa, "get_product_details",
                        lambda pid: ml_products_search_apple["results"][0])
    # Limit BRAND_SEARCHES to one entry so the loop completes quickly
    monkeypatch.setattr(rc.mlfa, "BRAND_SEARCHES",
                        [("macbook air", "Apple", "Apple")])
    results = rc.scrape_active_products(brands=["apple"], per_brand=5, ml_token="fake")
    assert isinstance(results, list)
    assert len(results) >= 1
    assert results[0].get("catalog_product_id") == "MLA37740033"


def test_scrape_dedupes_by_catalog_id(monkeypatch, ml_products_search_apple,
                                      ml_product_items_active):
    """Same product ID seen twice across queries must appear once."""
    # Two BRAND_SEARCHES entries both returning same product ID
    product = ml_products_search_apple["results"][0]
    monkeypatch.setattr(rc.mlfa, "search_catalog_products",
                        lambda q, b, lim: [product])
    monkeypatch.setattr(rc.mlfa, "get_best_item",
                        lambda pid: ml_product_items_active["results"][0])
    monkeypatch.setattr(rc.mlfa, "get_product_details", lambda pid: product)
    monkeypatch.setattr(rc.mlfa, "BRAND_SEARCHES", [
        ("macbook air", "Apple", "Apple"),
        ("macbook pro", "Apple", "Apple"),
    ])
    results = rc.scrape_active_products(brands=["apple"], per_brand=5, ml_token="fake")
    ids = [r.get("catalog_product_id") for r in results]
    assert len(ids) == len(set(ids))
    assert ids.count("MLA37740033") == 1


def test_attach_affiliate_links_uses_d2id():
    rows = [
        {"catalog_product_id": "MLA37740033", "name": "X", "affiliate_link": ""},
        {"catalog_product_id": None, "name": "Y", "affiliate_link": ""},
    ]
    rc.attach_affiliate_links(rows, "test-uuid")
    assert rows[0]["affiliate_link"] == "https://www.mercadolibre.com.ar/p/MLA37740033?matt_d2id=test-uuid"
    assert rows[1]["affiliate_link"] == ""  # null catalog id -> unchanged
