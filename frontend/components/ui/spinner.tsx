"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const spinnerSizes = {
  sm: "size-4 border-2",
  md: "size-8 border-2",
  lg: "size-10 border-2",
} as const;

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: keyof typeof spinnerSizes;
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size = "md", ...props }, ref) => (
    <div
      ref={ref}
      role="status"
      aria-label="Loading"
      className={cn(
        "animate-spin rounded-full border-border-muted border-t-brand",
        spinnerSizes[size],
        className
      )}
      {...props}
    />
  )
);
Spinner.displayName = "Spinner";

export { Spinner };
