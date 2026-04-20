"use client";

import Image from "next/image";
import { Cpu, MemoryStick, HardDrive, ChevronRight } from "lucide-react";
import type { Laptop } from "@/types/laptop";

interface CatalogCardProps {
  laptop: Laptop;
  onVerMas: (laptopId: string) => void;
}

export function CatalogCard({ laptop, onVerMas }: CatalogCardProps) {
  const hasInfluencer =
    laptop.influencer_note !== null && laptop.influencer_note.length > 0;

  return (
    <article
      onClick={() => onVerMas(laptop.id)}
      className="ed-card-row flex flex-row items-center cursor-pointer select-none"
      style={{ padding: '0.75rem 1.25rem', gap: '1.5rem' }}
    >
      {/* Image */}
      <div className="relative shrink-0" style={{ width: 72, height: 72 }}>
        <div className="w-full h-full rounded-xl overflow-hidden bg-white/5 flex items-center justify-center">
          {laptop.image_url ? (
            <Image
              src={laptop.image_url}
              alt={laptop.name}
              fill
              sizes="72px"
              className="object-cover pointer-events-none"
            />
          ) : (
            <span className="label-ed-sm">{laptop.brand}</span>
          )}
        </div>
        {laptop.availability_warning && (
          <span
            className="absolute -bottom-1 -left-1 -right-1 text-center"
            style={{
              padding: '2px 6px',
              background: '#ff7a85',
              color: '#2a0005',
              borderRadius: 4,
              fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
            }}
          >
            Stock limitado
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="label-ed-sm">{laptop.brand}</span>
          {hasInfluencer && (
            <span className="label-ed-sm" style={{ color: 'var(--pr-fixed-dim)' }}>• Top pick</span>
          )}
        </div>
        <div className="title-md truncate" style={{ marginBottom: 4 }}>{laptop.name}</div>
        <div className="flex items-center gap-3" style={{ color: 'var(--on-sur-muted)', fontSize: '0.8125rem' }}>
          <span className="flex items-center gap-1">
            <Cpu className="size-3 shrink-0" />
            <span className="hidden sm:inline">CPU: </span>
            <span className="max-w-[60px] sm:max-w-none truncate">{laptop.cpu}</span>
          </span>
          <span style={{ opacity: 0.4 }}>|</span>
          <span className="flex items-center gap-1 shrink-0">
            <MemoryStick className="size-3 shrink-0" />
            {laptop.ram}
          </span>
          <span style={{ opacity: 0.4 }}>|</span>
          <span className="flex items-center gap-1 shrink-0">
            <HardDrive className="size-3 shrink-0" />
            {laptop.storage}
          </span>
        </div>
        {/* Price — mobile only */}
        <p className="sm:hidden" style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--on-sur)', marginTop: 4, fontFamily: 'ui-monospace, monospace' }}>
          ${laptop.price.toLocaleString()}
        </p>
      </div>

      {/* Price — desktop */}
      <div className="hidden sm:block shrink-0 text-right" style={{ minWidth: 120 }}>
        <div className="title-md" style={{ fontFamily: 'ui-monospace, monospace', color: 'var(--on-sur)' }}>
          ${laptop.price.toLocaleString()}
        </div>
      </div>

      {/* CTA — desktop */}
      <button
        className="hidden sm:inline-flex btn-ed btn-ed-sm btn-ghost-ed shrink-0"
        onClick={e => { e.stopPropagation(); onVerMas(laptop.id); }}
        tabIndex={-1}
      >
        Ver más →
      </button>

      {/* Chevron — mobile */}
      <ChevronRight className="sm:hidden size-4 shrink-0" style={{ color: 'var(--pr)' }} />
    </article>
  );
}
