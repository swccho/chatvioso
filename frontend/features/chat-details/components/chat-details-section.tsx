"use client";

import { cn } from "@/lib/utils";

export interface ChatDetailsSectionProps {
  title: string;
  /** Optional action or link (e.g. "See all") rendered in the section header */
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

function sectionHeadingId(title: string): string {
  const safe = title.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "").toLowerCase();
  return safe ? `${safe}-heading` : "section-heading";
}

export function ChatDetailsSection({
  title,
  action,
  children,
  className,
}: ChatDetailsSectionProps) {
  const headingId = sectionHeadingId(title);
  return (
    <section
      className={cn(
        "shrink-0 border-b border-border-muted last:border-b-0",
        className
      )}
      aria-labelledby={headingId}
    >
      <div className="flex items-center justify-between gap-2 px-4 py-2.5 bg-surface-muted/50 min-h-[40px]">
        <h3
          id={headingId}
          className="text-sm font-medium text-primary truncate"
        >
          {title}
        </h3>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <div className="px-4 py-3">{children}</div>
    </section>
  );
}
