"use client";

import { SearchInput } from "@/components/ui/search-input";
import { cn } from "@/lib/utils";

export interface ConversationSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function ConversationSearch({
  value,
  onChange,
  placeholder = "Search conversations…",
  className,
}: ConversationSearchProps) {
  return (
    <SearchInput
      aria-label="Search conversations"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "h-9 text-sm border-0 bg-panel-search text-primary-inverse placeholder:text-panel-muted focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-panel [&_.pointer-events-none]:text-panel-muted",
        className
      )}
    />
  );
}
