"use client";

import { ChatDetailsHeader } from "./chat-details-header";
import { ChatDetailsOverview } from "./chat-details-overview";
import { ChatDetailsSection } from "./chat-details-section";
import { MembersPreviewList } from "./members-preview-list";
import { SharedFilesPanel } from "@/components/shared-files-panel";
import { PinnedMessagesPanel } from "@/components/pinned-messages-panel";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/types/api";

export interface ChatDetailsPanelProps {
  conversation: Conversation;
  workspaceId: number;
  currentUserId: number;
  className?: string;
}

export function ChatDetailsPanel({
  conversation,
  workspaceId,
  currentUserId,
  className,
}: ChatDetailsPanelProps) {
  return (
    <div
      className={cn(
        "flex flex-col h-full min-h-0 bg-panel border-l-0 border-border-panel overflow-hidden text-primary-inverse",
        className
      )}
      aria-label="Conversation details"
    >
      <ChatDetailsHeader
        conversation={conversation}
        currentUserId={currentUserId}
      />
      <ChatDetailsOverview conversation={conversation} />
      <div className="flex-1 overflow-y-auto min-h-0">
        {conversation.members && conversation.members.length > 0 && (
          <ChatDetailsSection title="Members">
            <MembersPreviewList members={conversation.members} />
          </ChatDetailsSection>
        )}
        <ChatDetailsSection title="Shared files">
          <SharedFilesPanel workspaceId={workspaceId} conversationId={conversation.id} showTitle={false} />
        </ChatDetailsSection>
        <ChatDetailsSection title="Pinned messages">
          <PinnedMessagesPanel workspaceId={workspaceId} conversationId={conversation.id} showTitle={false} />
        </ChatDetailsSection>
      </div>
    </div>
  );
}
