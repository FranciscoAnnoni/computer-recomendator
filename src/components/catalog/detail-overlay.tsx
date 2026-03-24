"use client";

import { useEffect } from "react";
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
  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const specsToShow = [
    { label: "CPU", value: laptop.cpu, icon: Cpu },
    { label: "RAM", value: laptop.ram, icon: MemoryStick },
    { label: "Almacenamiento", value: laptop.storage, icon: HardDrive },
    { label: "GPU", value: laptop.gpu, icon: Monitor },
    { label: "Bateria", value: laptop.battery, icon: Battery },
    { label: "Sistema operativo", value: laptop.os, icon: Laptop2 },
    { label: "Pantalla", value: laptop.screen_size, icon: MonitorSmartphone },
    { label: "Peso", value: laptop.weight, icon: Weight },
  ].filter((s) => s.value != null) as { label: string; value: string; icon: LucideIcon }[];

  return (
    <>
      {/* Sticky header bar */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-background/80 backdrop-blur">
        <button
          onClick={onClose}
          aria-label="Cerrar"
          autoFocus
          className="flex items-center justify-center size-11"
        >
          <X className="size-5" />
        </button>
        <a
          href={laptop.affiliate_link}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Comprar ${laptop.name} (abre en nueva pestana)`}
          className={buttonVariants({ variant: "default", size: "lg" })}
        >
          Comprar Ahora
        </a>
      </div>

      {/* Scrollable content */}
      <div className="px-4 pb-8">
        {/* Top section: image (40%) + title+price (60%) */}
        <div className="flex gap-4 mt-4">
          <div className="w-2/5 flex-shrink-0">
            {laptop.image_url ? (
              <img
                src={laptop.image_url}
                alt={laptop.name}
                className="w-full aspect-square object-cover rounded-xl"
              />
            ) : (
              <div className="w-full aspect-square bg-muted rounded-xl flex items-center justify-center text-muted-foreground text-sm">
                {laptop.brand}
              </div>
            )}
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <h2 className="text-[28px] font-medium leading-[1.3]">{laptop.name}</h2>
            <p className="text-[17px] text-muted-foreground mt-1">
              ${laptop.price.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Simplified tags */}
        <div className="flex flex-wrap gap-1 mt-6">
          {laptop.simplified_tags.map((tag) => (
            <span
              key={tag}
              className="text-[12px] bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Tech specs grid — 2 columns */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          {specsToShow.map((spec) => (
            <div key={spec.label} className="flex items-start gap-2">
              <spec.icon className="size-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[12px] text-muted-foreground">{spec.label}</p>
                <p className="text-[17px]">{spec.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Influencer section — conditional */}
        {laptop.influencer_note && laptop.influencer_note.length > 0 && (
          <div className="mt-6 pt-6 border-t">
            <p className="text-[12px] font-medium uppercase tracking-wide text-primary">
              Recomendacion de experto
            </p>
            <p className="text-[17px] italic text-muted-foreground mt-2">
              {laptop.influencer_note}
            </p>
            {laptop.recommendation_score != null && (
              <p className="text-[17px] mt-2">{laptop.recommendation_score}/10</p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
