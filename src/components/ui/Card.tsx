import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hoverable = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-[20px] p-5 border border-[#E4E8E2] shadow-[0_2px_8px_rgba(20,32,26,0.04)] transition-all duration-200 ${
        hoverable ? 'cursor-pointer hover:border-[#0B6B3A]/40 hover:shadow-md active:scale-[0.99]' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
