"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { useWorkspaceMembers } from "@/hooks/use-workspace-members";
import { useWorkspacePresence } from "@/hooks/use-workspace-presence";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useCreateDirectConversation } from "@/hooks/use-conversations";
import {
  ContactsPageHeader,
  ContactsSearch,
  ContactList,
  ContactsEmptyState,
  ContactListSkeleton,
} from "@/features/contacts/components";
import { CreateDirectMessageDialog } from "@/components/create-direct-message-dialog";
import { RetryBlock, NoResultsState } from "@/components/shared";
import type { WorkspaceMember } from "@/types/api";

export default function ContactsPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = Number(params.id);
  const { data: workspaces } = useWorkspaces();
  const { data: currentUser } = useCurrentUser();
  const currentUserId = currentUser?.id ?? 0;
  const { data: members, isLoading, isError, refetch } = useWorkspaceMembers(workspaceId);
  const presentUsers = useWorkspacePresence(workspaceId);
  const createDirect = useCreateDirectConversation(workspaceId);
  const [searchQuery, setSearchQuery] = useState("");
  const [dmDialogOpen, setDmDialogOpen] = useState(false);

  const workspace = workspaces?.find((w) => w.id === workspaceId);

  const presentUserIds = useMemo(
    () => new Set(presentUsers.map((u) => u.id)),
    [presentUsers]
  );

  const otherMembers = useMemo(() => {
    if (!members) return [];
    return members.filter((m) => m.user_id !== currentUserId);
  }, [members, currentUserId]);

  const filteredMembers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return otherMembers;
    return otherMembers.filter(
      (m) =>
        m.user.name?.toLowerCase().includes(q) ||
        m.user.email?.toLowerCase().includes(q)
    );
  }, [otherMembers, searchQuery]);

  const handleStartChat = (member: WorkspaceMember) => {
    createDirect.mutate(member.user_id, {
      onSuccess: (data) => {
        router.push(`/app/workspaces/${workspaceId}/conversations/${data.id}`);
      },
    });
  };

  const startingUserId = createDirect.isPending && typeof createDirect.variables === "number"
    ? createDirect.variables
    : null;

  if (!workspace) {
    return (
      <div className="p-6">
        <p className="text-sm text-primary-muted">Workspace not found.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-surface min-h-0 overflow-hidden">
        <ContactsPageHeader title="Contacts" />
        <div className="px-4 pt-2 pb-4 border-b border-border-muted shrink-0">
          <ContactsSearch value="" onChange={() => {}} disabled />
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto p-4">
          <ContactListSkeleton count={6} />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col h-full bg-surface min-h-0 overflow-hidden">
        <ContactsPageHeader title="Contacts" />
        <div className="flex-1 min-h-0 overflow-y-auto p-4 flex items-center justify-center">
          <RetryBlock
            message="Failed to load contacts."
            onRetry={() => refetch()}
            retryLabel="Try again"
          />
        </div>
      </div>
    );
  }

  const hasSearch = searchQuery.trim().length > 0;
  const showNoResults = hasSearch && filteredMembers.length === 0;
  const showEmpty = !hasSearch && otherMembers.length === 0;

  return (
    <div className="flex flex-col h-full bg-surface min-h-0 overflow-hidden">
      <ContactsPageHeader
        title="Contacts"
        actionLabel="New DM"
        onAction={() => setDmDialogOpen(true)}
      />
      <div className="px-4 pt-2 pb-4 border-b border-border-muted shrink-0">
        <ContactsSearch
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search contacts…"
        />
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-2">
        {showEmpty && <ContactsEmptyState />}
        {showNoResults && (
          <NoResultsState
            message="No contacts match your search."
            onClearSearch={() => setSearchQuery("")}
            clearLabel="Clear search"
          />
        )}
        {!showEmpty && !showNoResults && (
          <ContactList
            members={filteredMembers}
            onStartChat={handleStartChat}
            startingUserId={startingUserId}
            presentUserIds={presentUserIds}
            className="space-y-2"
          />
        )}
      </div>
      <CreateDirectMessageDialog
        open={dmDialogOpen}
        onOpenChange={setDmDialogOpen}
        workspaceId={workspaceId}
      />
    </div>
  );
}
