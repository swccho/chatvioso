"use client";

import { useEffect } from "react";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { cn } from "@/lib/utils";

export function WorkspaceSwitcher() {
  const { data: workspaces, isLoading } = useWorkspaces();
  const currentWorkspace = useWorkspaceStore((s) => s.currentWorkspace);
  const setCurrentWorkspace = useWorkspaceStore((s) => s.setCurrentWorkspace);

  useEffect(() => {
    if (workspaces?.length && !currentWorkspace) {
      setCurrentWorkspace(workspaces[0]);
    }
  }, [workspaces, currentWorkspace, setCurrentWorkspace]);

  if (isLoading) {
    return (
      <div className="px-3 py-2 text-sm text-primary-muted">Loading workspaces…</div>
    );
  }

  if (!workspaces?.length) {
    return (
      <div className="px-3 py-2 text-sm text-primary-muted">No workspaces yet</div>
    );
  }

  const current = currentWorkspace ?? workspaces[0];

  return (
    <div className="space-y-0.5">
      <div className="px-2 py-1.5 text-xs font-medium text-primary-muted uppercase tracking-wider">
        Workspaces
      </div>
      {workspaces.map((ws) => (
        <button
          key={ws.id}
          type="button"
          onClick={() => setCurrentWorkspace(ws)}
          className={cn(
            "w-full rounded-md px-3 py-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
            current?.id === ws.id
              ? "bg-surface-muted font-medium text-primary"
              : "text-primary-secondary hover:bg-surface-muted"
          )}
        >
          {ws.name}
        </button>
      ))}
    </div>
  );
}
