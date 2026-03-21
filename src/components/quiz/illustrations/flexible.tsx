interface Props {
  width?: number;
  height?: number;
  className?: string;
}

export default function FlexibleIllustration({ width = 120, height = 120, className }: Props) {
  return (
    <svg
      viewBox="0 0 120 120"
      width={width}
      height={height}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Compass / direction finder — represents openness and flexibility */}
      {/* Outer circle */}
      <circle cx="60" cy="60" r="36" />
      {/* Inner circle */}
      <circle cx="60" cy="60" r="4" />
      {/* Cardinal tick marks */}
      <line x1="60" y1="24" x2="60" y2="30" />
      <line x1="60" y1="90" x2="60" y2="96" />
      <line x1="24" y1="60" x2="30" y2="60" />
      <line x1="90" y1="60" x2="96" y2="60" />
      {/* N label area — small triangle pointing up */}
      <path d="M57 32 L60 24 L63 32" strokeOpacity="0.5" />
      {/* Compass needle — pointing NE */}
      <path d="M60 60 L75 42" strokeWidth="2" />
      <path d="M60 60 L45 78" strokeOpacity="0.4" />
      {/* Needle tip arrowhead */}
      <path d="M72 40 L75 42 L73 45" />
      {/* Diagonal minor ticks */}
      <line x1="85" y1="35" x2="81" y2="39" strokeOpacity="0.4" />
      <line x1="35" y1="85" x2="39" y2="81" strokeOpacity="0.4" />
      <line x1="35" y1="35" x2="39" y2="39" strokeOpacity="0.4" />
      <line x1="85" y1="85" x2="81" y2="81" strokeOpacity="0.4" />
    </svg>
  );
}
