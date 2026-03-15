"use client";

import { Avatar } from "@/components/ui/avatar";
import { UserPresenceIndicator } from "@/components/shared/user-presence-indicator";
import { getConversationDisplayName } from "../utils/get-display-name";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/types/api";

export interface ConversationListItemAvatarProps {
  conversation: Conversation;
  currentUserId: number;
  size?: "sm" | "md";
  /** For DMs: show presence dot when true. */
  online?: boolean;
}

export function ConversationListItemAvatar({
  conversation,
  currentUserId,
  size = "sm",
  online,
}: ConversationListItemAvatarProps) {
  const name = getConversationDisplayName(conversation, currentUserId);
  const avatarUrl =
    conversation.type === "direct" && conversation.members?.length
      ? conversation.members.find((m) => m.user_id !== currentUserId)?.user?.avatar_url
      : null;
  const showPresence = conversation.type === "direct" && online !== undefined;

  return (
    <div className="relative shrink-0">
      <Avatar src={avatarUrl ?? undefined} name={name} size={size} className="shrink-0" />
      {showPresence && (
        <span
          className={cn(
            "absolute bottom-0 right-0 ring-2 ring-panel rounded-full"
          )}
          aria-hidden
        >
          <UserPresenceIndicator online={online} size="sm" />
        </span>
      )}
    </div>
  );
}
