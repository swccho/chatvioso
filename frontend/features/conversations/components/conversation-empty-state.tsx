"use client";

import { EmptyState } from "@/components/shared/empty-state";
import { MessageCircle } from "lucide-react";

export interface ConversationEmptyStateProps {
  title?: string;
  description?: string;
}

export function ConversationEmptyState({
  title = "No conversations yet",
  description = "Use the New menu in the header to start a direct message, group, or channel.",
}: ConversationEmptyStateProps) {
  return (
    <EmptyState
      title={title}
      description={description}
      icon={<MessageCircle />}
    />
  );
}
