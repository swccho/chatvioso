"use client";

import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Message } from "@/types/api";

export interface MessageGroupProps {
  messages: Message[];
  isOwn: boolean;
  showAvatar?: boolean;
  showSenderName?: boolean;
  senderName?: string;
  senderAvatarUrl?: string | null;
  children: React.ReactNode;
  className?: string;
}

export function MessageGroup({
  messages,
  isOwn,
  showAvatar = true,
  showSenderName = false,
  senderName,
  senderAvatarUrl,
  children,
  className,
}: MessageGroupProps) {
  return (
    <div
      className={cn(
        "flex gap-2.5",
        isOwn ? "flex-row-reverse" : "flex-row",
        className
      )}
    >
      {showAvatar && !isOwn && (
        <Avatar
          src={senderAvatarUrl ?? undefined}
          name={senderName ?? "User"}
          size="sm"
          className="shrink-0 mt-0.5"
        />
      )}
      {showAvatar && isOwn && <div className="w-8 shrink-0" />}
      <div
        className={cn(
          "flex flex-col gap-1 min-w-0 max-w-[90%] sm:max-w-[85%]",
          isOwn ? "items-end" : "items-start"
        )}
      >
        {showSenderName && senderName && !isOwn && (
          <span className="text-xs font-medium text-primary-secondary px-0.5">
            {senderName}
          </span>
        )}
        {children}
      </div>
    </div>
  );
}
