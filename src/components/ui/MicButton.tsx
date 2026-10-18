import React from 'react';
import { Mic, MicOff, Sparkles } from 'lucide-react';

interface MicButtonProps {
  isRecording: boolean;
  isLoading?: boolean;
  onClick: () => void;
  size?: 'md' | 'lg' | 'xl';
  labelUr?: string;
  labelEn?: string;
}

export const MicButton: React.FC<MicButtonProps> = ({
  isRecording,
  isLoading = false,
  onClick,
  size = 'xl',
  labelUr,
  labelEn,
}) => {
  const sizeClasses = {
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
    xl: 'w-44 h-44 sm:w-48 sm:h-48',
  };

  const iconSizes = {
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={onClick}
        disabled={isLoading}
        className={`rounded-full flex flex-col items-center justify-center text-white transition-all transform active:scale-95 shadow-xl select-none relative ${sizeClasses[size]} ${
          isRecording
            ? 'bg-[#D64545] ring-8 ring-[#D64545]/20 animate-pulse'
            : isLoading
            ? 'bg-[#F2B705] animate-spin'
            : 'bg-[#0B6B3A] hover:bg-[#084D2A] animate-pulse-subtle'
        }`}
        aria-label="Tap to speak"
      >
        {isLoading ? (
          <Sparkles className={`${iconSizes[size]} animate-bounce`} />
        ) : isRecording ? (
          <MicOff className={iconSizes[size]} />
        ) : (
          <Mic className={iconSizes[size]} />
        )}

        {(labelUr || labelEn) && (
          <span className="font-urdu text-sm font-bold mt-1">
            {isRecording ? 'بولیں...' : isLoading ? 'سوچ رہا ہے...' : labelUr || 'بولیں'}
          </span>
        )}
      </button>

      {labelEn && !isRecording && !isLoading && (
        <span className="text-xs font-semibold text-[#6B7A72] mt-3">
          {labelEn}
        </span>
      )}
    </div>
  );
};
