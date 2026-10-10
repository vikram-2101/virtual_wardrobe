import React from "react";
import { Check } from "lucide-react";
import { ONBOARDING_STEPS } from "../types";

export interface StepIndicatorProps {
  currentStep: number;
  onStepClick?: (stepId: number) => void;
  className?: string;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  onStepClick,
  className = "",
}) => {
  return (
    <div className={`w-full max-w-md ${className}`}>
      <div className="relative flex items-center justify-between">
        {/* Continuous background connection line */}
        <div className="absolute top-4 left-4 right-4 h-0.5 bg-border-light -z-0" />

        {ONBOARDING_STEPS.map((step) => {
          const isCompleted = step.id < currentStep;
          const isActive = step.id === currentStep;
          const isClickable = onStepClick && step.id <= currentStep;

          return (
            <div
              key={step.id}
              onClick={() => isClickable && onStepClick(step.id)}
              className={`flex flex-col items-center relative z-10 ${
                isClickable ? "cursor-pointer" : "cursor-default"
              }`}
            >
              {/* Step Circle */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  isActive
                    ? "bg-ink-primary text-white ring-4 ring-ink-primary/10 shadow-sm scale-105"
                    : isCompleted
                      ? "bg-ink-primary text-white"
                      : "bg-surface-subtle text-ink-muted border border-border-light"
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 stroke-[2.5]" />
                ) : (
                  <span>{step.id}</span>
                )}
              </div>

              {/* Step Label */}
              <span
                className={`mt-2 text-xs transition-colors duration-200 text-center select-none ${
                  isActive
                    ? "font-bold text-ink-primary"
                    : isCompleted
                      ? "font-medium text-ink-primary"
                      : "font-medium text-ink-muted"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
