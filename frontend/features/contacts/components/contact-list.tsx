"use client";

import { ContactCard } from "./contact-card";
import type { WorkspaceMember } from "@/types/api";

export interface ContactListProps {
  members: WorkspaceMember[];
  onStartChat: (member: WorkspaceMember) => void;
  startingUserId: number | null;
  presentUserIds?: Set<number>;
  className?: string;
}

export function ContactList({
  members,
  onStartChat,
  startingUserId,
  presentUserIds,
  className,
}: ContactListProps) {
  return (
    <ul className={className} role="list">
      {members.map((member) => (
        <li key={member.id}>
          <ContactCard
            member={member}
            onStartChat={onStartChat}
            isStarting={startingUserId === member.user_id}
            online={presentUserIds?.has(member.user_id)}
          />
        </li>
      ))}
    </ul>
  );
}
