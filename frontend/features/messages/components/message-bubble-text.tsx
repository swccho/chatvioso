"use client";

import { cn } from "@/lib/utils";

export interface MessageBubbleTextProps {
  children: React.ReactNode;
  isOwn?: boolean;
  className?: string;
}

function highlightMentions(body: string): React.ReactNode {
  const parts = body.split(/(@\d+)/g);
  return parts.map((part, i) =>
    /@\d+/.test(part) ? (
      <span key={i} className="bg-brand-soft text-primary-brand rounded px-0.5">
        {part}
      </span>
    ) : (
      part
    )
  );
}

export function MessageBubbleText({
  children,
  isOwn,
  className,
}: MessageBubbleTextProps) {
  const text =
    typeof children === "string" ? highlightMentions(children) : children;
  return (
    <p
      className={cn(
        "text-sm whitespace-pre-wrap break-words",
        isOwn ? "text-message-own-text" : "text-message-other-text",
        className
      )}
    >
      {text}
    </p>
  );
}
