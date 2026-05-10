import * as React from "react";
import { cn } from "../cn";

export type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: "surface" | "muted";
};

export function Card({ className, variant = "surface", ...props }: CardProps) {
  return (
    <div
      {...props}
      className={cn(
        "rounded-xl border border-border shadow-sm",
        variant === "surface" ? "bg-surface" : "bg-bg",
        className,
      )}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cn("px-6 pt-6", className)} />;
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn("font-bold text-text brand text-base", className)}
    />
  );
}

export function CardBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cn("px-6 pb-6", className)} />;
}

