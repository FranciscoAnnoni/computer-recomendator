"use client";

import { useState, useEffect, useMemo } from "react";
import { Search } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { Laptop } from "@/types/laptop";

interface LaptopPickerProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  laptops: Laptop[];
  disabledIds: string[];
  onSelect: (laptop: Laptop) => void;
}

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

export function LaptopPicker({
  open,
  onOpenChange,
  laptops,
  disabledIds,
  onSelect,
}: LaptopPickerProps) {
  const side = useSheetSide();
  const [query, setQuery] = useState("");

  // Reset search when picker closes
  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  // Filter laptops by name and brand (per D-10)
  const filtered = useMemo(() => {
    if (!query.trim()) return laptops;
    const q = query.toLowerCase();
    return laptops.filter(
      (l) =>
        l.name.toLowerCase().includes(q) || l.brand.toLowerCase().includes(q)
    );
  }, [laptops, query]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={side}
        className={cn(
          "pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]",
          side === "bottom" ? "max-h-[88vh]" : "w-[380px]"
        )}
      >
        <div className="flex flex-col h-full px-5 pt-8">
          {/* Header */}
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Seleccionar laptop
          </h2>

          {/* Search input (per D-10) */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre o marca..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
          </div>

          {/* Laptop list (scrollable) */}
          <div className="flex-1 overflow-y-auto -mx-5 px-5 space-y-1">
            {filtered.map((laptop) => {
              const isDisabled = disabledIds.includes(laptop.id);
              return (
                <button
                  key={laptop.id}
                  disabled={isDisabled}
                  onClick={() => onSelect(laptop)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors",
                    isDisabled
                      ? "opacity-40 pointer-events-none cursor-default"
                      : "hover:bg-muted cursor-pointer"
                  )}
                >
                  {/* Thumbnail */}
                  <div className="size-10 rounded-md bg-muted overflow-hidden flex-shrink-0">
                    <img
                      src={laptop.image_url}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display =
                          "none";
                      }}
                    />
                  </div>
                  {/* Name + brand */}
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">
                      {laptop.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {laptop.brand} — ${laptop.price.toLocaleString()} USD
                    </div>
                  </div>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                No se encontraron laptops
              </p>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
