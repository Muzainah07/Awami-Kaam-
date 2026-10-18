import React, { useState, useRef } from 'react';
import { ChevronRight, Check } from 'lucide-react';

interface SwipeSliderProps {
  labelUr: string;
  labelEn: string;
  onConfirm: () => void;
  disabled?: boolean;
  color?: string;
}

export const SwipeSlider: React.FC<SwipeSliderProps> = ({
  labelUr,
  labelEn,
  onConfirm,
  disabled = false,
  color = '#0B6B3A',
}) => {
  const [dragProgress, setDragProgress] = useState(0); // 0 to 1
  const [isConfirmed, setIsConfirmed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (disabled || isConfirmed || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const offsetX = Math.max(0, Math.min(rect.width - 56, clientX - rect.left - 28));
    const progress = offsetX / (rect.width - 56);
    setDragProgress(progress);

    if (progress >= 0.88) {
      setIsConfirmed(true);
      setDragProgress(1);
      setTimeout(() => {
        onConfirm();
      }, 200);
    }
  };

  const handleTouchEnd = () => {
    if (!isConfirmed) {
      setDragProgress(0);
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={e => e.buttons === 1 && handleTouchMove(e)}
      onTouchMove={handleTouchMove}
      onMouseUp={handleTouchEnd}
      onTouchEnd={handleTouchEnd}
      className={`relative w-full h-16 rounded-[20px] bg-white border-2 border-[#E4E8E2] overflow-hidden select-none flex items-center shadow-xs ${
        disabled ? 'opacity-50 pointer-events-none' : ''
      }`}
    >
      {/* Background fill based on progress */}
      <div
        className="absolute left-0 top-0 bottom-0 transition-all"
        style={{
          width: `${Math.max(56, dragProgress * 100)}%`,
          backgroundColor: `${color}15`,
        }}
      />

      {/* Center instruction text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-14 text-center">
        <span className="font-urdu text-base font-bold text-[#14201A] leading-tight">
          {labelUr}
        </span>
        <span className="text-xs font-semibold text-[#6B7A72]">
          {labelEn} →
        </span>
      </div>

      {/* Draggable thumb handle */}
      <div
        className="absolute top-1 bottom-1 w-14 rounded-[16px] flex items-center justify-center text-white shadow-md transition-transform cursor-grab active:cursor-grabbing"
        style={{
          left: `${dragProgress * (containerRef.current ? containerRef.current.clientWidth - 64 : 260)}px`,
          backgroundColor: color,
        }}
      >
        {isConfirmed ? (
          <Check className="w-6 h-6 stroke-[3]" />
        ) : (
          <ChevronRight className="w-6 h-6 stroke-[3] animate-pulse" />
        )}
      </div>
    </div>
  );
};
