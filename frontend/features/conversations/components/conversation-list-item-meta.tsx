"use client";

import { formatConversationListTime } from "../utils/format-list-time";
import { UnreadBadge } from "@/components/shared/unread-badge";
import type { Conversation } from "@/types/api";

export interface ConversationListItemMetaProps {
  conversation: Conversation;
}

export function ConversationListItemMeta({ conversation }: ConversationListItemMetaProps) {
  const time = conversation.last_message_at ?? conversation.updated_at;
  const unreadCount = conversation.unread_count ?? 0;
  return (
    <div className="shrink-0 flex items-center gap-1.5">
      <span className="text-xs text-primary-muted">
        {formatConversationListTime(time)}
      </span>
      {unreadCount > 0 && (
        <UnreadBadge count={unreadCount} aria-label={`${unreadCount} unread`} />
      )}
    </div>
  );
}
