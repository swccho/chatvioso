"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface UnreadBadgeProps {
  count: number;
  maxDisplay?: number;
  className?: string;
  "aria-label"?: string;
}

export function UnreadBadge({
  count,
  maxDisplay = 99,
  className,
  "aria-label": ariaLabel,
}: UnreadBadgeProps) {
  if (count <= 0) return null;
  const display = count > maxDisplay ? `${maxDisplay}+` : String(count);
  return (
    <Badge
      variant="primary"
      size="sm"
      className={cn("shrink-0", className)}
      aria-label={ariaLabel ?? `${count} unread`}
    >
      {display}
    </Badge>
  );
}
