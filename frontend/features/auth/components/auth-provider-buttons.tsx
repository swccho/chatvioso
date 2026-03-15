"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GoogleIcon } from "./google-icon";
import { cn } from "@/lib/utils";

export interface AuthProviderButtonsProps {
  /** Primary CTA e.g. "Continue with Google" - uses brand purple */
  primaryLabel: string;
  primaryHref?: string;
  primaryOnClick?: () => void;
  primaryDisabled?: boolean;
  /** Secondary CTA e.g. "Continue with Email" - outline style */
  secondaryLabel: string;
  secondaryHref?: string;
  secondaryOnClick?: () => void;
  secondaryDisabled?: boolean;
  className?: string;
}

export function AuthProviderButtons({
  primaryLabel,
  primaryHref,
  primaryOnClick,
  primaryDisabled,
  secondaryLabel,
  secondaryHref,
  secondaryOnClick,
  secondaryDisabled,
  className,
}: AuthProviderButtonsProps) {
  const primaryContent = (
    <>
      <GoogleIcon mono className="size-5 text-current" />
      <span>{primaryLabel}</span>
    </>
  );

  const secondaryContent = <span>{secondaryLabel}</span>;

  return (
    <div className={cn("space-y-3", className)}>
      {primaryHref ? (
        <Button
          variant="primary"
          size="default"
          className="w-full gap-2 rounded-lg"
          disabled={primaryDisabled}
          asChild
        >
          <Link href={primaryHref} className="inline-flex items-center justify-center gap-2">
            {primaryContent}
          </Link>
        </Button>
      ) : (
        <Button
          type="button"
          variant="primary"
          size="default"
          className="w-full gap-2 rounded-lg"
          onClick={primaryOnClick}
          disabled={primaryDisabled}
        >
          {primaryContent}
        </Button>
      )}

      {secondaryHref ? (
        <Button
          variant="outline"
          size="default"
          className="w-full rounded-lg border border-border-default bg-surface text-primary hover:bg-black/5"
          disabled={secondaryDisabled}
          asChild
        >
          <Link href={secondaryHref} className="inline-flex items-center justify-center w-full">
            {secondaryContent}
          </Link>
        </Button>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="default"
          className="w-full rounded-lg border border-border-default bg-surface text-primary hover:bg-black/5"
          onClick={secondaryOnClick}
          disabled={secondaryDisabled}
        >
          {secondaryContent}
        </Button>
      )}
    </div>
  );
}
