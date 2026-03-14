"use client";

import { cn } from "@/lib/utils";

export interface SettingsFormRowProps {
  children: React.ReactNode;
  className?: string;
}

export function SettingsFormRow({
  children,
  className,
}: SettingsFormRowProps) {
  return <div className={cn("space-y-2", className)}>{children}</div>;
}
