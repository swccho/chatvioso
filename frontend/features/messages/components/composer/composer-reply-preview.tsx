"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Message } from "@/types/api";

export interface ComposerReplyPreviewProps {
  replyTo: Message;
  onClear: () => void;
  className?: string;
}

export function ComposerReplyPreview({
  replyTo,
  onClear,
  className,
}: ComposerReplyPreviewProps) {
  return (
    <div
      className={cn(
        "mb-2 flex items-center justify-between gap-2 rounded-md bg-surface-muted px-3 py-2 text-sm",
        className
      )}
    >
      <span className="text-primary-secondary truncate">
        Replying to {replyTo.user?.name ?? "message"}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="text-primary-muted shrink-0"
        onClick={onClear}
        aria-label="Cancel reply"
      >
        Cancel
      </Button>
    </div>
  );
}
