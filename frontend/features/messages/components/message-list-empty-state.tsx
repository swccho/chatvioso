"use client";

import { EmptyState } from "@/components/shared/empty-state";
import { MessageCircle } from "lucide-react";

export interface MessageListEmptyStateProps {
  title?: string;
  description?: string;
}

export function MessageListEmptyState({
  title = "No messages yet",
  description = "Send a message to start the conversation.",
}: MessageListEmptyStateProps) {
  return (
    <EmptyState
      title={title}
      description={description}
      icon={<MessageCircle />}
    />
  );
}
