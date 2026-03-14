"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Drawer } from "@/components/ui/drawer";
import { AppSidebarHeader } from "./app-sidebar-header";
import { AppSidebarNav } from "./app-sidebar-nav";
import { AppSidebarFooter } from "./app-sidebar-footer";
import { cn } from "@/lib/utils";

export interface AppSidebarProps {
  headerActions?: React.ReactNode;
  navItems: { href: string; label: string }[];
  footerUser?: { name: string; avatar_url?: string | null } | null;
  onLogout?: () => void;
  children?: React.ReactNode;
  className?: string;
}

export function AppSidebar({
  headerActions,
  navItems,
  footerUser,
  onLogout,
  children,
  className,
}: AppSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarContent = (
    <>
      <AppSidebarHeader actions={headerActions} />
      <div className="flex-1 overflow-y-auto p-2 flex flex-col min-h-0">
        {children}
      </div>
      <AppSidebarNav items={navItems} />
      <AppSidebarFooter user={footerUser} onLogout={onLogout} />
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden md:flex w-60 flex-col border-r border-border-muted bg-sidebar shrink-0",
          className
        )}
        aria-label="App sidebar"
      >
        {sidebarContent}
      </aside>

      {/* Mobile: menu trigger bar */}
      <div className="md:hidden shrink-0 flex items-center p-2 border-r border-border-muted bg-sidebar w-14">
        <IconButton
          icon={<Menu className="size-5" />}
          aria-label="Open menu"
          onClick={() => setMobileOpen(true)}
        />
      </div>

      <Drawer open={mobileOpen} onOpenChange={setMobileOpen} side="left">
        <div className="flex flex-col h-full">
          <AppSidebarHeader
            actions={
              <IconButton
                icon={<X className="size-5" />}
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
              />
            }
          />
          <div className="flex-1 overflow-y-auto p-2 flex flex-col min-h-0">
            {children}
          </div>
          <AppSidebarNav items={navItems} />
          <AppSidebarFooter user={footerUser} onLogout={onLogout} />
        </div>
      </Drawer>
    </>
  );
}
