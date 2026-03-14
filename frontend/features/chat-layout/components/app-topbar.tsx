"use client";

import { cn } from "@/lib/utils";

export interface AppTopbarProps {
  title?: string;
  actions?: React.ReactNode;
  mobileMenuTrigger?: React.ReactNode;
  className?: string;
}

/**
 * Top-level header for the main app area (e.g. when not in a conversation).
 * For the conversation view, use ConversationHeader inside the active chat panel.
 */
export function AppTopbar({
  title,
  actions,
  mobileMenuTrigger,
  className,
}: AppTopbarProps) {
  return (
    <header
      className={cn(
        "shrink-0 flex items-center justify-between gap-2 border-b border-border-muted bg-surface px-4 py-3",
        className
      )}
    >
      {mobileMenuTrigger && <div className="md:hidden">{mobileMenuTrigger}</div>}
      {title && <h1 className="text-sm font-semibold text-primary truncate">{title}</h1>}
      <div className="flex-1 min-w-0" />
      {actions}
    </header>
  );
}
