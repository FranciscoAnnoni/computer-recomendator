export default function PortabilityIllustration({
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
      {/* Ultra-thin laptop profile silhouette */}
      {/* Screen panel (angled back) */}
      <path d="M25 75 L30 25 L90 25 L95 75" />
      {/* Screen bezel */}
      <rect x="34" y="30" width="52" height="38" rx="1" />
      {/* Base (ultra-thin profile) */}
      <path d="M15 75 Q60 78 105 75 L102 80 Q60 83 18 80 Z" />
      {/* Keyboard surface hint */}
      <line x1="30" y1="76" x2="90" y2="76" />
      {/* Hinge detail */}
      <line x1="25" y1="75" x2="95" y2="75" />

      {/* Feather symbol above — lightweight suggestion */}
      <path d="M60 12 C64 8 72 10 70 18 C68 22 62 22 60 26" />
      <path d="M60 12 C56 8 48 10 50 18 C52 22 58 22 60 26" />
      <line x1="60" y1="12" x2="60" y2="26" />
      <path d="M57 16 C60 14 63 15 62 18" />
      <path d="M56 20 C59 18 63 19 62 22" />
    </svg>
  );
}
