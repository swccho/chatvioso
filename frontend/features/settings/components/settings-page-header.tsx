"use client";

import { cn } from "@/lib/utils";

export interface SettingsPageHeaderProps {
  title: string;
  description?: string;
  className?: string;
}

export function SettingsPageHeader({
  title,
  description,
  className,
}: SettingsPageHeaderProps) {
  return (
    <header className={cn("mb-6 shrink-0", className)}>
      <h1 className="text-lg sm:text-xl font-semibold text-primary">{title}</h1>
      {description && (
        <p className="mt-1 text-sm text-primary-muted">{description}</p>
      )}
    </header>
  );
}
