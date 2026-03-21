export default function ProductivityIllustration({
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
      {/* Notebook (isometric) */}
      <rect x="14" y="30" width="40" height="52" rx="3" />
      <line x1="14" y1="42" x2="54" y2="42" />
      <line x1="22" y1="52" x2="46" y2="52" />
      <line x1="22" y1="60" x2="46" y2="60" />
      <line x1="22" y1="68" x2="38" y2="68" />
      {/* Notebook spine */}
      <line x1="20" y1="30" x2="20" y2="82" />

      {/* Bar chart */}
      <rect x="64" y="62" width="8" height="20" rx="1" />
      <rect x="76" y="52" width="8" height="30" rx="1" />
      <rect x="88" y="44" width="8" height="38" rx="1" />
      <line x1="62" y1="84" x2="100" y2="84" />

      {/* Stacked browser windows */}
      <rect x="58" y="20" width="46" height="28" rx="3" />
      <line x1="58" y1="28" x2="104" y2="28" />
      <circle cx="64" cy="24" r="2" />
      <circle cx="71" cy="24" r="2" />
      <circle cx="78" cy="24" r="2" />

      {/* Second window (offset) */}
      <rect x="62" y="15" width="40" height="24" rx="3" />
      <line x1="62" y1="22" x2="102" y2="22" />
    </svg>
  );
}
