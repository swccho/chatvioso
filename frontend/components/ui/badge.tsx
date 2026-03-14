"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full font-medium shrink-0",
  {
    variants: {
      variant: {
        default: "bg-surface-muted text-primary-secondary",
        primary: "bg-brand text-primary-inverse",
        success: "bg-state-success/15 text-state-success",
        warning: "bg-state-warning/15 text-state-warning",
        danger: "bg-state-danger/15 text-state-danger",
      },
      size: {
        sm: "min-w-[1.25rem] h-5 px-1.5 text-xs",
        md: "min-w-[1.5rem] h-6 px-2 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(badgeVariants({ variant, size, className }))}
      {...props}
    />
  )
);
Badge.displayName = "Badge";

export { Badge, badgeVariants };
