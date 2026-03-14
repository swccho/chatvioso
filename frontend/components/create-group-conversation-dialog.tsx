"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkspaceMembers } from "@/hooks/use-workspace-members";
import { useCreateGroupConversation } from "@/hooks/use-conversations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface CreateGroupConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: number | null;
}

export function CreateGroupConversationDialog({
  open,
  onOpenChange,
  workspaceId,
}: CreateGroupConversationDialogProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const { data: members } = useWorkspaceMembers(workspaceId);
  const createGroup = useCreateGroupConversation(workspaceId);

  const toggleMember = (userId: number) => {
    setSelectedIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createGroup.mutate(
      { name, memberIds: selectedIds },
      {
        onSuccess: (data) => {
          setName("");
          setSelectedIds([]);
          onOpenChange(false);
          if (workspaceId != null) {
            router.push(`/app/workspaces/${workspaceId}/conversations/${data.id}`);
          }
        },
      }
    );
  };

  if (!open) return null;

  const otherMembers = members ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
        aria-hidden
      />
      <div className="relative z-10 w-full max-w-md rounded-lg border border-border-muted bg-surface p-6 shadow-overlay">
        <h2 className="text-lg font-semibold text-primary">New group conversation</h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="group-name">Group name</Label>
            <Input
              id="group-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Team Alpha"
              required
              disabled={createGroup.isPending}
            />
          </div>
          <div className="space-y-2">
            <Label>Add members</Label>
            <ul className="max-h-40 overflow-y-auto space-y-1">
              {otherMembers.map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => toggleMember(m.user_id)}
                    className={cn(
                      "w-full rounded-md px-3 py-2 text-left text-sm transition-colors text-primary",
                      selectedIds.includes(m.user_id) ? "bg-surface-muted font-medium" : "hover:bg-surface-muted"
                    )}
                  >
                    {m.user.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          {createGroup.error && (
            <p className="text-sm text-state-danger">
              {createGroup.error instanceof Error
                ? createGroup.error.message
                : "Failed to create group"}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createGroup.isPending}>
              {createGroup.isPending ? "Creating…" : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
