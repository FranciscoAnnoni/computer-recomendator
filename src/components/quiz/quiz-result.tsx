"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { QuizCelebration } from "@/components/quiz/quiz-celebration";
import { IdealPcCard } from "@/components/quiz/ideal-pc-card";
import { ProfileRevealCard } from "@/components/quiz/profile-reveal-card";
import { fetchProfile, fetchLaptopsByIds } from "@/lib/quiz-data";
import { PROFILE_STORAGE_KEY } from "@/types/quiz";
import type { Workload, Lifestyle, Budget, OsPreference, ProfileResult } from "@/types/quiz";

interface QuizResultProps {
  selections: [string | null, string | null, string | null, string | null];
  onRetry: () => void;
}

export function QuizResult({ selections, onRetry }: QuizResultProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [backendComplete, setBackendComplete] = useState(false);
  const [cardStep, setCardStep] = useState<null | "perfil" | "pc">(null);
  const [profileData, setProfileData] = useState<ProfileResult | null>(null);

  const handleNavigate = useCallback(() => {
    router.push("/profile");
  }, [router]);

  useEffect(() => {
    async function load() {
      setError(null);

      const [workload, lifestyle, budget, osPreference] = selections;

      try {
        const profileResult = await fetchProfile(
          workload as Workload,
          lifestyle as Lifestyle,
          budget as Budget,
          osPreference as OsPreference
        );

        const laptopResults = await fetchLaptopsByIds(profileResult.laptop_ids);
        const saved = { ...profileResult, laptops: laptopResults };

        // Write completed profile + laptops to localStorage
        // QuizResult is the sole owner of this write
        try {
          localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(saved));
          // Notify navbar (and any other listeners) that profile is now ready
          window.dispatchEvent(new CustomEvent("profileUpdated", { detail: saved }));
        } catch {
          // ignore storage errors
        }

        setProfileData(profileResult);
        setBackendComplete(true);
      } catch (err) {
        console.error(
          "[QuizResult] fetchProfile error for combination:",
          { workload, lifestyle, budget, osPreference },
          err
        );
        setError("error");
      }
    }

    load();
  }, [selections]);

  if (error) {
    return (
      <div role="alert" className="text-center py-12">
        <h2 className="text-subhead font-medium text-foreground">
          No encontramos tu perfil
        </h2>
        <p className="text-body text-muted-foreground mt-2">
          Algo salio mal al buscar tu perfil. Intenta hacer el quiz de nuevo.
        </p>
        <Button onClick={onRetry} className="mt-4">
          Volver a intentarlo
        </Button>
      </div>
    );
  }

  // Sequence: loading -> confetti -> perfil card -> pc card -> navigate
  return (
    <>
      <AnimatePresence mode="wait">
        {cardStep === null && (
          <QuizCelebration
            key="celebration"
            show={true}
            backendComplete={backendComplete}
            onHidden={() => setCardStep("perfil")}
          />
        )}
        {cardStep === "perfil" && profileData && (
          <ProfileRevealCard
            key="perfil"
            profile={profileData}
            onContinue={() => setCardStep("pc")}
          />
        )}
        {cardStep === "pc" && (
          <IdealPcCard
            key="ideal-pc-card"
            selections={selections}
            onDone={handleNavigate}
            onBack={() => setCardStep("perfil")}
          />
        )}
      </AnimatePresence>
    </>
  );
}
