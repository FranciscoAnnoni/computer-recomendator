"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export function NeuralFog() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(true); // default true = safe for SSR

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia("(max-width: 768px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  if (!mounted || theme !== "dark" || isMobile) return null;

  return (
    <>
      <div className="fog-root" aria-hidden="true">
        <div className="fog-blob b1" />
        <div className="fog-blob b2" />
        <div className="fog-blob b3" />
      </div>
      <div className="grain" aria-hidden="true" />
    </>
  );
}
