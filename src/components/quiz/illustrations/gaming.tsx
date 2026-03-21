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
      {/* PC Fan / turbine top-down view — outer ring */}
      <circle cx="60" cy="60" r="46" />
      {/* Inner ring */}
      <circle cx="60" cy="60" r="10" />
      {/* Fan blades (6 blades) */}
      <path d="M60 50 C55 42 45 38 40 44 C48 48 54 54 60 60" />
      <path d="M70 55 C78 50 82 40 76 36 C72 44 66 50 60 60" />
      <path d="M65 70 C73 75 83 73 83 65 C74 64 67 62 60 60" />
      <path d="M60 70 C65 78 74 82 79 76 C72 72 66 66 60 60" />
      <path d="M50 65 C42 70 38 80 44 84 C48 76 54 70 60 60" />
      <path d="M55 50 C47 45 37 47 37 55 C46 56 53 58 60 60" />
      {/* Mounting screws at corners */}
      <circle cx="22" cy="22" r="4" />
      <line x1="20" y1="22" x2="24" y2="22" />
      <line x1="22" y1="20" x2="22" y2="24" />
      <circle cx="98" cy="22" r="4" />
      <line x1="96" y1="22" x2="100" y2="22" />
      <line x1="98" y1="20" x2="98" y2="24" />
      <circle cx="22" cy="98" r="4" />
      <line x1="20" y1="98" x2="24" y2="98" />
      <line x1="22" y1="96" x2="22" y2="100" />
      <circle cx="98" cy="98" r="4" />
      <line x1="96" y1="98" x2="100" y2="98" />
      <line x1="98" y1="96" x2="98" y2="100" />
    </svg>
  );
}
