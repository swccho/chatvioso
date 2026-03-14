"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface NavItem {
  href: string;
  label: string;
}

export interface AppSidebarNavProps {
  items: NavItem[];
  className?: string;
}

export function AppSidebarNav({ items, className }: AppSidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className={cn("mt-4 space-y-0.5", className)} aria-label="Main navigation">
      {items.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "block rounded-md px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
              isActive
                ? "bg-brand-soft font-medium text-primary"
                : "text-primary-secondary hover:bg-surface-muted"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
