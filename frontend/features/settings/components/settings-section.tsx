"use client";

import { cn } from "@/lib/utils";

export interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function SettingsSection({
  title,
  children,
  className,
}: SettingsSectionProps) {
  return (
    <section className={cn("space-y-3 mb-8 last:mb-0", className)}>
      <h2 className="text-sm font-medium text-primary">{title}</h2>
      {children}
    </section>
  );
}
