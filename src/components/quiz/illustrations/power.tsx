export default function PowerIllustration({
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
      {/* Microchip body */}
      <rect x="30" y="30" width="60" height="60" rx="4" />
      {/* Inner die */}
      <rect x="42" y="42" width="36" height="36" rx="2" />
      {/* CPU cross grid lines */}
      <line x1="42" y1="54" x2="78" y2="54" />
      <line x1="42" y1="66" x2="78" y2="66" />
      <line x1="54" y1="42" x2="54" y2="78" />
      <line x1="66" y1="42" x2="66" y2="78" />

      {/* Left pins */}
      <line x1="20" y1="38" x2="30" y2="38" />
      <line x1="20" y1="46" x2="30" y2="46" />
      <line x1="20" y1="54" x2="30" y2="54" />
      <line x1="20" y1="62" x2="30" y2="62" />
      <line x1="20" y1="70" x2="30" y2="70" />
      <line x1="20" y1="78" x2="30" y2="78" />
      <line x1="20" y1="86" x2="30" y2="86" />

      {/* Right pins */}
      <line x1="90" y1="38" x2="100" y2="38" />
      <line x1="90" y1="46" x2="100" y2="46" />
      <line x1="90" y1="54" x2="100" y2="54" />
      <line x1="90" y1="62" x2="100" y2="62" />
      <line x1="90" y1="70" x2="100" y2="70" />
      <line x1="90" y1="78" x2="100" y2="78" />
      <line x1="90" y1="86" x2="100" y2="86" />

      {/* Top pins */}
      <line x1="38" y1="20" x2="38" y2="30" />
      <line x1="46" y1="20" x2="46" y2="30" />
      <line x1="54" y1="20" x2="54" y2="30" />
      <line x1="62" y1="20" x2="62" y2="30" />
      <line x1="70" y1="20" x2="70" y2="30" />
      <line x1="78" y1="20" x2="78" y2="30" />
      <line x1="86" y1="20" x2="86" y2="30" />

      {/* Bottom pins */}
      <line x1="38" y1="90" x2="38" y2="100" />
      <line x1="46" y1="90" x2="46" y2="100" />
      <line x1="54" y1="90" x2="54" y2="100" />
      <line x1="62" y1="90" x2="62" y2="100" />
      <line x1="70" y1="90" x2="70" y2="100" />
      <line x1="78" y1="90" x2="78" y2="100" />
      <line x1="86" y1="90" x2="86" y2="100" />
    </svg>
  );
}
