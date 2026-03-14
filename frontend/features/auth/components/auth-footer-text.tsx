"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

export interface AuthFooterTextProps {
  text: string;
  linkLabel: string;
  href: string;
  className?: string;
}

export function AuthFooterText({
  text,
  linkLabel,
  href,
  className,
}: AuthFooterTextProps) {
  return (
    <p
      className={cn(
        "text-center text-sm text-primary-secondary",
        className
      )}
    >
      {text}{" "}
      <Link
        href={href}
        className="font-medium text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 rounded"
      >
        {linkLabel}
      </Link>
    </p>
  );
}
