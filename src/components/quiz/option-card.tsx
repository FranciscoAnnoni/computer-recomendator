import type { QuizOption } from "@/types/quiz";
import { ILLUSTRATIONS } from "@/components/quiz/illustrations/index";

interface OptionCardProps {
  option: QuizOption;
  isCenter: boolean;
  isSelected: boolean;
  onClick: () => void;
}

export function OptionCard({ option, isCenter, isSelected, onClick }: OptionCardProps) {
  const IllustrationComponent = ILLUSTRATIONS[option.illustrationId];

  return (
    <button
      type="button"
      role="option"
      aria-pressed={isSelected}
      onClick={onClick}
      className={`w-[280px] md:w-[320px] shrink-0 rounded-2xl border-2 p-4 flex flex-col items-center gap-3 bg-card cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none ${
        isCenter
          ? "border-primary ring-2 ring-primary/20"
          : "border-border"
      }`}
    >
      <div className="w-20 h-20 flex items-center justify-center">
        {IllustrationComponent ? (
          <IllustrationComponent width={80} height={80} />
        ) : (
          <div className="w-20 h-20 rounded-full bg-muted" />
        )}
      </div>
      <span className="text-body text-foreground text-center">{option.label}</span>
    </button>
  );
}
