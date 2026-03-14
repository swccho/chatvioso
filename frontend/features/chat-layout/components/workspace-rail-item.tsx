"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface WorkspaceRailItemProps {
  icon: React.ReactNode;
  "aria-label": string;
  onClick?: () => void;
  href?: string;
  className?: string;
  active?: boolean;
}

export function WorkspaceRailItem({
  icon,
  "aria-label": ariaLabel,
  onClick,
  href,
  className,
  active,
}: WorkspaceRailItemProps) {
  const classes = cn(
    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-2",
    active ? "bg-brand-soft text-brand" : "text-primary-secondary hover:bg-surface-muted hover:text-primary",
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes} aria-label={ariaLabel} title={ariaLabel}>
        {icon}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={classes}
      aria-label={ariaLabel}
      title={ariaLabel}
      onClick={onClick}
    >
      {icon}
    </button>
  );
}
