"use client";

import { useState } from "react";
import { useCreateWorkspace } from "@/hooks/use-workspaces";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CreateWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function CreateWorkspaceDialog({
  open,
  onOpenChange,
  trigger,
}: CreateWorkspaceDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const createWorkspace = useCreateWorkspace();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createWorkspace.mutate(
      { name, description: description || undefined },
      {
        onSuccess: () => {
          setName("");
          setDescription("");
          onOpenChange(false);
        },
      }
    );
  };

  if (!open) {
    return trigger ? <>{trigger}</> : null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
        aria-hidden
      />
      <div
        className="relative z-10 w-full max-w-md rounded-lg border border-border-muted bg-surface p-6 shadow-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-workspace-title"
      >
        <h2 id="create-workspace-title" className="text-lg font-semibold text-primary">
          Create workspace
        </h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="workspace-name">Name</Label>
            <Input
              id="workspace-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My workspace"
              required
              disabled={createWorkspace.isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="workspace-desc">Description (optional)</Label>
            <Input
              id="workspace-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this workspace for?"
              disabled={createWorkspace.isPending}
            />
          </div>
          {createWorkspace.error && (
            <p className="text-sm text-state-danger" role="alert">
              {createWorkspace.error instanceof Error
                ? createWorkspace.error.message
                : "Something went wrong"}
            </p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createWorkspace.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createWorkspace.isPending}>
              {createWorkspace.isPending ? "Creating…" : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
