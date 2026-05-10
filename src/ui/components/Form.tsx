import * as React from "react";
import { cn } from "../cn";

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      {...props}
      className={cn("block text-[13px] font-semibold text-text mb-1.5", className)}
    />
  );
}

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full px-3.5 py-2.5 border border-border rounded-lg text-sm text-text bg-surface outline-none focus:border-primary-light focus:ring-2 focus:ring-primary-light/10 transition placeholder:text-[#9CA3AF]",
        className,
      )}
    />
  );
}

export function Select({
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "w-full px-3.5 py-2.5 border border-border rounded-lg text-sm text-text bg-surface outline-none focus:border-primary-light focus:ring-2 focus:ring-primary-light/10 transition",
        className,
      )}
    />
  );
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full px-3.5 py-2.5 border border-border rounded-lg text-sm text-text bg-surface outline-none focus:border-primary-light focus:ring-2 focus:ring-primary-light/10 transition placeholder:text-[#9CA3AF]",
        className,
      )}
    />
  );
}

