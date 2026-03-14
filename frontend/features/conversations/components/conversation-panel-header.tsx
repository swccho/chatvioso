"use client";

import { cn } from "@/lib/utils";

export interface ConversationPanelHeaderProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Messaging-app style panel header: workspace/context title and compact actions.
 */
export function ConversationPanelHeader({
  title = "Conversations",
  subtitle,
  actions,
  children,
  className,
}: ConversationPanelHeaderProps) {
  return (
    <div
      className={cn(
        "shrink-0 flex items-center justify-between gap-2 border-b border-border-muted bg-surface-muted px-3 py-2.5",
        className
      )}
    >
      <div className="min-w-0 flex-1">
        <h2 className="truncate text-sm font-medium text-primary">{title}</h2>
        {subtitle && (
          <p className="truncate text-xs text-primary-muted">{subtitle}</p>
        )}
      </div>
      {actions && <div className="shrink-0 flex items-center gap-0.5">{actions}</div>}
      {children && !title && <div className="flex-1 min-w-0">{children}</div>}
    </div>
  );
}
