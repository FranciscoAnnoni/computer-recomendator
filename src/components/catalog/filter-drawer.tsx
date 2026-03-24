"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Backpack, Gamepad2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CatalogFilters } from "@/components/catalog/catalog-client";

// ---------- Types ----------

interface FilterDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: CatalogFilters;
  onApply: (filters: CatalogFilters) => void;
  onClear: () => void;
  brands: string[];
  osOptions: string[];
  screenSizes: string[];
  storageOptions: string[];
}

// ---------- Responsive side hook ----------

function useSheetSide(): "left" | "bottom" {
  const [side, setSide] = useState<"left" | "bottom">("bottom");
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setSide(mq.matches ? "left" : "bottom");
    const handler = (e: MediaQueryListEvent) =>
      setSide(e.matches ? "left" : "bottom");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return side;
}

// ---------- Sub-components ----------

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
      {children}
    </h3>
  );
}

interface ChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

function Chip({ label, active, onClick }: ChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-full border text-[14px] transition-colors whitespace-nowrap",
        active
          ? "bg-foreground text-background border-foreground"
          : "bg-background text-foreground border-border hover:border-foreground/40"
      )}
    >
      {label}
    </button>
  );
}

interface ToggleRowProps {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  active: boolean;
  onClick: () => void;
}

function ToggleRow({ icon, label, sublabel, active, onClick }: ToggleRowProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 w-full px-4 py-3 rounded-xl border text-left transition-colors",
        active
          ? "bg-foreground text-background border-foreground"
          : "bg-background text-foreground border-border hover:border-foreground/40"
      )}
    >
      <span className="shrink-0">{icon}</span>
      <div>
        <p className="text-[15px] font-medium leading-none">{label}</p>
        <p
          className={cn(
            "text-[12px] mt-0.5",
            active ? "text-background/70" : "text-muted-foreground"
          )}
        >
          {sublabel}
        </p>
      </div>
    </button>
  );
}

// ---------- Main component ----------

export function FilterDrawer({
  open,
  onOpenChange,
  filters,
  onApply,
  onClear,
  brands,
  osOptions,
  screenSizes,
  storageOptions,
}: FilterDrawerProps) {
  const side = useSheetSide();
  const [local, setLocal] = useState<CatalogFilters>(filters);

  // Sync local state when drawer opens
  useEffect(() => {
    if (open) setLocal(filters);
  }, [open, filters]);

  // ---------- Toggle helpers ----------

  function toggleChip<T extends string>(
    list: T[],
    value: T,
    key: keyof CatalogFilters
  ) {
    setLocal((prev) => ({
      ...prev,
      [key]: list.includes(value)
        ? list.filter((v) => v !== value)
        : [...list, value],
    }));
  }

  // ---------- Apply / clear ----------

  function handleApply() {
    onApply(local);
    onOpenChange(false);
  }

  function handleClear() {
    onClear();
    onOpenChange(false);
  }

  // ---------- Active filter count ----------

  const activeCount =
    local.brands.length +
    local.os.length +
    local.screenSizes.length +
    local.storage.length +
    (local.priceMin !== null ? 1 : 0) +
    (local.priceMax !== null ? 1 : 0) +
    (local.portable ? 1 : 0) +
    (local.canPlayGames ? 1 : 0);

  // ---------- Render ----------

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={side}
        className={cn(
          "flex flex-col p-0",
          side === "left" ? "w-80 sm:max-w-80" : "max-h-[88vh]"
        )}
      >
        {/* Header */}
        <SheetHeader className="px-5 pt-5 pb-3 border-b shrink-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-[17px]">Filtros</SheetTitle>
            {activeCount > 0 && (
              <span className="text-[12px] text-muted-foreground">
                {activeCount} activo{activeCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </SheetHeader>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">

          {/* Precio */}
          <div>
            <SectionTitle>Precio (USD)</SectionTitle>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                placeholder="Mín"
                value={local.priceMin ?? ""}
                onChange={(e) =>
                  setLocal((p) => ({
                    ...p,
                    priceMin: e.target.value === "" ? null : Number(e.target.value),
                  }))
                }
                className="w-full h-9 px-3 rounded-lg border bg-background text-[14px] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <span className="text-muted-foreground text-[14px] shrink-0">—</span>
              <input
                type="number"
                placeholder="Máx"
                value={local.priceMax ?? ""}
                onChange={(e) =>
                  setLocal((p) => ({
                    ...p,
                    priceMax: e.target.value === "" ? null : Number(e.target.value),
                  }))
                }
                className="w-full h-9 px-3 rounded-lg border bg-background text-[14px] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {/* Portabilidad toggle */}
          <div>
            <SectionTitle>Portabilidad</SectionTitle>
            <ToggleRow
              icon={<Backpack className="size-4" />}
              label="Portátil"
              sublabel="Peso ≤ 1.8 kg — para llevar en la mochila"
              active={local.portable}
              onClick={() => setLocal((p) => ({ ...p, portable: !p.portable }))}
            />
          </div>

          {/* Gaming toggle */}
          <div>
            <SectionTitle>Gaming</SectionTitle>
            <ToggleRow
              icon={<Gamepad2 className="size-4" />}
              label="Puede jugar videojuegos"
              sublabel="GPU dedicada apta para gaming"
              active={local.canPlayGames}
              onClick={() =>
                setLocal((p) => ({ ...p, canPlayGames: !p.canPlayGames }))
              }
            />
          </div>

          {/* Marcas */}
          {brands.length > 0 && (
            <div>
              <SectionTitle>Marca</SectionTitle>
              <div className="flex flex-wrap gap-2">
                {brands.map((brand) => (
                  <Chip
                    key={brand}
                    label={brand}
                    active={local.brands.includes(brand)}
                    onClick={() => toggleChip(local.brands, brand, "brands")}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Sistema operativo */}
          {osOptions.length > 0 && (
            <div>
              <SectionTitle>Sistema operativo</SectionTitle>
              <div className="flex flex-wrap gap-2">
                {osOptions.map((os) => (
                  <Chip
                    key={os}
                    label={os}
                    active={local.os.includes(os)}
                    onClick={() => toggleChip(local.os, os, "os")}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Pantalla */}
          {screenSizes.length > 0 && (
            <div>
              <SectionTitle>Tamaño de pantalla</SectionTitle>
              <div className="flex flex-wrap gap-2">
                {screenSizes.map((size) => (
                  <Chip
                    key={size}
                    label={size}
                    active={local.screenSizes.includes(size)}
                    onClick={() =>
                      toggleChip(local.screenSizes, size, "screenSizes")
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {/* Almacenamiento */}
          {storageOptions.length > 0 && (
            <div>
              <SectionTitle>Almacenamiento</SectionTitle>
              <div className="flex flex-wrap gap-2">
                {storageOptions.map((s) => (
                  <Chip
                    key={s}
                    label={s}
                    active={local.storage.includes(s)}
                    onClick={() => toggleChip(local.storage, s, "storage")}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t shrink-0 space-y-2">
          <Button className="w-full h-11" onClick={handleApply}>
            Aplicar{activeCount > 0 ? ` (${activeCount})` : ""}
          </Button>
          {activeCount > 0 && (
            <button
              className="text-[13px] text-muted-foreground hover:text-foreground w-full text-center block"
              onClick={handleClear}
            >
              Limpiar todo
            </button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
