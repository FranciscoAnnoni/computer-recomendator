import type { Metadata } from "next";
import { Suspense } from "react";
import { ComparatorClient } from "@/components/compare/comparator-client";

export const metadata: Metadata = {
  title: "Comparar | Computer Recomendator",
  description: "Compara laptops lado a lado para encontrar tu mejor opcion.",
  openGraph: {
    title: "Comparar | Computer Recomendator",
    description: "Compara laptops lado a lado para encontrar tu mejor opcion.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Computer Recomendator — encuentra tu laptop ideal" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Comparar | Computer Recomendator",
    description: "Compara laptops lado a lado para encontrar tu mejor opcion.",
    images: [{ url: "/og-image.png", alt: "Computer Recomendator — encuentra tu laptop ideal" }],
  },
};

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <div className="px-4 py-16 text-muted-foreground text-center">
          Cargando...
        </div>
      }
    >
      <ComparatorClient />
    </Suspense>
  );
}
