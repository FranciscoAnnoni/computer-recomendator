"use client";

import { motion, type Variants } from "framer-motion";
import { deriveTraits } from "@/lib/profile-traits";
import type { ProfileResult } from "@/types/quiz";

interface ProfileRevealCardProps {
  profile: ProfileResult;
  onContinue: () => void;
}

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.28 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

function ArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}

export function ProfileRevealCard({ profile, onContinue }: ProfileRevealCardProps) {
  const initial = profile.profile_name.replace(/^(El|La|Los|Las) /i, "")[0]?.toUpperCase() ?? "P";
  const traits = deriveTraits(profile.workload, profile.lifestyle, profile.budget);

  return (
    <motion.div
      key="profile-reveal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto py-8 px-4"
      style={{
        background:
          "radial-gradient(900px 600px at 80% 90%, rgba(20,70,130,0.3), transparent 60%)," +
          "radial-gradient(700px 500px at 20% 10%, rgba(20,40,80,0.2), transparent 60%)," +
          "#000",
      }}
    >
      <motion.article
        initial={{ opacity: 0, scale: 0.92, filter: "blur(8px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, scale: 0.92, filter: "blur(8px)" }}
        transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
        className="relative w-full max-w-[560px] rounded-[22px] p-9 overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #0e1626 0%, #0a111e 100%)",
          border: "1px solid rgba(140,175,235,0.08)",
          boxShadow:
            "0 0 0 1px rgba(99,162,255,0.18)," +
            "0 0 50px rgba(99,162,255,0.20)," +
            "0 0 120px rgba(99,162,255,0.10)",
        }}
      >
        {/* Corner dots */}
        <Dot pos="top-3.5 left-3.5" />
        <Dot pos="top-3.5 right-3.5" />
        <Dot pos="bottom-3.5 left-3.5" />
        <Dot pos="bottom-3.5 right-3.5" />

        <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col">
          {/* Header */}
          <motion.header
            variants={item}
            className="grid items-center mb-6"
            style={{ gridTemplateColumns: "auto 1fr", gap: "22px" }}
          >
            {/* Avatar */}
            <div
              className="w-[84px] h-[84px] rounded-full grid place-items-center text-white font-bold text-[30px] relative shrink-0"
              style={{
                background: "radial-gradient(circle at 32% 30%, #b0d2ff 0%, #3b82f6 50%, #134ab0 100%)",
                boxShadow:
                  "0 0 0 1px rgba(255,255,255,0.08) inset," +
                  "0 0 30px rgba(60,130,255,0.55)," +
                  "0 12px 30px rgba(20,60,140,0.4)",
              }}
            >
              {initial}
              <span
                className="absolute inset-1 rounded-full pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle at 38% 32%, rgba(255,255,255,0.35), transparent 50%)",
                }}
              />
            </div>

            {/* Titles */}
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-2.5">
                <span style={{ color: "#3b82f6", opacity: 0.8 }}>—</span>
                <span
                  className="font-mono text-[11px] tracking-[0.22em] uppercase font-semibold whitespace-nowrap"
                  style={{ color: "#3b82f6" }}
                >
                  Tu perfil
                </span>
              </div>
              <h1
                className="text-[28px] sm:text-[30px] font-bold leading-[1.05] text-white m-0"
                style={{ letterSpacing: "-0.02em" }}
              >
                {profile.profile_name}
              </h1>
            </div>
          </motion.header>

          {/* Description */}
          <motion.p
            variants={item}
            className="text-[15px] leading-[1.55] mb-[22px]"
            style={{ color: "#c2cad9", maxWidth: "46ch" }}
          >
            {profile.profile_description}
          </motion.p>

          {/* Traits */}
          <motion.ul
            variants={item}
            className="list-none p-0 m-0 mb-7 grid gap-2.5"
          >
            {traits.map((trait, i) => (
              <li
                key={i}
                className="grid items-start gap-2.5 text-[14.5px] leading-[1.5]"
                style={{ gridTemplateColumns: "22px 1fr", color: "#c2cad9" }}
              >
                <span
                  className="w-[18px] h-[18px] rounded-full grid place-items-center mt-0.5 shrink-0"
                  style={{
                    background: "rgba(59,130,246,0.12)",
                    border: "1px solid rgba(59,130,246,0.4)",
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: "#3b82f6", boxShadow: "0 0 8px #3b82f6" }}
                  />
                </span>
                <span>
                  <b className="font-semibold" style={{ color: "white" }}>
                    {trait.k}
                  </b>
                  {" — "}
                  {trait.v}
                </span>
              </li>
            ))}
          </motion.ul>

          {/* Footer */}
          <motion.div
            variants={item}
            className="flex items-center justify-between gap-3 pt-5"
            style={{ borderTop: "1px solid rgba(140,175,235,0.08)" }}
          >
            <span
              className="font-mono text-[11px] tracking-[0.22em] uppercase"
              style={{ color: "#8a96ad" }}
            >
              Paso 01 · Tu perfil
            </span>
            <button
              onClick={onContinue}
              className="inline-flex items-center gap-2.5 px-[22px] py-3 rounded-full font-semibold text-[14.5px] cursor-pointer transition-transform duration-[160ms] hover:-translate-y-px active:translate-y-0"
              style={{
                background: "#a8c5ff",
                color: "#0a1120",
                border: "none",
                fontFamily: "inherit",
                boxShadow:
                  "0 0 28px rgba(168,197,255,0.4)," +
                  "inset 0 0 0 1px rgba(255,255,255,0.4)",
              }}
            >
              Continuar <ArrowRight />
            </button>
          </motion.div>
        </motion.div>
      </motion.article>
    </motion.div>
  );
}

function Dot({ pos }: { pos: string }) {
  return (
    <span
      className={`absolute ${pos} w-[5px] h-[5px] rounded-full pointer-events-none`}
      style={{
        background: "rgba(99,162,255,0.9)",
        boxShadow: "0 0 12px rgba(99,162,255,0.9)",
      }}
    />
  );
}
