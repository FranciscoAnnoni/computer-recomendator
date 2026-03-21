export default function EcosystemIllustration({
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
      {/* Laptop — bottom center */}
      <rect x="28" y="72" width="64" height="38" rx="3" />
      <rect x="34" y="77" width="52" height="26" rx="1" />
      <line x1="20" y1="110" x2="100" y2="110" />
      <path d="M20 110 Q60 114 100 110" />

      {/* Phone — left */}
      <rect x="8" y="28" width="22" height="38" rx="3" />
      <rect x="11" y="32" width="16" height="28" rx="1" />
      <circle cx="19" cy="64" r="2" />

      {/* Watch — right */}
      <rect x="90" y="36" width="22" height="24" rx="4" />
      <rect x="93" y="40" width="16" height="16" rx="1" />
      <line x1="97" y1="36" x2="97" y2="32" />
      <line x1="105" y1="36" x2="105" y2="32" />
      <line x1="97" y1="60" x2="97" y2="64" />
      <line x1="105" y1="60" x2="105" y2="64" />
      {/* Watch time hands */}
      <line x1="101" y1="48" x2="101" y2="44" />
      <line x1="101" y1="48" x2="104" y2="50" />

      {/* Connection lines between devices */}
      <line x1="30" y1="52" x2="52" y2="72" />
      <line x1="90" y1="52" x2="76" y2="72" />
      <line x1="30" y1="47" x2="90" y2="47" strokeDasharray="4 3" />

      {/* Connection dots */}
      <circle cx="30" cy="52" r="2" />
      <circle cx="90" cy="52" r="2" />
      <circle cx="60" cy="72" r="2" />
    </svg>
  );
}
