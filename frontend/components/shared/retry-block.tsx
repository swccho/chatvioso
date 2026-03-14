"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface RetryBlockProps {
  message: string;
  onRetry: () => void;
  retryLabel?: string;
  className?: string;
}

export function RetryBlock({
  message,
  onRetry,
  retryLabel = "Try again",
  className,
}: RetryBlockProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-8 text-center",
        className
      )}
    >
      <p className="text-sm text-primary-secondary max-w-sm">{message}</p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        {retryLabel}
      </Button>
    </div>
  );
}
