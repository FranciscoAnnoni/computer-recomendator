import type { Metadata } from "next";
import { Suspense } from "react";
import { CatalogClient } from "@/components/catalog/catalog-client";
import { CatalogSkeleton } from "@/components/catalog/catalog-skeleton";
import { Container } from "@/components/layout/container";

export const metadata: Metadata = {
  title: "Catalogo | Computer Recomendator",
  description: "Explora laptops curadas con recomendaciones de expertos.",
  openGraph: {
    title: "Catalogo | Computer Recomendator",
    description: "Explora laptops curadas con recomendaciones de expertos.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
};

export default function CatalogPage() {
  return (
    <Suspense fallback={<Container className="py-16"><CatalogSkeleton count={6} /></Container>}>
      <CatalogClient />
    </Suspense>
  );
}
