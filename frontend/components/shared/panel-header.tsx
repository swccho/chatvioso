"use client";

import { cn } from "@/lib/utils";

export interface PanelHeaderProps {
  title?: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PanelHeader({ title, children, actions, className }: PanelHeaderProps) {
  return (
    <div
      className={cn(
        "shrink-0 flex items-center justify-between gap-2 border-b border-border-muted bg-surface px-4 py-3",
        className
      )}
    >
      {title && <h2 className="text-sm font-medium text-primary truncate">{title}</h2>}
      {children && !title && <div className="flex-1 min-w-0">{children}</div>}
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  );
}
