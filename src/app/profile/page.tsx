"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ProfileLaptopCard } from "@/components/quiz/profile-laptop-card";
import { DetailOverlay } from "@/components/catalog/detail-overlay";
import { getProfileColor } from "@/lib/profile-color";
import { PROFILE_STORAGE_KEY, QUIZ_STORAGE_KEY } from "@/types/quiz";
import type { ProfileResult } from "@/types/quiz";
import type { Laptop } from "@/types/laptop";

type StoredProfile = ProfileResult & { laptops: Laptop[] };

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<StoredProfile | null>(null);
  const [activeLaptop, setActiveLaptop] = useState<Laptop | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (!raw) {
        router.push("/quiz");
        return;
      }
      const parsed = JSON.parse(raw) as StoredProfile;
      if (!parsed.profile_name) {
        router.push("/quiz");
        return;
      }
      setProfile(parsed);
    } catch {
      router.push("/quiz");
    }
  }, [router]);

  // Body scroll lock when overlay is open
  useEffect(() => {
    document.body.style.overflow = activeLaptop ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [activeLaptop]);

  const handleCloseOverlay = useCallback(() => setActiveLaptop(null), []);

  const handleRehacer = () => {
    try {
      localStorage.removeItem(PROFILE_STORAGE_KEY);
      localStorage.removeItem(QUIZ_STORAGE_KEY);
    } catch {
      // ignore
    }
    router.push("/quiz");
  };

  if (!profile) return null;

  const color = getProfileColor(
    profile.workload,
    profile.lifestyle,
    profile.budget,
    profile.os_preference
  );

  const displayedLaptops = profile.laptops ?? [];

  return (
    <>
      <main className="min-h-screen" style={{ paddingTop: '3rem', paddingBottom: '6rem' }}>
        <div style={{ maxWidth: 840, margin: '0 auto', padding: '0 1.5rem' }}>

          {/* Profile header card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              gap: '2rem',
              alignItems: 'center',
              padding: '2rem',
              marginBottom: '3rem',
              borderRadius: '1.25rem',
              background: 'rgba(25,27,35,0.55)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05)',
            }}
          >
            <div
              style={{
                width: 96, height: 96, borderRadius: '50%',
                background: `radial-gradient(circle at 30% 30%, ${color}, color-mix(in srgb, ${color} 60%, #000))`,
                display: 'grid', placeItems: 'center',
                fontFamily: 'var(--font-display-ed)', fontWeight: 700,
                fontSize: '2.5rem', color: 'rgba(255,255,255,0.92)',
                boxShadow: `0 0 0 1px rgba(255,255,255,0.08), 0 0 48px ${color}55`,
                flexShrink: 0,
              }}
            >
              P
            </div>
            <div>
              <div className="label-ed" style={{ color: 'var(--pr-fixed-dim)', marginBottom: 6 }}>Tu perfil</div>
              <h1 className="display-md" style={{ margin: 0, marginBottom: 8 }}>{profile.profile_name}</h1>
              <p style={{ margin: 0, color: 'var(--on-sur-var)', lineHeight: 1.55, marginBottom: '1rem' }}>
                {profile.profile_description}
              </p>
              <button className="btn-ed btn-ed-sm btn-ghost-ed" onClick={handleRehacer}>
                Rehacer quiz
              </button>
            </div>
          </motion.div>

          {/* Recommendations header */}
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h2 className="headline-lg" style={{ margin: 0 }}>Recomendados para vos</h2>
            {displayedLaptops.length > 0 && (
              <span className="label-ed-sm">{displayedLaptops.length} modelos</span>
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
                  transition={{ delay: 0.08 * i, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
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

      {/* Detail overlay — same as catalog */}
      <AnimatePresence>
        {activeLaptop && (
          <motion.div
            key={activeLaptop.id}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-0 z-50 bg-background/90 backdrop-blur-2xl"
          >
            <DetailOverlay laptop={activeLaptop} onClose={handleCloseOverlay} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
