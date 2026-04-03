"use client";

import Image from "next/image";
import { Cpu, MemoryStick, HardDrive, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Laptop } from "@/types/laptop";

interface CatalogCardProps {
  laptop: Laptop;
  onVerMas: (laptopId: string) => void;
}

export function CatalogCard({ laptop, onVerMas }: CatalogCardProps) {
  const hasInfluencer =
    laptop.influencer_note !== null && laptop.influencer_note.length > 0;

  const subtitle =
    laptop.simplified_tags.length > 0
      ? laptop.simplified_tags.slice(0, 3).join(" • ")
      : null;

  return (
    <article
      onClick={() => onVerMas(laptop.id)}
      className="flex flex-row items-center rounded-2xl border border-border bg-card hover:border-foreground/30 transition-colors cursor-pointer select-none"
    >
      {/* ── 1. Image ───────────────────────────── */}
      <div className="relative w-[100px] sm:w-[155px] shrink-0 self-stretch bg-muted rounded-l-2xl overflow-hidden">
        {laptop.image_url ? (
          <Image
            src={laptop.image_url}
            alt={laptop.name}
            fill
            sizes="(max-width: 640px) 100px, 155px"
            className="object-cover pointer-events-none"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[11px] text-muted-foreground font-mono p-2 text-center">
            {laptop.brand}
          </div>
        )}
        {hasInfluencer && (
          <span
            className="absolute top-2 left-2 text-primary text-sm leading-none select-none drop-shadow"
            aria-label="Recomendado por experto"
          >
            ★
          </span>
        )}
      </div>

      {/* ── 2. Name + subtitle + specs ─────────── */}
      <div className="flex flex-col justify-center flex-1 min-w-0 px-3 sm:px-6 py-3">
        <h3 className="text-[14px] sm:text-[18px] font-bold leading-snug text-foreground truncate">
          {laptop.name}
        </h3>

        {subtitle && (
          <p className="text-[11px] sm:text-[13px] text-muted-foreground mt-0.5 truncate">
            {subtitle}
          </p>
        )}

        {/* Spec row — single line, no wrap */}
        <div className="flex items-center gap-2 mt-1.5 overflow-hidden">
          <span className="flex items-center gap-1 shrink-0 text-[10px] sm:text-[13px] text-foreground/80">
            <Cpu className="size-3 sm:size-4 text-muted-foreground shrink-0" />
            <span className="sm:inline hidden">CPU: </span>{laptop.cpu}
          </span>
          <span className="text-muted-foreground/30 shrink-0 text-[10px] sm:text-[13px]">|</span>
          <span className="flex items-center gap-1 shrink-0 text-[10px] sm:text-[13px] text-foreground/80">
            <MemoryStick className="size-3 sm:size-4 text-muted-foreground shrink-0" />
            {laptop.ram}
          </span>
          <span className="text-muted-foreground/30 shrink-0 text-[10px] sm:text-[13px]">|</span>
          <span className="flex items-center gap-1 shrink-0 text-[10px] sm:text-[13px] text-foreground/80">
            <HardDrive className="size-3 sm:size-4 text-muted-foreground shrink-0" />
            {laptop.storage}
          </span>
        </div>

        {/* Price — mobile only */}
        <p className="text-[13px] font-bold text-foreground mt-1.5 sm:hidden">
          ${laptop.price.toLocaleString()}
        </p>
      </div>

      {/* ── 3. Price — desktop only ───────────── */}
      <div className="hidden sm:flex items-center justify-center shrink-0 px-5">
        <p className="text-[22px] font-bold text-muted-foreground whitespace-nowrap">
          ${laptop.price.toLocaleString()}
        </p>
      </div>

      {/* ── 4. Ver más button — desktop ── */}
      <div className="hidden sm:flex items-center justify-center px-5 shrink-0">
        <Button
          variant="outline"
          size="sm"
          className="text-[13px] px-4 h-9 rounded-xl border-primary text-primary hover:bg-primary/10 pointer-events-none"
          tabIndex={-1}
        >
          Ver más
        </Button>
      </div>

      {/* ── 4. Chevron — mobile ── */}
      <div className="sm:hidden flex items-center justify-center px-3 shrink-0 text-primary">
        <ChevronRight className="size-5" />
      </div>
    </article>
  );
}
