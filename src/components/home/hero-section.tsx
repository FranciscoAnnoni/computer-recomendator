"use client";

import Link from "next/link";

export function HeroSection() {
  return (
    <div className="flex flex-col items-center gap-6 max-w-2xl rise">
      <div className="label-ed" style={{ color: 'var(--pr-fixed-dim)' }}>
        — Encontrá tu laptop ideal
      </div>
      <h1
        className="display-lg text-center"
        style={{ color: 'var(--on-sur)' }}
      >
        Computer{" "}
        <span style={{
          background: 'linear-gradient(135deg, var(--pr-bright), var(--pr-container))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          Recomendator
        </span>
      </h1>
      <p
        className="rise-d1 text-center"
        style={{ fontSize: '1.125rem', color: 'var(--on-sur-var)', lineHeight: 1.55, maxWidth: 480 }}
      >
        Respondé 4 preguntas y te recomendamos la laptop ideal para vos.
      </p>
      <div className="rise-d2 mt-2">
        <Link href="/quiz">
          <button className="btn-ed btn-ed-xl btn-primary-ed">
            Encontrá tu laptop →
          </button>
        </Link>
      </div>
    </div>
  );
}
