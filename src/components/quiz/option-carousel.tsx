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
  onNext: () => void;
}

function vibrate() {
  try { navigator.vibrate?.(8); } catch { /* ignore */ }
}

export function OptionCarousel({ options, selectedValue, onSelect, onNext }: OptionCarouselProps) {
  const INITIAL_CENTER = 1; // middle card (index 1 of 3)

  const derivedCenter = selectedValue
    ? options.findIndex((o) => o.value === selectedValue)
    : INITIAL_CENTER;

  const [centerIndex, setCenterIndex] = useState(derivedCenter >= 0 ? derivedCenter : INITIAL_CENTER);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile breakpoint
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Auto-select the center card on mount so Siguiente is never disabled
  useEffect(() => {
    if (!selectedValue) {
      onSelect(options[INITIAL_CENTER].value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally mount-only

  // Sync centerIndex when parent's selectedValue changes (e.g., back navigation)
  useEffect(() => {
    if (selectedValue) {
      const idx = options.findIndex((o) => o.value === selectedValue);
      if (idx >= 0) setCenterIndex(idx);
    }
  }, [selectedValue, options]);

  const navigate = (newIndex: number) => {
    if (newIndex < 0 || newIndex >= options.length) return;
    vibrate();
    setCenterIndex(newIndex);
    onSelect(options[newIndex].value);
  };

  const handleCardClick = (index: number) => {
    if (index === centerIndex) {
      // Already selected — tap again to advance
      onNext();
    } else {
      navigate(index);
    }
  };

  const handleArrowLeft = () => navigate(centerIndex - 1);
  const handleArrowRight = () => navigate(centerIndex + 1);

  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    if (info.offset.x < -40) navigate(centerIndex + 1);
    else if (info.offset.x > 40) navigate(centerIndex - 1);
  };

  const isLeftDisabled = centerIndex === 0;
  const isRightDisabled = centerIndex === options.length - 1;

  // ── MOBILE: deck / stacked card layout ──────────────────────────────────────
  if (isMobile) {
    return (
      <div className="flex flex-col items-center gap-3">
        {/* Deck container — drag to swipe on mobile */}
        <motion.div
          className="relative w-[200px] h-[290px] mx-auto cursor-grab active:cursor-grabbing"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
        >
          {options.map((option, index) => {
            const offset = index - centerIndex; // -1, 0, or +1
            const isCenter = offset === 0;
            const isSelected = option.value === selectedValue;

            return (
              <motion.div
                key={option.value}
                className="absolute top-0"
                style={{ left: "50%", marginLeft: "-100px" }}
                animate={{
                  x: offset === 0 ? 0 : offset < 0 ? -52 : 52,
                  scale: isCenter ? 1 : 0.88,
                  opacity: Math.abs(offset) > 1 ? 0 : isCenter ? 1 : 0.65,
                  zIndex: isCenter ? 30 : 20,
                  rotate: isCenter ? 0 : offset < 0 ? -5 : 5,
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                onClick={() => !isCenter && navigate(index)}
              >
                <OptionCard
                  option={option}
                  isCenter={isCenter}
                  isSelected={isSelected}
                  compact
                  onClick={() => handleCardClick(index)}
                />
              </motion.div>
            );
          })}
        </motion.div>

        {/* Arrow buttons below the deck */}
        <div className="flex items-center gap-6">
          <button
            type="button"
            aria-label="Opcion anterior"
            onClick={handleArrowLeft}
            className="icon-btn-ed"
            style={{ opacity: isLeftDisabled ? 0.3 : 1, pointerEvents: isLeftDisabled ? 'none' : 'auto' }}
          >
            <ChevronLeft className="size-5" />
          </button>
          <span className="label-ed-sm" style={{ color: 'var(--on-sur-muted)' }}>
            {centerIndex + 1} / {options.length}
          </span>
          <button
            type="button"
            aria-label="Opcion siguiente"
            onClick={handleArrowRight}
            className="icon-btn-ed"
            style={{ opacity: isRightDisabled ? 0.3 : 1, pointerEvents: isRightDisabled ? 'none' : 'auto' }}
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>
    );
  }

  // ── DESKTOP: horizontal row layout ──────────────────────────────────────────
  return (
    <div className="relative flex items-center w-full">
      {/* Left arrow */}
      <button
        type="button"
        aria-label="Opcion anterior"
        onClick={handleArrowLeft}
        className="absolute left-0 z-10 icon-btn-ed"
        style={{ opacity: isLeftDisabled ? 0.3 : 1, pointerEvents: isLeftDisabled ? 'none' : 'auto' }}
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
                onClick={() => handleCardClick(index)}
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
        className="absolute right-0 z-10 icon-btn-ed"
        style={{ opacity: isRightDisabled ? 0.3 : 1, pointerEvents: isRightDisabled ? 'none' : 'auto' }}
      >
        <ChevronRight className="size-5" />
      </button>
    </div>
  );
}
