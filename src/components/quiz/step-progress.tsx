interface StepProgressProps {
  currentStep: number; // 0-indexed
}

export function StepProgress({ currentStep }: StepProgressProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <span className="text-small text-muted-foreground">
        Paso {currentStep + 1}/3
      </span>
      <div
        role="progressbar"
        aria-valuenow={currentStep + 1}
        aria-valuemin={1}
        aria-valuemax={3}
        aria-label="Progreso del quiz"
        className="flex gap-1 w-full"
      >
        {[0, 1, 2].map((i) => (
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
