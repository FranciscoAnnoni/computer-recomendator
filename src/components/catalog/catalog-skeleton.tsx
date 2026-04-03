export function CatalogSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-row items-center rounded-2xl border border-border bg-card min-h-[110px]"
        >
          {/* Image placeholder */}
          <div className="w-[100px] sm:w-[155px] shrink-0 self-stretch bg-muted animate-pulse rounded-l-2xl" />

          {/* Name + specs */}
          <div className="flex-1 min-w-0 px-3 sm:px-6 py-3 flex flex-col justify-center gap-2">
            <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
            <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
            <div className="h-3 w-2/3 bg-muted animate-pulse rounded" />
            {/* Price — mobile only */}
            <div className="h-4 w-16 bg-muted animate-pulse rounded sm:hidden" />
          </div>

          {/* Price — desktop only */}
          <div className="hidden sm:flex items-center justify-center shrink-0 px-5">
            <div className="h-6 w-20 bg-muted animate-pulse rounded" />
          </div>

          {/* Button — desktop / chevron — mobile */}
          <div className="hidden sm:flex items-center justify-center px-5 shrink-0">
            <div className="h-9 w-20 bg-muted animate-pulse rounded-xl" />
          </div>
          <div className="sm:hidden flex items-center justify-center px-3 shrink-0">
            <div className="h-5 w-5 bg-muted animate-pulse rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
