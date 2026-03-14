"use client";

import * as React from "react";
import { ConversationSectionHeader } from "./conversation-section-header";
import { cn } from "@/lib/utils";

export interface ConversationListSectionProps {
  title: string;
  icon?: React.ReactNode;
  count?: number;
  action?: React.ReactNode;
  empty?: React.ReactNode;
  children: React.ReactNode;
  ariaLabel?: string;
  className?: string;
}

/**
 * Wrapper for a single panel section (e.g. Direct messages, Channels, Groups).
 */
export function ConversationListSection({
  title,
  icon,
  count,
  action,
  empty,
  children,
  ariaLabel,
  className,
}: ConversationListSectionProps) {
  const isEmpty = React.Children.count(children) === 0;

  return (
    <section
      className={cn("space-y-0.5", className)}
      aria-label={ariaLabel ?? title}
    >
      <ConversationSectionHeader
        icon={icon}
        label={title}
        count={count}
        action={action}
      />
      {isEmpty && empty ? empty : children}
    </section>
  );
}
