"use client";

import { useState } from "react";
import Link from "next/link";
import { Cpu, HardDrive, MemoryStick, Battery, Monitor } from "lucide-react";
import type { Laptop } from "@/types/laptop";

interface ProfileLaptopCardProps {
  laptop: Laptop;
}

export function ProfileLaptopCard({ laptop }: ProfileLaptopCardProps) {
  const [imgError, setImgError] = useState(false);

  const specs = [
    { icon: Cpu, value: laptop.cpu },
    { icon: MemoryStick, value: laptop.ram },
    { icon: HardDrive, value: laptop.storage },
    { icon: Monitor, value: laptop.screen_size },
    { icon: Battery, value: laptop.battery },
  ].filter((s) => s.value);

  const topSpecs = specs.slice(0, 3);

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 hover:bg-muted/30 transition-colors">
      {/* Image */}
      <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-muted">
        {laptop.image_url && !imgError ? (
          <img
            src={laptop.image_url}
            alt={laptop.name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs text-center px-1 font-medium">
            {laptop.brand}
          </div>
        )}
      </div>

      {/* Name + description */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-foreground text-sm leading-tight truncate">
          {laptop.name}
        </h3>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
          {laptop.influencer_note ?? laptop.simplified_tags.slice(0, 2).join(" · ")}
        </p>
        <p className="text-sm font-semibold text-foreground mt-1.5">
          ${laptop.price.toLocaleString()}
        </p>
      </div>

      {/* Specs — hidden on small screens */}
      <div className="hidden sm:flex flex-col gap-1 shrink-0 min-w-[110px]">
        {topSpecs.map((spec, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <spec.icon className="size-3 shrink-0" />
            <span className="whitespace-nowrap truncate max-w-[90px]">{spec.value}</span>
          </div>
        ))}
      </div>

      {/* CTA button */}
      <div className="flex items-center shrink-0 ml-1">
        <Link
          href={`/catalog?laptop=${laptop.id}`}
          className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-3 py-2 text-xs font-medium hover:bg-primary/90 transition-colors whitespace-nowrap"
        >
          Ver más
        </Link>
      </div>
    </div>
  );
}
