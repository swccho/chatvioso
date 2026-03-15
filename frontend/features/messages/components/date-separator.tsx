"use client";

import { cn } from "@/lib/utils";

export interface DateSeparatorProps {
  date: string;
  className?: string;
}

function formatDateLabel(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear();
  if (sameDay) return "Today";
  if (isYesterday) return "Yesterday";
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

export function DateSeparator({ date, className }: DateSeparatorProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center py-3",
        className
      )}
      role="separator"
      aria-label={`Messages from ${formatDateLabel(date)}`}
    >
      <span className="text-xs font-medium text-primary-inverse bg-panel px-3 py-1.5 rounded-full">
        {formatDateLabel(date)}
      </span>
    </div>
  );
}
