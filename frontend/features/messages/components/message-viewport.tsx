"use client";

import { cn } from "@/lib/utils";

export interface MessageViewportProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Full-height scrollable viewport for the message list. Provides stable
 * scroll behavior and consistent padding for chat content.
 */
export function MessageViewport({ children, className }: MessageViewportProps) {
  return (
    <div
      className={cn(
        "flex-1 min-h-0 overflow-y-auto overflow-x-hidden flex flex-col bg-chat",
        className
      )}
      role="log"
      aria-label="Message list"
    >
      {children}
    </div>
  );
}
