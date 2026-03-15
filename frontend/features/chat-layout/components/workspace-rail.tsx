"use client";

import { useEffect, useState } from "react";
import { MessageCircle, Menu, Plus } from "lucide-react";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { NotificationBell } from "@/components/notification-bell";
import { Dropdown, DropdownItem } from "@/components/ui/dropdown";
import { Drawer } from "@/components/ui/drawer";
import { IconButton } from "@/components/ui/icon-button";
import { WorkspaceRailItem } from "./workspace-rail-item";
import { WorkspaceRailFooter } from "./workspace-rail-footer";
import { cn } from "@/lib/utils";

function getWorkspaceInitial(name: string): string {
  return name.trim().slice(0, 1).toUpperCase() || "?";
}

export interface WorkspaceRailProps {
  footerUser?: { name: string; avatar_url?: string | null } | null;
  onLogout?: () => void;
  onAddWorkspace?: () => void;
  className?: string;
}

export function WorkspaceRail({
  footerUser,
  onLogout,
  onAddWorkspace,
  className,
}: WorkspaceRailProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: workspaces, isLoading } = useWorkspaces();
  const currentWorkspace = useWorkspaceStore((s) => s.currentWorkspace);
  const setCurrentWorkspace = useWorkspaceStore((s) => s.setCurrentWorkspace);

  useEffect(() => {
    if (workspaces?.length && !currentWorkspace) {
      setCurrentWorkspace(workspaces[0]);
    }
  }, [workspaces, currentWorkspace, setCurrentWorkspace]);

  const current = currentWorkspace ?? workspaces?.[0];

  const railContent = (
    <>
      <WorkspaceRailItem
        icon={<MessageCircle className="size-6" />}
        aria-label="Chatvioso home"
        href="/app"
        className="text-primary-inverse hover:bg-panel focus-visible:ring-offset-rail"
      />

      <div className="mt-2 flex flex-col items-center gap-1">
        {isLoading ? (
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-panel text-primary-inverse"
            aria-hidden
          >
            <span className="text-xs">…</span>
          </div>
        ) : workspaces?.length ? (
          <Dropdown
            align="start"
            contentClassName="bg-panel border-border-panel text-primary-inverse"
            trigger={
              <button
                type="button"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-panel font-medium text-primary-inverse transition-colors hover:bg-panel-search focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-rail"
                aria-label={`Current workspace: ${current?.name ?? "Select workspace"}. Open workspace list`}
                title={current?.name}
              >
                {getWorkspaceInitial(current?.name ?? "")}
              </button>
            }
          >
            <div className="max-h-64 overflow-y-auto py-1">
              {workspaces.map((ws) => (
                <DropdownItem
                  key={ws.id}
                  onClick={() => setCurrentWorkspace(ws)}
                  className={current?.id === ws.id ? "bg-brand-soft font-medium" : ""}
                >
                  {ws.name}
                </DropdownItem>
              ))}
            </div>
            {onAddWorkspace && (
              <DropdownItem onClick={onAddWorkspace} className="flex items-center gap-2 border-t border-border-muted mt-1 pt-1">
                <Plus className="size-4 shrink-0" />
                Add workspace
              </DropdownItem>
            )}
          </Dropdown>
        ) : onAddWorkspace ? (
          <WorkspaceRailItem
            icon={<Plus className="size-5" />}
            aria-label="Add workspace"
            onClick={onAddWorkspace}
            className="text-primary-inverse hover:bg-panel focus-visible:ring-offset-rail"
          />
        ) : null}
      </div>

      <div className="mt-2 flex justify-center">
        <div className="flex h-10 w-10 items-center justify-center">
          <NotificationBell />
        </div>
      </div>

      <div className="flex-1 min-h-4" aria-hidden />

      <WorkspaceRailFooter user={footerUser} onLogout={onLogout} />
    </>
  );

  return (
    <>
      <nav
        className={cn(
          "hidden md:flex w-[72px] shrink-0 flex-col items-center gap-1 border-r border-border-panel bg-rail py-3 text-primary-inverse",
          className
        )}
        aria-label="Workspace rail"
      >
        {railContent}
      </nav>

      <div className="md:hidden shrink-0 flex items-center justify-center border-r border-border-panel bg-rail w-14 py-2 min-h-[44px] text-primary-inverse">
        <IconButton
          icon={<Menu className="size-5" />}
          aria-label="Open workspace menu"
          variant="ghost"
          size="md"
          className="text-primary-inverse hover:bg-panel"
          onClick={() => setMobileOpen(true)}
        />
      </div>

      <Drawer open={mobileOpen} onOpenChange={setMobileOpen} side="left">
        <div className="flex w-[72px] flex-col items-center gap-1 bg-rail py-3 px-2 text-primary-inverse">
          {railContent}
        </div>
      </Drawer>
    </>
  );
}
