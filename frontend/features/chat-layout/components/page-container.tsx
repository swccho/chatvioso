"use client";

import { cn } from "@/lib/utils";

export interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Wrapper for secondary app pages (profile, settings, contacts, etc.)
 * so they render with consistent padding and max-width inside the main content region.
 */
export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div
      className={cn(
        "flex flex-col flex-1 min-h-0 overflow-y-auto",
        "px-4 py-6 md:px-6 md:py-8 max-w-4xl",
        className
      )}
    >
      {children}
    </div>
  );
}
