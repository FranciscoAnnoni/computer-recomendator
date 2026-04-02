"use client";

interface ProfileAvatarProps {
  color?: string;
  profileName: string;
  onClick?: () => void;
}

export function ProfileAvatar({ color, profileName, onClick }: ProfileAvatarProps) {
  return (
    <button
      type="button"
      aria-label={`Tu perfil: ${profileName}`}
      onClick={onClick}
      className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
      style={{ backgroundColor: color ?? "hsl(var(--primary))" }}
    >
      <span className="flex items-center justify-center w-full h-full text-white text-xs font-bold">
        P
      </span>
    </button>
  );
}
