import Link from "next/link";
import Image from "next/image";
import type { QuizStepDef } from "@/types/quiz";
import { QUIZ_STEPS } from "@/types/quiz";

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

interface QuizStepProps {
  stepIndex: number;
  stepData: QuizStepDef;
  currentSelection: string | null;
  onSelect: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export function QuizStep({ stepIndex, stepData, currentSelection, onSelect, onNext, onBack }: QuizStepProps) {
  const isLastStep = stepIndex === QUIZ_STEPS.length - 1;
  const total = QUIZ_STEPS.length;
  const progress = Math.round(((stepIndex + (currentSelection ? 1 : 0)) / total) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
      {/* Progress bar */}
      <div style={{ display: 'flex', gap: 4 }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{
            flex: 1, height: 2, borderRadius: 1,
            background: i <= stepIndex ? 'var(--pr)' : 'rgba(255,255,255,0.08)',
            transition: 'background 0.4s',
          }} />
        ))}
      </div>

      {/* Step label row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div className="label-ed" style={{ color: 'var(--pr-fixed-dim)' }}>
          Paso {String(stepIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </div>
        <div className="label-ed-sm" style={{ fontFamily: 'ui-monospace, monospace', color: 'var(--on-sur-muted)' }}>
          {progress}% completo
        </div>
      </div>

      {/* Question */}
      <div>
        <h2 className="display-md" style={{ margin: 0, marginBottom: 8 }}>{stepData.heading}</h2>
        <p style={{ margin: 0, color: 'var(--on-sur-var)', fontSize: '1rem', lineHeight: 1.6 }}>{stepData.subheading}</p>
      </div>

      {/* Options grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1rem',
      }}>
        {stepData.options.map((option, i) => {
          const active = currentSelection === option.value;
          const img = IMAGE_ASSETS[option.illustrationId];
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelect(option.value)}
              style={{
                position: 'relative',
                textAlign: 'left',
                padding: '1.5rem',
                borderRadius: '1.25rem',
                background: active ? 'rgba(138,180,255,0.08)' : 'rgba(25,27,35,0.4)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                boxShadow: active
                  ? 'inset 0 0 0 1px rgba(138,180,255,0.5), 0 0 40px rgba(138,180,255,0.2)'
                  : 'inset 0 0 0 1px rgba(255,255,255,0.04)',
                transition: 'all 0.35s var(--ease-editorial)',
                cursor: 'pointer',
                minHeight: 220,
                display: 'flex', flexDirection: 'column',
                border: 0,
                animationDelay: `${i * 80}ms`,
              }}
            >
              {/* Illustration */}
              <div style={{ flex: 1, display: 'grid', placeItems: 'center', marginBottom: '1rem', position: 'relative', minHeight: 120 }}>
                {img ? (
                  <Image
                    src={img}
                    alt={option.label}
                    fill
                    sizes="200px"
                    className="object-contain"
                    style={{ opacity: active ? 1 : 0.55, transition: 'opacity 0.2s' }}
                  />
                ) : (
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
                )}
              </div>

              <div className="label-ed" style={{ color: active ? 'var(--pr-bright)' : 'var(--on-sur-var)', marginBottom: 4 }}>
                {option.label}
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--on-sur-muted)', lineHeight: 1.4 }}>{option.sublabel}</div>

              {active && (
                <div style={{
                  position: 'absolute', top: '1rem', right: '1rem',
                  width: 24, height: 24, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--pr-bright), var(--pr-container))',
                  color: 'var(--on-pr-fixed)',
                  display: 'grid', placeItems: 'center',
                  fontSize: 12, fontWeight: 700,
                }}>✓</div>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom buttons */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {stepIndex > 0 ? (
          <button type="button" className="btn-ed btn-ed-md btn-ghost-ed" onClick={onBack}>
            ← Atrás
          </button>
        ) : (
          <Link href="/" style={{ color: 'var(--on-sur-var)', fontSize: '0.9375rem' }}>
            ↩ Volver al inicio
          </Link>
        )}
        <button
          type="button"
          className="btn-ed btn-ed-lg btn-primary-ed"
          onClick={onNext}
          style={{ opacity: currentSelection ? 1 : 0.4 }}
          disabled={!currentSelection}
        >
          {isLastStep ? 'Ver mis recomendaciones' : 'Siguiente'} →
        </button>
      </div>
    </div>
  );
}
