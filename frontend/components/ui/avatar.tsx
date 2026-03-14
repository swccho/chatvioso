"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const avatarSizes = {
  xs: "size-6 text-xs",
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-12 text-base",
  xl: "size-16 text-lg",
} as const;

export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  src?: string | null;
  name?: string;
  size?: keyof typeof avatarSizes;
}

const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(
  ({ src, name, size = "md", className, ...props }, ref) => {
    const sizeClass = avatarSizes[size];
    const initials = name ? getInitials(name) : null;

    return (
      <span
        ref={ref}
        role="img"
        aria-label={name ?? "Avatar"}
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-full bg-surface-muted font-medium text-primary-secondary overflow-hidden",
          sizeClass,
          className
        )}
        {...props}
      >
        {src ? (
          <img
            src={src}
            alt=""
            className="size-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          initials
        )}
      </span>
    );
  }
);
Avatar.displayName = "Avatar";

export { Avatar, getInitials };
