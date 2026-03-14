"use client";

import { cn } from "@/lib/utils";

export interface ContactListSkeletonProps {
  count?: number;
  className?: string;
}

export function ContactListSkeleton({
  count = 5,
  className,
}: ContactListSkeletonProps) {
  return (
    <ul className={cn("space-y-2", className)} role="list" aria-busy="true">
      {Array.from({ length: count }).map((_, i) => (
        <li
          key={i}
          className="flex items-center gap-3 rounded-lg border border-border-muted bg-surface px-3 py-2.5"
        >
          <div className="size-10 shrink-0 rounded-full bg-surface-muted animate-pulse" />
          <div className="min-w-0 flex-1 space-y-1">
            <div className="h-4 w-24 rounded bg-surface-muted animate-pulse" />
            <div className="h-3 w-32 rounded bg-surface-muted animate-pulse" />
          </div>
          <div className="h-9 w-9 shrink-0 rounded-md bg-surface-muted animate-pulse" />
        </li>
      ))}
    </ul>
  );
}
