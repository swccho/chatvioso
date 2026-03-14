"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const MIN_HEIGHT = 40;
const MAX_HEIGHT = 200;

export interface ComposerTextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "onChange"> {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onSubmit?: () => void;
}

export const ComposerTextarea = React.forwardRef<HTMLTextAreaElement, ComposerTextareaProps>(
  (
    {
      value,
      onChange,
      onKeyDown,
      onSubmit,
      disabled,
      className,
      id = "message-composer-input",
      placeholder = "Write a message…",
      ...props
    },
    ref
  ) => {
    const internalRef = React.useRef<HTMLTextAreaElement | null>(null);
    const mergedRef = (el: HTMLTextAreaElement | null) => {
      (internalRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = el;
      if (typeof ref === "function") ref(el);
      else if (ref) (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = el;
    };

    React.useEffect(() => {
      const el = internalRef.current;
      if (!el) return;
      el.style.height = "auto";
      const next = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, el.scrollHeight));
      el.style.height = `${next}px`;
    }, [value]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        onSubmit?.();
      }
      onKeyDown?.(e);
    };

    return (
      <textarea
        ref={mergedRef}
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        aria-label="Message"
        className={cn(
          "flex-1 resize-none rounded-xl border border-border-muted bg-surface px-3 py-2.5 text-sm text-primary placeholder:text-primary-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-0 min-h-[40px] max-h-[200px] overflow-y-auto",
          className
        )}
        style={{ minHeight: MIN_HEIGHT, maxHeight: MAX_HEIGHT }}
        {...props}
      />
    );
  }
);
ComposerTextarea.displayName = "ComposerTextarea";
