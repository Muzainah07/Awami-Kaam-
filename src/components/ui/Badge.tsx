import React from 'react';

interface BadgeProps {
  variant?: 'fair' | 'warning' | 'success' | 'neutral' | 'accent';
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  children,
  icon,
}) => {
  const variantStyles = {
    fair: 'bg-[#1F9D55]/10 text-[#0B6B3A] border-[#1F9D55]/30',
    warning: 'bg-[#F2B705]/15 text-[#946800] border-[#F2B705]/40',
    success: 'bg-[#1F9D55]/15 text-[#1F9D55] border-[#1F9D55]/30',
    neutral: 'bg-gray-100 text-[#6B7A72] border-[#E4E8E2]',
    accent: 'bg-[#F2B705] text-[#14201A] border-transparent font-bold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${variantStyles[variant]}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
