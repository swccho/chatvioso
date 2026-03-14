"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const iconButtonVariants = cva(
  "inline-flex items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:opacity-90 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "hover:bg-surface-muted focus-visible:ring-border-default",
        ghost: "hover:bg-surface-muted focus-visible:ring-border-default",
        outline: "border border-border-muted bg-surface hover:bg-surface-muted focus-visible:ring-brand",
      },
      size: {
        sm: "h-8 w-8 [&_svg]:size-4",
        md: "h-9 w-9 [&_svg]:size-4",
        lg: "h-10 w-10 [&_svg]:size-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface IconButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children">,
    VariantProps<typeof iconButtonVariants> {
  "aria-label": string;
  icon: React.ReactNode;
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant, size, icon, "aria-label": ariaLabel, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      aria-label={ariaLabel}
      className={cn(iconButtonVariants({ variant, size, className }))}
      {...props}
    >
      {icon}
    </button>
  )
);
IconButton.displayName = "IconButton";

export { IconButton, iconButtonVariants };
