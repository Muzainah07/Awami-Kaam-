import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'success',
  onClose,
}) => {
  const typeStyles = {
    success: 'bg-[#0B6B3A] text-white',
    error: 'bg-[#D64545] text-white',
    info: 'bg-[#14201A] text-white',
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 shrink-0" />,
    info: <Info className="w-5 h-5 shrink-0" />,
  };

  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 max-w-sm w-full mx-4 animate-in slide-in-from-top duration-200 ${typeStyles[type]}`}
    >
      {icons[type]}
      <span className="text-sm font-semibold flex-1 leading-tight">{message}</span>
      {onClose && (
        <button onClick={onClose} className="p-1 opacity-70 hover:opacity-100">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
