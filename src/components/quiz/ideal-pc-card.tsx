"use client";

import { motion, type Variants } from "framer-motion";
import { Globe, MemoryStick, HardDrive, Cpu, Monitor, Battery } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { computeIdealSpecs } from "@/lib/ideal-specs";
import { NomadaArt, EscritorioArt } from "@/components/quiz/laptop-art";
import type { Workload, Lifestyle, Budget, OsPreference } from "@/types/quiz";

interface IdealPcCardProps {
  selections: [string | null, string | null, string | null, string | null];
  onDone: () => void;
  onBack: () => void;
}

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.2 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

function MiniLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.22em] uppercase font-semibold whitespace-nowrap"
      style={{ color: "#3b82f6" }}
    >
      <span style={{ opacity: 0.8 }}>—</span>
      {children}
    </div>
  );
}

function SpecRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div
      className="grid items-center"
      style={{ gridTemplateColumns: "20px 1fr auto", gap: "10px" }}
    >
      <Icon style={{ color: "#3b82f6", width: 16, height: 16, flexShrink: 0 }} />
      <span style={{ color: "#8a96ad", fontSize: "13.5px", whiteSpace: "nowrap" }}>
        {label}
      </span>
      <span
        style={{
          color: "white",
          fontSize: "14px",
          fontWeight: 600,
          textAlign: "right",
          fontVariantNumeric: "tabular-nums",
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function ArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}

function ArrowLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M11 19l-7-7 7-7" />
    </svg>
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

export function IdealPcCard({ selections, onDone, onBack }: IdealPcCardProps) {
  const [w, l, b, os] = selections as [Workload, Lifestyle, Budget, OsPreference];
  const specs = computeIdealSpecs(w, l, b, os);
  const isNomada = l === "maxima_portabilidad";

  return (
    <motion.div
      key="ideal-pc-card-backdrop"
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

        {/* Grid background */}
        <span
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 0,
            opacity: 0.5,
            backgroundImage:
              "linear-gradient(rgba(140,175,235,0.05) 1px, transparent 1px)," +
              "linear-gradient(90deg, rgba(140,175,235,0.05) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            maskImage:
              "radial-gradient(60% 60% at 50% 40%, black 30%, transparent 70%)",
            WebkitMaskImage:
              "radial-gradient(60% 60% at 50% 40%, black 30%, transparent 70%)",
          }}
        />

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="relative flex flex-col"
          style={{ zIndex: 1 }}
        >
          {/* Mini label */}
          <motion.div variants={item} className="flex flex-col items-center mb-2">
            <MiniLabel>Tu PC ideal</MiniLabel>
          </motion.div>

          {/* Laptop illustration */}
          <motion.div
            variants={item}
            className="relative w-full flex items-center justify-center my-1"
            style={{ aspectRatio: "16/9" }}
          >
            {isNomada ? <NomadaArt /> : <EscritorioArt />}
          </motion.div>

          {/* Title + subtitle */}
          <motion.div variants={item} className="flex flex-col items-center mb-[22px]">
            <h2
              className="text-[28px] sm:text-[30px] font-bold text-white text-center m-0 mb-1"
              style={{ letterSpacing: "-0.02em" }}
            >
              Tu PC ideal
            </h2>
            <p
              className="text-[13.5px] text-center italic m-0"
              style={{ color: "#8a96ad" }}
            >
              {specs.profileDescriptor}
            </p>
          </motion.div>

          {/* Specs grid */}
          <motion.div
            variants={item}
            className="grid grid-cols-2 mb-[22px]"
            style={{
              gap: "14px 28px",
              padding: "18px 4px",
              borderTop: "1px solid rgba(140,175,235,0.08)",
              borderBottom: "1px solid rgba(140,175,235,0.08)",
            }}
          >
            <SpecRow icon={Globe} label="Sistema" value={specs.os} />
            <SpecRow icon={MemoryStick} label="RAM" value={specs.ram} />
            <SpecRow icon={HardDrive} label="Almac." value={specs.storage} />
            <SpecRow icon={Cpu} label="GPU" value={specs.gpu} />
            <SpecRow icon={Monitor} label="Pantalla" value={specs.screen} />
            <SpecRow icon={Battery} label="Batería" value={specs.battery} />
          </motion.div>

          {/* CTA */}
          <motion.button
            variants={item}
            onClick={onDone}
            className="w-full inline-flex items-center justify-center gap-2.5 py-[14px] px-[22px] rounded-full font-semibold text-[15px] cursor-pointer transition-transform duration-[160ms] hover:-translate-y-px active:translate-y-0"
            style={{
              background: "linear-gradient(180deg, #4a90ff 0%, #2563eb 100%)",
              color: "white",
              border: "none",
              fontFamily: "inherit",
              boxShadow:
                "0 0 32px rgba(60,130,255,0.5)," +
                "inset 0 -2px 0 rgba(0,0,0,0.18)",
            }}
          >
            Ver mis recomendaciones <ArrowRight />
          </motion.button>

          {/* Back */}
          <motion.div variants={item} className="flex justify-center mt-[22px]">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 px-[18px] py-2.5 rounded-full font-medium text-[13.5px] cursor-pointer transition-colors duration-[160ms]"
              style={{
                background: "transparent",
                color: "#c2cad9",
                border: "1px solid rgba(140,175,235,0.08)",
                fontFamily: "inherit",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = "white";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(140,175,235,0.35)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = "#c2cad9";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(140,175,235,0.08)";
              }}
            >
              <ArrowLeft /> Volver al perfil
            </button>
          </motion.div>
        </motion.div>
      </motion.article>
    </motion.div>
  );
}
