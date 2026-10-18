import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'md' | 'lg'; // md: 56px, lg: 64px
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'lg',
  loading = false,
  fullWidth = true,
  disabled = false,
  icon,
  children,
  className = '',
  ...props
}) => {
  const heightClass = size === 'lg' ? 'h-16 text-lg' : 'h-14 text-base';

  const variantClasses = {
    primary:
      'bg-[#0B6B3A] text-white hover:bg-[#084D2A] active:scale-[0.98] shadow-sm disabled:bg-[#0B6B3A]/40 disabled:pointer-events-none',
    secondary:
      'bg-white text-[#14201A] border border-[#E4E8E2] hover:bg-gray-50 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none',
    ghost:
      'bg-transparent text-[#14201A] hover:bg-black/5 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none',
    danger:
      'bg-[#D64545] text-white hover:bg-[#b83535] active:scale-[0.98] disabled:bg-[#D64545]/40 disabled:pointer-events-none',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`relative inline-flex items-center justify-center font-bold rounded-[16px] transition-all duration-200 select-none ${
        fullWidth ? 'w-full' : 'px-6'
      } ${heightClass} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>برائے مہربانی انتظار کریں...</span>
        </div>
      ) : (
        <span className="flex items-center justify-center gap-2.5">
          {icon && <span className="shrink-0">{icon}</span>}
          <span>{children}</span>
        </span>
      )}
    </button>
  );
};
