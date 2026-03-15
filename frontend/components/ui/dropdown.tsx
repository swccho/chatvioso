"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  align?: "start" | "end";
  /** Open menu above the trigger ("top") or below ("bottom", default). */
  side?: "top" | "bottom";
  className?: string;
  /** Optional class for the menu content (e.g. dark panel theme when opened from rail). */
  contentClassName?: string;
}

export function Dropdown({
  trigger,
  children,
  open: controlledOpen,
  onOpenChange,
  align = "end",
  side = "bottom",
  className,
  contentClassName,
}: DropdownProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const triggerRef = React.useRef<HTMLDivElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const [position, setPosition] = React.useState<{ top?: number; bottom?: number; left: number }>({ left: 0 });

  React.useLayoutEffect(() => {
    if (!open || !triggerRef.current || typeof document === "undefined") return;
    const rect = triggerRef.current.getBoundingClientRect();
    const menuWidth = 160; // min-w-[10rem]
    const left = align === "end" ? rect.right - menuWidth : rect.left;
    if (side === "top") {
      setPosition({ bottom: window.innerHeight - rect.top + 4, left });
    } else {
      setPosition({ top: rect.bottom + 4, left });
    }
  }, [open, align, side]);

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      )
        return;
      setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, setOpen]);

  const menu = open && (
    <div
      ref={menuRef}
      className={cn(
        "fixed z-dropdown min-w-[10rem] rounded-md border py-1 shadow-overlay",
        contentClassName ?? "border-border-muted bg-surface"
      )}
      style={
        side === "top"
          ? { bottom: position.bottom, left: position.left }
          : { top: position.top, left: position.left }
      }
      role="menu"
    >
      {children}
    </div>
  );

  return (
    <div className={cn("relative", className)}>
      <div ref={triggerRef} onClick={() => setOpen(!open)}>
        {trigger}
      </div>
      {typeof document !== "undefined" && menu && createPortal(menu, document.body)}
    </div>
  );
}

export interface DropdownItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function DropdownItem({
  className,
  children,
  ...props
}: DropdownItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      className={cn(
        "w-full px-3 py-2 text-left text-sm focus:outline-none",
        "text-primary hover:bg-surface-muted focus:bg-surface-muted",
        "[.bg-panel_&]:text-primary-inverse [.bg-panel_&]:hover:bg-panel-selected [.bg-panel_&]:focus:bg-panel-selected",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
