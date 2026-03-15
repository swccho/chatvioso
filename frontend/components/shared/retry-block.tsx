"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface RetryBlockProps {
  message: string;
  onRetry: () => void;
  retryLabel?: string;
  className?: string;
  variant?: "default" | "panel";
}

export function RetryBlock({
  message,
  onRetry,
  retryLabel = "Try again",
  className,
  variant = "default",
}: RetryBlockProps) {
  const isPanel = variant === "panel";
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-8 text-center",
        className
      )}
    >
      <p
        className={cn(
          "text-sm max-w-sm",
          isPanel ? "text-panel-muted" : "text-primary-secondary"
        )}
      >
        {message}
      </p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        {retryLabel}
      </Button>
    </div>
  );
}
