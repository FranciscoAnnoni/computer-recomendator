import Link from "next/link";
import type { QuizStepDef } from "@/types/quiz";
import { QUIZ_STEPS } from "@/types/quiz";
import { Button } from "@/components/ui/button";
import { StepProgress } from "@/components/quiz/step-progress";
import { OptionCarousel } from "@/components/quiz/option-carousel";

interface QuizStepProps {
  stepIndex: number;
  stepData: QuizStepDef;
  currentSelection: string | null;
  onSelect: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export function QuizStep({
  stepIndex,
  stepData,
  currentSelection,
  onSelect,
  onNext,
  onBack,
}: QuizStepProps) {
  const isLastStep = stepIndex === QUIZ_STEPS.length - 1;

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Step heading + subheading */}
      <div className="text-center">
        <h2 className="text-subhead font-medium text-foreground">
          {stepData.heading}
        </h2>
        <p className="text-small text-muted-foreground mt-1">
          {stepData.subheading}
        </p>
      </div>

      {/* Progress bar */}
      <StepProgress currentStep={stepIndex} />

      {/* Carousel */}
      <OptionCarousel
        options={stepData.options}
        selectedValue={currentSelection}
        onSelect={onSelect}
      />

      {/* Bottom action row: [Anterior] [Siguiente / Ver mis recomendaciones] */}
      <div className="flex items-center gap-3">
        {stepIndex > 0 && (
          <button
            type="button"
            aria-label="Volver al paso anterior"
            onClick={onBack}
            className="h-11 px-5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-sm font-medium focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none shrink-0"
          >
            Anterior
          </button>
        )}
        <Button
          variant="default"
          className="flex-1 h-11"
          onClick={onNext}
        >
          {isLastStep ? "Ver mis recomendaciones" : "Siguiente"}
        </Button>
      </div>

      {/* Exit link */}
      <Link
        href="/"
        className="text-body text-muted-foreground hover:text-foreground text-center transition-colors"
      >
        ↩ Volver al Inicio
      </Link>
    </div>
  );
}
