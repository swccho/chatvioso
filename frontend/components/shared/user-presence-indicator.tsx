"use client";

import { cn } from "@/lib/utils";

export interface UserPresenceIndicatorProps {
  /** Online state */
  online?: boolean;
  size?: "sm" | "md";
  className?: string;
  "aria-label"?: string;
}

const sizeClasses = {
  sm: "size-2",
  md: "size-2.5",
} as const;

export function UserPresenceIndicator({
  online = true,
  size = "md",
  className,
  "aria-label": ariaLabel,
}: UserPresenceIndicatorProps) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-full",
        sizeClasses[size],
        online ? "bg-state-success" : "bg-primary-muted",
        className
      )}
      aria-label={ariaLabel ?? (online ? "Online" : "Offline")}
      role="status"
    />
  );
}
