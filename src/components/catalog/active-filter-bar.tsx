"use client";

import { X } from "lucide-react";
import type { CatalogFilters } from "@/components/catalog/catalog-client";

// ---------- Props ----------

interface ActiveFilterBarProps {
  filters: CatalogFilters;
  profileFilter: boolean;
  searchText: string;
  onRemoveFilter: (key: string, value?: string) => void;
  onClearAll: () => void;
}

// ---------- Chip ----------

function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-[12px] border border-border whitespace-nowrap">
      {label}
      <button
        onClick={onRemove}
        aria-label={`Quitar filtro ${label}`}
        className="ml-0.5 hover:text-foreground"
      >
        <X className="size-3" />
      </button>
    </span>
  );
}

// ---------- Main component ----------

export function ActiveFilterBar({
  filters,
  profileFilter,
  searchText,
  onRemoveFilter,
  onClearAll,
}: ActiveFilterBarProps) {
  const chips: { label: string; filterKey: string; value?: string }[] = [];

  if (filters.portable) {
    chips.push({ label: "Portátil", filterKey: "portable" });
  }

  if (filters.canPlayGames) {
    chips.push({ label: "Gaming", filterKey: "canPlayGames" });
  }

  filters.brands.forEach((brand) => {
    chips.push({ label: brand, filterKey: "brands", value: brand });
  });

  filters.os.forEach((os) => {
    chips.push({ label: os, filterKey: "os", value: os });
  });

  filters.screenSizes.forEach((size) => {
    chips.push({ label: size, filterKey: "screenSizes", value: size });
  });

  filters.storage.forEach((s) => {
    chips.push({ label: s, filterKey: "storage", value: s });
  });

  if (filters.priceMin !== null) {
    chips.push({ label: `Desde $${filters.priceMin}`, filterKey: "priceMin" });
  }

  if (filters.priceMax !== null) {
    chips.push({ label: `Hasta $${filters.priceMax}`, filterKey: "priceMax" });
  }

  if (profileFilter) {
    chips.push({ label: "Mi perfil", filterKey: "profileFilter" });
  }

  if (searchText.trim()) {
    chips.push({ label: `"${searchText}"`, filterKey: "searchText" });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 mt-3 scrollbar-none items-center">
      {chips.map((chip, index) => (
        <FilterChip
          key={`${chip.filterKey}-${chip.value ?? index}`}
          label={chip.label}
          onRemove={() => onRemoveFilter(chip.filterKey, chip.value)}
        />
      ))}
      <button
        className="text-[12px] text-muted-foreground hover:text-foreground whitespace-nowrap shrink-0 ml-1"
        onClick={onClearAll}
      >
        Limpiar todo
      </button>
    </div>
  );
}
