import React from 'react';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  iconEmoji?: string;
  bgColor?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  size = 'md',
  iconEmoji,
  bgColor = '#0B6B3A',
}) => {
  const sizeClasses = {
    sm: 'w-10 h-10 text-sm',
    md: 'w-14 h-14 text-lg',
    lg: 'w-18 h-18 text-2xl',
    xl: 'w-24 h-24 text-4xl',
  };

  const initial = name ? name.charAt(0).toUpperCase() : 'W';

  return (
    <div
      className={`rounded-full flex items-center justify-center font-black text-white shrink-0 shadow-xs select-none ${sizeClasses[size]}`}
      style={{ backgroundColor: bgColor }}
    >
      {iconEmoji ? <span>{iconEmoji}</span> : <span>{initial}</span>}
    </div>
  );
};
