"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface NoDataStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  icon?: React.ReactNode;
}

/**
 * Generic "no data" state with optional CTA.
 * Use for empty lists or missing content (e.g. no items yet).
 */
export function NoDataState({
  title,
  description,
  actionLabel,
  onAction,
  className,
  icon,
}: NoDataStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-10 text-center",
        className
      )}
    >
      {icon && <div className="mb-2 text-primary-muted [&_svg]:size-8">{icon}</div>}
      <p className="font-medium text-primary text-sm">{title}</p>
      {description && (
        <p className="mt-1 text-xs text-primary-secondary max-w-xs">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" className="mt-3" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
