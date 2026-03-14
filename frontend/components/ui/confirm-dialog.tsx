"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

const FOCUSABLE =
  "button, [href], input, select, textarea, [tabindex]:not([tabindex=\"-1\")";

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => !el.hasAttribute("disabled") && el.getAttribute("aria-hidden") !== "true"
  );
}

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
  onConfirm: () => void;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  onConfirm,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const previousActiveRef = useRef<HTMLElement | null>(null);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (open) {
      setEntered(false);
      previousActiveRef.current = document.activeElement as HTMLElement | null;
      const frame = requestAnimationFrame(() => {
        requestAnimationFrame(() => setEntered(true));
      });
      return () => cancelAnimationFrame(frame);
    }
  }, [open]);

  useEffect(() => {
    if (open) cancelRef.current?.focus();
  }, [open]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onOpenChange(false);
        if (previousActiveRef.current?.focus) previousActiveRef.current.focus();
        return;
      }
      if (e.key !== "Tab" || !contentRef.current) return;
      const els = getFocusableElements(contentRef.current);
      if (els.length === 0) return;
      const current = document.activeElement as HTMLElement;
      const idx = els.indexOf(current);
      if (idx === -1) return;
      const atFirst = idx === 0;
      const atLast = idx === els.length - 1;
      if (e.shiftKey && atFirst) {
        e.preventDefault();
        els[els.length - 1].focus();
      } else if (!e.shiftKey && atLast) {
        e.preventDefault();
        els[0].focus();
      }
    }
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        if (previousActiveRef.current?.focus) previousActiveRef.current.focus();
      };
    }
  }, [open, onOpenChange]);

  if (!open) return null;

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <div
      className="fixed inset-0 z-modal flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby={description ? "confirm-dialog-desc" : undefined}
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
        ref={contentRef}
        className={cn(
          "relative rounded-lg border border-border-muted bg-surface p-6 shadow-overlay max-w-sm w-full transition-opacity duration-200 ease-out",
          entered ? "opacity-100" : "opacity-0",
          "focus-visible:outline-none"
        )}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.target as HTMLElement).getAttribute("data-confirm") === "true") {
            e.preventDefault();
            handleConfirm();
          }
        }}
      >
        <h2 id="confirm-dialog-title" className="text-lg font-semibold text-primary">
          {title}
        </h2>
        {description && (
          <p id="confirm-dialog-desc" className="mt-2 text-sm text-primary-secondary">
            {description}
          </p>
        )}
        <div className="mt-6 flex justify-end gap-2">
          <Button
            ref={cancelRef}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            aria-label={cancelLabel}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={variant === "destructive" ? "destructive" : "default"}
            size="sm"
            data-confirm="true"
            onClick={handleConfirm}
            aria-label={confirmLabel}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
