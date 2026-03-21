import { Card, CardContent } from "@/components/ui/card";

export function ResultSkeleton() {
  return (
    <div aria-live="polite" className="flex flex-col gap-4">
      <span className="sr-only">Buscando tus laptops recomendadas...</span>
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="pt-4">
            <div className="h-40 w-full rounded-lg bg-muted animate-pulse" />
            <div className="h-5 w-3/4 rounded bg-muted animate-pulse mt-3" />
            <div className="h-4 w-1/2 rounded bg-muted animate-pulse mt-2" />
            <div className="h-4 w-1/4 rounded bg-muted animate-pulse mt-2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
