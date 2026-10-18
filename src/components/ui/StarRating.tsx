import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number; // 0 to 5
  max?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  max = 5,
  interactive = false,
  onChange,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
  };

  return (
    <div className="inline-flex items-center gap-1">
      {Array.from({ length: max }).map((_, index) => {
        const starNumber = index + 1;
        const isFilled = rating >= starNumber;

        return (
          <button
            key={index}
            type="button"
            disabled={!interactive}
            onClick={() => onChange?.(starNumber)}
            className={`${interactive ? 'cursor-pointer hover:scale-110 active:scale-95' : 'cursor-default'} transition-transform p-0.5`}
          >
            <Star
              className={`${sizeClasses[size]} ${
                isFilled
                  ? 'text-[#F2B705] fill-[#F2B705]'
                  : 'text-gray-300'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};
