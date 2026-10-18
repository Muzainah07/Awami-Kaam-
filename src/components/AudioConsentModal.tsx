import React from 'react';
import { ShieldCheck, Mic, Lock, CheckCircle2 } from 'lucide-react';

interface AudioConsentModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export const AudioConsentModal: React.FC<AudioConsentModalProps> = ({
  isOpen,
  onAccept,
  onDecline,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 text-center">
        <div className="w-16 h-16 rounded-full bg-[#0B6B3A]/10 text-[#0B6B3A] flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-9 h-9" />
        </div>

        <h3 className="text-2xl font-bold text-gray-900 mb-2 font-urdu">
          آواز کی ریکارڈنگ کی اجازت
        </h3>
        <p className="text-sm font-semibold text-[#0B6B3A] mb-3">
          Voice Privacy & Consent (محفوظ اور نجی)
        </p>

        <div className="text-right text-gray-600 text-sm leading-relaxed mb-4 bg-gray-50 p-3.5 rounded-2xl border border-gray-200/60 font-urdu">
          آپ کی آواز صرف آپ کا کام اور علاقہ سمجھنے کے لیے گوگل جیمینائی (Gemini AI) کو بھیجی جائے گی۔ آپ کا فون نمبر نوکری قبول ہونے تک خفیہ رہے گا۔
        </div>

        <div className="text-left text-gray-500 text-xs leading-relaxed mb-6 space-y-1.5 border-t border-gray-100 pt-3">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Audio is processed securely via multimodal AI to match daily-wage work.</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Worker phone numbers remain masked until an offer is accepted.</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onDecline}
            className="py-3.5 px-4 rounded-2xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 active:scale-95 transition-all text-sm"
          >
            نہیں / Cancel
          </button>
          <button
            onClick={onAccept}
            className="py-3.5 px-4 rounded-2xl bg-[#0B6B3A] text-white font-bold hover:bg-[#09572e] active:scale-95 transition-all shadow-md shadow-[#0B6B3A]/25 flex items-center justify-center gap-2 text-sm"
          >
            <Mic className="w-4 h-4" />
            <span>میں راضی ہوں / Accept</span>
          </button>
        </div>
      </div>
    </div>
  );
};
