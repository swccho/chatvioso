"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

export interface AuthLegalTextProps {
  className?: string;
  /** Optional custom terms URL */
  termsHref?: string;
  /** Optional custom DPA URL */
  dpaHref?: string;
}

const defaultTermsHref = "#";
const defaultDpaHref = "#";

export function AuthLegalText({
  className,
  termsHref = defaultTermsHref,
  dpaHref = defaultDpaHref,
}: AuthLegalTextProps) {
  return (
    <p
      className={cn(
        "text-center text-xs text-primary-muted max-w-[280px] mx-auto",
        className
      )}
    >
      By signing up, you agree to the{" "}
      <Link
        href={termsHref}
        className="text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 rounded"
      >
        Terms of Service
      </Link>{" "}
      and{" "}
      <Link
        href={dpaHref}
        className="text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 rounded"
      >
        Data Processing Agreement
      </Link>
      .
    </p>
  );
}
