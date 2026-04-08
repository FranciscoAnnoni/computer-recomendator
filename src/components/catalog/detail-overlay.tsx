"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Cpu,
  HardDrive,
  Monitor,
  Battery,
  Laptop2,
  MonitorSmartphone,
  Weight,
  MemoryStick,
  type LucideIcon,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import type { Laptop } from "@/types/laptop";

interface DetailOverlayProps {
  laptop: Laptop;
  onClose: () => void;
}

export function DetailOverlay({ laptop, onClose }: DetailOverlayProps) {
  const router = useRouter();
  const [selectedImg, setSelectedImg] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  // Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Reset image when laptop changes
  useEffect(() => {
    setSelectedImg(0);
  }, [laptop.id]);

  // Touch gesture handlers — swipe-down (from top) or swipe-right to close
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    touchStart.current = null;

    // Swipe right to close (anywhere, horizontal dominant)
    if (dx > 90 && Math.abs(dy) < 80) {
      onClose();
      return;
    }

    // Swipe down to close (only when scrolled to top)
    const scrollTop = scrollRef.current?.scrollTop ?? 0;
    if (dy > 110 && Math.abs(dx) < 80 && scrollTop < 10) {
      onClose();
    }
  };

  // Build image list
  const allImages = [
    laptop.image_url,
    ...(laptop.gallery_images ?? []),
  ].filter(Boolean) as string[];

  const specsToShow = [
    { label: "CPU", value: laptop.cpu, icon: Cpu },
    { label: "RAM", value: laptop.ram, icon: MemoryStick },
    { label: "GPU", value: laptop.gpu, icon: Monitor },
    { label: "Almacenamiento", value: laptop.storage, icon: HardDrive },
    { label: "Pantalla", value: laptop.screen_size, icon: MonitorSmartphone },
    { label: "Batería", value: laptop.battery, icon: Battery },
    { label: "Sistema Operativo", value: laptop.os, icon: Laptop2 },
    { label: "Peso", value: laptop.weight, icon: Weight },
  ].filter((s) => s.value != null) as { label: string; value: string; icon: LucideIcon }[];

  return (
    <div
      className="flex flex-col h-full"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── Header (not sticky — flex item so it never scrolls away) ── */}
      <div className="flex-shrink-0 relative flex items-center px-4 py-3 bg-background/70 backdrop-blur border-b border-white/10">
        {/* Drag-pill indicator */}
        <div className="absolute top-1.5 left-0 right-0 flex justify-center pointer-events-none">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="flex items-center justify-center size-11 rounded-full hover:bg-white/10 transition-colors focus:outline-none"
        >
          <X className="size-5" />
        </button>
      </div>

      {/* ── Scrollable content ── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="px-4 sm:px-8 pb-16">

          {/* Hero: image + info */}
          <div className="flex flex-col sm:flex-row gap-12 mt-8 sm:items-center">

            {/* Image column */}
            <div className="sm:w-[35%] flex-shrink-0 flex flex-col gap-3">
              <div className="rounded-2xl overflow-hidden bg-muted aspect-[4/3]">
                {allImages.length > 0 ? (
                  <img
                    src={allImages[selectedImg]}
                    alt={laptop.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                    {laptop.brand}
                  </div>
                )}
              </div>

              {allImages.length > 1 && (
                <div className="flex gap-2">
                  {allImages.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImg(i)}
                      aria-label={`Imagen ${i + 1}`}
                      className={`w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-colors focus:outline-none ${
                        selectedImg === i
                          ? "border-primary"
                          : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info column */}
            <div className="flex-1 flex flex-col justify-center pl-0 sm:pl-4">
              <h1 className="text-[36px] sm:text-[44px] font-bold leading-tight">
                {laptop.name}
              </h1>
              <p className="text-[32px] sm:text-[36px] font-bold mt-2">
                ${laptop.price.toLocaleString()}
              </p>

              {laptop.description && (
                <p className="text-[15px] text-muted-foreground mt-4 leading-relaxed">
                  {laptop.description}
                </p>
              )}

              {laptop.simplified_tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {laptop.simplified_tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[12px] bg-secondary text-secondary-foreground px-2.5 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <a
                  href={laptop.affiliate_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Comprar ${laptop.name}`}
                  className={buttonVariants({ variant: "default", size: "lg" })}
                >
                  Comprar Ahora
                </a>
                <button
                  onClick={() => router.push(`/compare?laptop=${laptop.id}`)}
                  className={buttonVariants({ variant: "outline", size: "lg" })}
                >
                  Comparar
                </button>
              </div>
            </div>
          </div>

          {/* Specs grid */}
          {specsToShow.length > 0 && (
            <div className="mt-12">
              <h2 className="text-[20px] font-semibold mb-4">Especificaciones Técnicas</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 border-t border-l border-white/10 rounded-xl overflow-hidden">
                {specsToShow.map((spec) => (
                  <div
                    key={spec.label}
                    className="flex items-start gap-3 p-4 border-b border-r border-white/10"
                  >
                    <spec.icon className="size-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        {spec.label}
                      </p>
                      <p className="text-[15px] font-medium mt-0.5 leading-snug">
                        {spec.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendation */}
          {laptop.influencer_note && laptop.influencer_note.length > 0 && (
            <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-[13px] font-semibold uppercase tracking-wider text-primary mb-2">
                💡 Recomendación
              </p>
              <p className="text-[15px] text-muted-foreground leading-relaxed italic">
                {laptop.influencer_note}
              </p>
              {laptop.recommendation_score != null && (
                <p className="text-[15px] font-semibold mt-3 text-foreground">
                  Puntaje: {laptop.recommendation_score}/10
                </p>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
