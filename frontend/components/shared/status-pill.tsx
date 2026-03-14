"use client";

import { cn } from "@/lib/utils";

export interface StatusPillProps {
  label: string;
  variant?: "default" | "success" | "warning" | "muted";
  className?: string;
}

const variantClasses = {
  default: "bg-brand-soft text-primary-brand",
  success: "bg-state-success/15 text-state-success",
  warning: "bg-state-warning/15 text-state-warning",
  muted: "bg-surface-muted text-primary-secondary",
} as const;

export function StatusPill({
  label,
  variant = "default",
  className,
}: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className
      )}
    >
      {label}
    </span>
  );
}
