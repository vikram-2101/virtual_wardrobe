import React, { useState } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Eye, EyeOff } from "lucide-react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

/**
 * Reusable Input Component with Icon Prefix, Password Visibility Toggle, and Error State.
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, helperText, icon, type = "text", className, id, ...props },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;
    const inputId =
      id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full flex flex-col gap-1 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs sm:text-xs font-semibold text-ink-primary font-sans"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {/* Left Icon */}
          {icon && (
            <div className="absolute left-3.5 text-ink-muted pointer-events-none flex items-center justify-center">
              {icon}
            </div>
          )}

          {/* Text Input */}
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            className={twMerge(
              clsx(
                "w-full bg-white text-ink-primary text-xs sm:text-sm rounded-xl border transition-all duration-200 placeholder:text-ink-muted/70 focus:outline-none focus:ring-2 focus:ring-ink-primary/10",
                icon ? "pl-9 sm:pl-10" : "pl-3.5",
                isPassword ? "pr-10" : "pr-3.5",
                "py-2 sm:py-2.5",
                error
                  ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                  : "border-border-light focus:border-ink-primary hover:border-border-subtle",
                className,
              ),
            )}
            {...props}
          />

          {/* Password Eye Toggle */}
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              tabIndex={-1}
              className="absolute right-3.5 text-ink-muted hover:text-ink-primary transition-colors focus:outline-none p-1 rounded-md"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {/* Validation Error / Helper Text */}
        {error ? (
          <p className="text-xs text-red-500 font-medium mt-0.5">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-ink-muted mt-0.5">{helperText}</p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";
