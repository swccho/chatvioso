"use client";

import { MessageCircle, PlusCircle } from "lucide-react";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { useShellActions } from "@/lib/shell-actions-context";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export default function AppPage() {
  const currentWorkspace = useWorkspaceStore((s) => s.currentWorkspace);
  const actions = useShellActions();

  if (currentWorkspace) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8">
        <div className="w-full max-w-md rounded-xl border border-border-muted bg-surface shadow-soft px-8 py-10 text-center">
          <EmptyState
            title="Choose a conversation"
            description="Select one from the list or start a new direct message, group, or channel."
            icon={<MessageCircle />}
            className="max-w-md py-0"
          />
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {actions?.openNewDM && (
              <Button
                variant="primary"
                size="sm"
                onClick={actions.openNewDM}
                className="gap-1.5"
              >
                <MessageCircle className="size-4" />
                New DM
              </Button>
            )}
            {actions?.openNewGroup && (
              <Button
                variant="outline"
                size="sm"
                onClick={actions.openNewGroup}
                className="gap-1.5"
              >
                New group
              </Button>
            )}
            {actions?.openNewChannel && (
              <Button
                variant="outline"
                size="sm"
                onClick={actions.openNewChannel}
                className="gap-1.5"
              >
                New channel
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-8">
      <EmptyState
        title="Create your first workspace"
        description="Workspaces help you organize teams and conversations. Create one to get started."
        actionLabel="Create workspace"
        onAction={actions?.openNewWorkspace}
        icon={<PlusCircle />}
        className="max-w-md"
      />
    </div>
  );
}
