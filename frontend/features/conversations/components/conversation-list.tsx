"use client";

import { useWorkspaceStore } from "@/stores/workspace-store";
import { useConversationStore } from "@/stores/conversation-store";
import { useConversations } from "@/hooks/use-conversations";
import { useCurrentUser } from "@/hooks/use-current-user";
import { LoadingState } from "@/components/ui/loading-state";
import { RetryBlock } from "@/components/shared";
import { ConversationListItem } from "./conversation-list-item";
import { ConversationEmptyState } from "./conversation-empty-state";
import { ConversationListSkeleton } from "./conversation-list-skeleton";

export function ConversationList() {
  const currentWorkspace = useWorkspaceStore((s) => s.currentWorkspace);
  const currentConversation = useConversationStore((s) => s.currentConversation);
  const { data: currentUser } = useCurrentUser();
  const { data: conversations, isLoading, isError, refetch } = useConversations(
    currentWorkspace?.id ?? null
  );

  if (!currentWorkspace) {
    return (
      <div className="px-3 py-2 text-sm text-primary-muted">
        Select a workspace
      </div>
    );
  }

  if (isLoading) {
    return <LoadingState message="Loading conversations…" />;
  }

  if (isError) {
    return (
      <RetryBlock
        message="Failed to load conversations."
        onRetry={() => refetch()}
        retryLabel="Try again"
      />
    );
  }

  if (!conversations?.length) {
    return <ConversationEmptyState />;
  }

  return (
    <div className="space-y-0.5" role="list">
      {conversations.map((conv) => (
        <ConversationListItem
          key={conv.id}
          conversation={conv}
          isActive={currentConversation?.id === conv.id}
          workspaceId={currentWorkspace.id}
          currentUserId={currentUser?.id ?? 0}
        />
      ))}
    </div>
  );
}
