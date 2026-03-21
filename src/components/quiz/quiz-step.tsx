import Link from "next/link";
import { ChevronLeft } from "lucide-react";
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
      {/* Back arrow — hidden on step 0 */}
      <div className="h-11">
        {stepIndex > 0 && (
          <button
            type="button"
            aria-label="Volver al paso anterior"
            onClick={onBack}
            className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
          >
            <ChevronLeft className="size-5" />
          </button>
        )}
      </div>

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

      {/* Siguiente / Ver mis recomendaciones */}
      <Button
        variant="default"
        className="w-full h-11"
        disabled={!currentSelection}
        onClick={onNext}
      >
        {isLastStep ? "Ver mis recomendaciones" : "Siguiente"}
      </Button>

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
