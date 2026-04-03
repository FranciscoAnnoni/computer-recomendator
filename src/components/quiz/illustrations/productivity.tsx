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
      {/* ── BINDERS left ── */}
      {/* Binder 1 — back */}
      <rect x="8" y="58" width="30" height="78" rx="2" />
      <line x1="14" y1="58" x2="14" y2="136" />
      <rect x="8" y="64" width="6" height="10" rx="1" />
      <line x1="20" y1="68" x2="35" y2="68" />
      <line x1="20" y1="74" x2="35" y2="74" />
      <line x1="20" y1="80" x2="35" y2="80" />
      {/* Binder 2 — mid */}
      <rect x="16" y="68" width="30" height="68" rx="2" />
      <line x1="22" y1="68" x2="22" y2="136" />
      <rect x="16" y="74" width="6" height="10" rx="1" />
      <line x1="28" y1="78" x2="43" y2="78" />
      <line x1="28" y1="84" x2="43" y2="84" />
      <line x1="28" y1="90" x2="43" y2="90" />
      {/* Binder 3 — front */}
      <rect x="24" y="78" width="30" height="58" rx="2" />
      <line x1="30" y1="78" x2="30" y2="136" />
      <rect x="24" y="84" width="6" height="10" rx="1" />
      <line x1="36" y1="88" x2="51" y2="88" />
      <line x1="36" y1="94" x2="51" y2="94" />
      <line x1="36" y1="100" x2="51" y2="100" />

      {/* ── LAPTOP center ── */}
      {/* Screen */}
      <rect x="54" y="48" width="88" height="62" rx="4" />
      {/* Bezel */}
      <rect x="59" y="53" width="78" height="52" rx="2" />
      {/* Browser chrome */}
      <line x1="59" y1="61" x2="137" y2="61" />
      <circle cx="63" cy="57" r="2" />
      <circle cx="70" cy="57" r="2" />
      <circle cx="77" cy="57" r="2" />
      {/* Page content lines */}
      <line x1="65" y1="68" x2="131" y2="68" />
      <line x1="65" y1="74" x2="125" y2="74" />
      <line x1="65" y1="80" x2="131" y2="80" />
      <line x1="65" y1="86" x2="118" y2="86" />
      <line x1="65" y1="92" x2="128" y2="92" />
      {/* Hinge */}
      <line x1="54" y1="110" x2="142" y2="110" />
      {/* Base / keyboard deck */}
      <path d="M47 110 L149 110 L145 132 L51 132 Z" />
      {/* Keyboard rows */}
      {[0,1,2,3,4,5,6,7,8,9,10,11,12,13].map((k) => (
        <rect key={`kr1-${k}`} x={57 + k * 6.5} y="114" width="4" height="3" rx="0.8" />
      ))}
      {[0,1,2,3,4,5,6,7,8,9,10,11,12].map((k) => (
        <rect key={`kr2-${k}`} x={59 + k * 6.5} y="120" width="4" height="3" rx="0.8" />
      ))}
      {/* Trackpad */}
      <rect x="80" y="126" width="36" height="3" rx="1.5" />

      {/* ── FLOWCHART top right ── */}
      <rect x="120" y="10" width="36" height="18" rx="3" />
      <line x1="138" y1="28" x2="138" y2="36" />
      <polyline points="135,33 138,37 141,33" />
      <rect x="120" y="36" width="36" height="18" rx="3" />
      {/* Fork */}
      <line x1="128" y1="54" x2="128" y2="58" />
      <line x1="148" y1="54" x2="148" y2="58" />
      <line x1="128" y1="58" x2="148" y2="58" />
      <line x1="128" y1="58" x2="128" y2="63" />
      <line x1="148" y1="58" x2="148" y2="63" />
      <polyline points="125,60 128,64 131,60" />
      <polyline points="145,60 148,64 151,60" />
      <rect x="112" y="62" width="30" height="16" rx="3" />
      <rect x="145" y="62" width="26" height="16" rx="3" />

      {/* ── COFFEE CUP bottom left ── */}
      {/* Cup */}
      <path d="M10 150 Q10 172 14 172 L30 172 Q34 172 34 168 L34 150 Z" />
      <line x1="10" y1="150" x2="34" y2="150" />
      {/* Handle */}
      <path d="M34 154 C44 154 44 166 34 166" />
      {/* Steam */}
      <path d="M16 147 C14 143 18 140 16 136" strokeWidth="1.2" />
      <path d="M22 147 C24 143 20 140 22 136" strokeWidth="1.2" />
      <path d="M28 147 C26 143 30 140 28 136" strokeWidth="1.2" />
      {/* Saucer */}
      <ellipse cx="22" cy="172" rx="20" ry="3.5" />

      {/* ── PENCIL ── */}
      <line x1="46" y1="140" x2="50" y2="170" />
      <line x1="49" y1="140" x2="53" y2="170" />
      <line x1="46" y1="140" x2="49" y2="140" />
      <polygon points="48,168 53,173 51,166" />
    </svg>
  );
}
