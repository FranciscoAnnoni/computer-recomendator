import { Suspense } from "react";
import { ComparatorClient } from "@/components/compare/comparator-client";

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
