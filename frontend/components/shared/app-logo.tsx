"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

export interface AppLogoProps {
  href?: string;
  className?: string;
  /** Override brand name (default: Chatvioso) */
  name?: string;
}

export function AppLogo({ href = "/app", className, name = "Chatvioso" }: AppLogoProps) {
  const content = <span className="font-semibold text-primary">{name}</span>;
  return (
    <div className={cn("shrink-0", className)}>
      {href ? (
        <Link href={href} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 rounded">
          {content}
        </Link>
      ) : (
        content
      )}
    </div>
  );
}
