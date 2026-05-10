import * as React from "react";
import { cn } from "../cn";

type Tone = "info" | "success" | "warning" | "danger" | "neutral" | "premium";

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: Tone;
};

const toneClass: Record<Tone, string> = {
  info: "bg-[#EFF6FF] text-primary border border-[#DBEAFE]",
  success: "bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]",
  warning: "bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]",
  danger: "bg-[#FEF2F2] text-error border border-[#FCA5A5]",
  neutral: "bg-[#F3F4F6] text-text-dim border border-border",
  premium: "bg-[#F5F3FF] text-[#7C3AED] border border-[#DDD6FE]",
};

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      {...props}
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
        toneClass[tone],
        className,
      )}
    />
  );
}

