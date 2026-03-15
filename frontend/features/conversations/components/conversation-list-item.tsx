"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/types/api";
import { getConversationDisplayName } from "../utils/get-display-name";
import { ConversationListItemAvatar } from "./conversation-list-item-avatar";
import { ConversationListItemContent } from "./conversation-list-item-content";
import { ConversationListItemMeta } from "./conversation-list-item-meta";

export interface ConversationListItemProps {
  conversation: Conversation;
  isActive: boolean;
  workspaceId: number;
  currentUserId: number;
  /** For DMs: whether the other user is online (presence). */
  online?: boolean;
}

export function ConversationListItem({
  conversation,
  isActive,
  workspaceId,
  currentUserId,
  online,
}: ConversationListItemProps) {
  const href = `/app/workspaces/${workspaceId}/conversations/${conversation.id}`;
  const displayName = getConversationDisplayName(conversation, currentUserId);

  return (
    <Link
      href={href}
      role="listitem"
      title={displayName}
      className={cn(
        "flex items-center gap-3 rounded-r-lg border-l-2 py-2.5 pl-3 pr-3 text-left transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-panel",
        isActive
          ? "border-l-[3px] border-transparent bg-panel-selected text-primary-inverse"
          : "border-transparent text-primary-inverse hover:bg-panel-selected"
      )}
    >
      <ConversationListItemAvatar
        conversation={conversation}
        currentUserId={currentUserId}
        online={conversation.type === "direct" ? online : undefined}
      />
      <div className="min-w-0 flex-1 flex flex-col gap-0.5">
        <div className="flex items-center justify-between gap-2">
          <ConversationListItemContent
            conversation={conversation}
            currentUserId={currentUserId}
          />
          <ConversationListItemMeta conversation={conversation} />
        </div>
      </div>
    </Link>
  );
}
