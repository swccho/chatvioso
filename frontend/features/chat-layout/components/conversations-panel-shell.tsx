"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageSquare, Users, Hash, X } from "lucide-react";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useConversationStore } from "@/stores/conversation-store";
import { useConversations } from "@/hooks/use-conversations";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useWorkspacePresence } from "@/hooks/use-workspace-presence";
import { RetryBlock, NoResultsState } from "@/components/shared";
import { ConversationListItem } from "@/features/conversations/components/conversation-list-item";
import { ConversationEmptyState } from "@/features/conversations/components/conversation-empty-state";
import { ConversationListSkeleton } from "@/features/conversations/components/conversation-list-skeleton";
import { ConversationPanelHeader } from "@/features/conversations/components/conversation-panel-header";
import { ConversationPanelActions } from "@/features/conversations/components/conversation-panel-actions";
import { ConversationSearch } from "@/features/conversations/components/conversation-search";
import { ConversationListSection } from "@/features/conversations/components/conversation-list-section";
import { Drawer } from "@/components/ui/drawer";
import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/types/api";

export interface ConversationsPanelShellProps {
  onNewDM?: () => void;
  onNewGroup?: () => void;
  onNewChannel?: () => void;
  className?: string;
}

export function ConversationsPanelShell({
  onNewDM,
  onNewGroup,
  onNewChannel,
  className,
}: ConversationsPanelShellProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const currentWorkspace = useWorkspaceStore((s) => s.currentWorkspace);
  const currentConversation = useConversationStore((s) => s.currentConversation);
  const { data: currentUser } = useCurrentUser();
  const { data: conversations, isLoading, isError, refetch } = useConversations(
    currentWorkspace?.id ?? null
  );
  const presentUsers = useWorkspacePresence(currentWorkspace?.id ?? null);
  const presentUserIds = new Set(presentUsers.map((u) => u.id));

  const filterByQuery = (list: Conversation[]) => {
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (c) =>
        (c.name?.toLowerCase().includes(q) ?? false) ||
        c.members?.some((m) => m.user?.name?.toLowerCase().includes(q))
    );
  };

  const filtered = filterByQuery(conversations ?? []);
  const direct = filtered.filter((c) => c.type === "direct");
  const channels = filtered.filter((c) => c.type === "channel");
  const groups = filtered.filter((c) => c.type === "group");
  const hasAny = direct.length > 0 || channels.length > 0 || groups.length > 0;
  const hasSearchQuery = searchQuery.trim().length > 0;
  const noSearchResults = hasSearchQuery && filtered.length === 0;

  const panelContent = (
    <>
      <ConversationPanelHeader
        title={currentWorkspace?.name ?? "Chatvioso"}
        actions={
          <ConversationPanelActions
            onNewDM={onNewDM}
            onNewGroup={onNewGroup}
            onNewChannel={onNewChannel}
          />
        }
        className="border-border-panel"
      />

      {currentWorkspace && (
        <div className="shrink-0 space-y-1.5 px-3 py-2 border-b border-border-panel">
          <ConversationSearch
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search conversations…"
          />
          <Link
            href={`/app/workspaces/${currentWorkspace.id}/search`}
            className="text-xs text-panel-muted hover:text-primary-inverse focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-panel rounded"
            aria-label="Search workspace"
          >
            Search workspace
          </Link>
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto">
        {!currentWorkspace ? (
          <div className="px-3 py-4 text-sm text-panel-muted">
            Select a workspace
          </div>
        ) : isLoading ? (
          <div className="px-0">
            <ConversationListSkeleton withSections />
          </div>
        ) : isError ? (
          <div className="px-3 py-4">
            <RetryBlock
              message="Failed to load conversations."
              onRetry={() => refetch()}
              retryLabel="Try again"
              variant="panel"
            />
          </div>
        ) : noSearchResults ? (
          <div className="px-3 py-4">
            <NoResultsState
              message="No conversations match your search."
              onClearSearch={() => setSearchQuery("")}
              clearLabel="Clear search"
              variant="panel"
            />
          </div>
        ) : !hasAny ? (
          <div className="px-3 py-4">
            <ConversationEmptyState />
          </div>
        ) : (
          <div className="space-y-6 py-3">
            <ConversationListSection
              title="Direct messages"
              icon={<MessageSquare className="size-3.5" />}
              count={direct.length}
              ariaLabel="Direct messages"
              empty={
                <p className="px-3 py-2 text-xs text-panel-muted">
                  No direct messages
                </p>
              }
            >
              {direct.map((conv) => {
                const otherUserId =
                  conv.type === "direct" && conv.members?.length
                    ? conv.members.find((m) => m.user_id !== (currentUser?.id ?? 0))?.user_id
                    : undefined;
                return (
                  <ConversationListItem
                    key={conv.id}
                    conversation={conv}
                    isActive={currentConversation?.id === conv.id}
                    workspaceId={currentWorkspace!.id}
                    currentUserId={currentUser?.id ?? 0}
                    online={
                      otherUserId !== undefined
                        ? presentUserIds.has(otherUserId)
                        : undefined
                    }
                  />
                );
              })}
            </ConversationListSection>
            <ConversationListSection
              title="Channels"
              icon={<Hash className="size-3.5" />}
              count={channels.length}
              ariaLabel="Channels"
              empty={
                <p className="px-3 py-2 text-xs text-panel-muted">
                  No channels
                </p>
              }
            >
              {channels.map((conv) => (
                <ConversationListItem
                  key={conv.id}
                  conversation={conv}
                  isActive={currentConversation?.id === conv.id}
                  workspaceId={currentWorkspace!.id}
                  currentUserId={currentUser?.id ?? 0}
                />
              ))}
            </ConversationListSection>
            <ConversationListSection
              title="Groups"
              icon={<Users className="size-3.5" />}
              count={groups.length}
              ariaLabel="Groups"
              empty={
                <p className="px-3 py-2 text-xs text-panel-muted">
                  No groups
                </p>
              }
            >
              {groups.map((conv) => (
                <ConversationListItem
                  key={conv.id}
                  conversation={conv}
                  isActive={currentConversation?.id === conv.id}
                  workspaceId={currentWorkspace!.id}
                  currentUserId={currentUser?.id ?? 0}
                />
              ))}
            </ConversationListSection>
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      <aside
        className={cn(
          "flex w-[300px] shrink-0 flex-col border-r border-border-panel bg-panel overflow-hidden text-primary-inverse",
          "hidden md:flex",
          className
        )}
        aria-label="Conversations"
      >
        {panelContent}
      </aside>

      <div className="md:hidden shrink-0 flex items-center justify-center border-r border-border-panel bg-panel w-14 py-2 min-h-[44px] text-primary-inverse">
        <IconButton
          icon={<MessageSquare className="size-5" />}
          aria-label="Open conversations"
          variant="ghost"
          size="md"
          onClick={() => setMobileOpen(true)}
        />
      </div>

      <Drawer open={mobileOpen} onOpenChange={setMobileOpen} side="left">
        <div className="flex flex-col h-full w-full min-w-0 max-w-[300px] bg-panel text-primary-inverse">
          <div className="shrink-0 flex items-center justify-between border-b border-border-panel px-3 py-2">
            <span className="text-sm font-medium text-primary-inverse">Conversations</span>
            <IconButton
              icon={<X className="size-5" />}
              aria-label="Close"
              variant="ghost"
              size="sm"
              onClick={() => setMobileOpen(false)}
            />
          </div>
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            {panelContent}
          </div>
        </div>
      </Drawer>
    </>
  );
}
