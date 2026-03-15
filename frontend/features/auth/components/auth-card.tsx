"use client";

import { cn } from "@/lib/utils";

export interface AuthCardProps {
  children: React.ReactNode;
  className?: string;
}

export function AuthCard({ children, className }: AuthCardProps) {
  return (
    <div
      className={cn(
        "w-full rounded-xl border border-border-default bg-surface p-6 shadow-overlay sm:p-8",
        className
      )}
    >
      {children}
    </div>
  );
}
