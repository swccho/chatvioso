"use client";

import { MessageSquare, Hash, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ConversationSectionHeader } from "./conversation-section-header";
import { cn } from "@/lib/utils";

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5">
      <Skeleton className="size-8 rounded-full shrink-0" />
      <div className="min-w-0 flex-1 space-y-1">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

export interface ConversationListSkeletonProps {
  count?: number;
  /** When true, mirrors section structure (DMs, Channels, Groups) to reduce layout jump. */
  withSections?: boolean;
  className?: string;
}

export function ConversationListSkeleton({
  count = 5,
  withSections = false,
  className,
}: ConversationListSkeletonProps) {
  if (withSections) {
    return (
      <div className={cn("space-y-6 py-3", className)}>
        <div className="space-y-0.5">
          <ConversationSectionHeader
            icon={<MessageSquare className="size-3.5" />}
            label="Direct messages"
          />
          <SkeletonRow />
          <SkeletonRow />
          <SkeletonRow />
        </div>
        <div className="space-y-0.5">
          <ConversationSectionHeader
            icon={<Hash className="size-3.5" />}
            label="Channels"
          />
          <SkeletonRow />
          <SkeletonRow />
        </div>
        <div className="space-y-0.5">
          <ConversationSectionHeader
            icon={<Users className="size-3.5" />}
            label="Groups"
          />
          <SkeletonRow />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-0.5", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  );
}
