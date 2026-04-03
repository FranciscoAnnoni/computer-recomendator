"use client";

import { useState, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { fetchAllLaptops } from "@/lib/catalog-data";
import type { Laptop } from "@/types/laptop";
import { cn } from "@/lib/utils";
import { CompareCard } from "./compare-card";
import { EmptySlot } from "./empty-slot";
import { LaptopPicker } from "./laptop-picker";

export function ComparatorClient() {
  const [allLaptops, setAllLaptops] = useState<Laptop[]>([]);
  const [loading, setLoading] = useState(true);
  const [slots, setSlots] = useState<(Laptop | null)[]>([null, null]);
  const [isDesktop, setIsDesktop] = useState(false);
  const [pickerSlotIndex, setPickerSlotIndex] = useState<number | null>(null);

  // Detect desktop (sm breakpoint: 640px)
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Load laptops — both slots start empty, user chooses both manually
  useEffect(() => {
    async function load() {
      const laptops = await fetchAllLaptops();
      setAllLaptops(laptops);
      setLoading(false);
    }
    load();
  }, []);

  // Derived slot display — show 3rd slot on desktop when both slots are filled
  const showThirdSlot = isDesktop && slots[0] !== null && slots[1] !== null;
  const displaySlots: (Laptop | null)[] =
    showThirdSlot && slots.length === 2 ? [...slots, null] : slots;

  // Compute disabled IDs to prevent duplicate selection
  const disabledIds = useMemo(
    () => slots.filter(Boolean).map((l) => l!.id),
    [slots]
  );

  function removeSlot(index: number) {
    setSlots((prev) => {
      const next = [...prev];
      next[index] = null;
      // Trim back to 2 slots if 3rd slot exists and first two aren't both filled
      if (next.length === 3 && (next[0] === null || next[1] === null)) {
        return [next[0], next[1]];
      }
      return next;
    });
  }

  function handleSelectLaptop(laptop: Laptop) {
    if (pickerSlotIndex === null) return;
    setSlots((prev) => {
      const next = [...prev];
      next[pickerSlotIndex] = laptop;
      return next;
    });
    setPickerSlotIndex(null);
  }

  function openPicker(index: number) {
    setPickerSlotIndex(index);
  }

  if (loading) {
    return (
      <section className="px-4 sm:px-8 py-8 sm:py-16 max-w-5xl mx-auto">
        {/* Header skeleton */}
        <div className="mb-8">
          <div className="h-9 w-44 bg-muted rounded-lg animate-pulse mb-3" />
          <div className="flex items-center gap-2">
            <div className="h-7 w-10 bg-muted rounded-full animate-pulse" />
            <div className="h-7 w-10 bg-muted rounded-full animate-pulse" />
          </div>
        </div>
        {/* Two card skeletons side by side */}
        <div className="flex gap-3 sm:gap-4 items-start">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="flex-1 min-w-0 rounded-xl border border-border bg-card overflow-hidden animate-pulse"
            >
              {/* Image area */}
              <div className="aspect-square w-full bg-muted" />
              {/* Name row */}
              <div className="px-3 py-2.5">
                <div className="h-4 bg-muted rounded w-3/4" />
              </div>
              {/* 5 spec rows */}
              {[0, 1, 2, 3, 4].map((j) => (
                <div
                  key={j}
                  className="px-3 py-2 border-t border-border flex items-center gap-2"
                >
                  <div className="h-3 bg-muted rounded w-1/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 sm:px-8 py-8 sm:py-16 max-w-5xl mx-auto">
      {/* Header: Comparador title + slot count indicator */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-3">
          Comparador
        </h1>
        <div className="flex items-center gap-2">
          {[2, 3].map((n) => (
            <span
              key={n}
              className={cn(
                "px-3 py-1 font-mono text-[14px] border border-border rounded-full transition-colors",
                displaySlots.length === n
                  ? "bg-foreground text-background"
                  : "text-muted-foreground"
              )}
            >
              [{n}]
            </span>
          ))}
        </div>
      </div>

      {/* Slot columns */}
      <div className="flex gap-3 sm:gap-4 items-start">
        <AnimatePresence mode="popLayout">
          {displaySlots.map((laptop, i) => (
            <motion.div
              key={laptop?.id ?? `empty-${i}`}
              className="flex-1 min-w-0"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {laptop ? (
                <CompareCard laptop={laptop} onRemove={() => removeSlot(i)} />
              ) : (
                <EmptySlot slotNumber={i + 1} onAdd={() => openPicker(i)} />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Laptop picker sheet */}
      <LaptopPicker
        open={pickerSlotIndex !== null}
        onOpenChange={(v) => {
          if (!v) setPickerSlotIndex(null);
        }}
        laptops={allLaptops}
        disabledIds={disabledIds}
        onSelect={handleSelectLaptop}
      />
    </section>
  );
}
