import Image from "next/image";
import type { QuizOption } from "@/types/quiz";
import { ILLUSTRATIONS } from "@/components/quiz/illustrations/index";

// Illustration IDs that use static image assets instead of SVG components
const IMAGE_ASSETS: Record<string, string> = {
  productivity: "/illustrations/trabajar.png",
  creation:     "/illustrations/crear.png",
  gaming:       "/illustrations/gaming.png",
};

interface OptionCardProps {
  option: QuizOption;
  isCenter: boolean;
  isSelected: boolean;
  compact?: boolean;
  onClick: () => void;
}

export function OptionCard({ option, isCenter, isSelected, compact = false, onClick }: OptionCardProps) {
  const IllustrationComponent = ILLUSTRATIONS[option.illustrationId];
  const imageAsset = IMAGE_ASSETS[option.illustrationId];
  const active = isCenter || isSelected;

  return (
    <button
      type="button"
      role="option"
      aria-pressed={isSelected}
      onClick={onClick}
      className={`shrink-0 rounded-2xl flex flex-col overflow-hidden cursor-pointer focus-visible:outline-none transition-all duration-200 ${
        compact ? "w-[200px] h-[270px]" : "w-[260px] h-[380px]"
      }`}
      style={{
        background: "#0d0d0d",
        border: active ? "2px solid #ffffff" : "1px solid rgba(255,255,255,0.1)",
        boxShadow: active
          ? "0 0 28px rgba(255,255,255,0.18), inset 0 0 20px rgba(255,255,255,0.05)"
          : "none",
      }}
    >
      {/* Illustration area — top 70% */}
      <div
        className="flex-1 w-full relative overflow-hidden"
        style={{ background: "#0d0d0d" }}
      >
        {imageAsset ? (
          <Image
            src={imageAsset}
            alt={option.label}
            fill
            sizes="(max-width: 640px) 200px, 260px"
            className="object-cover transition-opacity duration-200"
            style={{ opacity: active ? 1 : 0.55 }}
          />
        ) : IllustrationComponent ? (
          <div className="w-full h-full flex items-center justify-center p-4">
            <div
              className="w-full h-full flex items-center justify-center rounded-xl"
              style={{ border: "1px solid rgba(255,255,255,0.08)", background: "#0d0d0d" }}
            >
              <IllustrationComponent
                width={compact ? 100 : 150}
                height={compact ? 100 : 150}
                className={active ? "text-[#ffffff]" : "text-white/70"}
              />
            </div>
          </div>
        ) : (
          <div className={`rounded-full bg-white/10 ${compact ? "w-20 h-20" : "w-32 h-32"}`} />
        )}
      </div>

      {/* Label area — bottom */}
      <div className={`w-full flex flex-col items-center gap-1 shrink-0 ${compact ? "py-3 px-3" : "py-4 px-4"}`}>
        <span
          className={`font-bold uppercase tracking-widest ${compact ? "text-sm" : "text-lg"}`}
          style={{ color: active ? "#ffffff" : "rgba(255,255,255,0.9)" }}
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
