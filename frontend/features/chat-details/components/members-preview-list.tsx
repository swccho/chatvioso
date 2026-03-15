"use client";

import { MemberRow } from "./member-row";
import { cn } from "@/lib/utils";
import type { ConversationMember } from "@/types/api";

export interface MembersPreviewListProps {
  members: ConversationMember[];
  className?: string;
}

export function MembersPreviewList({
  members,
  className,
}: MembersPreviewListProps) {
  if (members.length === 0) {
    return (
      <p className="text-xs text-panel-muted py-2">
        No members loaded.
      </p>
    );
  }

  return (
    <ul
      className={cn("space-y-0.5", className)}
      role="list"
      aria-label="Conversation members"
    >
      {members.map((member) => (
        <li key={member.id}>
          <MemberRow member={member} />
        </li>
      ))}
    </ul>
  );
}
