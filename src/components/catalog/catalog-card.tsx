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
  const hasInfluencer = laptop.influencer_note !== null && laptop.influencer_note.length > 0;

  return (
    <article
      onClick={() => onVerMas(laptop.id)}
      className="ed-card-row flex flex-row items-stretch cursor-pointer select-none"
    >
      {/* Image — self-stretch, fills card height like the old version */}
      <div
        className="relative shrink-0 self-stretch overflow-hidden w-[100px] sm:w-[130px]"
        style={{
          background: 'var(--ed-img-bg)',
          borderRadius: '0.75rem 0 0 0.75rem',
          minHeight: 80,
        }}
      >
        {laptop.image_url ? (
          <Image
            src={laptop.image_url}
            alt={laptop.name}
            fill
            sizes="(min-width: 640px) 130px, 100px"
            className="object-cover pointer-events-none"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-2 text-center">
            <span className="label-ed-sm">{laptop.brand}</span>
          </div>
        )}

        {/* Top pick indicator */}
        {hasInfluencer && (
          <span
            className="absolute top-2 left-2 drop-shadow"
            style={{ color: 'var(--pr-bright)', fontSize: 14, lineHeight: 1 }}
            aria-label="Recomendado"
          >
            ★
          </span>
        )}

        {/* Stock limitado — subtle badge like old version */}
        {laptop.availability_warning && (
          <span
            className="absolute bottom-2 left-2 right-2 text-center"
            style={{
              padding: '2px 5px',
              background: 'rgba(239,68,68,0.18)',
              color: '#f87171',
              border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: 4,
              fontSize: 9,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              lineHeight: 1.4,
            }}
          >
            Stock limitado
          </span>
        )}
      </div>

      {/* Content — name + specs + mobile price */}
      <div
        className="flex flex-col justify-center flex-1 min-w-0 px-[0.875rem] py-3 sm:py-4 sm:px-5"
      >
        <div className="label-ed-sm" style={{ marginBottom: 3 }}>{laptop.brand}</div>

        {/* Full name — no truncation */}
        <div
          className="text-[0.9375rem] sm:text-[1.0625rem]"
          style={{
            fontFamily: 'var(--font-display-ed)',
            fontWeight: 600,
            lineHeight: 1.25,
            letterSpacing: '-0.005em',
            color: 'var(--on-sur)',
            marginBottom: 5,
          }}
        >
          {laptop.name}
        </div>

        {/* Specs row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            flexWrap: 'wrap',
            color: 'var(--on-sur-muted)',
            fontSize: '0.6875rem',
            lineHeight: 1.2,
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Cpu size={11} className="shrink-0" />
            <span style={{ maxWidth: '5.5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {laptop.cpu}
            </span>
          </span>
          <span style={{ opacity: 0.35 }}>·</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
            <MemoryStick size={11} className="shrink-0" />
            {laptop.ram}
          </span>
          <span style={{ opacity: 0.35 }}>·</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
            <HardDrive size={11} className="shrink-0" />
            {laptop.storage}
          </span>
        </div>

        {/* Price — mobile only (sm:hidden) */}
        <p
          className="sm:hidden"
          style={{
            marginTop: 6,
            fontSize: '0.875rem',
            fontWeight: 700,
            fontFamily: 'ui-monospace, monospace',
            color: 'var(--on-sur)',
          }}
        >
          ${laptop.price.toLocaleString()}
        </p>
      </div>

      {/* Price — desktop only */}
      <div
        className="hidden sm:flex items-center justify-center shrink-0"
        style={{ padding: '0 1.25rem' }}
      >
        <p style={{ fontFamily: 'ui-monospace, monospace', fontWeight: 700, fontSize: '1.125rem', color: 'var(--on-sur)', whiteSpace: 'nowrap' }}>
          ${laptop.price.toLocaleString()}
        </p>
      </div>

      {/* Ver más button — desktop only */}
      <div className="hidden sm:flex items-center justify-center shrink-0" style={{ paddingRight: '1.25rem' }}>
        <Button
          variant="outline"
          size="sm"
          className="pointer-events-none"
          tabIndex={-1}
          style={{ borderColor: 'var(--pr)', color: 'var(--pr)', borderRadius: 12 }}
        >
          Ver más
        </Button>
      </div>

      {/* Chevron — mobile only */}
      <div
        className="sm:hidden flex items-center justify-center shrink-0"
        style={{ paddingRight: '0.875rem' }}
      >
        <ChevronRight size={18} style={{ color: 'var(--pr)' }} />
      </div>
    </article>
  );
}
