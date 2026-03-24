"use client";

import { X } from "lucide-react";
import type { CatalogFilters } from "@/components/catalog/catalog-client";
import type { UsageProfile } from "@/types/laptop";

// ---------- Usage profile display labels ----------

const USAGE_PROFILE_LABELS: Record<UsageProfile, string> = {
  productividad_estudio: "Productividad",
  creacion_desarrollo: "Creacion",
  gaming_rendimiento: "Gaming",
  design: "Diseño",
  programming: "Programacion",
  study: "Estudio",
  general: "General",
};

// ---------- Props ----------

interface ActiveFilterBarProps {
  filters: CatalogFilters;
  profileFilter: boolean;
  searchText: string;
  onRemoveFilter: (key: string, value?: string) => void;
  onClearAll: () => void;
}

// ---------- Chip component ----------

interface ChipProps {
  label: string;
  onRemove: () => void;
}

function FilterChip({ label, onRemove }: ChipProps) {
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

  // Build chip list from active filters
  filters.brands.forEach((brand) => {
    chips.push({ label: brand, filterKey: "brands", value: brand });
  });

  if (filters.priceMin !== null) {
    chips.push({ label: `Min: $${filters.priceMin}`, filterKey: "priceMin" });
  }

  if (filters.priceMax !== null) {
    chips.push({ label: `Max: $${filters.priceMax}`, filterKey: "priceMax" });
  }

  filters.screenSizes.forEach((size) => {
    chips.push({ label: size, filterKey: "screenSizes", value: size });
  });

  filters.weights.forEach((weight) => {
    chips.push({ label: weight, filterKey: "weights", value: weight });
  });

  filters.usageProfiles.forEach((profile) => {
    chips.push({
      label: USAGE_PROFILE_LABELS[profile] ?? profile,
      filterKey: "usageProfiles",
      value: profile,
    });
  });

  filters.os.forEach((os) => {
    chips.push({ label: os, filterKey: "os", value: os });
  });

  if (profileFilter) {
    chips.push({ label: "Perfil", filterKey: "profileFilter" });
  }

  if (searchText.trim()) {
    chips.push({
      label: `"${searchText}"`,
      filterKey: "searchText",
    });
  }

  // Only render when there are active chips
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
