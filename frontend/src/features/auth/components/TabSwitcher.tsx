import React from "react";
import { clsx } from "clsx";

export type AuthMode = "login" | "signup";

export interface TabSwitcherProps {
  activeMode: AuthMode;
  onChange: (mode: AuthMode) => void;
}

/**
 * Segmented Pill Tab Switcher: "Sign In" ⟷ "Sign Up".
 */
export const TabSwitcher: React.FC<TabSwitcherProps> = ({
  activeMode,
  onChange,
}) => {
  return (
    <div className="w-full bg-surface-subtle/80 p-1.5 rounded-2xl flex items-center border border-border-light/60 select-none">
      <button
        type="button"
        onClick={() => onChange("login")}
        className={clsx(
          "flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 focus:outline-none",
          activeMode === "login"
            ? "bg-accent-dark text-white shadow-sm"
            : "text-ink-secondary hover:text-ink-primary hover:bg-white/40",
        )}
      >
        Sign In
      </button>

      <button
        type="button"
        onClick={() => onChange("signup")}
        className={clsx(
          "flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 focus:outline-none",
          activeMode === "signup"
            ? "bg-accent-dark text-white shadow-sm"
            : "text-ink-secondary hover:text-ink-primary hover:bg-white/40",
        )}
      >
        Sign Up
      </button>
    </div>
  );
};
