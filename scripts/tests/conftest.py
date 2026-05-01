import json
from pathlib import Path
import pytest

FIXTURES = Path(__file__).parent / "fixtures"


def _load(name: str) -> dict:
    return json.loads((FIXTURES / name).read_text(encoding="utf-8"))


@pytest.fixture
def ml_products_search_apple() -> dict:
    """ML /products/search?q=macbook response sample."""
    return _load("ml_products_search_apple.json")


@pytest.fixture
def ml_product_items_active() -> dict:
    """ML /products/{id}/items response with quality local listings."""
    return _load("ml_product_items_active.json")


@pytest.fixture
def ml_product_items_empty() -> dict:
    """ML /products/{id}/items with no quality listings (stale product)."""
    return _load("ml_product_items_empty.json")


@pytest.fixture
def db_laptops_sample() -> list[dict]:
    """Sample of existing DB rows (subset of laptops table)."""
    return _load("db_laptops_sample.json")


@pytest.fixture
def affiliate_d2id() -> str:
    """Test-only affiliate UUID — never hit network."""
    return "test-d2id-aaaa-bbbb-cccc-dddddddddddd"
