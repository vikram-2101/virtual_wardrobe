import React from "react";
import { Sparkles, SlidersHorizontal, Plus } from "lucide-react";
import { StylistMode } from "../types";

export interface StylistModeTabsProps {
  activeMode: StylistMode;
  onModeChange: (mode: StylistMode) => void;
}

export const StylistModeTabs: React.FC<StylistModeTabsProps> = ({
  activeMode,
  onModeChange,
}) => {
  const modes: {
    id: StylistMode;
    label: string;
    description: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: "occasion",
      label: "By Occasion",
      description: "Auto-styled AI looks",
      icon: <Sparkles className="w-4 h-4 text-accent-gold" />,
    },
    {
      id: "controlled",
      label: "Build Your Own",
      description: "Select categories",
      icon: <SlidersHorizontal className="w-4 h-4 text-ink-primary" />,
    },
    {
      id: "manual",
      label: "Manual Build",
      description: "Pick specific items",
      icon: <Plus className="w-4 h-4 text-ink-primary" />,
    },
  ];

  return (
    <div className="flex items-center gap-2.5 sm:gap-3">
      {modes.map((mode) => {
        const isActive = activeMode === mode.id;

        return (
          <button
            key={mode.id}
            type="button"
            onClick={() => onModeChange(mode.id)}
            className={`flex items-center gap-3 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl border transition-all text-left focus:outline-none cursor-pointer ${
              isActive
                ? "bg-[#F4ECE1] border-ink-primary text-ink-primary shadow-sm ring-1 ring-ink-primary/20 scale-[1.02]"
                : "bg-white border-border-light hover:border-border-subtle hover:bg-surface-subtle/70 text-ink-secondary hover:text-ink-primary shadow-2xs hover:shadow-xs"
            }`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                isActive
                  ? "bg-white shadow-xs text-ink-primary"
                  : "bg-surface-subtle text-ink-secondary"
              }`}
            >
              {mode.icon}
            </div>

            <div className="flex flex-col">
              <span className="text-xs sm:text-[13px] font-bold text-ink-primary leading-snug">
                {mode.label}
              </span>
              <span className="text-[10px] text-ink-muted leading-tight hidden md:inline">
                {mode.description}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
