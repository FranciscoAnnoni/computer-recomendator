"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { X, Cpu, HardDrive, Monitor, Battery, Laptop2, MonitorSmartphone, Weight, MemoryStick, type LucideIcon } from "lucide-react";
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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => { setSelectedImg(0); }, [laptop.id]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    touchStart.current = null;
    if (dx > 90 && Math.abs(dy) < 80) { onClose(); return; }
    const scrollTop = scrollRef.current?.scrollTop ?? 0;
    if (dy > 110 && Math.abs(dx) < 80 && scrollTop < 10) onClose();
  };

  const allImages = [laptop.image_url, ...(laptop.gallery_images ?? [])].filter(Boolean) as string[];

  const specs: { label: string; value: string; icon: LucideIcon }[] = [
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
      {/* Header */}
      <div style={{
        flexShrink: 0,
        position: 'relative', zIndex: 20,
        padding: '0.625rem 1rem',
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        background: 'var(--ed-overlay-header-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--ed-navbar-border)',
      }}>
        {/* X button — top left */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          aria-label="Cerrar"
          className="icon-btn-ed"
        >
          <X className="size-4" />
        </button>
        {/* Drag pill — centered */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 36, height: 3, background: 'rgba(128,128,128,0.3)', borderRadius: 2 }} />
        </div>
        {/* Spacer to balance the X button */}
        <div style={{ width: 36, height: 36 }} />
      </div>

      {/* Scrollable content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="px-4 sm:px-10 md:px-12 pt-6 sm:pt-8 pb-16" style={{ maxWidth: 960, margin: '0 auto' }}>

          {/* Hero: image + info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}
            className="sm-stack">
            {/* Image column */}
            <div>
              <div style={{
                aspectRatio: '4/3', borderRadius: '1.25rem',
                background: 'var(--ed-quiz-card-bg)',
                position: 'relative', overflow: 'hidden',
                display: 'grid', placeItems: 'center',
                boxShadow: 'inset 0 0 0 1px var(--ed-border-card)',
              }}>
                {allImages.length > 0 ? (
                  <img src={allImages[selectedImg]} alt={laptop.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="label-ed" style={{ color: 'var(--on-sur-muted)' }}>{laptop.brand}</span>
                )}
              </div>
              {allImages.length > 1 && (
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  {allImages.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImg(i)}
                      style={{
                        flex: 1, aspectRatio: '4/3',
                        borderRadius: 8, overflow: 'hidden',
                        boxShadow: i === selectedImg ? 'inset 0 0 0 2px var(--pr)' : 'inset 0 0 0 1px rgba(255,255,255,0.05)',
                        opacity: i === selectedImg ? 1 : 0.5,
                        cursor: 'pointer', border: 0, padding: 0,
                        transition: 'opacity 0.2s',
                      }}
                    >
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info column */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div className="label-ed" style={{ color: 'var(--pr-fixed-dim)', marginBottom: 8 }}>{laptop.brand}</div>
              <h2 className="headline-lg" style={{ margin: 0, marginBottom: '1rem' }}>{laptop.name}</h2>

              {laptop.description && (
                <p style={{ margin: 0, marginBottom: '1.5rem', fontSize: '0.9375rem', color: 'var(--on-sur-var)', lineHeight: 1.6 }}>
                  {laptop.description}
                </p>
              )}

              {laptop.simplified_tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: '1.5rem' }}>
                  {laptop.simplified_tags.map((tag) => (
                    <span key={tag} className="chip-ed" style={{ cursor: 'default' }}>{tag}</span>
                  ))}
                </div>
              )}

              <div style={{ marginBottom: '1.5rem' }}>
                <div className="label-ed-sm">Precio</div>
                <div className="headline-lg" style={{ marginTop: 4, fontFamily: 'ui-monospace, monospace' }}>
                  ${laptop.price.toLocaleString()}
                </div>
              </div>

              <div className="flex gap-2 sm:gap-3">
                <a
                  href={laptop.affiliate_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ed btn-ed-sm sm:btn-ed-md btn-primary-ed"
                  style={{ flex: 1, textDecoration: 'none', textAlign: 'center' }}
                >
                  Comprar →
                </a>
                <button
                  onClick={() => router.push(`/compare?laptop=${laptop.id}`)}
                  className="btn-ed btn-ed-sm sm:btn-ed-md btn-ghost-ed shrink-0"
                >
                  Comparar
                </button>
              </div>
            </div>
          </div>

          {/* Specs grid */}
          {specs.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <div className="label-ed" style={{ color: 'var(--pr-fixed-dim)', marginBottom: '1rem' }}>Ficha técnica</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem 1rem' }}
                className="specs-grid">
                {specs.map((s) => (
                  <div key={s.label}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <s.icon className="size-3" style={{ color: 'var(--on-sur-muted)' }} />
                      <span className="label-ed-sm">{s.label}</span>
                    </div>
                    <div style={{ fontSize: '0.9375rem', color: 'var(--on-sur)' }}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendation box */}
          {laptop.influencer_note && laptop.influencer_note.length > 0 && (
            <div style={{
              padding: '1.5rem',
              borderRadius: '1rem',
              background: 'var(--ed-recommendation-bg)',
              boxShadow: 'inset 0 0 0 1px var(--ed-recommendation-border)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: '0.75rem' }}>
                <span style={{ fontSize: 12 }}>✦</span>
                <span className="label-ed" style={{ color: 'var(--pr-fixed-dim)' }}>Recomendación del curador</span>
                {laptop.recommendation_score != null && (
                  <span className="label-ed-sm" style={{ marginLeft: 'auto', fontFamily: 'ui-monospace, monospace' }}>
                    Puntaje {laptop.recommendation_score}/10
                  </span>
                )}
              </div>
              <p style={{ margin: 0, fontStyle: 'italic', color: 'var(--on-sur)', lineHeight: 1.6 }}>
                "{laptop.influencer_note}"
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
