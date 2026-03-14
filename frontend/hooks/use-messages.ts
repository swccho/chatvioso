"use client";

import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  fetchMessages,
  sendMessage as sendMessageApi,
  updateMessage as updateMessageApi,
  deleteMessage as deleteMessageApi,
  fetchConversationFiles,
  addOrToggleReaction as addOrToggleReactionApi,
  pinMessage as pinMessageApi,
  unpinMessage as unpinMessageApi,
  fetchPinnedMessages,
} from "@/lib/messages";
import type { MessagesPage } from "@/lib/messages";

const MESSAGES_QUERY_KEY = "messages";

export function useMessages(
  workspaceId: number | null,
  conversationId: number | null,
  _cursor?: string | null
) {
  return useQuery({
    queryKey: [
      "workspaces",
      workspaceId,
      "conversations",
      conversationId,
      MESSAGES_QUERY_KEY,
    ],
    queryFn: () =>
      fetchMessages(workspaceId!, conversationId!, undefined, 20),
    enabled: !!workspaceId && !!conversationId,
  });
}

export function useInfiniteMessages(
  workspaceId: number | null,
  conversationId: number | null
) {
  return useInfiniteQuery({
    queryKey: [
      "workspaces",
      workspaceId,
      "conversations",
      conversationId,
      MESSAGES_QUERY_KEY,
    ],
    queryFn: ({ pageParam }) =>
      fetchMessages(workspaceId!, conversationId!, pageParam ?? undefined, 20),
    getNextPageParam: (lastPage: MessagesPage) =>
      lastPage.next_cursor ?? undefined,
    initialPageParam: undefined as string | undefined,
    enabled: !!workspaceId && !!conversationId,
  });
}

export function useSendMessage(
  workspaceId: number | null,
  conversationId: number | null
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      body,
      parentId,
      files,
    }: {
      body: string;
      parentId?: number | null;
      files?: File[];
    }) =>
      sendMessageApi(workspaceId!, conversationId!, body, parentId, files),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          "workspaces",
          workspaceId,
          "conversations",
          conversationId,
          MESSAGES_QUERY_KEY,
        ],
      });
    },
  });
}

export function useUpdateMessage(
  workspaceId: number | null,
  conversationId: number | null
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      messageId,
      body,
    }: {
      messageId: number;
      body: string;
    }) =>
      updateMessageApi(workspaceId!, conversationId!, messageId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          "workspaces",
          workspaceId,
          "conversations",
          conversationId,
          MESSAGES_QUERY_KEY,
        ],
      });
    },
  });
}

export function useDeleteMessage(
  workspaceId: number | null,
  conversationId: number | null
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: number) =>
      deleteMessageApi(workspaceId!, conversationId!, messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          "workspaces",
          workspaceId,
          "conversations",
          conversationId,
          MESSAGES_QUERY_KEY,
        ],
      });
    },
  });
}

export function useConversationFiles(
  workspaceId: number | null,
  conversationId: number | null
) {
  return useQuery({
    queryKey: [
      "workspaces",
      workspaceId,
      "conversations",
      conversationId,
      "files",
    ],
    queryFn: () => fetchConversationFiles(workspaceId!, conversationId!),
    enabled: !!workspaceId && !!conversationId,
  });
}

export function useAddReaction(
  workspaceId: number | null,
  conversationId: number | null
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      messageId,
      emoji,
    }: {
      messageId: number;
      emoji: string;
    }) => addOrToggleReactionApi(workspaceId!, conversationId!, messageId, emoji),
    onSuccess: (_, { messageId }) => {
      queryClient.invalidateQueries({
        queryKey: [
          "workspaces",
          workspaceId,
          "conversations",
          conversationId,
          MESSAGES_QUERY_KEY,
        ],
      });
    },
  });
}

export function usePinMessage(
  workspaceId: number | null,
  conversationId: number | null
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ messageId, pin }: { messageId: number; pin: boolean }) =>
      pin
        ? pinMessageApi(workspaceId!, conversationId!, messageId)
        : unpinMessageApi(workspaceId!, conversationId!, messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          "workspaces",
          workspaceId,
          "conversations",
          conversationId,
          MESSAGES_QUERY_KEY,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: [
          "workspaces",
          workspaceId,
          "conversations",
          conversationId,
          "pinned",
        ],
      });
    },
  });
}

export function usePinnedMessages(
  workspaceId: number | null,
  conversationId: number | null
) {
  return useQuery({
    queryKey: [
      "workspaces",
      workspaceId,
      "conversations",
      conversationId,
      "pinned",
    ],
    queryFn: () => fetchPinnedMessages(workspaceId!, conversationId!),
    enabled: !!workspaceId && !!conversationId,
  });
}
