"""Stub tests for affiliate link generation — Plan 02 fills these in."""
import pytest

refresh_catalog = pytest.importorskip(
    "scripts.refresh_catalog",
    reason="scripts/refresh_catalog.py is created in Plan 02",
)


def test_affiliate_link_format(affiliate_d2id):
    link = refresh_catalog.make_affiliate_link("MLA37740033", affiliate_d2id)
    assert link == f"https://www.mercadolibre.com.ar/p/MLA37740033?matt_d2id={affiliate_d2id}"


def test_affiliate_link_no_d2id():
    link = refresh_catalog.make_affiliate_link("MLA37740033", "")
    assert link == "https://www.mercadolibre.com.ar/p/MLA37740033"
    assert "?" not in link


def test_affiliate_link_idempotent(affiliate_d2id):
    """Calling twice with same input produces same output."""
    a = refresh_catalog.make_affiliate_link("MLA37740033", affiliate_d2id)
    b = refresh_catalog.make_affiliate_link("MLA37740033", affiliate_d2id)
    assert a == b
