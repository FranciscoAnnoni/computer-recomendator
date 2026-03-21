interface Props {
  width?: number;
  height?: number;
  className?: string;
}

export default function WindowsIllustration({ width = 120, height = 120, className }: Props) {
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
      {/* Windows logo — four panes in perspective */}
      {/* Top-left pane */}
      <path d="M20 30 L54 24 L54 56 L20 56 Z" />
      {/* Top-right pane */}
      <path d="M58 23 L100 16 L100 56 L58 56 Z" />
      {/* Bottom-left pane */}
      <path d="M20 60 L54 60 L54 92 L20 86 Z" />
      {/* Bottom-right pane */}
      <path d="M58 60 L100 60 L100 100 L58 93 Z" />
      {/* Subtle inner lines on each pane */}
      <line x1="37" y1="25" x2="37" y2="56" strokeOpacity="0.3" />
      <line x1="79" y1="18" x2="79" y2="56" strokeOpacity="0.3" />
      <line x1="20" y1="43" x2="54" y2="43" strokeOpacity="0.3" />
      <line x1="58" y1="43" x2="100" y2="43" strokeOpacity="0.3" />
    </svg>
  );
}
