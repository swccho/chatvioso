"use client";

import { useQuery } from "@tanstack/react-query";
import { searchWorkspace } from "@/lib/search";

export function useWorkspaceSearch(
  workspaceId: number | null,
  q: string,
  type: "users" | "conversations" | "messages" | "all" = "all"
) {
  return useQuery({
    queryKey: ["workspaces", workspaceId, "search", q, type],
    queryFn: () => searchWorkspace(workspaceId!, q, type),
    enabled: !!workspaceId && q.trim().length > 0,
  });
}
