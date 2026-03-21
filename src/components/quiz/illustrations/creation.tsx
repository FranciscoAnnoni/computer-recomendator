export default function CreationIllustration({
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
      {/* Video editing timeline ruler */}
      <rect x="10" y="20" width="100" height="14" rx="2" />
      {/* Ruler tick marks */}
      <line x1="25" y1="20" x2="25" y2="27" />
      <line x1="40" y1="20" x2="40" y2="27" />
      <line x1="55" y1="20" x2="55" y2="27" />
      <line x1="70" y1="20" x2="70" y2="27" />
      <line x1="85" y1="20" x2="85" y2="27" />
      <line x1="100" y1="20" x2="100" y2="27" />

      {/* Timeline track 1 — video clips */}
      <rect x="10" y="40" width="100" height="16" rx="2" />
      <rect x="14" y="44" width="22" height="8" rx="1" />
      <rect x="40" y="44" width="30" height="8" rx="1" />
      <rect x="74" y="44" width="18" height="8" rx="1" />
      <rect x="96" y="44" width="10" height="8" rx="1" />

      {/* Timeline track 2 — audio clips */}
      <rect x="10" y="62" width="100" height="12" rx="2" />
      <rect x="14" y="65" width="50" height="6" rx="1" />
      <rect x="68" y="65" width="38" height="6" rx="1" />

      {/* Playhead */}
      <line x1="52" y1="16" x2="52" y2="78" />
      <polygon points="49,16 55,16 52,20" />

      {/* Code node graph */}
      <circle cx="25" cy="96" r="6" />
      <circle cx="60" cy="88" r="6" />
      <circle cx="95" cy="96" r="6" />
      <circle cx="60" cy="108" r="5" />
      <line x1="31" y1="96" x2="54" y2="90" />
      <line x1="66" y1="90" x2="89" y2="96" />
      <line x1="60" y1="94" x2="60" y2="103" />
    </svg>
  );
}
