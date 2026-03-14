"use client";

import { MessageAttachments } from "@/components/message-attachments";
import type { Attachment } from "@/types/api";
import { cn } from "@/lib/utils";

export interface MessageBubbleAttachmentsProps {
  attachments: Attachment[];
  className?: string;
}

export function MessageBubbleAttachments({
  attachments,
  className,
}: MessageBubbleAttachmentsProps) {
  if (!attachments?.length) return null;
  return (
    <div className={cn("mt-2", className)}>
      <MessageAttachments attachments={attachments} />
    </div>
  );
}
