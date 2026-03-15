"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  icon?: React.ReactNode;
  /** Use "panel" when inside dark sidebar/panel for correct text colors */
  variant?: "default" | "panel";
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  className,
  icon,
  variant = "default",
}: EmptyStateProps) {
  const isPanel = variant === "panel";
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 text-center",
        className
      )}
    >
      {icon && (
        <div
          className={cn(
            "mb-3 [&_svg]:size-10",
            isPanel ? "text-panel-muted" : "text-primary-muted"
          )}
        >
          {icon}
        </div>
      )}
      <p
        className={cn(
          "font-medium",
          isPanel ? "text-primary-inverse" : "text-primary"
        )}
      >
        {title}
      </p>
      {description && (
        <p
          className={cn(
            "mt-1 text-sm max-w-sm",
            isPanel ? "text-panel-muted" : "text-primary-secondary"
          )}
        >
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button variant="primary" className="mt-4" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
