"use client";

import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

export interface FullPageLoaderProps {
  message?: string;
  className?: string;
}

export function FullPageLoader({ message = "Loading…", className }: FullPageLoaderProps) {
  return (
    <div
      className={cn(
        "flex min-h-[50vh] flex-col items-center justify-center gap-3 py-12 text-primary-secondary",
        className
      )}
    >
      <Spinner size="lg" />
      {message && <p className="text-sm">{message}</p>}
    </div>
  );
}
