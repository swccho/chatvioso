"use client";

import { cn } from "@/lib/utils";

export interface ConversationSectionHeaderProps {
  icon?: React.ReactNode;
  label: string;
  count?: number;
  action?: React.ReactNode;
  className?: string;
}

/**
 * Lightweight section heading for DMs, Channels, Groups.
 */
export function ConversationSectionHeader({
  icon,
  label,
  count,
  action,
  className,
}: ConversationSectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 px-3 py-1.5 text-xs font-medium text-primary-muted uppercase tracking-wider",
        className
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {icon && <span className="shrink-0 [&_svg]:size-3.5">{icon}</span>}
        <span className="truncate">{label}</span>
        {count !== undefined && count > 0 && (
          <span className="shrink-0 text-primary-muted">({count})</span>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
