"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateChannel } from "@/hooks/use-conversations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CreateChannelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: number | null;
}

export function CreateChannelDialog({
  open,
  onOpenChange,
  workspaceId,
}: CreateChannelDialogProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const createChannel = useCreateChannel(workspaceId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createChannel.mutate(
      { name, isPrivate },
      {
        onSuccess: (data) => {
          setName("");
          setIsPrivate(false);
          onOpenChange(false);
          if (workspaceId != null) {
            router.push(`/app/workspaces/${workspaceId}/conversations/${data.id}`);
          }
        },
      }
    );
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
        <h2 className="text-lg font-semibold text-primary">Create channel</h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="channel-name">Channel name</Label>
            <Input
              id="channel-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. general"
              required
              disabled={createChannel.isPending}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="channel-private"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              disabled={createChannel.isPending}
              className="rounded border-border-muted text-brand focus:ring-brand"
            />
            <Label htmlFor="channel-private" className="text-primary">Private channel</Label>
          </div>
          {createChannel.error && (
            <p className="text-sm text-state-danger">
              {createChannel.error instanceof Error
                ? createChannel.error.message
                : "Failed to create channel"}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createChannel.isPending}>
              {createChannel.isPending ? "Creating…" : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
