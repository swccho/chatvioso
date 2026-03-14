"use client";

import { cn } from "@/lib/utils";

export interface SettingsCardProps {
  children: React.ReactNode;
  className?: string;
}

export function SettingsCard({ children, className }: SettingsCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border-muted bg-surface p-4 sm:p-5",
        className
      )}
    >
      {children}
    </div>
  );
}
