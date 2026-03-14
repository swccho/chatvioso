"use client";

import { cn } from "@/lib/utils";
import type { Conversation } from "@/types/api";

export interface ChatDetailsOverviewProps {
  conversation: Conversation;
  className?: string;
}

function formatCreatedDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: d.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
    });
  } catch {
    return "";
  }
}

export function ChatDetailsOverview({
  conversation,
  className,
}: ChatDetailsOverviewProps) {
  const memberCount = conversation.members?.length ?? 0;
  const typeLabel =
    conversation.type === "direct"
      ? "Direct message"
      : conversation.type === "group"
        ? "Group"
        : "Channel";
  const createdFormatted =
    conversation.created_at && conversation.created_at !== ""
      ? formatCreatedDate(conversation.created_at)
      : null;

  return (
    <div
      className={cn(
        "px-4 py-3 border-b border-border-muted bg-surface-muted/50",
        className
      )}
      aria-label="Conversation overview"
    >
      <dl className="space-y-1.5 text-xs">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <dt className="text-primary-muted shrink-0">Type</dt>
          <dd className="text-primary">{typeLabel}</dd>
        </div>
        {memberCount > 0 && (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <dt className="text-primary-muted shrink-0">Members</dt>
            <dd className="text-primary">
              {memberCount} {memberCount === 1 ? "member" : "members"}
            </dd>
          </div>
        )}
        {createdFormatted && (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <dt className="text-primary-muted shrink-0">Started</dt>
            <dd className="text-primary">{createdFormatted}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}
