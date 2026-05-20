"use client";

import { motion } from "framer-motion";
import {
  LockOpen,
  Globe,
  MemoryStick,
  HardDrive,
  Cpu,
  Monitor,
  Battery,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { computeIdealSpecs } from "@/lib/ideal-specs";
import type { Workload, Lifestyle, Budget, OsPreference } from "@/types/quiz";

interface IdealPcCardProps {
  selections: [string | null, string | null, string | null, string | null];
  onDone: () => void;
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
    <div className="flex items-center gap-2 min-w-0">
      <Icon className="size-4 text-primary shrink-0" />
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <span className="ml-auto text-xs font-medium text-right">{value}</span>
    </div>
  );
}

export function IdealPcCard({ selections, onDone }: IdealPcCardProps) {
  // selections are always non-null when QuizResult renders (quiz enforces completion),
  // but we cast defensively for TypeScript.
  const [w, l, b, os] = selections as [
    Workload,
    Lifestyle,
    Budget,
    OsPreference
  ];

  const specs = computeIdealSpecs(w, l, b, os);

  return (
    <motion.div
      key="ideal-pc-card-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="w-full max-w-sm rounded-2xl border bg-card shadow-2xl overflow-hidden"
      >
        {/* Card content */}
        <div className="flex flex-col items-center gap-4 px-6 pt-7 pb-6">
          {/* DESBLOQUEADO badge */}
          <span className="text-[10px] font-semibold tracking-widest text-primary uppercase">
            DESBLOQUEADO
          </span>

          {/* Lock icon + title */}
          <div className="flex flex-col items-center gap-2">
            <LockOpen className="size-8 text-primary" />
            <h2 className="text-xl font-bold text-foreground text-center">
              Tu PC ideal
            </h2>
          </div>

          {/* Specs grid: 2 columns, 3 rows */}
          <div className="w-full grid grid-cols-2 gap-x-6 gap-y-3">
            <SpecRow icon={Globe} label="Sistema" value={specs.os} />
            <SpecRow icon={MemoryStick} label="RAM" value={specs.ram} />
            <SpecRow icon={HardDrive} label="Almac." value={specs.storage} />
            <SpecRow icon={Cpu} label="GPU" value={specs.gpu} />
            <SpecRow icon={Monitor} label="Pantalla" value={specs.screen} />
            <SpecRow icon={Battery} label="Batería" value={specs.battery} />
          </div>

          {/* Separator */}
          <div className="w-full border-t" />

          {/* Profile descriptor */}
          <p className="text-xs text-muted-foreground text-center italic">
            {specs.profileDescriptor}
          </p>

          {/* CTA */}
          <Button onClick={onDone} className="w-full">
            Ver mis recomendaciones
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
