"""Tests for scripts.refresh_basics.make_affiliate_link."""
from scripts.refresh_basics import make_affiliate_link


def test_affiliate_link_format(affiliate_d2id):
    link = make_affiliate_link("MLA37740033", affiliate_d2id)
    assert link == f"https://www.mercadolibre.com.ar/p/MLA37740033?matt_d2id={affiliate_d2id}"


def test_affiliate_link_no_d2id():
    link = make_affiliate_link("MLA37740033", "")
    assert link == "https://www.mercadolibre.com.ar/p/MLA37740033"
    assert "?" not in link


def test_affiliate_link_none_d2id():
    link = make_affiliate_link("MLA37740033", None)
    assert link == "https://www.mercadolibre.com.ar/p/MLA37740033"


def test_affiliate_link_idempotent(affiliate_d2id):
    a = make_affiliate_link("MLA37740033", affiliate_d2id)
    b = make_affiliate_link("MLA37740033", affiliate_d2id)
    assert a == b
