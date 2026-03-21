export default function BalancedIllustration({
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
      {/* Central pivot post */}
      <line x1="60" y1="30" x2="60" y2="95" />
      {/* Base */}
      <line x1="40" y1="95" x2="80" y2="95" />
      <line x1="36" y1="100" x2="84" y2="100" />

      {/* Pivot point triangle */}
      <polygon points="60,28 56,36 64,36" />

      {/* Horizontal balance beam */}
      <line x1="18" y1="50" x2="102" y2="50" />

      {/* Left suspension lines */}
      <line x1="26" y1="50" x2="22" y2="65" />
      <line x1="34" y1="50" x2="38" y2="65" />

      {/* Left pan */}
      <path d="M18 65 Q30 70 42 65" />

      {/* Right suspension lines */}
      <line x1="86" y1="50" x2="82" y2="65" />
      <line x1="94" y1="50" x2="98" y2="65" />

      {/* Right pan */}
      <path d="M78 65 Q90 70 102 65" />

      {/* Small weight circles on each pan */}
      <circle cx="30" cy="64" r="4" />
      <circle cx="90" cy="64" r="4" />

      {/* Beam connection to post */}
      <circle cx="60" cy="50" r="3" />

      {/* Architectural detail — small tick marks on beam */}
      <line x1="40" y1="47" x2="40" y2="53" />
      <line x1="50" y1="47" x2="50" y2="53" />
      <line x1="70" y1="47" x2="70" y2="53" />
      <line x1="80" y1="47" x2="80" y2="53" />
    </svg>
  );
}
