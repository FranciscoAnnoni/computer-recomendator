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
      <main className="min-h-screen">
        <div className="max-w-2xl mx-auto px-4 py-16">

          {/* Profile header */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="flex flex-col items-center text-center mb-12"
          >
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center text-white text-4xl font-bold mb-6 ring-4 ring-white/10 shadow-lg"
              style={{ backgroundColor: color }}
            >
              P
            </div>

            <h1 className="text-2xl font-semibold text-foreground tracking-tight">
              {profile.profile_name}
            </h1>
            <p className="text-muted-foreground mt-2 max-w-sm leading-relaxed">
              {profile.profile_description}
            </p>

            <Button variant="outline" className="mt-6" onClick={handleRehacer}>
              Rehacer quiz
            </Button>
          </motion.div>

          {/* Laptop list */}
          {displayedLaptops.length > 0 ? (
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Recomendados para vos:
              </h2>
              <div className="flex flex-col gap-3">
                {displayedLaptops.map((laptop, i) => (
                  <motion.div
                    key={laptop.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.07, duration: 0.25, ease: "easeOut" }}
                  >
                    <ProfileLaptopCard
                      laptop={laptop}
                      onVerMas={() => setActiveLaptop(laptop)}
                    />
                  </motion.div>
                ))}
              </div>
            </section>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-8">
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
