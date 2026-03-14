"use client";

import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ComposerSendButtonProps {
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export function ComposerSendButton({
  disabled,
  loading,
  className,
}: ComposerSendButtonProps) {
  return (
    <Button
      type="submit"
      variant="primary"
      size="sm"
      disabled={disabled}
      aria-label="Send message"
      className={cn("shrink-0", className)}
    >
      {loading ? (
        <span className="text-sm">Sending…</span>
      ) : (
        <Send className="size-4" aria-hidden />
      )}
    </Button>
  );
}
