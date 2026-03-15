"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface NoResultsStateProps {
  message?: string;
  onClearSearch?: () => void;
  clearLabel?: string;
  className?: string;
  variant?: "default" | "panel";
}

/**
 * "No search/list results" state with optional clear or search-again action.
 */
export function NoResultsState({
  message = "No results found.",
  onClearSearch,
  clearLabel = "Clear search",
  className,
  variant = "default",
}: NoResultsStateProps) {
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
      {onClearSearch && (
        <Button variant="ghost" size="sm" onClick={onClearSearch}>
          {clearLabel}
        </Button>
      )}
    </div>
  );
}
