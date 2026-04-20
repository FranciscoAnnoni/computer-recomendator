"use client";

import { useState } from "react";
import { Cpu, HardDrive, MemoryStick } from "lucide-react";
import type { Laptop } from "@/types/laptop";

interface ProfileLaptopCardProps {
  laptop: Laptop;
  rank?: number;
  onVerMas: () => void;
}

export function ProfileLaptopCard({ laptop, rank, onVerMas }: ProfileLaptopCardProps) {
  const [imgError, setImgError] = useState(false);

  const specs = [
    { icon: Cpu, value: laptop.cpu },
    { icon: MemoryStick, value: laptop.ram },
    { icon: HardDrive, value: laptop.storage },
  ].filter((s) => s.value);

  return (
    <article
      onClick={onVerMas}
      className="ed-card cursor-pointer"
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        gap: '1.5rem',
        padding: '1.5rem',
      }}
    >
      {/* Accent bar */}
      <div style={{
        position: 'absolute',
        top: 0, left: '1.5rem',
        width: 24, height: 2,
        background: 'var(--pr)',
      }} />

      {/* Rank badge */}
      {rank !== undefined && (
        <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
          <span className="label-ed-sm" style={{ fontFamily: 'ui-monospace, monospace', color: 'var(--on-sur-muted)' }}>
            #{String(rank).padStart(2, '0')}
          </span>
        </div>
      )}

      {/* Image */}
      <div style={{ width: 112, height: 112, flexShrink: 0 }}>
        <div className="w-full h-full rounded-xl overflow-hidden bg-white/5 flex items-center justify-center">
          {laptop.image_url && !imgError ? (
            <img
              src={laptop.image_url}
              alt={laptop.name}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <span className="label-ed-sm text-center px-2">{laptop.brand}</span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="min-w-0">
        <div className="label-ed-sm" style={{ marginBottom: 4 }}>{laptop.brand}</div>
        <h3 className="title-md" style={{ margin: 0, marginBottom: 6 }}>{laptop.name}</h3>
        {laptop.influencer_note && (
          <p
            style={{
              margin: 0, marginBottom: 12, fontSize: '0.8125rem',
              color: 'var(--on-sur-var)', lineHeight: 1.5,
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}
          >
            {laptop.influencer_note}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {specs.map((spec, i) => (
            <span key={i} className="spec-pill-ed flex items-center gap-1">
              <spec.icon className="size-3 shrink-0" />
              {spec.value}
            </span>
          ))}
        </div>
      </div>

      {/* Price + CTA */}
      <div
        style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'flex-end', justifyContent: 'space-between',
          minWidth: 120,
        }}
      >
        <div />
        <div style={{ textAlign: 'right' }}>
          <div className="headline-sm" style={{ margin: 0, fontFamily: 'ui-monospace, monospace' }}>
            ${laptop.price.toLocaleString()}
          </div>
          <div
            style={{
              marginTop: 6, fontSize: '0.75rem', fontWeight: 600,
              color: 'var(--pr)', display: 'flex', alignItems: 'center',
              gap: 4, justifyContent: 'flex-end',
            }}
          >
            Ver más →
          </div>
        </div>
      </div>
    </article>
  );
}
