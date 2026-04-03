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
      viewBox="0 0 180 180"
      width={width}
      height={height}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* ── VIDEO EDITOR window (top) ── */}
      <rect x="10" y="8" width="108" height="76" rx="4" />
      {/* Window chrome */}
      <line x1="10" y1="18" x2="118" y2="18" />
      <circle cx="17" cy="13" r="2.5" />
      <circle cx="25" cy="13" r="2.5" />
      <circle cx="33" cy="13" r="2.5" />
      {/* Preview area */}
      <rect x="16" y="22" width="70" height="42" rx="2" />
      {/* Play button inside preview */}
      <circle cx="51" cy="43" r="10" />
      <polygon points="47,38 47,48 58,43" />
      {/* Right panel — properties */}
      <rect x="90" y="22" width="22" height="6" rx="1" />
      <rect x="90" y="32" width="22" height="6" rx="1" />
      <rect x="90" y="42" width="16" height="6" rx="1" />
      <rect x="90" y="52" width="22" height="6" rx="1" />
      {/* Timeline tracks */}
      <rect x="10" y="68" width="108" height="9" rx="0" />
      {/* Track clips */}
      <rect x="14" y="70" width="18" height="5" rx="1" />
      <rect x="35" y="70" width="26" height="5" rx="1" />
      <rect x="64" y="70" width="14" height="5" rx="1" />
      <rect x="81" y="70" width="20" height="5" rx="1" />
      <rect x="104" y="70" width="10" height="5" rx="1" />
      {/* Playhead */}
      <line x1="56" y1="64" x2="56" y2="84" strokeWidth="1.8" />
      <polygon points="53,64 59,64 56,68" />

      {/* ── COLOR PALETTE top right ── */}
      <circle cx="148" cy="28" r="22" />
      <circle cx="148" cy="28" r="12" />
      {/* Palette thumb hole */}
      <circle cx="148" cy="28" r="5" />
      {/* Color dots on palette rim */}
      <circle cx="148" cy="10" r="3" />
      <circle cx="162" cy="18" r="3" />
      <circle cx="166" cy="34" r="3" />
      <circle cx="157" cy="46" r="3" />
      <circle cx="139" cy="46" r="3" />
      <circle cx="130" cy="34" r="3" />
      <circle cx="134" cy="18" r="3" />
      {/* Paintbrush */}
      <line x1="164" y1="44" x2="174" y2="14" />
      <path d="M162 46 C160 50 164 54 168 50 L164 44 Z" />

      {/* ── DRAWING TABLET bottom left ── */}
      <rect x="8" y="100" width="74" height="50" rx="6" />
      {/* Active area */}
      <rect x="16" y="106" width="58" height="36" rx="3" />
      {/* Express keys left */}
      <rect x="9" y="110" width="5" height="8" rx="1" />
      <rect x="9" y="122" width="5" height="8" rx="1" />
      <rect x="9" y="134" width="5" height="8" rx="1" />
      {/* Drawing on tablet — a shape/curve being drawn */}
      <path d="M22 132 C28 118 38 112 50 120 C58 126 60 138 68 136" strokeWidth="1.8" />
      {/* Stylus pen */}
      <line x1="62" y1="108" x2="82" y2="92" />
      <line x1="65" y1="106" x2="85" y2="90" />
      <line x1="62" y1="108" x2="65" y2="106" />
      <polygon points="63,107 81,93 84,91 82,94" />
      {/* Stylus tip detail */}
      <line x1="84" y1="90" x2="87" y2="87" strokeWidth="1" />

      {/* ── CODE EDITOR bottom right ── */}
      <rect x="90" y="92" width="82" height="80" rx="4" />
      {/* Window chrome */}
      <line x1="90" y1="102" x2="172" y2="102" />
      <circle cx="97" cy="97" r="2" />
      <circle cx="104" cy="97" r="2" />
      <circle cx="111" cy="97" r="2" />
      {/* Line numbers column */}
      <line x1="100" y1="102" x2="100" y2="172" strokeWidth="0.8" />
      {/* Code lines — varying lengths simulate real code */}
      <line x1="104" y1="109" x2="130" y2="109" />
      <line x1="108" y1="115" x2="158" y2="115" />
      <line x1="108" y1="121" x2="148" y2="121" />
      <line x1="112" y1="127" x2="162" y2="127" />
      <line x1="112" y1="133" x2="140" y2="133" />
      <line x1="108" y1="139" x2="155" y2="139" />
      <line x1="104" y1="145" x2="130" y2="145" />
      <line x1="108" y1="151" x2="168" y2="151" />
      <line x1="108" y1="157" x2="144" y2="157" />
      <line x1="104" y1="163" x2="138" y2="163" />
      {/* Cursor blink */}
      <rect x="138" y="157" width="1.5" height="8" />
    </svg>
  );
}
