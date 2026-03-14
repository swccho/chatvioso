"use client";

import { getConversationDisplayName } from "../utils/get-display-name";
import type { Conversation } from "@/types/api";

export interface ConversationListItemContentProps {
  conversation: Conversation;
  currentUserId: number;
}

export function ConversationListItemContent({
  conversation,
  currentUserId,
}: ConversationListItemContentProps) {
  const displayName = getConversationDisplayName(conversation, currentUserId);
  const preview = conversation.last_message_preview ?? null;
  return (
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-medium text-primary">{displayName}</p>
      {preview && (
        <p className="truncate text-xs text-primary-muted">{preview}</p>
      )}
    </div>
  );
}
