"use client";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface AppSidebarFooterProps {
  user?: { name: string; avatar_url?: string | null } | null;
  onLogout?: () => void;
  className?: string;
}

export function AppSidebarFooter({
  user,
  onLogout,
  className,
}: AppSidebarFooterProps) {
  return (
    <div
      className={cn(
        "shrink-0 p-2 border-t border-border-muted flex items-center gap-2",
        className
      )}
    >
      {user && (
        <Avatar
          src={user.avatar_url}
          name={user.name}
          size="sm"
          className="shrink-0"
        />
      )}
      <Button
        variant="ghost"
        size="sm"
        className="flex-1 justify-start text-primary-secondary"
        onClick={onLogout}
      >
        Log out
      </Button>
    </div>
  );
}
