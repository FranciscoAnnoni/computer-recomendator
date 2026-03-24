"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
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

interface FilterDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: CatalogFilters;
  onApply: (filters: CatalogFilters) => void;
  onClear: () => void;
  availableOptions: {
    brands: string[];
    screenSizes: string[];
    weights: string[];
    osOptions: string[];
    usageProfiles: UsageProfile[];
  };
}

// ---------- Component ----------

export function FilterDrawer({
  open,
  onOpenChange,
  filters,
  onApply,
  onClear,
  availableOptions,
}: FilterDrawerProps) {
  // Local filter state — cloned from props when drawer opens
  const [localFilters, setLocalFilters] = useState<CatalogFilters>(filters);

  // Sync local state when drawer opens
  useEffect(() => {
    if (open) {
      setLocalFilters(filters);
    }
  }, [open, filters]);

  // ---------- Handlers ----------

  function toggleCheckbox<T extends string>(
    list: T[],
    value: T,
    setter: (updater: (prev: CatalogFilters) => CatalogFilters) => void,
    key: keyof CatalogFilters
  ) {
    setter((prev) => ({
      ...prev,
      [key]: list.includes(value)
        ? (list.filter((v) => v !== value) as T[])
        : ([...list, value] as T[]),
    }));
  }

  function handleBrandToggle(brand: string) {
    toggleCheckbox(localFilters.brands, brand, setLocalFilters, "brands");
  }

  function handleScreenSizeToggle(size: string) {
    toggleCheckbox(localFilters.screenSizes, size, setLocalFilters, "screenSizes");
  }

  function handleWeightToggle(weight: string) {
    toggleCheckbox(localFilters.weights, weight, setLocalFilters, "weights");
  }

  function handleOsToggle(os: string) {
    toggleCheckbox(localFilters.os, os, setLocalFilters, "os");
  }

  function handleUsageProfileToggle(profile: UsageProfile) {
    toggleCheckbox(localFilters.usageProfiles, profile, setLocalFilters, "usageProfiles");
  }

  function handlePriceMinChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value === "" ? null : Number(e.target.value);
    setLocalFilters((prev) => ({ ...prev, priceMin: val }));
  }

  function handlePriceMaxChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value === "" ? null : Number(e.target.value);
    setLocalFilters((prev) => ({ ...prev, priceMax: val }));
  }

  function handleApply() {
    onApply(localFilters);
    onOpenChange(false);
  }

  function handleClear() {
    onClear();
    onOpenChange(false);
  }

  // ---------- Render ----------

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[85vh] flex flex-col">
        <SheetHeader>
          <SheetTitle>Filtros</SheetTitle>
        </SheetHeader>

        {/* Scrollable filter body */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-6">

          {/* Brand */}
          {availableOptions.brands.length > 0 && (
            <div>
              <h3 className="text-[17px] font-medium mb-2">Marca</h3>
              <div className="space-y-0">
                {availableOptions.brands.map((brand) => (
                  <label
                    key={brand}
                    className="flex items-center gap-2 min-h-[44px] cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="size-4 rounded accent-primary"
                      checked={localFilters.brands.includes(brand)}
                      onChange={() => handleBrandToggle(brand)}
                    />
                    <span className="text-[17px]">{brand}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Price range */}
          <div>
            <h3 className="text-[17px] font-medium mb-2">Precio</h3>
            <div className="flex gap-3 items-center min-h-[44px]">
              <input
                type="number"
                placeholder="Min"
                value={localFilters.priceMin ?? ""}
                onChange={handlePriceMinChange}
                className="w-full h-10 px-3 rounded-lg border bg-background text-[17px] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <span className="text-muted-foreground text-[17px] shrink-0">—</span>
              <input
                type="number"
                placeholder="Max"
                value={localFilters.priceMax ?? ""}
                onChange={handlePriceMaxChange}
                className="w-full h-10 px-3 rounded-lg border bg-background text-[17px] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {/* Screen size */}
          {availableOptions.screenSizes.length > 0 && (
            <div>
              <h3 className="text-[17px] font-medium mb-2">Pantalla</h3>
              <div className="space-y-0">
                {availableOptions.screenSizes.map((size) => (
                  <label
                    key={size}
                    className="flex items-center gap-2 min-h-[44px] cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="size-4 rounded accent-primary"
                      checked={localFilters.screenSizes.includes(size)}
                      onChange={() => handleScreenSizeToggle(size)}
                    />
                    <span className="text-[17px]">{size}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Weight */}
          {availableOptions.weights.length > 0 && (
            <div>
              <h3 className="text-[17px] font-medium mb-2">Peso</h3>
              <div className="space-y-0">
                {availableOptions.weights.map((weight) => (
                  <label
                    key={weight}
                    className="flex items-center gap-2 min-h-[44px] cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="size-4 rounded accent-primary"
                      checked={localFilters.weights.includes(weight)}
                      onChange={() => handleWeightToggle(weight)}
                    />
                    <span className="text-[17px]">{weight}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Usage profile */}
          {availableOptions.usageProfiles.length > 0 && (
            <div>
              <h3 className="text-[17px] font-medium mb-2">Uso</h3>
              <div className="space-y-0">
                {availableOptions.usageProfiles.map((profile) => (
                  <label
                    key={profile}
                    className="flex items-center gap-2 min-h-[44px] cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="size-4 rounded accent-primary"
                      checked={localFilters.usageProfiles.includes(profile)}
                      onChange={() => handleUsageProfileToggle(profile)}
                    />
                    <span className="text-[17px]">
                      {USAGE_PROFILE_LABELS[profile] ?? profile}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* OS */}
          {availableOptions.osOptions.length > 0 && (
            <div>
              <h3 className="text-[17px] font-medium mb-2">Sistema operativo</h3>
              <div className="space-y-0">
                {availableOptions.osOptions.map((os) => (
                  <label
                    key={os}
                    className="flex items-center gap-2 min-h-[44px] cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="size-4 rounded accent-primary"
                      checked={localFilters.os.includes(os)}
                      onChange={() => handleOsToggle(os)}
                    />
                    <span className="text-[17px]">{os}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <SheetFooter>
          <Button
            variant="default"
            className="w-full h-11"
            onClick={handleApply}
          >
            Aplicar filtros
          </Button>
          <button
            className="text-[12px] text-muted-foreground hover:text-foreground mt-2 mx-auto block"
            onClick={handleClear}
          >
            Limpiar todo
          </button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
