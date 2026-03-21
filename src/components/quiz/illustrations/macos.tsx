interface Props {
  width?: number;
  height?: number;
  className?: string;
}

export default function MacosIllustration({ width = 120, height = 120, className }: Props) {
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
      {/* Stylized apple silhouette outline */}
      {/* Body: rounded shape with a bite taken out */}
      <path d="M60 30 C60 22 68 16 76 18 C76 18 72 26 64 28" />
      {/* Leaf stem */}
      <path d="M60 28 C56 20 50 18 46 22" strokeOpacity="0.5" />
      {/* Apple body */}
      <path d="M42 42 C36 38 30 44 28 52 C24 66 30 82 38 90 C42 94 48 96 52 92 C56 88 64 88 68 92 C72 96 78 94 82 90 C90 82 96 66 92 52 C90 44 84 38 78 42 C74 46 66 48 60 46 C54 48 46 46 42 42 Z" />
      {/* Bite mark — right side cutout */}
      <path d="M80 36 C82 30 90 28 94 32 C90 36 84 40 80 36 Z" strokeOpacity="0.4" />
    </svg>
  );
}
