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


@pytest.fixture
def sample_laptops() -> list[dict]:
    """20-laptop sample covering Windows/macOS, multiple brands, GPU/no-GPU, price tiers."""
    return [
        # 5 Windows esencial (<=600k)
        {"id": "11111111-1111-1111-1111-111111111101", "name": "Notebook Lenovo IdeaPad 3", "brand": "Lenovo",
         "price": 450_000, "os": "Windows 11", "ram": "8GB", "gpu": "Integrada", "weight": 1.65,
         "screen_size": 15.6, "affiliate_link": "https://www.mercadolibre.com.ar/p/MLA10000001?matt_d2id=test",
         "influencer_note": "Una opcion solida para estudiantes con presupuesto ajustado.",
         "description": "Lenovo IdeaPad 3 con procesador moderno, 8GB RAM y SSD rapido. Pantalla de 15.6 pulgadas. " * 5,
         "usage_profiles": ["productividad_estudio"]},
        {"id": "11111111-1111-1111-1111-111111111102", "name": "HP 15 i3", "brand": "HP",
         "price": 520_000, "os": "Windows 11", "ram": "8GB", "gpu": "Integrada", "weight": 1.7,
         "screen_size": 15.6, "affiliate_link": "https://www.mercadolibre.com.ar/p/MLA10000002?matt_d2id=test",
         "influencer_note": "HP confiable de gama entrada para tareas diarias.",
         "description": "HP 15 con Intel i3, 8GB RAM, almacenamiento SSD y pantalla full HD de 15.6 pulgadas. " * 5,
         "usage_profiles": ["productividad_estudio"]},
        {"id": "11111111-1111-1111-1111-111111111103", "name": "Notebook Acer Aspire 3", "brand": "Acer",
         "price": 480_000, "os": "Windows 11", "ram": "8GB", "gpu": "Integrada", "weight": 1.9,
         "screen_size": 15.6, "affiliate_link": "https://www.mercadolibre.com.ar/p/MLA10000003?matt_d2id=test",
         "influencer_note": None,  # missing on purpose
         "description": "Acer Aspire 3 con procesador Intel y SSD rapido para trabajo y estudio. " * 5,
         "usage_profiles": ["productividad_estudio"]},
        {"id": "11111111-1111-1111-1111-111111111104", "name": "Notebook Asus X515", "brand": "Asus",
         "price": 550_000, "os": "Windows 11", "ram": "8GB", "gpu": "Integrada", "weight": 1.8,
         "screen_size": 15.6, "affiliate_link": "https://www.mercadolibre.com.ar/p/MLA10000004?matt_d2id=test",
         "influencer_note": "Asus solido para tareas de oficina y estudio diario.",
         "description": "Asus X515 con Intel, 8GB RAM, SSD y pantalla de 15.6 pulgadas full HD. " * 5,
         "usage_profiles": ["productividad_estudio"]},
        {"id": "11111111-1111-1111-1111-111111111105", "name": "Notebook Dell Inspiron 15", "brand": "Dell",
         "price": 590_000, "os": "Windows 11", "ram": "8GB", "gpu": "Integrada", "weight": 1.75,
         "screen_size": 15.6, "affiliate_link": "https://www.mercadolibre.com.ar/p/MLA10000005?matt_d2id=test",
         "influencer_note": "Dell de confianza para uso general.",
         "description": "Dell Inspiron 15 con procesador moderno y SSD rapido para trabajo diario. " * 5,
         "usage_profiles": ["productividad_estudio"]},
        # 5 Windows equilibrado (600k-1.5M) with GPU
        {"id": "22222222-2222-2222-2222-222222222201", "name": "Lenovo Loq 15 RTX 4050", "brand": "Lenovo",
         "price": 1_300_000, "os": "Windows 11", "ram": "16GB", "gpu": "RTX 4050", "weight": 2.4,
         "screen_size": 15.6, "affiliate_link": "https://www.mercadolibre.com.ar/p/MLA20000001?matt_d2id=test",
         "influencer_note": "Notebook gamer con RTX 4050 ideal para gaming en gama media.",
         "description": "Lenovo Loq con Ryzen 7, 16GB RAM, RTX 4050 y pantalla de 15.6 pulgadas. " * 5,
         "usage_profiles": ["gaming_rendimiento"]},
        {"id": "22222222-2222-2222-2222-222222222202", "name": "HP Victus RTX 3050", "brand": "HP",
         "price": 1_400_000, "os": "Windows 11", "ram": "16GB", "gpu": "RTX 3050", "weight": 2.3,
         "screen_size": 15.6, "affiliate_link": "https://www.mercadolibre.com.ar/p/MLA20000002?matt_d2id=test",
         "influencer_note": "HP Victus con RTX 3050 para gaming accesible.",
         "description": "HP Victus 15 con Intel i5, 16GB RAM, RTX 3050 y SSD NVMe. " * 5,
         "usage_profiles": ["gaming_rendimiento"]},
        {"id": "22222222-2222-2222-2222-222222222203", "name": "Acer Nitro V16 Ryzen 5", "brand": "Acer",
         "price": 1_200_000, "os": "Windows 11", "ram": "16GB", "gpu": "RTX 4050", "weight": 2.5,
         "screen_size": 16.0, "affiliate_link": "https://www.mercadolibre.com.ar/p/MLA20000003?matt_d2id=test",
         "influencer_note": "Acer Nitro V16 con Ryzen 5 y RTX 4050 para gaming completo.",
         "description": "Acer Nitro V16 con Ryzen 5, 16GB RAM, RTX 4050 y pantalla de 16 pulgadas. " * 5,
         "usage_profiles": ["gaming_rendimiento"]},
        {"id": "22222222-2222-2222-2222-222222222204", "name": "Asus TUF F15 RTX 3060", "brand": "Asus",
         "price": 1_450_000, "os": "Windows 11", "ram": "16GB", "gpu": "RTX 3060", "weight": 2.3,
         "screen_size": 15.6, "affiliate_link": "https://www.mercadolibre.com.ar/p/MLA20000004?matt_d2id=test",
         "influencer_note": "Asus TUF F15 con RTX 3060 para gaming exigente.",
         "description": "Asus TUF F15 con Ryzen 7, 16GB RAM, RTX 3060 y panel 144Hz. " * 5,
         "usage_profiles": ["gaming_rendimiento"]},
        {"id": "22222222-2222-2222-2222-222222222205", "name": "MSI Cyborg RTX 4060", "brand": "MSI",
         "price": 1_490_000, "os": "Windows 11", "ram": "16GB", "gpu": "RTX 4060", "weight": 2.3,
         "screen_size": 15.6, "affiliate_link": "https://www.mercadolibre.com.ar/p/MLA20000005?matt_d2id=test",
         "influencer_note": "MSI Cyborg con RTX 4060 para gaming high-end.",
         "description": "MSI Cyborg con Intel i7, 16GB RAM, RTX 4060 y pantalla 144Hz. " * 5,
         "usage_profiles": ["gaming_rendimiento"]},
        # 5 Windows premium (>1.5M) - productivity
        {"id": "33333333-3333-3333-3333-333333333301", "name": "Lenovo ThinkPad X1 Carbon", "brand": "Lenovo",
         "price": 2_500_000, "os": "Windows 11", "ram": "16GB", "gpu": "Integrada", "weight": 1.1,
         "screen_size": 14.0, "affiliate_link": "https://www.mercadolibre.com.ar/p/MLA30000001?matt_d2id=test",
         "influencer_note": "ThinkPad X1 Carbon premium ultraliviano para profesionales.",
         "description": "Lenovo ThinkPad X1 Carbon con Intel i7, 16GB RAM, SSD 512GB, pantalla 14 pulgadas. " * 5,
         "usage_profiles": ["productividad_estudio", "creacion_desarrollo"]},
        {"id": "33333333-3333-3333-3333-333333333302", "name": "HP EliteBook 840", "brand": "HP",
         "price": 2_300_000, "os": "Windows 11", "ram": "16GB", "gpu": "Integrada", "weight": 1.4,
         "screen_size": 14.0, "affiliate_link": "https://www.mercadolibre.com.ar/p/MLA30000002?matt_d2id=test",
         "influencer_note": "HP EliteBook 840 premium para uso ejecutivo.",
         "description": "HP EliteBook 840 con Intel i7, 16GB RAM, SSD y pantalla de 14 pulgadas. " * 5,
         "usage_profiles": ["productividad_estudio"]},
        {"id": "33333333-3333-3333-3333-333333333303", "name": "Dell XPS 13", "brand": "Dell",
         "price": 2_700_000, "os": "Windows 11", "ram": "16GB", "gpu": "Integrada", "weight": 1.2,
         "screen_size": 13.4, "affiliate_link": "https://www.mercadolibre.com.ar/p/MLA30000003?matt_d2id=test",
         "influencer_note": "Dell XPS 13 ultraliviano premium para portabilidad maxima.",
         "description": "Dell XPS 13 con Intel i7, 16GB RAM, SSD 512GB y pantalla InfinityEdge. " * 5,
         "usage_profiles": ["productividad_estudio", "creacion_desarrollo"]},
        {"id": "33333333-3333-3333-3333-333333333304", "name": "Asus ZenBook 14", "brand": "Asus",
         "price": 1_900_000, "os": "Windows 11", "ram": "16GB", "gpu": "Integrada", "weight": 1.3,
         "screen_size": 14.0, "affiliate_link": "https://www.mercadolibre.com.ar/p/MLA30000004?matt_d2id=test",
         "influencer_note": "Asus ZenBook 14 ultraliviano y elegante para profesionales.",
         "description": "Asus ZenBook 14 con Intel i7, 16GB RAM, SSD y pantalla OLED. " * 5,
         "usage_profiles": ["productividad_estudio"]},
        {"id": "33333333-3333-3333-3333-333333333305", "name": "Acer Swift 5", "brand": "Acer",
         "price": 1_800_000, "os": "Windows 11", "ram": "16GB", "gpu": "Integrada", "weight": 1.2,
         "screen_size": 14.0, "affiliate_link": "https://www.mercadolibre.com.ar/p/MLA30000005?matt_d2id=test",
         "influencer_note": "Acer Swift 5 ultraliviano premium para movilidad.",
         "description": "Acer Swift 5 con Intel i7, 16GB RAM, SSD 512GB y pantalla touch 14. " * 5,
         "usage_profiles": ["productividad_estudio"]},
        # 5 macOS premium
        {"id": "44444444-4444-4444-4444-444444444401", "name": "MacBook Air M2 13 8GB/256GB", "brand": "Apple",
         "price": 1_900_000, "os": "macOS Sequoia", "ram": "8GB", "gpu": "M2", "weight": 1.24,
         "screen_size": 13.6, "affiliate_link": "https://www.mercadolibre.com.ar/p/MLA40000001?matt_d2id=test",
         "influencer_note": "MacBook Air M2 ideal para estudiantes y profesionales en movimiento.",
         "description": "MacBook Air M2 13 pulgadas con chip M2, 8GB RAM, 256GB SSD y bateria de 18hs. " * 5,
         "usage_profiles": ["productividad_estudio"]},
        {"id": "44444444-4444-4444-4444-444444444402", "name": "MacBook Air M3 13 16GB/512GB", "brand": "Apple",
         "price": 2_999_990, "os": "macOS Sequoia", "ram": "16GB", "gpu": "M3", "weight": 1.24,
         "screen_size": 13.6, "affiliate_link": "https://www.mercadolibre.com.ar/p/MLA40000002?matt_d2id=test",
         "influencer_note": "MacBook Air M3 con 16GB RAM para productividad fluida.",
         "description": "MacBook Air M3 13 con chip M3, 16GB RAM, 512GB SSD y pantalla Liquid Retina. " * 5,
         "usage_profiles": ["productividad_estudio", "creacion_desarrollo"]},
        {"id": "44444444-4444-4444-4444-444444444403", "name": "MacBook Pro M4 14 16GB/512GB", "brand": "Apple",
         "price": 3_500_000, "os": "macOS Sequoia", "ram": "16GB", "gpu": "M4", "weight": 1.55,
         "screen_size": 14.0, "affiliate_link": "https://www.mercadolibre.com.ar/p/MLA40000003?matt_d2id=test",
         "influencer_note": None,  # missing on purpose
         "description": "MacBook Pro M4 14 con chip M4, 16GB RAM, 512GB SSD y pantalla Liquid Retina XDR. " * 5,
         "usage_profiles": ["creacion_desarrollo"]},
        {"id": "44444444-4444-4444-4444-444444444404", "name": "MacBook Pro M4 Pro 14 24GB/1TB", "brand": "Apple",
         "price": 6_499_000, "os": "macOS Sequoia", "ram": "24GB", "gpu": "M4 Pro", "weight": 1.6,
         "screen_size": 14.0, "affiliate_link": "https://www.mercadolibre.com.ar/p/MLA40000004?matt_d2id=test",
         "influencer_note": "MacBook Pro M4 Pro top de linea para creadores profesionales.",
         "description": "MacBook Pro M4 Pro 14 con chip M4 Pro, 24GB RAM, 1TB SSD y pantalla Liquid Retina XDR. " * 5,
         "usage_profiles": ["creacion_desarrollo", "gaming_rendimiento"]},
        {"id": "44444444-4444-4444-4444-444444444405", "name": "Mac mini M4 16GB/256GB", "brand": "Apple",
         "price": 1_750_000, "os": "macOS Sequoia", "ram": "16GB", "gpu": "M4", "weight": 0.7,
         "screen_size": None, "affiliate_link": "https://www.mercadolibre.com.ar/p/MLA40000005?matt_d2id=test",
         "influencer_note": "Mac mini M4 ideal para escritorio fijo con potencia M4.",
         "description": "Mac mini con chip M4, 16GB RAM unificada, 256GB SSD para escritorio fijo. " * 5,
         "usage_profiles": ["productividad_estudio", "creacion_desarrollo"]},
    ]


@pytest.fixture
def sample_profiles() -> list[dict]:
    """4 representative profiles covering OS, workload, lifestyle, budget combos."""
    return [
        {"id": "p1", "workload": "productividad_estudio", "lifestyle": "maxima_portabilidad",
         "budget": "esencial", "os_preference": "windows", "laptop_ids": []},
        {"id": "p2", "workload": "gaming_rendimiento", "lifestyle": "escritorio_fijo",
         "budget": "equilibrado", "os_preference": "windows", "laptop_ids": []},
        {"id": "p3", "workload": "productividad_estudio", "lifestyle": "maxima_portabilidad",
         "budget": "premium", "os_preference": "macos", "laptop_ids": []},
        {"id": "p4", "workload": "gaming_rendimiento", "lifestyle": "escritorio_fijo",
         "budget": "premium", "os_preference": "macos", "laptop_ids": []},  # gap: no GPU Macs
    ]
