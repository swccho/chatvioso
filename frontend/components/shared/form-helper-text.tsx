"use client";

import { cn } from "@/lib/utils";

export interface FormHelperTextProps {
  children: React.ReactNode;
  className?: string;
}

export function FormHelperText({ children, className }: FormHelperTextProps) {
  return <p className={cn("text-sm text-primary-muted", className)}>{children}</p>;
}
