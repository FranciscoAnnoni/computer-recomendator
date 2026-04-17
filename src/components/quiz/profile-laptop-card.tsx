"use client";

import { useState } from "react";
import { Cpu, HardDrive, MemoryStick, ChevronRight } from "lucide-react";
import type { Laptop } from "@/types/laptop";

interface ProfileLaptopCardProps {
  laptop: Laptop;
  onVerMas: () => void;
}

export function ProfileLaptopCard({ laptop, onVerMas }: ProfileLaptopCardProps) {
  const [imgError, setImgError] = useState(false);

  const specs = [
    { icon: Cpu, value: laptop.cpu },
    { icon: MemoryStick, value: laptop.ram },
    { icon: HardDrive, value: laptop.storage },
  ].filter((s) => s.value);

  return (
    <button
      onClick={onVerMas}
      className="group w-full flex items-stretch gap-0 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer text-left"
    >
      {/* Image */}
      <div className="w-28 sm:w-36 shrink-0 p-3 flex items-center">
        <div className="w-full rounded-xl overflow-hidden bg-muted">
        {laptop.image_url && !imgError ? (
          <img
            src={laptop.image_url}
            alt={laptop.name}
            className="w-full aspect-square object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full aspect-square flex items-center justify-center text-muted-foreground text-xs text-center px-2 font-medium">
            {laptop.brand}
          </div>
        )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-between p-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
            {laptop.brand}
          </p>
          <h3 className="font-semibold text-foreground text-base leading-snug">
            {laptop.name}
          </h3>

          {laptop.influencer_note && (
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed line-clamp-2">
              {laptop.influencer_note}
            </p>
          )}

          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3">
            {specs.map((spec, i) => (
              <span key={i} className="flex items-center gap-1 text-xs text-muted-foreground">
                <spec.icon className="size-3 shrink-0" />
                <span>{spec.value}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mt-3">
          <p className="text-lg font-bold text-foreground">
            ${laptop.price.toLocaleString()}
          </p>
          <span className="inline-flex items-center gap-0.5 text-sm font-medium text-primary group-hover:underline">
            Ver más
            <ChevronRight className="size-4" />
          </span>
        </div>
      </div>
    </button>
  );
}
