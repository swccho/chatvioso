"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "./input";

export interface SearchInputProps extends Omit<React.ComponentProps<typeof Input>, "type"> {
  /** Accessible label for the search field (used for aria-label if no visible label) */
  "aria-label"?: string;
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, "aria-label": ariaLabel, ...props }, ref) => (
    <div className="relative">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-primary-muted"
        aria-hidden
      />
      <Input
        ref={ref}
        type="search"
        role="searchbox"
        aria-label={ariaLabel ?? "Search"}
        className={cn("pl-9", className)}
        {...props}
      />
    </div>
  )
);
SearchInput.displayName = "SearchInput";

export { SearchInput };
