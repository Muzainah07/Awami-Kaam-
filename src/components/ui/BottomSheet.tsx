import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  titleUr?: string;
  children: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  titleUr,
  children,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-xs transition-opacity duration-200">
      {/* Backdrop tap to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Sheet Content */}
      <div className="relative w-full max-w-lg bg-white rounded-t-[28px] p-6 shadow-2xl border-t border-[#E4E8E2] max-h-[88dvh] overflow-y-auto animate-in slide-in-from-bottom duration-200 z-10">
        {/* Drag handle pill */}
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-4" />

        {/* Header */}
        {(title || titleUr) && (
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E4E8E2]">
            <div>
              {titleUr && <h3 className="text-xl font-bold font-urdu text-[#14201A]">{titleUr}</h3>}
              {title && <p className="text-sm font-semibold text-[#6B7A72]">{title}</p>}
            </div>
            <button
              onClick={onClose}
              className="p-2 text-[#6B7A72] hover:text-[#14201A] rounded-full hover:bg-gray-100 active:scale-95 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {children}
      </div>
    </div>
  );
};
