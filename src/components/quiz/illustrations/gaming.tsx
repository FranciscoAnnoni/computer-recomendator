export default function GamingIllustration({
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
      {/* ── HEADPHONES top left ── */}
      {/* Headband arc */}
      <path d="M18 72 C18 42 58 28 72 42" />
      {/* Left ear cup */}
      <ellipse cx="18" cy="78" rx="10" ry="13" />
      <ellipse cx="18" cy="78" rx="6" ry="8" />
      {/* Right ear cup */}
      <ellipse cx="72" cy="48" rx="10" ry="13" transform="rotate(-30 72 48)" />
      <ellipse cx="72" cy="48" rx="6" ry="8" transform="rotate(-30 72 48)" />
      {/* Padding detail left */}
      <path d="M10 72 C10 76 12 82 18 84" strokeWidth="0.8" />
      {/* Mic boom right */}
      <path d="M80 54 C86 58 88 68 84 74" />
      <circle cx="84" cy="76" r="3" />

      {/* ── GAMING MONITOR right ── */}
      {/* Screen bezel */}
      <rect x="82" y="20" width="92" height="68" rx="4" />
      {/* Screen area */}
      <rect x="87" y="25" width="82" height="56" rx="2" />
      {/* Character silhouette on screen — warrior figure */}
      {/* Body */}
      <line x1="128" y1="44" x2="128" y2="62" />
      {/* Head */}
      <circle cx="128" cy="40" r="5" />
      {/* Horned helmet */}
      <path d="M123 37 C121 32 118 30 120 34" />
      <path d="M133 37 C135 32 138 30 136 34" />
      {/* Cape */}
      <path d="M122 46 C116 52 112 62 116 72" />
      <path d="M134 46 C140 52 144 62 140 72" />
      {/* Sword arm */}
      <line x1="122" y1="50" x2="110" y2="40" />
      <line x1="108" y1="36" x2="112" y2="42" />
      <line x1="106" y1="38" x2="114" y2="38" />
      {/* Shield */}
      <path d="M134 52 C140 50 146 54 146 60 C146 66 140 72 134 70 C134 62 134 54 134 52 Z" />
      {/* Legs */}
      <line x1="125" y1="62" x2="122" y2="74" />
      <line x1="131" y1="62" x2="134" y2="74" />
      {/* Glow lines on screen */}
      <line x1="89" y1="34" x2="96" y2="34" strokeWidth="0.8" />
      <line x1="89" y1="38" x2="94" y2="38" strokeWidth="0.8" />
      <line x1="89" y1="42" x2="97" y2="42" strokeWidth="0.8" />
      <line x1="152" y1="28" x2="163" y2="28" strokeWidth="0.8" />
      <line x1="154" y1="34" x2="165" y2="34" strokeWidth="0.8" />
      {/* Monitor stand */}
      <line x1="128" y1="88" x2="128" y2="100" />
      <path d="M112 100 L144 100 L148 106 L108 106 Z" />
      {/* Stand base */}
      <line x1="108" y1="106" x2="148" y2="106" />

      {/* ── GAME CONTROLLER bottom center ── */}
      {/* Main body */}
      <path d="M52 122 C38 118 30 126 32 138 C34 150 44 162 54 162 C60 162 66 156 74 156 C82 156 88 162 94 162 C104 162 116 150 118 138 C120 126 112 118 98 122 C94 120 88 116 82 116 C76 116 70 116 66 116 C60 116 54 120 52 122 Z" />
      {/* Left grip */}
      <path d="M32 138 C28 146 30 158 36 162 C40 164 46 162 50 158" strokeWidth="1.2" />
      {/* Right grip */}
      <path d="M118 138 C122 146 120 158 114 162 C110 164 104 162 100 158" strokeWidth="1.2" />
      {/* D-pad */}
      <line x1="50" y1="130" x2="50" y2="144" />
      <line x1="43" y1="137" x2="57" y2="137" />
      <rect x="46" y="133" width="8" height="8" rx="1" strokeWidth="0.8" />
      {/* ABXY buttons */}
      <circle cx="102" cy="130" r="3.5" />
      <circle cx="94" cy="136" r="3.5" />
      <circle cx="110" cy="136" r="3.5" />
      <circle cx="102" cy="142" r="3.5" />
      {/* Left stick */}
      <circle cx="62" cy="148" r="8" />
      <circle cx="62" cy="148" r="4" />
      {/* Right stick */}
      <circle cx="90" cy="148" r="8" />
      <circle cx="90" cy="148" r="4" />
      {/* Shoulder bumpers */}
      <path d="M42 124 C46 118 56 116 66 118" strokeWidth="1.2" />
      <path d="M108 124 C104 118 94 116 84 118" strokeWidth="1.2" />
      {/* Center button */}
      <circle cx="76" cy="134" r="5" />
      <circle cx="76" cy="134" r="2.5" />
      {/* Menu buttons */}
      <rect x="65" y="126" width="6" height="3" rx="1" />
      <rect x="79" y="126" width="6" height="3" rx="1" />
    </svg>
  );
}
