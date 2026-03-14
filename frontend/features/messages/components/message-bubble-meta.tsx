"use client";

import { formatMessageTime } from "../utils/format-message-time";
import { cn } from "@/lib/utils";

export interface MessageBubbleMetaProps {
  time: string;
  className?: string;
}

export function MessageBubbleMeta({ time, className }: MessageBubbleMetaProps) {
  return (
    <span
      className={cn("text-xs text-primary-muted shrink-0", className)}
      aria-hidden
    >
      {formatMessageTime(time)}
    </span>
  );
}
