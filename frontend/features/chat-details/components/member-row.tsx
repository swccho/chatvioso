"use client";

import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { ConversationMember } from "@/types/api";

export interface MemberRowProps {
  member: ConversationMember;
  className?: string;
}

export function MemberRow({ member, className }: MemberRowProps) {
  const user = member.user;
  const displayName = user?.name ?? "Unknown";

  return (
    <div
      className={cn(
        "flex items-center gap-3 py-1.5 min-w-0",
        className
      )}
    >
      <Avatar
        src={user?.avatar_url ?? undefined}
        name={displayName}
        size="sm"
        className="shrink-0"
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm text-primary truncate">{displayName}</p>
        <p className="text-xs text-primary-muted">Member</p>
      </div>
    </div>
  );
}
