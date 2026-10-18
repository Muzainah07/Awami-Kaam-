import React from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  onlineLabelUr?: string;
  onlineLabelEn?: string;
  offlineLabelUr?: string;
  offlineLabelEn?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  onlineLabelUr = 'آپ دستیاب ہیں',
  onlineLabelEn = 'You are online & available',
  offlineLabelUr = 'آپ آف لائن ہیں',
  offlineLabelEn = 'You are currently offline',
}) => {
  return (
    <div
      onClick={() => onChange(!checked)}
      className={`w-full max-w-sm mx-auto p-3.5 rounded-full border cursor-pointer select-none transition-all duration-200 flex items-center justify-between ${
        checked
          ? 'bg-[#1F9D55]/10 border-[#1F9D55]/30'
          : 'bg-gray-100 border-[#E4E8E2]'
      }`}
    >
      <div className="flex items-center gap-3 px-2">
        <span
          className={`w-3.5 h-3.5 rounded-full transition-colors ${
            checked ? 'bg-[#0B6B3A] animate-ping' : 'bg-[#6B7A72]'
          }`}
        />
        <div className="text-left">
          <div className="font-urdu text-base font-bold leading-tight text-[#14201A]">
            {checked ? onlineLabelUr : offlineLabelUr}
          </div>
          <div className="text-xs font-semibold text-[#6B7A72]">
            {checked ? onlineLabelEn : offlineLabelEn}
          </div>
        </div>
      </div>

      {/* Pill Switch knob */}
      <div
        className={`w-14 h-8 rounded-full p-1 transition-colors duration-200 flex items-center ${
          checked ? 'bg-[#0B6B3A] justify-end' : 'bg-gray-300 justify-start'
        }`}
      >
        <div className="w-6 h-6 rounded-full bg-white shadow-md transition-transform" />
      </div>
    </div>
  );
};
