import { useState, useEffect } from 'react';

interface VisitorAvatarProps {
  name: string;
  photoUrl?: string | null;
  size?: number;
  className?: string;
}

export default function VisitorAvatar({ name, photoUrl, size = 44, className = '' }: VisitorAvatarProps) {
  const [broken, setBroken] = useState(false);
  useEffect(() => { setBroken(false); }, [photoUrl]);

  const initial = name?.trim()?.charAt(0)?.toUpperCase() || '?';
  const showPhoto = !!photoUrl && !broken;

  return (
    <div
      className={`rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 bg-blue-100 dark:bg-blue-900/30 ${className}`}
      style={{ width: size, height: size }}
    >
      {showPhoto ? (
        <img
          src={photoUrl as string}
          alt={`${name}'s profile photo`}
          className="w-full h-full object-cover"
          onError={() => setBroken(true)}
        />
      ) : (
        <span className="font-bold text-blue-700 dark:text-blue-300" style={{ fontSize: size * 0.4 }}>
          {initial}
        </span>
      )}
    </div>
  );
}
