"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { QUIZ_STEPS, QUIZ_STORAGE_KEY, PROFILE_STORAGE_KEY } from "@/types/quiz";
import { QuizStep } from "@/components/quiz/quiz-step";
import { QuizResult } from "@/components/quiz/quiz-result";

export function QuizShell() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<[string | null, string | null, string | null]>([
    null,
    null,
    null,
  ]);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [quizComplete, setQuizComplete] = useState(false);

  // SSR-safe: restore selections from localStorage after mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(QUIZ_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { selections?: [string | null, string | null, string | null] };
        if (parsed.selections) {
          setSelections(parsed.selections);
        }
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  const handleSelect = (value: string) => {
    setSelections((prev) => {
      const next: [string | null, string | null, string | null] = [...prev] as [string | null, string | null, string | null];
      next[currentStep] = value;
      // Persist to localStorage
      try {
        localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify({ selections: next }));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  const handleNext = () => {
    setDirection(1);
    if (currentStep === 2) {
      setQuizComplete(true);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setDirection(-1);
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const handleRetry = () => {
    setQuizComplete(false);
    setCurrentStep(0);
    setSelections([null, null, null]);
    try {
      localStorage.removeItem(QUIZ_STORAGE_KEY);
      localStorage.removeItem(PROFILE_STORAGE_KEY);
    } catch {
      // ignore storage errors
    }
  };

  if (quizComplete) {
    return (
      <div className="w-full">
        <QuizResult selections={selections} onRetry={handleRetry} />
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden">
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentStep}
          custom={direction}
          variants={{
            enter: (dir: number) => ({ x: `${dir * 60}%`, opacity: 0 }),
            center: { x: 0, opacity: 1 },
            exit: (dir: number) => ({ x: `${dir * -60}%`, opacity: 0 }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <QuizStep
            stepIndex={currentStep}
            stepData={QUIZ_STEPS[currentStep]}
            currentSelection={selections[currentStep]}
            onSelect={handleSelect}
            onNext={handleNext}
            onBack={handleBack}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
