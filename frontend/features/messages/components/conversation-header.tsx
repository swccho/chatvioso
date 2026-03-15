"use client";

import { Info } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { IconButton } from "@/components/ui/icon-button";
import { UserPresenceIndicator } from "@/components/shared/user-presence-indicator";
import { getConversationDisplayName } from "@/features/conversations/components";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/types/api";
import type { PresentUser } from "@/hooks/use-workspace-presence";

export interface ConversationHeaderProps {
  conversation: Conversation | null;
  currentUserId: number;
  presentUsers?: PresentUser[];
  typingNames?: string[];
  onOpenDetails?: () => void;
  className?: string;
}

function memberCount(conversation: Conversation): number {
  return conversation.members?.length ?? 0;
}

export function ConversationHeader({
  conversation,
  currentUserId,
  presentUsers = [],
  typingNames = [],
  onOpenDetails,
  className,
}: ConversationHeaderProps) {
  if (!conversation) {
    return (
      <header
        className={cn(
          "h-12 shrink-0 border-b border-border-default px-4 flex items-center bg-chat",
          className
        )}
        aria-label="Conversation"
      >
        <span className="text-sm text-primary-muted">Select a conversation</span>
      </header>
    );
  }

  const displayName = getConversationDisplayName(conversation, currentUserId);
  const avatarUrl =
    conversation.type === "direct" && conversation.members?.length
      ? conversation.members.find((m) => m.user_id !== currentUserId)?.user?.avatar_url
      : null;
  const count = memberCount(conversation);
  const otherUserId =
    conversation.type === "direct" && conversation.members?.length
      ? conversation.members.find((m) => m.user_id !== currentUserId)?.user_id
      : undefined;
  const isOtherOnline =
    otherUserId !== undefined && presentUsers.some((p) => p.id === otherUserId);
  const subtitle =
    conversation.type === "direct"
      ? isOtherOnline
        ? "Online"
        : null
      : `${count} member${count === 1 ? "" : "s"}`;
  const subtitleIsOnline = conversation.type === "direct" && isOtherOnline;

  return (
    <header
      className={cn(
        "h-12 shrink-0 border-b border-border-default px-4 flex items-center gap-3 bg-chat",
        className
      )}
      aria-label={`Conversation: ${displayName}`}
    >
      <Avatar
        src={avatarUrl ?? undefined}
        name={displayName}
        size="sm"
        className="shrink-0"
      />
      <div className="min-w-0 flex-1 py-2">
        <h1 className="text-sm font-semibold text-primary truncate">
          {displayName}
        </h1>
        <div className="flex items-center gap-2 min-w-0">
          {subtitle && (
            <span className={cn(
              "text-xs truncate",
              subtitleIsOnline ? "text-online" : "text-primary-muted"
            )}>
              {subtitle}
            </span>
          )}
          {presentUsers.length > 0 && conversation.type !== "direct" && (
            <span className="flex items-center gap-1 shrink-0 text-online" title="Online">
              <UserPresenceIndicator online size="sm" />
              <span className="text-xs">
                {presentUsers.length} online
              </span>
            </span>
          )}
          {typingNames.length > 0 && (
            <span className="text-xs text-primary-muted truncate">
              {typingNames.length === 1
                ? `${typingNames[0]} is typing…`
                : typingNames.length === 2
                  ? `${typingNames[0]} and ${typingNames[1]} are typing…`
                  : `${typingNames[0]} and ${typingNames.length - 1} others are typing…`}
            </span>
          )}
        </div>
      </div>
      {onOpenDetails && (
        <IconButton
          icon={<Info className="size-4" />}
          aria-label="Conversation details"
          variant="ghost"
          size="sm"
          onClick={onOpenDetails}
        />
      )}
    </header>
  );
}
