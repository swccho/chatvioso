"use client";

import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

export interface InlineLoaderProps {
  className?: string;
  "aria-label"?: string;
}

export function InlineLoader({ className, "aria-label": ariaLabel }: InlineLoaderProps) {
  return (
    <Spinner
      size="sm"
      className={cn("shrink-0", className)}
      aria-label={ariaLabel ?? "Loading"}
    />
  );
}
