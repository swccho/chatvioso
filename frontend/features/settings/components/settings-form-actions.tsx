"use client";

import { cn } from "@/lib/utils";

export interface SettingsFormActionsProps {
  children: React.ReactNode;
  className?: string;
}

export function SettingsFormActions({
  children,
  className,
}: SettingsFormActionsProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2 pt-2", className)}>
      {children}
    </div>
  );
}
