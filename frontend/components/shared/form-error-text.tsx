"use client";

import { cn } from "@/lib/utils";

export interface FormErrorTextProps {
  children: React.ReactNode;
  className?: string;
}

export function FormErrorText({ children, className }: FormErrorTextProps) {
  return (
    <p className={cn("text-sm text-state-danger", className)} role="alert">
      {children}
    </p>
  );
}
