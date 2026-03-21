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
  const active = isCenter || isSelected;

  return (
    <button
      type="button"
      role="option"
      aria-pressed={isSelected}
      onClick={onClick}
      className="w-[260px] h-[380px] shrink-0 rounded-2xl flex flex-col overflow-hidden cursor-pointer focus-visible:outline-none transition-all duration-200"
      style={{
        background: "#0d0d0d",
        border: active ? "2px solid #00e5ff" : "1px solid rgba(255,255,255,0.1)",
        boxShadow: active
          ? "0 0 32px rgba(0,229,255,0.25), inset 0 0 24px rgba(0,229,255,0.06)"
          : "none",
      }}
    >
      {/* Illustration area — top 70% */}
      <div
        className="flex-1 w-full flex items-center justify-center p-5"
        style={{ background: "#111111" }}
      >
        <div
          className="w-full h-full flex items-center justify-center rounded-xl"
          style={{
            border: "1px solid rgba(255,255,255,0.08)",
            background: "#0d0d0d",
          }}
        >
          {IllustrationComponent ? (
            <IllustrationComponent
              width={150}
              height={150}
              className={active ? "text-[#00e5ff]" : "text-white/70"}
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-white/10" />
          )}
        </div>
      </div>

      {/* Label area — bottom */}
      <div className="w-full py-4 px-4 flex flex-col items-center gap-1 shrink-0">
        <span
          className="font-bold text-lg uppercase tracking-widest"
          style={{ color: active ? "#00e5ff" : "rgba(255,255,255,0.9)" }}
        >
          {option.label}
        </span>
        <span className="text-xs text-center leading-tight" style={{ color: "rgba(255,255,255,0.4)" }}>
          {option.sublabel}
        </span>
      </div>
    </button>
  );
}
