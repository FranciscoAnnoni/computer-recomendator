export default function PremiumIllustration({
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
      {/* Faceted diamond — geometric wireframe */}
      {/* Crown (top facets) */}
      <polygon points="60,12 38,42 82,42" />
      {/* Left crown facets */}
      <polygon points="60,12 18,42 38,42" />
      {/* Right crown facets */}
      <polygon points="60,12 82,42 102,42" />

      {/* Girdle — widest point */}
      <line x1="18" y1="42" x2="102" y2="42" />

      {/* Pavilion (bottom facets) */}
      <polygon points="18,42 60,108 38,42" />
      <polygon points="38,42 60,108 60,42" />
      <polygon points="60,42 60,108 82,42" />
      <polygon points="82,42 60,108 102,42" />

      {/* Table facet — top flat face */}
      <polygon points="60,22 44,42 76,42" />

      {/* Internal cross lines for depth */}
      <line x1="44" y1="42" x2="60" y2="108" />
      <line x1="76" y1="42" x2="60" y2="108" />
      <line x1="60" y1="22" x2="60" y2="42" />

      {/* Star facets hint */}
      <line x1="60" y1="22" x2="44" y2="42" />
      <line x1="60" y1="22" x2="76" y2="42" />
    </svg>
  );
}
