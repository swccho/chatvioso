"use client";

import { cn } from "@/lib/utils";

export interface SettingsLayoutProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Layout wrapper for secondary pages (settings, members, invitations, profile).
 * Provides consistent max-width, padding, and scroll behavior inside the main content frame.
 */
export function SettingsLayout({ children, className }: SettingsLayoutProps) {
  return (
    <div
      className={cn(
        "flex flex-col h-full min-h-0 overflow-y-auto w-full",
        "p-4 sm:p-6 max-w-2xl mx-auto",
        "bg-surface",
        className
      )}
    >
      {children}
    </div>
  );
}
