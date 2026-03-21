"use client";

interface ProfileAvatarProps {
  imageUrl: string | null;
  profileName: string;
  onClick?: () => void;
}

export function ProfileAvatar({ imageUrl, profileName, onClick }: ProfileAvatarProps) {
  const initial = profileName.charAt(0).toUpperCase();

  return (
    <button
      type="button"
      aria-label={`Tu perfil: ${profileName}`}
      onClick={onClick}
      className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
    >
      {imageUrl ? (
        <img src={imageUrl} alt="" className="w-full h-full object-cover" />
      ) : (
        <span className="flex items-center justify-center w-full h-full bg-primary text-primary-foreground text-xs font-medium">
          {initial}
        </span>
      )}
    </button>
  );
}
