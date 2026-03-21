"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { QuizOption } from "@/types/quiz";
import { OptionCard } from "@/components/quiz/option-card";

interface OptionCarouselProps {
  options: QuizOption[];
  selectedValue: string | null;
  onSelect: (value: string) => void;
}

export function OptionCarousel({ options, selectedValue, onSelect }: OptionCarouselProps) {
  // Derive centerIndex from selectedValue; if no selection yet, default to 1 (visual center)
  const derivedCenter = selectedValue
    ? options.findIndex((o) => o.value === selectedValue)
    : 1;

  // Local state for center index — only drives visual; selection state lives in parent
  const [centerIndex, setCenterIndex] = useState(derivedCenter >= 0 ? derivedCenter : 1);

  // Sync centerIndex if parent's selectedValue changes (e.g., on back navigation)
  useEffect(() => {
    if (selectedValue) {
      const idx = options.findIndex((o) => o.value === selectedValue);
      if (idx >= 0) setCenterIndex(idx);
    }
  }, [selectedValue, options]);

  const handleArrowLeft = () => {
    if (centerIndex <= 0) return;
    const newIndex = centerIndex - 1;
    setCenterIndex(newIndex);
    onSelect(options[newIndex].value);
  };

  const handleArrowRight = () => {
    if (centerIndex >= options.length - 1) return;
    const newIndex = centerIndex + 1;
    setCenterIndex(newIndex);
    onSelect(options[newIndex].value);
  };

  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    if (info.offset.x < -40 && centerIndex < options.length - 1) {
      const newIndex = centerIndex + 1;
      setCenterIndex(newIndex);
      onSelect(options[newIndex].value);
    } else if (info.offset.x > 40 && centerIndex > 0) {
      const newIndex = centerIndex - 1;
      setCenterIndex(newIndex);
      onSelect(options[newIndex].value);
    }
  };

  const isLeftDisabled = centerIndex === 0;
  const isRightDisabled = centerIndex === options.length - 1;

  return (
    <div className="relative flex items-center w-full">
      {/* Left arrow */}
      <button
        type="button"
        aria-label="Opcion anterior"
        onClick={handleArrowLeft}
        className={`absolute left-0 z-10 w-11 h-11 flex items-center justify-center rounded-full bg-background border border-border focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none ${
          isLeftDisabled ? "opacity-30 pointer-events-none" : ""
        }`}
      >
        <ChevronLeft className="size-5" />
      </button>

      {/* Cards row */}
      <motion.div
        className="flex items-center justify-center gap-3 w-full overflow-visible cursor-grab active:cursor-grabbing"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.15}
        onDragEnd={handleDragEnd}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {options.map((option, index) => {
          const isCenter = index === centerIndex;
          const isSelected = option.value === selectedValue;
          return (
            <motion.div
              key={option.value}
              animate={{
                scale: isCenter ? 1.03 : 0.92,
                opacity: isCenter ? 1 : 0.6,
              }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="shrink-0"
            >
              <OptionCard
                option={option}
                isCenter={isCenter}
                isSelected={isSelected}
                onClick={() => {
                  setCenterIndex(index);
                  onSelect(option.value);
                }}
              />
            </motion.div>
          );
        })}
      </motion.div>

      {/* Right arrow */}
      <button
        type="button"
        aria-label="Opcion siguiente"
        onClick={handleArrowRight}
        className={`absolute right-0 z-10 w-11 h-11 flex items-center justify-center rounded-full bg-background border border-border focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none ${
          isRightDisabled ? "opacity-30 pointer-events-none" : ""
        }`}
      >
        <ChevronRight className="size-5" />
      </button>
    </div>
  );
}
