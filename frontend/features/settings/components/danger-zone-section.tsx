"use client";

import { cn } from "@/lib/utils";

export interface DangerZoneSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function DangerZoneSection({
  title = "Danger zone",
  description = "Irreversible actions. Proceed with caution.",
  children,
  className,
}: DangerZoneSectionProps) {
  return (
    <section
      className={cn(
        "mt-8 rounded-lg border border-state-danger/30 bg-state-danger/5 p-4 sm:p-5",
        className
      )}
    >
      <h2 className="text-sm font-medium text-state-danger">{title}</h2>
      {description && (
        <p className="mt-1 text-xs text-primary-muted">{description}</p>
      )}
      <div className="mt-3">{children}</div>
    </section>
  );
}
