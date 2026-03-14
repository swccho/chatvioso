"use client";

import { cn } from "@/lib/utils";

export interface SettingsFormProps {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  className?: string;
}

export function SettingsForm({
  children,
  onSubmit,
  className,
}: SettingsFormProps) {
  return (
    <form onSubmit={onSubmit} className={cn("space-y-4", className)}>
      {children}
    </form>
  );
}
