"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchConversations,
  createDirectConversation as createDirectApi,
  createGroupConversation as createGroupApi,
  createChannel as createChannelApi,
} from "@/lib/conversations";
import { useConversationStore } from "@/stores/conversation-store";

export function useConversations(workspaceId: number | null) {
  return useQuery({
    queryKey: ["workspaces", workspaceId, "conversations"],
    queryFn: () => fetchConversations(workspaceId!),
    enabled: !!workspaceId,
  });
}

export function useCreateDirectConversation(workspaceId: number | null) {
  const queryClient = useQueryClient();
  const setCurrent = useConversationStore((s) => s.setCurrentConversation);

  return useMutation({
    mutationFn: (otherUserId: number) =>
      createDirectApi(workspaceId!, otherUserId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["workspaces", workspaceId, "conversations"],
      });
      setCurrent(data);
    },
  });
}

export function useCreateGroupConversation(workspaceId: number | null) {
  const queryClient = useQueryClient();
  const setCurrent = useConversationStore((s) => s.setCurrentConversation);

  return useMutation({
    mutationFn: ({ name, memberIds }: { name: string; memberIds: number[] }) =>
      createGroupApi(workspaceId!, name, memberIds),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["workspaces", workspaceId, "conversations"],
      });
      setCurrent(data);
    },
  });
}

export function useCreateChannel(workspaceId: number | null) {
  const queryClient = useQueryClient();
  const setCurrent = useConversationStore((s) => s.setCurrentConversation);

  return useMutation({
    mutationFn: ({
      name,
      isPrivate,
    }: {
      name: string;
      isPrivate?: boolean;
    }) => createChannelApi(workspaceId!, name, isPrivate ?? false),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["workspaces", workspaceId, "conversations"],
      });
      setCurrent(data);
    },
  });
}
