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
        "h-9 text-sm border-border-muted bg-surface text-primary placeholder:text-primary-muted focus-visible:ring-brand",
        className
      )}
    />
  );
}
