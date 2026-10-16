import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl" | "full";
  children: React.ReactNode;
}

/**
 * Responsive layout container wrapper.
 */
export const Container: React.FC<ContainerProps> = ({
  size = "xl",
  children,
  className,
  ...props
}) => {
  const sizeStyles = {
    sm: "max-w-3xl",
    md: "max-w-5xl",
    lg: "max-w-6xl",
    xl: "max-w-[1360px]",
    full: "max-w-full",
  };

  return (
    <div
      className={twMerge(
        clsx(
          "mx-auto px-4 sm:px-6 lg:px-10 w-full",
          sizeStyles[size],
          className,
        ),
      )}
      {...props}
    >
      {children}
    </div>
  );
};
