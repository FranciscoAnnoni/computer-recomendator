"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface QuizCelebrationProps {
  show: boolean;
  backendComplete: boolean;
  onDone: () => void;
}

const CONFETTI_COLORS = [
  "#ff6b6b", "#4ecdc4", "#45b7d1", "#f9ca24", "#f0932b", "#6c5ce7", "#a29bfe",
];

const SPARKLES = [
  { emoji: "✨", top: "15%", left: "10%" },
  { emoji: "⭐", top: "20%", left: "82%" },
  { emoji: "💫", top: "70%", left: "78%" },
  { emoji: "🌟", top: "75%", left: "12%" },
];

export function QuizCelebration({ show, backendComplete, onDone }: QuizCelebrationProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) setVisible(true);
  }, [show]);

  useEffect(() => {
    if (visible && backendComplete) {
      const hide = setTimeout(() => {
        setVisible(false);
        setTimeout(onDone, 400);
      }, 2200);
      return () => clearTimeout(hide);
    }
  }, [visible, backendComplete, onDone]);

  const confetti = Array.from({ length: 90 }, (_, i) => ({
    id: i,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    left: `${(i * 1.12) % 100}%`,
    delay: `${((i * 0.037) % 3).toFixed(2)}s`,
    duration: `${(3 + (i % 3)).toFixed(1)}s`,
  }));

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
        >
          {/* Confetti */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {confetti.map((p) => (
              <div
                key={p.id}
                className="absolute top-0 w-2.5 h-3 rounded-sm animate-confetti-fall"
                style={{
                  backgroundColor: p.color,
                  left: p.left,
                  animationDelay: p.delay,
                  animationDuration: p.duration,
                }}
              />
            ))}
          </div>

          {/* Sparkles */}
          <div className="absolute inset-0 pointer-events-none">
            {SPARKLES.map((s, i) => (
              <span
                key={i}
                className="absolute text-3xl animate-sparkle-anim"
                style={{
                  top: s.top,
                  left: s.left,
                  animationDelay: `${i * 0.5}s`,
                }}
              >
                {s.emoji}
              </span>
            ))}
          </div>

          {/* Message card */}
          <motion.div
            initial={{ scale: 0.3, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 280, damping: 22, delay: 0.1 }}
            className="relative z-10 flex flex-col items-center gap-3 text-center px-10"
          >
            <span className="text-7xl" style={{ animation: "bounce-icon 1s infinite" }}>
              💻
            </span>
            <h2 className="text-4xl font-bold text-white drop-shadow-lg">
              ¡Tu perfil está listo!
            </h2>
            <p className="text-white/85 text-xl">
              Encontramos las mejores laptops para vos
            </p>
            <p className="text-white/50 text-sm mt-1 animate-pulse">
              Redirigiendo a tu perfil…
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
