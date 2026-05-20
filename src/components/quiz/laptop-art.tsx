export function NomadaArt() {
  return (
    <svg
      viewBox="0 0 400 240"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ width: "88%", height: "100%", overflow: "visible" }}
    >
      <defs>
        <linearGradient id="stroke-n" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9ec3ff" />
          <stop offset="1" stopColor="#3b82f6" />
        </linearGradient>
        <linearGradient id="screenFill-n" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="rgba(59,130,246,0.18)" />
          <stop offset="1" stopColor="rgba(59,130,246,0.02)" />
        </linearGradient>
      </defs>

      {/* base / keyboard */}
      <g stroke="url(#stroke-n)" strokeLinecap="round" strokeLinejoin="round" fill="none" strokeWidth="1.6">
        <path d="M40 195 L360 195 L380 215 L20 215 Z" />
        <path d="M175 205 H225" strokeWidth="2" />
        <path d="M55 200 L350 200" opacity="0.45" />
      </g>

      {/* screen frame */}
      <g stroke="url(#stroke-n)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" fill="none">
        <path d="M62 195 L62 38 Q62 30 70 30 L330 30 Q338 30 338 38 L338 195" />
      </g>

      {/* screen inner */}
      <rect x="76" y="44" width="248" height="142" rx="3" fill="url(#screenFill-n)" stroke="url(#stroke-n)" strokeWidth="1.2" />

      {/* dock / window chrome */}
      <g stroke="#9ec3ff" strokeWidth="1.2" opacity="0.85" fill="none">
        <circle cx="86" cy="54" r="1.6" />
        <circle cx="92" cy="54" r="1.6" />
        <circle cx="98" cy="54" r="1.6" />
        <path d="M76 62 L324 62" opacity="0.35" />
      </g>

      {/* code lines */}
      <g stroke="#9ec3ff" strokeWidth="1.2" opacity="0.8" fill="none">
        <path d="M88 76 L150 76" />
        <path d="M88 86 L210 86" />
        <path d="M104 96 L180 96" />
        <path d="M104 106 L240 106" />
        <path d="M88 116 L130 116" />
      </g>

      {/* window shape with play icon */}
      <g fill="none" stroke="#9ec3ff" strokeWidth="1.3" opacity="0.95">
        <rect x="220" y="74" width="90" height="62" rx="3" />
        <path d="M252 92 L272 105 L252 118 Z" fill="rgba(59,130,246,0.55)" stroke="#3b82f6" />
      </g>

      {/* timeline */}
      <g stroke="#9ec3ff" strokeWidth="1.1" opacity="0.7" fill="none">
        <path d="M88 150 L312 150" />
        <circle cx="138" cy="150" r="2.4" fill="#3b82f6" stroke="none" />
        <path d="M88 162 L260 162" opacity="0.55" />
        <path d="M88 172 L210 172" opacity="0.4" />
      </g>

      {/* hinge highlight */}
      <path d="M62 195 L338 195" stroke="url(#stroke-n)" strokeWidth="1.8" />

      {/* under-glow */}
      <ellipse cx="200" cy="223" rx="170" ry="6" fill="rgba(59,130,246,0.25)" />
    </svg>
  );
}

