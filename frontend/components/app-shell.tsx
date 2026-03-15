"use client";

import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useConversationStore } from "@/stores/conversation-store";
import { useProfile } from "@/hooks/use-profile";
import { useCurrentUser } from "@/hooks/use-current-user";
import { ChatDetailsPanel } from "@/features/chat-details/components";
import { EmptyState } from "@/components/shared/empty-state";
import { ShellActionsProvider } from "@/lib/shell-actions-context";
import { MessageCircle } from "lucide-react";
import { logoutApi } from "@/lib/auth";
import {
  ResponsivePanelContainer,
  WorkspaceRail,
  ConversationsPanelShell,
  MainContentFrame,
  RightDetailPanelShell,
} from "@/features/chat-layout/components";
import { CreateWorkspaceDialog } from "@/components/create-workspace-dialog";
import { CreateDirectMessageDialog } from "@/components/create-direct-message-dialog";
import { CreateGroupConversationDialog } from "@/components/create-group-conversation-dialog";
import { CreateChannelDialog } from "@/components/create-channel-dialog";

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const currentWorkspace = useWorkspaceStore((s) => s.currentWorkspace);
  const currentConversation = useConversationStore((s) => s.currentConversation);
  const { data: profile } = useProfile();
  const { data: currentUser } = useCurrentUser();
  const currentUserId = currentUser?.id ?? 0;
  const [createOpen, setCreateOpen] = useState(false);
  const [dmOpen, setDmOpen] = useState(false);
  const [groupOpen, setGroupOpen] = useState(false);
  const [channelOpen, setChannelOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(true);

  const handleLogout = async () => {
    await logoutApi();
    router.replace("/login");
    router.refresh();
  };

  const shellActions = useMemo(
    () => ({
      openNewWorkspace: () => setCreateOpen(true),
      openNewDM: () => setDmOpen(true),
      openNewGroup: () => setGroupOpen(true),
      openNewChannel: () => setChannelOpen(true),
    }),
    []
  );

  return (
    <ShellActionsProvider actions={shellActions}>
    <ResponsivePanelContainer>
      <WorkspaceRail
        footerUser={profile ?? null}
        onLogout={handleLogout}
        onAddWorkspace={() => setCreateOpen(true)}
      />

      <ConversationsPanelShell
        onNewDM={() => setDmOpen(true)}
        onNewGroup={() => setGroupOpen(true)}
        onNewChannel={() => setChannelOpen(true)}
      />

      <MainContentFrame>
        <div className="flex-1 min-h-0 overflow-hidden">{children}</div>
      </MainContentFrame>

      <RightDetailPanelShell open={detailsOpen} onOpenChange={setDetailsOpen}>
        {currentWorkspace && currentConversation ? (
          <ChatDetailsPanel
            conversation={currentConversation}
            workspaceId={currentWorkspace.id}
            currentUserId={currentUserId}
          />
        ) : (
          <div className="flex flex-1 min-h-0 items-center justify-center p-4">
            <div className="w-full max-w-[260px] rounded-xl border border-border-panel bg-panel-selected px-6 py-8 text-center">
              <EmptyState
                title="Conversation details"
                description="Select a conversation to see details, members, files, and pinned messages here."
                icon={<MessageCircle className="size-8" />}
                className="py-0 max-w-[260px]"
                variant="panel"
              />
            </div>
          </div>
        )}
      </RightDetailPanelShell>

      <CreateWorkspaceDialog open={createOpen} onOpenChange={setCreateOpen} />
      <CreateDirectMessageDialog
        open={dmOpen}
        onOpenChange={setDmOpen}
        workspaceId={currentWorkspace?.id ?? null}
      />
      <CreateGroupConversationDialog
        open={groupOpen}
        onOpenChange={setGroupOpen}
        workspaceId={currentWorkspace?.id ?? null}
      />
      <CreateChannelDialog
        open={channelOpen}
        onOpenChange={setChannelOpen}
        workspaceId={currentWorkspace?.id ?? null}
      />
    </ResponsivePanelContainer>
    </ShellActionsProvider>
  );
}
