"use client";

import { cn } from "@/lib/utils";

export interface ComposerActionsProps {
  children: React.ReactNode;
  className?: string;
}

export function ComposerActions({ children, className }: ComposerActionsProps) {
  return <div className={cn("flex items-center gap-1.5 shrink-0", className)}>{children}</div>;
}
