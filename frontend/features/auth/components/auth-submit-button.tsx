"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface AuthSubmitButtonProps {
  children: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function AuthSubmitButton({
  children,
  loading,
  disabled,
  className,
}: AuthSubmitButtonProps) {
  return (
    <Button
      type="submit"
      variant="primary"
      className={cn("w-full", className)}
      disabled={disabled ?? loading}
    >
      {loading ? "Please wait…" : children}
    </Button>
  );
}
