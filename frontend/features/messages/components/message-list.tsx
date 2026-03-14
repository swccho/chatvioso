"use client";

import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageViewport } from "./message-viewport";
import { MessageGroup } from "./message-group";
import { MessageBubble } from "./message-bubble";
import { DateSeparator } from "./date-separator";
import { MessageListEmptyState } from "./message-list-empty-state";
import { MessageListSkeleton } from "./message-list-skeleton";
import { RetryBlock } from "@/components/shared/retry-block";
import type { Message } from "@/types/api";

function getDateKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function buildGroups(
  messages: Message[],
  currentUserId: number
): Array<{ type: "date"; date: string } | { type: "group"; userId: number; messages: Message[] }> {
  const result: Array<
    { type: "date"; date: string } | { type: "group"; userId: number; messages: Message[] }
  > = [];
  let lastDate: string | null = null;
  let currentGroup: { userId: number; messages: Message[] } | null = null;

  for (const msg of messages) {
    const dateKey = getDateKey(msg.created_at);
    if (lastDate !== dateKey) {
      lastDate = dateKey;
      result.push({ type: "date", date: msg.created_at });
    }
    const userId = msg.user_id;
    if (currentGroup && currentGroup.userId === userId) {
      currentGroup.messages.push(msg);
    } else {
      if (currentGroup) result.push({ type: "group", ...currentGroup });
      currentGroup = { userId, messages: [msg] };
    }
  }
  if (currentGroup) result.push({ type: "group", ...currentGroup });
  return result;
}

export interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  currentUserId: number;
  workspaceId: number | null;
  conversationId: number | null;
  onReply: (message: Message) => void;
  onEdit: (message: Message, newBody: string) => void;
  onDelete: (message: Message) => void;
  onLoadOlder?: () => void;
  isLoadingOlder?: boolean;
  /** When set, show retry UI instead of messages (e.g. failed to load messages). */
  error?: boolean;
  onRetry?: () => void;
}

export function MessageList({
  messages,
  isLoading,
  currentUserId,
  workspaceId,
  conversationId,
  onReply,
  onEdit,
  onDelete,
  onLoadOlder,
  isLoadingOlder,
  error,
  onRetry,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (error && onRetry) {
    return (
      <MessageViewport>
        <div className="flex flex-1 min-h-[200px] items-center justify-center p-6">
          <RetryBlock
            message="Couldn’t load messages."
            onRetry={onRetry}
            retryLabel="Try again"
          />
        </div>
      </MessageViewport>
    );
  }

  if (isLoading && messages.length === 0) {
    return (
      <MessageViewport>
        <MessageListSkeleton />
      </MessageViewport>
    );
  }

  if (!messages.length) {
    return (
      <MessageViewport>
        <div className="flex flex-1 min-h-[200px] items-center justify-center p-6">
          <MessageListEmptyState />
        </div>
      </MessageViewport>
    );
  }

  const groups = buildGroups(messages, currentUserId);

  return (
    <MessageViewport>
      {onLoadOlder && (
        <div className="flex justify-center py-3 shrink-0 border-b border-border-muted">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onLoadOlder()}
            disabled={isLoadingOlder}
            aria-label={isLoadingOlder ? "Loading older messages" : "Load older messages"}
          >
            {isLoadingOlder ? "Loading…" : "Load older messages"}
          </Button>
        </div>
      )}
      <div className="flex flex-col px-3 py-4 space-y-4 max-w-3xl mx-auto w-full sm:px-4">
        {groups.map((item, idx) => {
          if (item.type === "date") {
            return <DateSeparator key={`date-${item.date}`} date={item.date} />;
          }
          const { userId, messages: groupMessages } = item;
          const isOwn = userId === currentUserId;
          const firstMessage = groupMessages[0];
          const senderName = firstMessage?.user?.name;
          const senderAvatarUrl = firstMessage?.user?.avatar_url;
          return (
            <MessageGroup
              key={`group-${idx}-${firstMessage?.id}`}
              messages={groupMessages}
              isOwn={isOwn}
              showAvatar={true}
              showSenderName={groupMessages.length > 0 && !isOwn}
              senderName={senderName}
              senderAvatarUrl={senderAvatarUrl}
            >
              {groupMessages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isOwn={msg.user_id === currentUserId}
                  workspaceId={workspaceId}
                  conversationId={conversationId}
                  onReply={onReply}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  showSenderName={msg.id === firstMessage?.id && !isOwn}
                  isFirstInGroup={msg.id === firstMessage?.id}
                />
              ))}
            </MessageGroup>
          );
        })}
        <div ref={bottomRef} className="min-h-4" aria-hidden />
      </div>
    </MessageViewport>
  );
}
