"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ContactsPageHeaderProps {
  title?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function ContactsPageHeader({
  title = "Contacts",
  actionLabel = "New DM",
  onAction,
  className,
}: ContactsPageHeaderProps) {
  return (
    <header
      className={cn(
        "flex items-center justify-between gap-2 border-b border-border-muted bg-surface px-4 py-3 shrink-0",
        className
      )}
    >
      <h1 className="text-lg font-semibold text-primary">{title}</h1>
      {onAction && (
        <Button
          variant="outline"
          size="sm"
          onClick={onAction}
          aria-label={actionLabel}
        >
          {actionLabel}
        </Button>
      )}
    </header>
  );
}
