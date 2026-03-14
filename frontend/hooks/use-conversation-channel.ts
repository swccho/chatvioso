"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getEcho } from "@/lib/echo";

const TYPING_TIMEOUT_MS = 4000;

export function useConversationChannel(
  workspaceId: number | null,
  conversationId: number | null,
  currentUserId: number
): { typingUserIds: number[]; emitTyping: () => void } {
  const queryClient = useQueryClient();
  const [typingUserIds, setTypingUserIds] = useState<number[]>([]);
  const timeoutsRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const emitTyping = useCallback(() => {
    if (!conversationId) return;
    const echo = getEcho();
    if (!echo) return;
    const channel = echo.private(`conversation.${conversationId}`);
    channel.whisper("typing", { user_id: currentUserId });
  }, [conversationId, currentUserId]);

  useEffect(() => {
    if (!conversationId || !workspaceId) {
      setTypingUserIds([]);
      return;
    }

    const echo = getEcho();
    if (!echo) {
      return;
    }

    const channelName = `conversation.${conversationId}`;
    const channel = echo.private(channelName);

    const invalidateMessages = () => {
      queryClient.invalidateQueries({
        queryKey: ["workspaces", workspaceId, "conversations", conversationId, "messages"],
      });
    };

    const invalidateConversations = () => {
      queryClient.invalidateQueries({
        queryKey: ["workspaces", workspaceId, "conversations"],
      });
    };

    channel.listen(".MessageSent", () => {
      invalidateMessages();
      invalidateConversations();
    });

    channel.listen(".MessageUpdated", () => {
      invalidateMessages();
    });

    channel.listen(".MessageDeleted", () => {
      invalidateMessages();
    });

    channel.listen(".ReactionUpdated", () => {
      invalidateMessages();
    });

    channel.listen(".MessagePinned", () => {
      invalidateMessages();
      queryClient.invalidateQueries({
        queryKey: ["workspaces", workspaceId, "conversations", conversationId, "pinned"],
      });
    });

    channel.listen(".ConversationUpdated", () => {
      invalidateConversations();
    });

    channel.listen(".ConversationRead", () => {
      invalidateConversations();
    });

    channel.listenForWhisper("typing", (payload: { user_id?: number }) => {
      const uid = payload?.user_id;
      if (typeof uid !== "number" || uid === currentUserId) return;
      setTypingUserIds((prev) => {
        if (prev.includes(uid)) return prev;
        return [...prev, uid];
      });
      timeoutsRef.current.get(uid) && clearTimeout(timeoutsRef.current.get(uid)!);
      const t = setTimeout(() => {
        setTypingUserIds((prev) => prev.filter((id) => id !== uid));
        timeoutsRef.current.delete(uid);
      }, TYPING_TIMEOUT_MS);
      timeoutsRef.current.set(uid, t);
    });

    return () => {
      echo.leave(channelName);
      timeoutsRef.current.forEach((t) => clearTimeout(t));
      timeoutsRef.current.clear();
      setTypingUserIds([]);
    };
  }, [workspaceId, conversationId, currentUserId, queryClient]);

  return { typingUserIds, emitTyping };
}
