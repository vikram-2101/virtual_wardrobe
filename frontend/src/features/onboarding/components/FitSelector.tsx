import React from "react";
import { FitType } from "../types";

export interface FitOption {
  id: FitType;
  label: string;
  subtext: string;
}

const FIT_OPTIONS: FitOption[] = [
  { id: "slim", label: "Slim", subtext: "Fitted to body" },
  { id: "regular", label: "Regular", subtext: "Standard fit" },
  { id: "relaxed", label: "Relaxed", subtext: "A bit loose" },
  { id: "oversized", label: "Oversized", subtext: "Very loose" },
];

/**
 * T-shirt SVG icons adjusted for different fits.
 */
const FitShirtIcon: React.FC<{ fit: FitType; isSelected: boolean }> = ({
  fit,
  isSelected,
}) => {
  const strokeColor = isSelected ? "#14171A" : "#5F6774";

  if (fit === "slim") {
    return (
      <svg
        className="w-7 h-7 transition-transform duration-200 group-hover:scale-105"
        viewBox="0 0 24 24"
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M8 3.5 C9.5 5 14.5 5 16 3.5 L20 6.5 L17.5 10.5 L15.5 9.5 L15 21 L9 21 L8.5 9.5 L6.5 10.5 L4 6.5 Z" />
      </svg>
    );
  }

  if (fit === "relaxed") {
    return (
      <svg
        className="w-7 h-7 transition-transform duration-200 group-hover:scale-105"
        viewBox="0 0 24 24"
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M8 3.5 C9.5 5 14.5 5 16 3.5 L21.5 6.5 L18.5 11 L16.5 9.8 L16.5 21 L7.5 21 L7.5 9.8 L5.5 11 L2.5 6.5 Z" />
      </svg>
    );
  }

  if (fit === "oversized") {
    return (
      <svg
        className="w-7 h-7 transition-transform duration-200 group-hover:scale-105"
        viewBox="0 0 24 24"
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M7.5 3.5 C9.5 5.5 14.5 5.5 16.5 3.5 L23 7 L19 12 L17.5 10.5 L18 21 L6 21 L6.5 10.5 L5 12 L1 7 Z" />
      </svg>
    );
  }

  // Regular fit default
  return (
    <svg
      className="w-7 h-7 transition-transform duration-200 group-hover:scale-105"
      viewBox="0 0 24 24"
      fill="none"
      stroke={strokeColor}
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 3.5 C9.5 5 14.5 5 16 3.5 L21 6.5 L18 10.5 L16 9.5 L16 21 L8 21 L8 9.5 L6 10.5 L3 6.5 Z" />
    </svg>
  );
};

export interface FitSelectorProps {
  value: FitType;
  onChange: (fit: FitType) => void;
}

export const FitSelector: React.FC<FitSelectorProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 w-full">
      {FIT_OPTIONS.map((option) => {
        const isSelected = value === option.id;

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`group flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl border transition-all duration-200 text-center select-none focus:outline-none focus:ring-2 focus:ring-ink-primary/10 ${
              isSelected
                ? "border-ink-primary bg-[#F5EFEA] shadow-sm ring-1 ring-ink-primary"
                : "border-border-light bg-white hover:border-border-subtle hover:bg-surface-subtle/50"
            }`}
          >
            {/* T-Shirt Icon */}
            <div className="mb-2 flex items-center justify-center h-8">
              <FitShirtIcon fit={option.id} isSelected={isSelected} />
            </div>

            {/* Label */}
            <span
              className={`text-xs sm:text-sm font-semibold tracking-tight transition-colors ${
                isSelected ? "text-ink-primary" : "text-ink-primary/90"
              }`}
            >
              {option.label}
            </span>

            {/* Subtitle */}
            <span className="text-[11px] text-ink-secondary mt-0.5 leading-tight font-normal">
              {option.subtext}
            </span>
          </button>
        );
      })}
    </div>
  );
};
