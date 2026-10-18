import React from 'react';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  titleUr?: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  titleUr,
  description,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center max-w-sm mx-auto">
      <div className="w-16 h-16 rounded-full bg-gray-100 text-[#6B7A72] flex items-center justify-center mb-4">
        {icon}
      </div>
      {titleUr && (
        <h3 className="text-xl font-bold font-urdu text-[#14201A] mb-1">
          {titleUr}
        </h3>
      )}
      <h4 className="text-base font-bold text-[#14201A] mb-2">{title}</h4>
      <p className="text-sm text-[#6B7A72] leading-relaxed mb-6">{description}</p>
      {action && <div className="w-full">{action}</div>}
    </div>
  );
};
