import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface TopBarProps {
  title: string;
  titleUr?: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export const TopBar: React.FC<TopBarProps> = ({
  title,
  titleUr,
  onBack,
  rightAction,
}) => {
  return (
    <header className="sticky top-0 z-30 h-16 bg-[#F7F8F5]/90 backdrop-blur-md border-b border-[#E4E8E2] px-5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-[#14201A] hover:bg-black/5 active:scale-95 transition-all"
            aria-label="Back"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        <div>
          {titleUr && <span className="font-urdu text-lg font-bold text-[#14201A] block leading-tight">{titleUr}</span>}
          <h1 className="text-sm font-bold text-[#6B7A72]">{title}</h1>
        </div>
      </div>

      {rightAction && <div className="flex items-center gap-2">{rightAction}</div>}
    </header>
  );
};
