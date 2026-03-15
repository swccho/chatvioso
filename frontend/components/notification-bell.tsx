"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUnreadCount, useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from "@/hooks/use-notifications";

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString();
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const { data: unreadCount } = useUnreadCount();
  const { data, isLoading } = useNotifications(false);
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("click", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const notifications = data?.data ?? [];
  const count = unreadCount ?? 0;

  return (
    <div className="relative" ref={panelRef}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="relative p-2"
        onClick={() => setOpen((o) => !o)}
        aria-label={count ? `${count} unread notifications` : "Notifications"}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Bell className="size-5" aria-hidden />
        {count > 0 && (
          <span
            className="absolute top-0.5 right-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-notification-badge text-primary-inverse px-1.5 text-xs font-medium"
            aria-hidden
          >
            {count > 99 ? "99+" : count}
          </span>
        )}
      </Button>
      {open && (
        <div
          className="absolute left-0 top-full mt-1 w-80 rounded-lg border border-border-muted bg-surface shadow-overlay z-dropdown max-h-[400px] flex flex-col"
          role="dialog"
          aria-label="Notifications"
        >
          <div className="flex items-center justify-between p-4 border-b border-border-muted">
            <span className="text-sm font-medium text-primary">Notifications</span>
            {count > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => markAllRead.mutate()}
                aria-label="Mark all as read"
              >
                Mark all read
              </Button>
            )}
          </div>
          <div className="overflow-y-auto flex-1">
            {isLoading ? (
              <p className="p-4 text-sm text-primary-muted">Loading…</p>
            ) : notifications.length === 0 ? (
              <p className="p-4 text-sm text-primary-muted">No notifications.</p>
            ) : (
              <ul className="divide-y divide-border-default" role="list">
                {notifications.map((n) => (
                  <li key={n.id}>
                    <Link
                      href={n.data?.link ?? "/app"}
                      onClick={() => {
                        if (!n.read_at) markRead.mutate(n.id);
                        setOpen(false);
                      }}
                      className={`block px-4 py-2 text-left text-sm hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand ${!n.read_at ? "bg-surface-muted/70" : ""}`}
                    >
                      <p className="text-sm font-medium text-primary">
                        {n.data?.title ?? "Notification"}
                      </p>
                      <p className="text-xs text-primary-secondary line-clamp-2">
                        {n.data?.body}
                      </p>
                      <p className="text-xs text-primary-muted mt-0.5">
                        {formatTime(n.created_at)}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
