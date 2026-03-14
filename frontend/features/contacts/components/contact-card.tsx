"use client";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserPresenceIndicator } from "@/components/shared";
import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WorkspaceMember } from "@/types/api";

export interface ContactCardProps {
  member: WorkspaceMember;
  onStartChat: (member: WorkspaceMember) => void;
  isStarting?: boolean;
  online?: boolean;
  className?: string;
}

export function ContactCard({
  member,
  onStartChat,
  isStarting,
  online,
  className,
}: ContactCardProps) {
  const { user } = member;

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border border-border-muted bg-surface px-3 py-2.5 transition-colors hover:bg-surface-muted focus-within:ring-2 focus-within:ring-brand focus-within:ring-offset-2 focus-within:ring-offset-surface",
        className
      )}
    >
      <div className="relative shrink-0">
        <Avatar
          src={user.avatar_url}
          name={user.name}
          size="md"
          className="ring-2 ring-transparent"
        />
        <UserPresenceIndicator
          online={online ?? false}
          size="sm"
          className="absolute bottom-0 right-0 rounded-full border-2 border-surface"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-primary">{user.name}</p>
        {user.email && (
          <p className="truncate text-xs text-primary-muted">{user.email}</p>
        )}
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={isStarting}
        onClick={() => onStartChat(member)}
        aria-label={`Message ${user.name}`}
        className="shrink-0"
      >
        <MessageCircle className="size-4" aria-hidden />
      </Button>
    </div>
  );
}
