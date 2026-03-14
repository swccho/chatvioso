"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const FOCUSABLE =
  "button, [href], input, select, textarea, [tabindex]:not([tabindex=\"-1\"])";

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => !el.hasAttribute("disabled") && el.getAttribute("aria-hidden") !== "true"
  );
}

export interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: "left" | "right";
  children: React.ReactNode;
  className?: string;
}

export function Drawer({
  open,
  onOpenChange,
  side = "right",
  children,
  className,
}: DrawerProps) {
  const [entered, setEntered] = React.useState(false);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const previousActiveRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (open) {
      setEntered(false);
      previousActiveRef.current = document.activeElement as HTMLElement | null;
      const frame = requestAnimationFrame(() => {
        requestAnimationFrame(() => setEntered(true));
      });
      return () => cancelAnimationFrame(frame);
    }
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;

    const focusable = getFocusableElements(panel);
    const first = focusable[0];
    if (first) first.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onOpenChange(false);
        if (previousActiveRef.current?.focus) {
          previousActiveRef.current.focus();
        }
        return;
      }
      if (e.key !== "Tab") return;
      const p = panelRef.current;
      if (!p) return;
      const els = getFocusableElements(p);
      if (els.length === 0) return;
      const current = document.activeElement as HTMLElement;
      const idx = els.indexOf(current);
      if (idx === -1) return;
      if (e.shiftKey) {
        const next = idx <= 0 ? els[els.length - 1] : els[idx - 1];
        e.preventDefault();
        next.focus();
      } else {
        const next = idx >= els.length - 1 ? els[0] : els[idx + 1];
        e.preventDefault();
        next.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (previousActiveRef.current?.focus) {
        previousActiveRef.current.focus();
      }
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  const panelTranslate = side === "right" ? "translate-x-full" : "-translate-x-full";
  const panelTranslateOpen = "translate-x-0";

  return (
    <div
      className="fixed inset-0 z-drawer"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={cn(
          "absolute inset-0 bg-black/50 transition-opacity duration-200 ease-out",
          entered ? "opacity-100" : "opacity-0"
        )}
        onClick={() => onOpenChange(false)}
        aria-hidden
      />
      <div
        ref={panelRef}
        className={cn(
          "absolute top-0 bottom-0 w-full max-w-sm bg-surface shadow-overlay flex flex-col transition-transform duration-200 ease-out",
          side === "left" ? "left-0" : "right-0",
          entered ? panelTranslateOpen : panelTranslate,
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}

export interface DrawerHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DrawerHeader({ className, ...props }: DrawerHeaderProps) {
  return (
    <div
      className={cn(
        "shrink-0 flex items-center justify-between border-b border-border-muted px-4 py-3",
        className
      )}
      {...props}
    />
  );
}

export interface DrawerContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DrawerContent({ className, ...props }: DrawerContentProps) {
  return <div className={cn("flex-1 overflow-y-auto p-4", className)} {...props} />;
}
