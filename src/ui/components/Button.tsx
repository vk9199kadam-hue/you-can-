import * as React from "react";
import { cn } from "../cn";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger";
type Size = "sm" | "md" | "lg";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
};

const variantClass: Record<Variant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-dark disabled:bg-primary/60",
  secondary:
    "bg-secondary text-white hover:bg-[#059669] disabled:bg-secondary/60",
  outline:
    "bg-surface text-text border border-border hover:bg-bg disabled:opacity-60",
  ghost:
    "bg-transparent text-text-dim hover:text-primary hover:bg-bg disabled:opacity-60",
  danger: "bg-error text-white hover:bg-[#DC2626] disabled:bg-error/60",
};

const sizeClass: Record<Size, string> = {
  sm: "h-9 px-3 text-sm rounded-lg",
  md: "h-10 px-4 text-sm rounded-lg",
  lg: "h-11 px-5 text-[15px] rounded-xl",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  leftIcon,
  rightIcon,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-semibold transition focus:outline-none focus:ring-2 focus:ring-primary-light/20 disabled:cursor-not-allowed",
        variantClass[variant],
        sizeClass[size],
        className,
      )}
    >
      {leftIcon ? <span className="text-[18px] leading-none">{leftIcon}</span> : null}
      <span>{children}</span>
      {rightIcon ? <span className="text-[18px] leading-none">{rightIcon}</span> : null}
    </button>
  );
}

