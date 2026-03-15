"use client";

import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Dropdown, DropdownItem } from "@/components/ui/dropdown";
import { IconButton } from "@/components/ui/icon-button";
import { User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

export interface WorkspaceRailFooterProps {
  user?: { name: string; avatar_url?: string | null } | null;
  onLogout?: () => void;
  className?: string;
}

export function WorkspaceRailFooter({
  user,
  onLogout,
  className,
}: WorkspaceRailFooterProps) {
  return (
    <div
      className={cn(
        "shrink-0 flex flex-col items-center gap-1 border-t border-border-panel pt-2 pb-2",
        className
      )}
      role="region"
      aria-label="User menu"
    >
      <Dropdown
        align="start"
        side="top"
        contentClassName="bg-panel border-border-panel text-primary-inverse"
        trigger={
          <div className="flex items-center justify-center">
            {user ? (
              <button
                type="button"
                className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-2"
                aria-label="Open profile menu"
              >
                <Avatar
                  src={user.avatar_url}
                  name={user.name}
                  size="sm"
                  className="size-9"
                />
              </button>
            ) : (
              <IconButton
                icon={<User className="size-5" />}
                aria-label="Open profile menu"
                variant="ghost"
                size="md"
              />
            )}
          </div>
        }
      >
        <div className="py-1">
          <Link
            href="/app/profile"
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-primary-inverse hover:bg-panel-selected focus:bg-panel-selected focus:outline-none"
          >
            <User className="size-4 shrink-0" />
            Profile
          </Link>
          {onLogout && (
            <DropdownItem onClick={onLogout} className="flex items-center gap-2">
              <LogOut className="size-4 shrink-0" />
              Log out
            </DropdownItem>
          )}
        </div>
      </Dropdown>
    </div>
  );
}
