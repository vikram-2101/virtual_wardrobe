import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Sparkles } from "lucide-react";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "ai" | "subtle" | "outline" | "default";
  icon?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Standardized pill badge component.
 * Features the signature "✨ AI POWERED VIRTUAL WARDROBE" golden glowing badge.
 */
export const Badge: React.FC<BadgeProps> = ({
  variant = "default",
  icon,
  children,
  className,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center rounded-full text-xs font-semibold tracking-wider uppercase transition-colors";

  const variantStyles = {
    ai: "bg-[#FFF9EE] border border-[#F3E2B8] text-[#8C6B1C] px-3.5 py-1.5 gap-2 shadow-[0_2px_8px_rgba(243,226,184,0.3)]",
    subtle: "bg-surface-subtle text-ink-secondary px-3 py-1 gap-1.5",
    outline:
      "bg-white border border-border-light text-ink-primary px-3 py-1 gap-1.5",
    default: "bg-surface text-ink-primary px-3 py-1 gap-1.5 shadow-sm",
  };

  return (
    <div
      className={twMerge(clsx(baseStyles, variantStyles[variant], className))}
      {...props}
    >
      {variant === "ai" && !icon && (
        <Sparkles className="w-3.5 h-3.5 text-[#C4972A] fill-[#F6D878]" />
      )}
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
    </div>
  );
};
