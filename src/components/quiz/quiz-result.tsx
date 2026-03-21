"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ResultSkeleton } from "@/components/quiz/result-skeleton";
import { ResultLaptopCard } from "@/components/quiz/result-laptop-card";
import { fetchProfile, fetchLaptopsByIds } from "@/lib/quiz-data";
import { PROFILE_STORAGE_KEY } from "@/types/quiz";
import type { Workload, Lifestyle, Budget, ProfileResult } from "@/types/quiz";
import type { Laptop } from "@/types/laptop";

interface QuizResultProps {
  selections: [string | null, string | null, string | null];
  onRetry: () => void;
}

export function QuizResult({ selections, onRetry }: QuizResultProps) {
  const [profile, setProfile] = useState<ProfileResult | null>(null);
  const [laptops, setLaptops] = useState<Laptop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);

      const [workload, lifestyle, budget] = selections;

      try {
        const profileResult = await fetchProfile(
          workload as Workload,
          lifestyle as Lifestyle,
          budget as Budget
        );

        const laptopResults = await fetchLaptopsByIds(profileResult.laptop_ids);

        // Write completed profile + laptops to localStorage
        // QuizResult is the sole owner of this write
        try {
          localStorage.setItem(
            PROFILE_STORAGE_KEY,
            JSON.stringify({ ...profileResult, laptops: laptopResults })
          );
        } catch {
          // ignore storage errors
        }

        setProfile(profileResult);
        setLaptops(laptopResults);
      } catch (err) {
        console.error(
          "[QuizResult] fetchProfile error for combination:",
          { workload, lifestyle, budget },
          err
        );
        setError("error");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [selections]);

  if (loading) {
    return <ResultSkeleton />;
  }

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

  if (!profile || laptops.length === 0) {
    return (
      <p className="text-body text-muted-foreground text-center py-12">
        Aun no hay laptops para este perfil. Vuelve pronto.
      </p>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <h2 className="text-subhead font-medium text-foreground">
        {profile.profile_name}
      </h2>
      <p className="text-body text-muted-foreground mt-1">
        {profile.profile_description}
      </p>
      <h3 className="text-body font-medium text-foreground mt-8">
        Tus 5 mejores opciones
      </h3>
      <div className="flex flex-col gap-4 mt-4">
        {laptops.map((laptop) => (
          <ResultLaptopCard key={laptop.id} laptop={laptop} />
        ))}
      </div>
    </motion.div>
  );
}
