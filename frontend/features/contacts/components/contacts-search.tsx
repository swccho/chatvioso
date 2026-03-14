"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ContactsSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export function ContactsSearch({
  value,
  onChange,
  placeholder = "Search contacts…",
  disabled,
  className,
  id = "contacts-search",
}: ContactsSearchProps) {
  return (
    <div className={cn("relative", className)}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-primary-muted"
        aria-hidden
      />
      <Input
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        aria-label="Search contacts"
        className="pl-9 border-border-muted bg-surface text-primary placeholder:text-primary-muted focus-visible:ring-brand"
      />
    </div>
  );
}
