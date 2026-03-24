export function CatalogSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-row rounded-xl border border-border bg-card overflow-hidden min-h-[110px]"
        >
          {/* Image placeholder */}
          <div className="w-[110px] sm:w-[150px] shrink-0 bg-muted animate-pulse" />

          {/* Title + subtitle */}
          <div className="flex-1 min-w-0 px-3 sm:px-4 py-3 border-r border-border flex flex-col justify-center gap-2">
            <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
            <div className="h-3 w-full bg-muted animate-pulse rounded" />
            <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
          </div>

          {/* Specs panel (desktop) */}
          <div className="hidden sm:flex flex-col divide-y divide-border border-r border-border w-[190px] shrink-0 justify-center">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="px-3 py-2.5">
                <div className="h-3 w-32 bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>

          {/* Button placeholder */}
          <div className="flex items-center justify-center px-3 sm:px-4 shrink-0">
            <div className="hidden sm:block h-9 w-20 bg-muted animate-pulse rounded-lg" />
            <div className="sm:hidden h-5 w-5 bg-muted animate-pulse rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
