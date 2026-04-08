"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { fetchAllLaptops } from "@/lib/catalog-data";
import type { Laptop } from "@/types/laptop";
import { CompareCard } from "./compare-card";
import { EmptySlot } from "./empty-slot";
import { LaptopPicker } from "./laptop-picker";

export function ComparatorClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [allLaptops, setAllLaptops] = useState<Laptop[]>([]);
  const [loading, setLoading] = useState(true);
  const [slots, setSlots] = useState<(Laptop | null)[]>([null, null]);
  const [pickerSlotIndex, setPickerSlotIndex] = useState<number | null>(null);

  // Load laptops — pre-populate slot 0 if ?laptop={id} is in the URL
  useEffect(() => {
    async function load() {
      const laptops = await fetchAllLaptops();
      setAllLaptops(laptops);
      setLoading(false);

      const preloadId = searchParams.get("laptop");
      if (preloadId) {
        const found = laptops.find((l) => l.id === preloadId);
        if (found) {
          setSlots([found, null]);
        }
        // Remove the query param without re-triggering navigation
        router.replace("/compare", { scroll: false });
      }
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Compute disabled IDs to prevent duplicate selection
  const disabledIds = useMemo(
    () => slots.filter(Boolean).map((l) => l!.id),
    [slots]
  );

  function removeSlot(index: number) {
    setSlots((prev) => {
      const next = [...prev];
      next[index] = null;
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
      {/* Header: Comparador title + fixed [2] slot count indicator */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-3">
          Comparador
        </h1>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 font-mono text-[14px] border border-border rounded-full bg-foreground text-background">
            [2]
          </span>
        </div>
      </div>

      {/* Slot columns — always exactly 2 */}
      <div className="flex gap-3 sm:gap-4 items-start">
        <AnimatePresence mode="popLayout">
          {slots.map((laptop, i) => (
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
