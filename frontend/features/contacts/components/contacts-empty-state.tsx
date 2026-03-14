"use client";

import { Users } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ContactsEmptyStateProps {
  message?: string;
  className?: string;
}

export function ContactsEmptyState({
  message = "No contacts in this workspace.",
  className,
}: ContactsEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 text-center",
        className
      )}
    >
      <Users className="size-10 text-primary-muted mb-3" aria-hidden />
      <p className="text-sm font-medium text-primary">No contacts</p>
      <p className="mt-1 text-sm text-primary-muted max-w-sm">{message}</p>
    </div>
  );
}
