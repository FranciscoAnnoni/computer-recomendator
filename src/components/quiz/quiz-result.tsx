"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { QuizCelebration } from "@/components/quiz/quiz-celebration";
import { fetchProfile, fetchLaptopsByIds } from "@/lib/quiz-data";
import { PROFILE_STORAGE_KEY } from "@/types/quiz";
import type { Workload, Lifestyle, Budget, OsPreference } from "@/types/quiz";

interface QuizResultProps {
  selections: [string | null, string | null, string | null, string | null];
  onRetry: () => void;
}

export function QuizResult({ selections, onRetry }: QuizResultProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [backendComplete, setBackendComplete] = useState(false);

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

  // Show celebration overlay while fetching and after backend completes.
  // The overlay handles navigation to /profile once it finishes.
  return (
    <QuizCelebration
      show={true}
      backendComplete={backendComplete}
      onDone={handleNavigate}
    />
  );
}
