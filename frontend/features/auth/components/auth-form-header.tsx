"use client";

import { cn } from "@/lib/utils";

export interface AuthFormHeaderProps {
  title: string;
  description?: string;
  className?: string;
}

export function AuthFormHeader({ title, description, className }: AuthFormHeaderProps) {
  return (
    <div className={cn("text-center", className)}>
      <h1 className="text-2xl font-semibold tracking-tight text-primary">{title}</h1>
      {description && (
        <p className="mt-1 text-sm text-primary-secondary">{description}</p>
      )}
    </div>
  );
}
