"use client";

import { cn } from "@/lib/utils";

export interface ResponsivePanelContainerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Wraps the full app shell layout (sidebar + main + optional right).
 * Ensures correct height and flex behavior across breakpoints.
 * Breakpoints: sidebar visible at md (768px), right details panel at lg (1024px).
 */
export function ResponsivePanelContainer({
  children,
  className,
}: ResponsivePanelContainerProps) {
  return (
    <div
      className={cn(
        "flex flex-row h-screen w-full bg-app overflow-hidden",
        className
      )}
      data-responsive-shell
    >
      {children}
    </div>
  );
}
