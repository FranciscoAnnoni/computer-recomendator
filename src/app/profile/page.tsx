"use client";

import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ProfileLaptopCard } from "@/components/quiz/profile-laptop-card";
import { DetailOverlay } from "@/components/catalog/detail-overlay";
import { getProfileColor } from "@/lib/profile-color";
import { PROFILE_STORAGE_KEY, QUIZ_STORAGE_KEY } from "@/types/quiz";
import type { ProfileResult } from "@/types/quiz";
import type { Laptop } from "@/types/laptop";

type StoredProfile = ProfileResult & { laptops: Laptop[] };

export default function ProfilePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<StoredProfile | null>(null);
  const [activeLaptop, setActiveLaptop] = useState<Laptop | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (!raw) { router.push("/quiz"); return; }
      const parsed = JSON.parse(raw) as StoredProfile;
      if (!parsed.profile_name) { router.push("/quiz"); return; }
      setProfile(parsed);
    } catch {
      router.push("/quiz");
    }
  }, [router]);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    document.body.style.overflow = activeLaptop ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [activeLaptop]);

  const handleCloseOverlay = useCallback(() => setActiveLaptop(null), []);

  const handleRehacer = () => {
    try {
      localStorage.removeItem(PROFILE_STORAGE_KEY);
      localStorage.removeItem(QUIZ_STORAGE_KEY);
    } catch { /* ignore */ }
    router.push("/quiz");
  };

  if (!profile) return null;

  const color = getProfileColor(
    profile.workload,
    profile.lifestyle,
    profile.budget,
    profile.os_preference
  );
  const colorDark = color.replace(/(\d+)%\)$/, (_, l) => `${Math.max(5, parseInt(l) - 38)}%)`);
  const displayedLaptops = profile.laptops ?? [];

  return (
    <>
      <main className="min-h-screen" style={{ paddingTop: '2rem', paddingBottom: '6rem' }}>
        <div style={{ maxWidth: 840, margin: '0 auto', padding: '0 1rem' }}>

          {/* Profile header card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{
              padding: '1.25rem',
              marginBottom: '2rem',
              borderRadius: '1.25rem',
              background: 'var(--ed-profile-card-bg)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: 'inset 0 0 0 1px var(--ed-profile-card-border), var(--ed-shadow-card)',
            }}
          >
            {/* Row: icon + text + button (column on mobile, row on desktop) */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Icon + text */}
              <div className="flex items-start gap-4 flex-1 min-w-0">
                {/* Icon — smaller on mobile */}
                <div
                  className="w-14 h-14 sm:w-20 sm:h-20 shrink-0"
                  style={{
                    borderRadius: '50%',
                    background: `radial-gradient(circle at 30% 30%, ${color}, ${colorDark})`,
                    display: 'grid', placeItems: 'center',
                    fontFamily: 'var(--font-display-ed)', fontWeight: 700,
                    fontSize: '1.5rem',
                    color: 'rgba(255,255,255,0.92)',
                    boxShadow: `0 0 0 1px rgba(255,255,255,0.08), 0 0 32px ${color}44`,
                  }}
                >
                  P
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="label-ed" style={{ color: 'var(--pr-fixed-dim)', marginBottom: 4 }}>Tu perfil</div>
                  <h1
                    style={{
                      margin: 0, marginBottom: 6,
                      fontFamily: 'var(--font-display-ed)', fontWeight: 700,
                      fontSize: 'clamp(1.125rem, 5vw, 1.75rem)',
                      lineHeight: 1.2, letterSpacing: '-0.02em',
                    }}
                  >
                    {profile.profile_name}
                  </h1>
                  <p className="text-[0.8125rem] sm:text-[0.9375rem]" style={{ margin: 0, color: 'var(--on-sur-var)', lineHeight: 1.5 }}>
                    {profile.profile_description}
                  </p>
                </div>
              </div>

              {/* Rehacer button — below on mobile, to the right on desktop */}
              <button
                className="btn-ed btn-ed-sm btn-ghost-ed w-full sm:w-auto sm:shrink-0"
                onClick={handleRehacer}
              >
                Rehacer quiz
              </button>
            </div>
          </motion.div>

          {/* Recommendations header */}
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h2 className="headline-md" style={{ margin: 0 }}>Recomendados para vos</h2>
            {displayedLaptops.length > 0 && (
              <span className="label-ed-sm" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {displayedLaptops.length} modelos
              </span>
            )}
          </div>

          {/* Laptop list */}
          {displayedLaptops.length > 0 ? (
            <div className="flex flex-col gap-3">
              {displayedLaptops.map((laptop, i) => (
                <motion.div
                  key={laptop.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06 * i, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <ProfileLaptopCard
                    laptop={laptop}
                    rank={i + 1}
                    onVerMas={() => setActiveLaptop(laptop)}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--on-sur-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '2rem 0' }}>
              Aún no hay laptops cargadas para este perfil. Volvé pronto.
            </p>
          )}
        </div>
      </main>

      {mounted && createPortal(
        <AnimatePresence>
          {activeLaptop && (
            <motion.div
              key={activeLaptop.id}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
              className="fixed inset-0 z-[200] bg-background/90 backdrop-blur-2xl"
            >
              <DetailOverlay laptop={activeLaptop} onClose={handleCloseOverlay} />
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
