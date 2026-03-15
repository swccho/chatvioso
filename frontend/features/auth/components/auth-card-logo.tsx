"use client";

import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AuthCardLogoProps {
  className?: string;
}

export function AuthCardLogo({ className }: AuthCardLogoProps) {
  return (
    <div
      className={cn(
        "mx-auto flex size-12 items-center justify-center rounded-full bg-brand text-primary-inverse",
        className
      )}
      aria-hidden
    >
      <MessageCircle className="size-7" strokeWidth={2} />
    </div>
  );
}
