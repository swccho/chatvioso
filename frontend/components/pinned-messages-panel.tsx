"use client";

import Link from "next/link";
import { InlineLoader } from "@/components/shared/inline-loader";
import { EmptyState } from "@/components/shared/empty-state";
import { RetryBlock } from "@/components/shared/retry-block";
import { usePinnedMessages } from "@/hooks/use-messages";
import { formatMessageTime } from "@/features/messages/utils/format-message-time";
import { cn } from "@/lib/utils";
import type { Message } from "@/types/api";

export function PinnedMessagesPanel({
  workspaceId,
  conversationId,
  showTitle = true,
}: {
  workspaceId: number;
  conversationId: number;
  showTitle?: boolean;
}) {
  const { data: pinned, isLoading, isError, refetch } = usePinnedMessages(
    workspaceId,
    conversationId
  );
  const messages: Message[] = pinned ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <InlineLoader aria-label="Loading pinned messages" />
      </div>
    );
  }

  if (isError) {
    return (
      <RetryBlock
        message="Couldn’t load pinned messages."
        onRetry={() => refetch()}
        retryLabel="Try again"
        className="py-4"
      />
    );
  }

  if (messages.length === 0) {
    return (
      <div className="py-4">
        <EmptyState
          title="No pinned messages"
          description="Pin important messages to find them here."
          className="py-6"
          variant="panel"
        />
      </div>
    );
  }

  return (
    <ul className={cn("space-y-2", showTitle ? "mt-0" : "")} role="list">
      {messages.map((msg) => (
        <li key={msg.id}>
          <Link
            href={`/app/workspaces/${workspaceId}/conversations/${conversationId}`}
            className={cn(
              "block rounded-md border border-border-panel bg-panel-selected/80 px-3 py-2",
              "text-sm text-primary-inverse line-clamp-2 break-words",
              "hover:bg-panel-selected focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-panel"
            )}
          >
            <span className="block text-xs text-panel-muted mb-0.5">
              {msg.user?.name ?? "Unknown"} · {formatMessageTime(msg.created_at)}
            </span>
            <span className="line-clamp-2">{msg.body}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
