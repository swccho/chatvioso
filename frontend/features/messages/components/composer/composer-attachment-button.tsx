"use client";

import { Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ComposerAttachmentButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export function ComposerAttachmentButton({
  onClick,
  disabled,
  className,
}: ComposerAttachmentButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={disabled}
      onClick={onClick}
      aria-label="Attach files"
      className={cn("shrink-0", className)}
    >
      <Paperclip className="size-4" aria-hidden />
    </Button>
  );
}
