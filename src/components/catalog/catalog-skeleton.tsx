export function CatalogSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border bg-card ring-1 ring-foreground/10 overflow-hidden">
          {/* Image placeholder - square */}
          <div className="aspect-square bg-muted animate-pulse" />
          {/* Content area */}
          <div className="p-4 space-y-3">
            {/* Name */}
            <div className="h-5 w-3/4 bg-muted animate-pulse rounded" />
            {/* Price */}
            <div className="h-3 w-1/4 bg-muted animate-pulse rounded" />
            {/* Tags row */}
            <div className="flex gap-1">
              <div className="h-5 w-16 bg-muted animate-pulse rounded-full" />
              <div className="h-5 w-20 bg-muted animate-pulse rounded-full" />
              <div className="h-5 w-14 bg-muted animate-pulse rounded-full" />
            </div>
            {/* Spec grid */}
            <div className="grid grid-cols-2 gap-1">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            </div>
          </div>
          {/* Footer placeholder */}
          <div className="p-4 border-t">
            <div className="h-11 bg-muted animate-pulse rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
