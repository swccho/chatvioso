"use client";

import { cn } from "@/lib/utils";

export interface ComposerContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function ComposerContainer({ children, className }: ComposerContainerProps) {
  return (
    <div
      className={cn(
        "shrink-0 border-t border-border-muted bg-composer px-3 py-3 sm:px-4",
        className
      )}
    >
      {children}
    </div>
  );
}
