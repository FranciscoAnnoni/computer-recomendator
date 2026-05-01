"""Tests for supabase/migrations/06_add_catalog_product_id.sql."""
from pathlib import Path

MIGRATION = Path(__file__).resolve().parents[2] / "supabase" / "migrations" / "06_add_catalog_product_id.sql"


def test_migration_file_exists():
    assert MIGRATION.exists(), f"Missing: {MIGRATION}"


def test_migration_is_idempotent():
    sql = MIGRATION.read_text()
    assert "ADD COLUMN IF NOT EXISTS catalog_product_id" in sql
    assert "CREATE UNIQUE INDEX IF NOT EXISTS" in sql


def test_partial_unique_index():
    sql = MIGRATION.read_text()
    assert "WHERE catalog_product_id IS NOT NULL" in sql, (
        "Partial index required so NULL rows do not collide"
    )
