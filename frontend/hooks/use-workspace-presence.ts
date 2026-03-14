"use client";

import { useEffect, useState } from "react";
import { getEcho } from "@/lib/echo";

export interface PresentUser {
  id: number;
  name: string;
}

export function useWorkspacePresence(workspaceId: number | null): PresentUser[] {
  const [presentUsers, setPresentUsers] = useState<PresentUser[]>([]);

  useEffect(() => {
    if (!workspaceId) {
      setPresentUsers([]);
      return;
    }

    const echo = getEcho();
    if (!echo) {
      setPresentUsers([]);
      return;
    }

    const channelName = `presence-workspace.${workspaceId}`;
    const channel = echo.join(channelName);

    channel.here((users: PresentUser[]) => {
      setPresentUsers(users);
    });

    channel.joining((user: PresentUser) => {
      setPresentUsers((prev) => {
        if (prev.some((u) => u.id === user.id)) return prev;
        return [...prev, user];
      });
    });

    channel.leaving((user: PresentUser) => {
      setPresentUsers((prev) => prev.filter((u) => u.id !== user.id));
    });

    return () => {
      echo.leave(channelName);
      setPresentUsers([]);
    };
  }, [workspaceId]);

  return presentUsers;
}
