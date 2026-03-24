import { Suspense } from "react";
import { CatalogClient } from "@/components/catalog/catalog-client";
import { CatalogSkeleton } from "@/components/catalog/catalog-skeleton";

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="px-4 sm:px-8 py-16"><CatalogSkeleton count={6} /></div>}>
      <CatalogClient />
    </Suspense>
  );
}
