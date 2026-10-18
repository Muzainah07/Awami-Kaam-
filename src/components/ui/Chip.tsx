import React from 'react';

interface ChipProps {
  label: string;
  labelUr?: string;
  icon?: React.ReactNode;
  selected?: boolean;
  onClick?: () => void;
  size?: 'md' | 'lg';
}

export const Chip: React.FC<ChipProps> = ({
  label,
  labelUr,
  icon,
  selected = false,
  onClick,
  size = 'md',
}) => {
  const heightClass = size === 'lg' ? 'h-14 px-5 text-base' : 'h-11 px-4 text-sm';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-2xl font-semibold border transition-all duration-200 select-none ${heightClass} ${
        selected
          ? 'bg-[#0B6B3A] border-[#0B6B3A] text-white shadow-xs'
          : 'bg-white border-[#E4E8E2] text-[#14201A] hover:border-[#0B6B3A]/40 hover:bg-gray-50'
      }`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <div className="flex items-center gap-1.5">
        {labelUr && <span className="font-urdu leading-none">{labelUr}</span>}
        <span>{label}</span>
      </div>
    </button>
  );
};
