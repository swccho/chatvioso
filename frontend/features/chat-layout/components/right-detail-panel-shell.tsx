"use client";

import { PanelRightClose, PanelRightOpen } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/utils";

export interface RightDetailPanelShellProps {
  children: React.ReactNode;
  className?: string;
  /** When false, panel is collapsed to a slim strip with expand button */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * Shell for the optional right-side detail panel (files, pinned, etc.).
 * Width 280-320px; hidden on small screens (lg:). Optional close/hide for desktop.
 */
export function RightDetailPanelShell({
  children,
  className,
  open = true,
  onOpenChange,
}: RightDetailPanelShellProps) {
  const canToggle = typeof onOpenChange === "function";

  if (!open && canToggle) {
    return (
      <div
        className={cn(
          "hidden lg:flex w-12 shrink-0 flex-col items-center border-l border-border-panel bg-panel py-2 text-primary-inverse"
        )}
        aria-label="Conversation details (collapsed)"
      >
        <IconButton
          icon={<PanelRightOpen className="size-5" />}
          aria-label="Show details panel"
          variant="ghost"
          size="md"
          className="text-primary-inverse hover:bg-panel-selected"
          onClick={() => onOpenChange(true)}
        />
      </div>
    );
  }

  return (
    <aside
      className={cn(
        "hidden lg:flex w-[300px] shrink-0 flex-col border-l border-border-panel bg-panel overflow-hidden text-primary-inverse",
        className
      )}
      aria-label="Conversation details"
    >
      {canToggle && (
        <div className="shrink-0 flex justify-end border-b border-border-panel px-1 py-1.5">
          <IconButton
            icon={<PanelRightClose className="size-5" />}
            aria-label="Hide details panel"
            variant="ghost"
            size="sm"
            className="text-primary-inverse hover:bg-panel-selected"
            onClick={() => onOpenChange(false)}
          />
        </div>
      )}
      <div className="flex-1 min-h-0 overflow-y-auto">{children}</div>
    </aside>
  );
}
