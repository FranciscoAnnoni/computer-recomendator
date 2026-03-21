import { QUIZ_STEPS } from "@/types/quiz";

interface StepProgressProps {
  currentStep: number; // 0-indexed
}

export function StepProgress({ currentStep }: StepProgressProps) {
  const total = QUIZ_STEPS.length;
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <span className="text-small text-muted-foreground">
        Paso {currentStep + 1}/{total}
      </span>
      <div
        role="progressbar"
        aria-valuenow={currentStep + 1}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label="Progreso del quiz"
        className="flex gap-1 w-full"
      >
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-200 ${
              i <= currentStep ? "bg-primary" : "bg-border"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
