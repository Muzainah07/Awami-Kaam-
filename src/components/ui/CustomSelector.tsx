import React, { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface CustomSelectorProps {
  label: string;
  value: string;
  options: { label: string; value: string; icon?: string }[];
  onChange: (value: string) => void;
  placeholder?: string;
}

export const CustomSelector: React.FC<CustomSelectorProps> = ({
  label,
  value,
  options,
  onChange,
  placeholder = 'Select option...',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find(o => o.value === value);

  return (
    <div className="relative">
      <label className="block text-xs font-bold text-[#6B7A72] uppercase tracking-wider mb-2">
        {label}
      </label>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-14 px-4 rounded-2xl bg-white border border-[#E4E8E2] text-left flex items-center justify-between text-base font-bold text-[#14201A] hover:bg-gray-50 focus:outline-hidden focus:border-[#0B6B3A] focus:ring-2 focus:ring-[#0B6B3A]/20 transition-all cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          {selectedOption?.icon && <span className="text-xl">{selectedOption.icon}</span>}
          <span>{selectedOption ? selectedOption.label : placeholder}</span>
        </div>
        <ChevronDown className={`w-5 h-5 text-[#6B7A72] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#E4E8E2] rounded-2xl shadow-xl z-50 max-h-60 overflow-y-auto p-2 space-y-1 animate-in fade-in zoom-in-95">
          {options.map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-3 rounded-xl text-left flex items-center justify-between text-sm font-bold transition-all ${
                value === option.value
                  ? 'bg-[#0B6B3A]/10 text-[#0B6B3A]'
                  : 'text-[#14201A] hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {option.icon && <span className="text-lg">{option.icon}</span>}
                <span>{option.label}</span>
              </div>
              {value === option.value && <Check className="w-4 h-4 text-[#0B6B3A]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
