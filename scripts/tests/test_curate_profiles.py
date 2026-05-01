"""Tests for scripts/curate_profiles.py — RED until Task 2 creates the script."""
import pytest

cp = pytest.importorskip("scripts.curate_profiles",
    reason="scripts.curate_profiles not implemented yet — Task 2 of Plan 13-01")


def test_score_laptop_range(sample_laptops):
    for laptop in sample_laptops:
        score = cp.score_laptop(laptop)
        assert 1 <= score <= 10, f"Score {score} out of range for {laptop['name']}"


def test_score_laptop_canonical_link_bonus():
    good = {"name": "X", "affiliate_link": "https://www.mercadolibre.com.ar/p/MLA12345?matt_d2id=test",
            "ram": "16GB", "description": "word " * 50, "influencer_note": "x" * 35}
    bad = {"name": "X", "affiliate_link": "https://example.com/foo",
           "ram": "16GB", "description": "word " * 50, "influencer_note": "x" * 35}
    assert cp.score_laptop(good) > cp.score_laptop(bad)
    assert cp.score_laptop(good) >= 7


def test_select_returns_5(sample_laptops, sample_profiles):
    # Profile p1 = productividad_estudio + maxima_portabilidad + esencial + windows
    result = cp.select_laptops_for_profile(sample_profiles[0], sample_laptops, cp.EFFECTIVE_TIERS)
    assert len(result) == 5
    assert len(set(result)) == 5  # no duplicates
    for uid in result:
        assert isinstance(uid, str) and len(uid) >= 8


def test_macos_only_mac(sample_laptops, sample_profiles):
    # Profile p3 = macos
    result_ids = cp.select_laptops_for_profile(sample_profiles[2], sample_laptops, cp.EFFECTIVE_TIERS)
    by_id = {l["id"]: l for l in sample_laptops}
    for lid in result_ids:
        assert "macOS" in by_id[lid]["os"], f"Non-mac laptop {by_id[lid]['name']} in macOS profile"


def test_gaming_gpu_filter(sample_laptops, sample_profiles):
    # Profile p2 = gaming + windows; pool has 5 GPU laptops + 5 non-GPU + 5 mac
    result_ids = cp.select_laptops_for_profile(sample_profiles[1], sample_laptops, cp.EFFECTIVE_TIERS)
    by_id = {l["id"]: l for l in sample_laptops}
    for lid in result_ids:
        assert cp.has_dedicated_gpu(by_id[lid]), \
            f"Non-GPU laptop {by_id[lid]['name']} in gaming profile"


def test_brand_diversity(sample_laptops, sample_profiles):
    # Add 3 extra Lenovo entries to the sample to verify cap
    extended = sample_laptops + [
        {**sample_laptops[0], "id": f"extra-lenovo-{i}",
         "name": f"Lenovo Extra {i}", "brand": "Lenovo"}
        for i in range(3)
    ]
    result_ids = cp.select_laptops_for_profile(sample_profiles[0], extended, cp.EFFECTIVE_TIERS)
    by_id = {l["id"]: l for l in extended}
    from collections import Counter
    brands = Counter(by_id[lid]["brand"].lower() for lid in result_ids)
    for brand, count in brands.items():
        assert count <= 2, f"Brand {brand} has {count} laptops (max 2 allowed)"


def test_dry_run_no_db_write(monkeypatch, sample_laptops, sample_profiles):
    patch_calls = []
    monkeypatch.setattr(cp, "patch_profile_laptops",
                        lambda *a, **kw: patch_calls.append(("profile", a, kw)) or True)
    monkeypatch.setattr(cp, "patch_laptop",
                        lambda *a, **kw: patch_calls.append(("laptop", a, kw)) or True)
    monkeypatch.setattr(cp, "fetch_laptops", lambda *a, **kw: sample_laptops)
    monkeypatch.setattr(cp, "fetch_profiles", lambda *a, **kw: sample_profiles)
    monkeypatch.setenv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.co")
    monkeypatch.setenv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "test-token")
    cp.main(["--dry-run"])
    assert len(patch_calls) == 0, f"--dry-run made {len(patch_calls)} PATCH calls"


def test_apply_patches_profiles(monkeypatch, sample_laptops, sample_profiles):
    # Use 81 profile copies to confirm one PATCH per profile
    profiles_81 = [{**sample_profiles[i % 4], "id": f"p{i}"} for i in range(81)]
    profile_calls = []
    monkeypatch.setattr(cp, "patch_profile_laptops",
                        lambda url, tok, pid, ids: profile_calls.append(pid) or True)
    monkeypatch.setattr(cp, "patch_laptop", lambda *a, **kw: True)
    monkeypatch.setattr(cp, "fetch_laptops", lambda *a, **kw: sample_laptops)
    monkeypatch.setattr(cp, "fetch_profiles", lambda *a, **kw: profiles_81)
    monkeypatch.setenv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.co")
    monkeypatch.setenv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "test-token")
    cp.main(["--apply"])
    assert len(profile_calls) == 81, f"Expected 81 profile PATCHes, got {len(profile_calls)}"
