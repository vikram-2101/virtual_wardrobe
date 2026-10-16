import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface IconBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

/**
 * Circular icon container used in feature highlights and onboarding steps.
 */
export const IconBadge: React.FC<IconBadgeProps> = ({
  icon,
  size = "md",
  className,
  ...props
}) => {
  const sizeStyles = {
    sm: "w-8 h-8 p-1.5",
    md: "w-11 h-11 p-2.5",
    lg: "w-14 h-14 p-3.5",
  };

  return (
    <div
      className={twMerge(
        clsx(
          "inline-flex items-center justify-center rounded-full bg-surface-subtle text-ink-primary border border-border-light/60 transition-transform duration-200 group-hover:scale-105",
          sizeStyles[size],
          className,
        ),
      )}
      {...props}
    >
      {icon}
    </div>
  );
};
