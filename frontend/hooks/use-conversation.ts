"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchConversation } from "@/lib/conversations";

export function useConversation(
  workspaceId: number | null,
  conversationId: number | null,
  enabled: boolean
) {
  return useQuery({
    queryKey: ["workspaces", workspaceId, "conversations", conversationId],
    queryFn: () => fetchConversation(workspaceId!, conversationId!),
    enabled: !!workspaceId && !!conversationId && enabled,
  });
}
