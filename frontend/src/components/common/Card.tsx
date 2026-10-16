import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "floating" | "polaroid";
  children: React.ReactNode;
}

/**
 * Clean card surface component matching the Warm Editorial style.
 */
export const Card: React.FC<CardProps> = ({
  variant = "default",
  children,
  className,
  ...props
}) => {
  const baseStyles =
    "bg-white border border-border-light rounded-3xl transition-all duration-300";

  const variantStyles = {
    default: "shadow-sm",
    elevated: "shadow-card",
    floating: "shadow-floating hover:shadow-2xl hover:-translate-y-0.5",
    polaroid:
      "shadow-polaroid p-3 bg-white border-2 border-white/90 rounded-2xl",
  };

  return (
    <div
      className={twMerge(clsx(baseStyles, variantStyles[variant], className))}
      {...props}
    >
      {children}
    </div>
  );
};
