import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost" | "secondary";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  children: React.ReactNode;
}

/**
 * Standardized Pill Button adhering to the FitMe Warm Editorial design system.
 */
export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "right",
  children,
  className,
  ...props
}) => {
  // Base pill style with smooth transitions
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ink-primary disabled:opacity-50 disabled:cursor-not-allowed";

  // Size configurations
  const sizeStyles = {
    sm: "text-xs px-3.5 py-1.5 gap-1.5",
    md: "text-sm px-5 py-2.5 gap-2",
    lg: "text-base px-7 py-3.5 gap-2.5",
  };

  // Color & Surface variants
  const variantStyles = {
    primary:
      "bg-accent-dark text-white hover:bg-accent-hover shadow-sm active:scale-[0.98]",
    outline:
      "bg-white border border-border-light text-ink-primary hover:bg-surface-subtle hover:border-border-subtle shadow-sm active:scale-[0.98]",
    secondary:
      "bg-surface-subtle text-ink-primary hover:bg-surface-muted active:scale-[0.98]",
    ghost:
      "bg-transparent text-ink-secondary hover:text-ink-primary hover:bg-surface-subtle/70",
  };

  return (
    <button
      className={twMerge(
        clsx(baseStyles, sizeStyles[size], variantStyles[variant], className),
      )}
      {...props}
    >
      {icon && iconPosition === "left" && (
        <span className="inline-flex shrink-0">{icon}</span>
      )}
      <span>{children}</span>
      {icon && iconPosition === "right" && (
        <span className="inline-flex shrink-0">{icon}</span>
      )}
    </button>
  );
};
