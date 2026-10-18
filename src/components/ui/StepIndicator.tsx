import React from 'react';

interface StepIndicatorProps {
  totalSteps: number;
  currentStep: number; // 1-indexed
  labels?: string[];
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  totalSteps,
  currentStep,
  labels,
}) => {
  return (
    <div className="w-full max-w-xs mx-auto py-3">
      {/* Step bars */}
      <div className="flex items-center gap-2">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNumber = index + 1;
          const isCompleted = currentStep > stepNumber;
          const isActive = currentStep === stepNumber;

          return (
            <div
              key={index}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                isCompleted
                  ? 'bg-[#0B6B3A]'
                  : isActive
                  ? 'bg-[#0B6B3A] ring-2 ring-[#0B6B3A]/20'
                  : 'bg-[#E4E8E2]'
              }`}
            />
          );
        })}
      </div>

      {labels && labels[currentStep - 1] && (
        <div className="text-center mt-2">
          <span className="text-xs font-bold text-[#6B7A72]">
            Step {currentStep} of {totalSteps}: {labels[currentStep - 1]}
          </span>
        </div>
      )}
    </div>
  );
};
