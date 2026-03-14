"use client";

import { Avatar } from "@/components/ui/avatar";
import { getConversationDisplayName } from "@/features/conversations/components";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/types/api";

export interface ChatDetailsHeaderProps {
  conversation: Conversation;
  currentUserId: number;
  className?: string;
}

export function ChatDetailsHeader({
  conversation,
  currentUserId,
  className,
}: ChatDetailsHeaderProps) {
  const displayName = getConversationDisplayName(conversation, currentUserId);
  const avatarUrl =
    conversation.type === "direct" && conversation.members?.length
      ? conversation.members.find((m) => m.user_id !== currentUserId)?.user?.avatar_url
      : null;
  const memberCount = conversation.members?.length ?? 0;
  const subtitle =
    conversation.type === "direct"
      ? "Direct message"
      : `${conversation.type === "group" ? "Group" : "Channel"} · ${memberCount} member${memberCount === 1 ? "" : "s"}`;

  return (
    <header
      className={cn(
        "flex items-center gap-3 border-b border-border-muted bg-surface px-4 py-3 shrink-0",
        className
      )}
      aria-label="Conversation details"
    >
      <Avatar
        src={avatarUrl ?? undefined}
        name={displayName}
        size="md"
        className="shrink-0"
      />
      <div className="min-w-0 flex-1">
        <h2 className="text-sm font-semibold text-primary truncate">{displayName}</h2>
        <p className="text-xs text-primary-muted truncate mt-0.5">{subtitle}</p>
      </div>
    </header>
  );
}
