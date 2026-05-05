import Image from "next/image";
import type { QuizOption } from "@/types/quiz";

const IMAGE_ASSETS: Record<string, string> = {
  productivity: "/illustrations/trabajar.png",
  creation:     "/illustrations/crear.png",
  gaming:       "/illustrations/gaming.png",
  portability:  "/illustrations/nomada.png",
  ecosystem:    "/illustrations/mixto.png",
  power:        "/illustrations/escritorio.png",
  essential:    "/illustrations/esencial.png",
  balanced:     "/illustrations/intelignete.png",
  premium:      "/illustrations/premium.png",
  windows:      "/illustrations/windows.png",
  macos:        "/illustrations/apple.png",
  flexible:     "/illustrations/abierto.png",
};

interface OptionCardProps {
  option: QuizOption;
  isCenter: boolean;
  isSelected: boolean;
  compact?: boolean;
  onClick: () => void;
}

export function OptionCard({ option, isCenter, isSelected, compact = false, onClick }: OptionCardProps) {
  const imageAsset = IMAGE_ASSETS[option.illustrationId];
  const active = isCenter || isSelected;

  return (
    <button
      type="button"
      role="option"
      aria-pressed={isSelected}
      onClick={onClick}
      className={`shrink-0 rounded-2xl flex flex-col overflow-hidden cursor-pointer focus-visible:outline-none transition-all duration-300 ${
        compact ? "w-[200px] h-[270px]" : "w-[260px] h-[418px]"
      }`}
      style={{
        background: active ? 'var(--ed-quiz-card-active)' : 'var(--ed-quiz-card-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: active ? 'var(--ed-quiz-card-active-shadow)' : 'var(--ed-quiz-card-shadow)',
        border: 0,
      }}
    >
      {/* Illustration */}
      <div className="flex-1 w-full relative overflow-hidden">
        {imageAsset ? (
          <Image
            src={imageAsset}
            alt={option.label}
            fill
            sizes="(max-width: 640px) 200px, 260px"
            className="object-contain transition-opacity duration-200"
            style={{ opacity: active ? 1 : 0.5 }}
            draggable={false}
          />
        ) : (
          <div className={`rounded-full bg-white/10 m-auto ${compact ? "w-20 h-20" : "w-32 h-32"}`} />
        )}
      </div>

      {/* Labels */}
      <div className={`w-full flex flex-col items-center gap-1 shrink-0 ${compact ? "py-3 px-3" : "py-4 px-4"}`}>
        <span
          className="label-ed text-center"
          style={{ color: active ? 'var(--pr-bright)' : 'var(--on-sur-var)' }}
        >
          {option.label}
        </span>
        <span className="label-ed-sm text-center" style={{ color: 'var(--on-sur-muted)' }}>
          {option.sublabel}
        </span>
      </div>
    </button>
  );
}