export function EscritorioArt() {
  return (
    <svg
      viewBox="0 0 400 260"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ width: "88%", height: "100%", overflow: "visible" }}
    >
      <defs>
        <linearGradient id="stroke-d" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9ec3ff" />
          <stop offset="1" stopColor="#3b82f6" />
        </linearGradient>
        <linearGradient id="screenFill-d" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="rgba(59,130,246,0.18)" />
          <stop offset="1" stopColor="rgba(59,130,246,0.02)" />
        </linearGradient>
      </defs>

      {/* Monitor frame */}
      <rect x="55" y="14" width="290" height="186" rx="10"
        stroke="url(#stroke-d)" strokeWidth="1.8" fill="none" strokeLinecap="round" />

      {/* Screen */}
      <rect x="67" y="26" width="266" height="162" rx="5"
        fill="url(#screenFill-d)" stroke="url(#stroke-d)" strokeWidth="1.2" />

      {/* Screen chrome dots */}
      <circle cx="78" cy="37" r="1.6" stroke="#9ec3ff" strokeWidth="1.2" fill="none" opacity="0.85" />
      <circle cx="85" cy="37" r="1.6" stroke="#9ec3ff" strokeWidth="1.2" fill="none" opacity="0.85" />
      <circle cx="92" cy="37" r="1.6" stroke="#9ec3ff" strokeWidth="1.2" fill="none" opacity="0.85" />
      <path d="M67 45 L333 45" stroke="#9ec3ff" strokeWidth="1.1" opacity="0.35" fill="none" />

      {/* Code lines */}
      <g stroke="#9ec3ff" strokeWidth="1.2" opacity="0.8" fill="none">
        <path d="M78 60 L152 60" />
        <path d="M78 71 L192 71" />
        <path d="M90 82 L172 82" />
        <path d="M90 93 L202 93" />
        <path d="M78 104 L142 104" />
        <path d="M78 115 L176 115" opacity="0.7" />
      </g>

      {/* Chart panel */}
      <rect x="215" y="57" width="106" height="82" rx="3"
        stroke="#9ec3ff" strokeWidth="1.3" fill="none" opacity="0.95" />
      <rect x="226" y="109" width="13" height="20" rx="1.5"
        fill="rgba(59,130,246,0.4)" stroke="#3b82f6" strokeWidth="0.8" />
      <rect x="245" y="95" width="13" height="34" rx="1.5"
        fill="rgba(59,130,246,0.6)" stroke="#3b82f6" strokeWidth="0.8" />
      <rect x="264" y="87" width="13" height="42" rx="1.5"
        fill="rgba(59,130,246,0.7)" stroke="#3b82f6" strokeWidth="0.8" />
      <rect x="283" y="101" width="13" height="28" rx="1.5"
        fill="rgba(59,130,246,0.5)" stroke="#3b82f6" strokeWidth="0.8" />
      <path d="M222 129 L306 129" stroke="#9ec3ff" strokeWidth="0.8" opacity="0.5" fill="none" />

      {/* Timeline */}
      <g stroke="#9ec3ff" fill="none">
        <path d="M78 143 L312 143" strokeWidth="1.1" opacity="0.7" />
        <circle cx="130" cy="143" r="2.4" fill="#3b82f6" stroke="none" />
        <path d="M78 154 L258 154" strokeWidth="1" opacity="0.45" />
        <path d="M78 164 L200 164" strokeWidth="1" opacity="0.35" />
      </g>

      {/* Monitor stand */}
      <path d="M200 200 L200 218" stroke="url(#stroke-d)" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M170 218 L230 218" stroke="url(#stroke-d)" strokeWidth="1.8" strokeLinecap="round" fill="none" />

      {/* Keyboard */}
      <rect x="112" y="228" width="178" height="20" rx="5"
        stroke="url(#stroke-d)" strokeWidth="1.5" fill="none" />
      <path d="M122 234 L290 234" stroke="#9ec3ff" strokeWidth="0.8" opacity="0.4" fill="none" />
      <path d="M120 240 L280 240" stroke="#9ec3ff" strokeWidth="0.8" opacity="0.35" fill="none" />

      {/* Mouse */}
      <ellipse cx="317" cy="236" rx="13" ry="16"
        stroke="url(#stroke-d)" strokeWidth="1.5" fill="none" />
      <path d="M317 220 L317 230" stroke="#9ec3ff" strokeWidth="1" opacity="0.6" fill="none" />

      {/* Under-glow */}
      <ellipse cx="200" cy="254" rx="155" ry="6" fill="rgba(59,130,246,0.25)" />
    </svg>
  );
}
