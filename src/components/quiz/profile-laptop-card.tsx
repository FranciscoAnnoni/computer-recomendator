"use client";

import { useState } from "react";
import { Cpu, HardDrive, MemoryStick, ChevronRight } from "lucide-react";
import type { Laptop } from "@/types/laptop";

interface ProfileLaptopCardProps {
  laptop: Laptop;
  rank?: number;
  onVerMas: () => void;
}

export function ProfileLaptopCard({ laptop, rank, onVerMas }: ProfileLaptopCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <article
      onClick={onVerMas}
      className="ed-card-row flex flex-row items-stretch cursor-pointer select-none h-[104px] sm:h-[120px] overflow-hidden"
    >
      {/* Image — self-stretch like catalog card */}
      <div
        className="relative shrink-0 self-stretch overflow-hidden w-[88px] sm:w-[120px]"
        style={{ background: 'var(--ed-img-bg)', borderRadius: '0.75rem 0 0 0.75rem', minHeight: 72 }}
      >
        {laptop.image_url && !imgError ? (
          <img
            src={laptop.image_url}
            alt={laptop.name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-2">
            <span className="label-ed-sm text-center">{laptop.brand}</span>
          </div>
        )}
        {rank !== undefined && (
          <div style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.45)', borderRadius: 4, padding: '1px 5px' }}>
            <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>
              #{String(rank).padStart(2, '0')}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col justify-center flex-1 min-w-0 px-3 py-[0.625rem] sm:px-4 sm:py-3">
        <div className="label-ed-sm" style={{ marginBottom: 2 }}>{laptop.brand}</div>
        <div className="text-[0.9375rem] sm:text-[1.0625rem] line-clamp-2" style={{ fontFamily: 'var(--font-display-ed)', fontWeight: 600, lineHeight: 1.25, letterSpacing: '-0.005em', color: 'var(--on-sur)', marginBottom: 4 }}>
          {laptop.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap', color: 'var(--on-sur-muted)', fontSize: '0.6875rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Cpu size={10} className="shrink-0" />
            <span style={{ maxWidth: '5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{laptop.cpu}</span>
          </span>
          <span style={{ opacity: 0.35 }}>·</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
            <MemoryStick size={10} className="shrink-0" />{laptop.ram}
          </span>
          <span style={{ opacity: 0.35 }}>·</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
            <HardDrive size={10} className="shrink-0" />{laptop.storage}
          </span>
        </div>
        {/* Price — mobile only */}
        <p className="sm:hidden" style={{ marginTop: 5, fontSize: '0.875rem', fontWeight: 700, fontFamily: 'ui-monospace, monospace', color: 'var(--on-sur)' }}>
          ${laptop.price.toLocaleString()}
        </p>
      </div>

      {/* Price — desktop only */}
      <div className="hidden sm:flex items-center justify-center shrink-0" style={{ padding: '0 1.25rem' }}>
        <p style={{ fontFamily: 'ui-monospace, monospace', fontWeight: 700, fontSize: '1.125rem', color: 'var(--on-sur)', whiteSpace: 'nowrap' }}>
          ${laptop.price.toLocaleString()}
        </p>
      </div>

      {/* Ver más button — desktop only */}
      <div className="hidden sm:flex items-center justify-center shrink-0" style={{ paddingRight: '1.25rem' }}>
        <span
          className="pointer-events-none"
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            padding: '0.375rem 0.875rem',
            fontSize: '0.8125rem', fontWeight: 600,
            border: '1px solid var(--pr)', color: 'var(--pr)',
            borderRadius: 12,
          }}
        >
          Ver más
        </span>
      </div>

      {/* Chevron — mobile only */}
      <div className="sm:hidden flex items-center justify-center shrink-0" style={{ paddingRight: '0.75rem' }}>
        <ChevronRight size={16} style={{ color: 'var(--pr)' }} />
      </div>
    </article>
  );
}
