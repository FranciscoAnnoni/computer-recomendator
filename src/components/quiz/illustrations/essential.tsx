export default function EssentialIllustration({
  width = 120,
  height = 120,
  className,
}: {
  width?: number;
  height?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 120 120"
      width={width}
      height={height}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Single coin — front face */}
      <circle cx="60" cy="52" r="34" />
      <circle cx="60" cy="52" r="26" />
      {/* Dollar sign on coin */}
      <line x1="60" y1="36" x2="60" y2="68" />
      <path d="M50 42 Q50 36 60 36 Q70 36 70 43 Q70 52 60 52 Q70 52 70 61 Q70 68 60 68 Q50 68 50 62" />

      {/* Ascending step chart below coin */}
      <line x1="18" y1="100" x2="102" y2="100" />
      <line x1="18" y1="100" x2="18" y2="78" />
      {/* Steps ascending left to right */}
      <polyline points="22,98 22,92 38,92 38,86 54,86 54,80 70,80 70,74 86,74 86,68 102,68" />
    </svg>
  );
}
