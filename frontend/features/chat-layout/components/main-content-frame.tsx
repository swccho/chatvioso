"use client";

import { cn } from "@/lib/utils";

export interface MainContentFrameProps {
  children: React.ReactNode;
  className?: string;
}

export function MainContentFrame({ children, className }: MainContentFrameProps) {
  return (
    <main
      className={cn(
        "flex-1 min-w-0 flex flex-col overflow-hidden bg-surface border-r border-border-muted",
        className
      )}
      aria-label="Main content"
    >
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {children}
      </div>
    </main>
  );
}
