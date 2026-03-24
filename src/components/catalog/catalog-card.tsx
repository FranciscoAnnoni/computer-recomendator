"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Laptop } from "@/types/laptop";

interface CatalogCardProps {
  laptop: Laptop;
  onVerMas: (laptopId: string) => void;
}

// Bracket-style spec pill used in the right panel
function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-3 py-2.5 text-[12px] font-mono text-foreground leading-none">
      [ {label}: {value} ]
    </div>
  );
}

export function CatalogCard({ laptop, onVerMas }: CatalogCardProps) {
  const [imgError, setImgError] = useState(false);

  const hasInfluencer =
    laptop.influencer_note !== null && laptop.influencer_note.length > 0;

  const subtitle =
    laptop.simplified_tags.length > 0
      ? laptop.simplified_tags.slice(0, 3).join(" · ")
      : null;

  return (
    <article className="flex flex-row rounded-xl border border-border bg-card overflow-hidden hover:border-foreground/30 hover:shadow-md transition-all duration-150 min-h-[110px]">

      {/* ── 1. Image ─────────────────────────────────────────── */}
      <div className="relative w-[110px] sm:w-[150px] shrink-0 bg-muted">
        {laptop.image_url && !imgError ? (
          <img
            src={laptop.image_url}
            alt={laptop.name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[11px] text-muted-foreground font-mono p-2 text-center">
            {laptop.brand}
          </div>
        )}

        {/* Influencer star badge */}
        {hasInfluencer && (
          <span
            className="absolute top-1.5 left-1.5 text-primary text-base leading-none select-none drop-shadow"
            aria-label="Recomendado por experto"
          >
            ★
          </span>
        )}
      </div>

      {/* ── 2. Title + description ───────────────────────────── */}
      <div className="flex flex-col justify-center flex-1 min-w-0 px-3 sm:px-4 py-3 border-r border-border">
        <h3 className="text-[15px] sm:text-[17px] font-semibold leading-snug text-foreground line-clamp-2">
          {laptop.name}
        </h3>

        {subtitle && (
          <p className="text-[12px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
            {subtitle}
          </p>
        )}

        {/* Price shown only on mobile (below title) */}
        <p className="text-[13px] font-semibold text-foreground mt-1.5 sm:hidden">
          ${laptop.price.toLocaleString()}
        </p>
      </div>

      {/* ── 3. Specs panel (desktop) ─────────────────────────── */}
      <div className="hidden sm:flex flex-col divide-y divide-border border-r border-border w-[190px] shrink-0 justify-center">
        <SpecRow label="Marca" value={laptop.brand} />
        <SpecRow label="Precio" value={`$${laptop.price.toLocaleString()} USD`} />
        <SpecRow label="RAM" value={laptop.ram} />
        <SpecRow label="Alma" value={laptop.storage} />
      </div>

      {/* ── 4. Ver más button ────────────────────────────────── */}
      <div className="flex items-center justify-center px-3 sm:px-4 shrink-0">
        {/* Desktop: text button */}
        <Button
          variant="outline"
          size="sm"
          className="hidden sm:flex h-9 border-primary text-primary hover:bg-primary/10 text-[13px]"
          onClick={() => onVerMas(laptop.id)}
        >
          Ver más
        </Button>

        {/* Mobile: arrow icon */}
        <button
          className="sm:hidden text-primary"
          onClick={() => onVerMas(laptop.id)}
          aria-label="Ver más"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>
    </article>
  );
}
