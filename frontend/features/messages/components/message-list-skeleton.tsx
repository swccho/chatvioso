"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface MessageListSkeletonProps {
  count?: number;
  className?: string;
}

export function MessageListSkeleton({
  count = 6,
  className,
}: MessageListSkeletonProps) {
  return (
    <div className={cn("flex flex-col px-3 py-4 space-y-4 max-w-3xl mx-auto w-full sm:px-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "flex gap-2.5",
            i % 3 === 0 ? "justify-end" : "justify-start"
          )}
        >
          <div className="max-w-[85%] space-y-1.5">
            <Skeleton className="h-4 w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4 rounded-lg" />
            <Skeleton className="h-3 w-14 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
