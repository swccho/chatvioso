"use client";

import { AppLogo } from "@/components/shared/app-logo";
import { cn } from "@/lib/utils";

export interface AppSidebarHeaderProps {
  actions?: React.ReactNode;
  className?: string;
}

export function AppSidebarHeader({ actions, className }: AppSidebarHeaderProps) {
  return (
    <div
      className={cn(
        "shrink-0 flex items-center justify-between gap-2 p-3 border-b border-border-muted",
        className
      )}
    >
      <AppLogo href="/app" />
      {actions}
    </div>
  );
}
