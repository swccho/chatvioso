"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkspaceMembers } from "@/hooks/use-workspace-members";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useCreateDirectConversation } from "@/hooks/use-conversations";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import { cn } from "@/lib/utils";

interface CreateDirectMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: number | null;
}

export function CreateDirectMessageDialog({
  open,
  onOpenChange,
  workspaceId,
}: CreateDirectMessageDialogProps) {
  const router = useRouter();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const { data: currentUser } = useCurrentUser();
  const { data: members, isLoading } = useWorkspaceMembers(workspaceId);
  const createDirect = useCreateDirectConversation(workspaceId);

  const currentUserId = currentUser?.id ?? 0;
  const otherMembers = members?.filter((m) => m.user_id !== currentUserId) ?? [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;
    createDirect.mutate(selectedUserId, {
      onSuccess: (data) => {
        onOpenChange(false);
        setSelectedUserId(null);
        if (workspaceId != null) {
          router.push(`/app/workspaces/${workspaceId}/conversations/${data.id}`);
        }
      },
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
        aria-hidden
      />
      <div className="relative z-10 w-full max-w-md rounded-lg border border-border-muted bg-surface p-6 shadow-overlay">
        <h2 className="text-lg font-semibold text-primary">New direct message</h2>
        <p className="text-sm text-primary-muted mt-1">Choose a workspace member to message.</p>
        {isLoading ? (
          <LoadingState message="Loading members…" />
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-2">
            {otherMembers.length === 0 ? (
              <p className="text-sm text-primary-muted">No other members in this workspace.</p>
            ) : (
              <ul className="max-h-60 overflow-y-auto space-y-1">
                {otherMembers.map((m) => (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedUserId(m.user_id)}
                      className={cn(
                        "w-full rounded-md px-3 py-2 text-left text-sm transition-colors text-primary",
                        selectedUserId === m.user_id
                          ? "bg-surface-muted font-medium"
                          : "hover:bg-surface-muted"
                      )}
                    >
                      {m.user.name}
                      <span className="text-primary-muted text-xs block">{m.user.email}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {createDirect.error && (
              <p className="text-sm text-state-danger">
                {createDirect.error instanceof Error
                  ? createDirect.error.message
                  : "Failed to start conversation"}
              </p>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!selectedUserId || createDirect.isPending}
              >
                {createDirect.isPending ? "Starting…" : "Start conversation"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
