"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { useConversations } from "@/hooks/use-conversations";
import { useConversation } from "@/hooks/use-conversation";
import { useConversationStore } from "@/stores/conversation-store";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useInfiniteMessages, useSendMessage, useUpdateMessage, useDeleteMessage } from "@/hooks/use-messages";
import { useConversationChannel } from "@/hooks/use-conversation-channel";
import { useWorkspacePresence } from "@/hooks/use-workspace-presence";
import { ConversationHeader, MessageList, MessageComposer } from "@/features/messages/components";
import { ChatDetailsPanel } from "@/features/chat-details/components";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { markConversationRead } from "@/lib/conversations";
import type { Message } from "@/types/api";

export default function ConversationPage() {
  const params = useParams();
  const queryClient = useQueryClient();
  const [messageToDelete, setMessageToDelete] = useState<Message | null>(null);
  const workspaceId = Number(params.id);
  const conversationId = Number(params.convId);
  const { data: workspaces } = useWorkspaces();
  const { data: conversations, isLoading: conversationsLoading } = useConversations(workspaceId);
  const conversationFromList = conversations?.find((c) => c.id === conversationId) ?? null;
  const shouldFetchSingle =
    conversations !== undefined && !conversations.some((c) => c.id === conversationId);
  const {
    data: singleConversation,
    isLoading: singleLoading,
    isError: singleError,
    error: singleErrorDetail,
  } = useConversation(workspaceId, conversationId, shouldFetchSingle);

  const conversation = useMemo(() => {
    if (conversationFromList) return conversationFromList;
    if (singleConversation) return singleConversation;
    return null;
  }, [conversationFromList, singleConversation]);

  const setCurrentConversation = useConversationStore((s) => s.setCurrentConversation);

  useEffect(() => {
    if (conversation) setCurrentConversation(conversation);
  }, [conversation, setCurrentConversation]);

  useEffect(() => {
    if (workspaceId && conversationId && conversation) {
      markConversationRead(workspaceId, conversationId)
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ["workspaces", workspaceId, "conversations"] });
        })
        .catch(() => {});
    }
  }, [workspaceId, conversationId, conversation?.id, queryClient]);

  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false);
  const { data: currentUser } = useCurrentUser();
  const currentUserId = currentUser?.id ?? 0;
  const { typingUserIds, emitTyping } = useConversationChannel(workspaceId, conversationId, currentUserId);
  const presentUsers = useWorkspacePresence(workspaceId);

  const workspace = workspaces?.find((w) => w.id === workspaceId);

  const {
    data: messagesData,
    isLoading,
    isError: messagesError,
    refetch: refetchMessages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteMessages(workspaceId, conversationId);
  const sendMessage = useSendMessage(workspaceId, conversationId);
  const updateMessage = useUpdateMessage(workspaceId, conversationId);
  const deleteMessage = useDeleteMessage(workspaceId, conversationId);

  const messages = useMemo(() => {
    if (!messagesData?.pages?.length) return [];
    const all = messagesData.pages.flatMap((p) => p.messages);
    return [...all].reverse();
  }, [messagesData?.pages]);

  const handleSend = (body: string, parentId?: number | null, files?: File[]) => {
    const uid = currentUser?.id ?? 0;
    const tempId = -Date.now();
    queryClient.setQueryData(
      ["workspaces", workspaceId, "conversations", conversationId, "messages"],
      (old: { pages?: { messages: Message[] }[] } | undefined) => {
        if (!old?.pages?.length) return old;
        const pages = [...old.pages];
        const optimisticMessage: Message = {
          id: tempId,
          conversation_id: conversationId,
          user_id: uid,
          body,
          parent_id: parentId ?? null,
          type: "message",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user: currentUser ? { ...currentUser } : undefined,
        };
        pages[0] = {
          ...pages[0],
          messages: [optimisticMessage, ...(pages[0].messages ?? [])],
        };
        return { ...old, pages };
      }
    );
    sendMessage.mutate(
      { body, parentId, files },
      {
        onError: () => {
          queryClient.invalidateQueries({
            queryKey: ["workspaces", workspaceId, "conversations", conversationId, "messages"],
          });
        },
      }
    );
  };

  const handleEdit = (message: Message, newBody: string) => {
    updateMessage.mutate({ messageId: message.id, body: newBody });
  };

  const handleDelete = (message: Message) => {
    setMessageToDelete(message);
  };

  const confirmDelete = () => {
    if (messageToDelete) {
      deleteMessage.mutate(messageToDelete.id);
      setMessageToDelete(null);
    }
  };

  if (!workspace) {
    return (
      <div className="p-6">
        <p className="text-sm text-primary-muted">Workspace not found.</p>
      </div>
    );
  }

  const loadingConversation =
    conversationsLoading || (shouldFetchSingle && singleLoading && !singleError);
  if (loadingConversation && !conversation) {
    return <LoadingState message="Loading conversation…" />;
  }

  if (shouldFetchSingle && singleError) {
    const status = (singleErrorDetail as Error & { status?: number }).status;
    const message =
      status === 403
        ? "You don't have access to this conversation."
        : status === 404
          ? "Conversation not found."
          : "Something went wrong. Please try again.";
    return (
      <div className="p-6">
        <ErrorState message={message} />
      </div>
    );
  }

  if (!conversation && conversations !== undefined) {
    return (
      <div className="p-6">
        <ErrorState message="Conversation not found or you don't have access." />
      </div>
    );
  }
  if (!conversation) {
    return null;
  }

  const messageError =
    sendMessage.error ?? updateMessage.error ?? deleteMessage.error;
  const messageErrorString =
    messageError instanceof Error ? messageError.message : null;

  const conversationMemberIds = conversation.members?.map((m) => m.user_id) ?? [];
  const presentInConversation = presentUsers.filter((u) => conversationMemberIds.includes(u.id));
  const typingNames = typingUserIds
    .map((id) => conversation.members?.find((m) => m.user_id === id)?.user?.name ?? presentInConversation.find((u) => u.id === id)?.name ?? "Someone")
    .filter(Boolean);

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      <ConfirmDialog
        open={messageToDelete !== null}
        onOpenChange={(open) => !open && setMessageToDelete(null)}
        title="Delete message"
        description="Are you sure you want to delete this message? This cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={confirmDelete}
      />
      <ConversationHeader
        conversation={conversation}
        currentUserId={currentUserId}
        presentUsers={presentInConversation}
        typingNames={typingNames}
        onOpenDetails={() => setDetailsDrawerOpen(true)}
      />
      {messageErrorString && (
        <div
          className="shrink-0 mx-4 mt-2 flex items-center justify-between gap-2 rounded-md border border-state-danger/30 bg-state-danger/10 px-3 py-2 text-sm text-state-danger"
          role="alert"
        >
          <span>{messageErrorString}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-state-danger hover:bg-state-danger/10"
            onClick={() => {
              sendMessage.reset();
              updateMessage.reset();
              deleteMessage.reset();
            }}
            aria-label="Dismiss error"
          >
            Dismiss
          </Button>
        </div>
      )}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        <MessageList
          messages={messages}
          isLoading={isLoading}
        currentUserId={currentUserId}
        workspaceId={workspaceId}
        conversationId={conversationId}
        onReply={setReplyTo}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onLoadOlder={hasNextPage ? fetchNextPage : undefined}
        isLoadingOlder={isFetchingNextPage}
        error={messagesError}
        onRetry={messagesError ? () => refetchMessages() : undefined}
        />
      </div>
      <MessageComposer
        conversation={conversation}
        currentUserId={currentUserId}
        disabled={sendMessage.isPending}
        onSubmit={handleSend}
        replyTo={replyTo}
        onClearReply={() => setReplyTo(null)}
        onTyping={emitTyping}
      />
      <Drawer open={detailsDrawerOpen} onOpenChange={setDetailsDrawerOpen} side="right">
        <div className="flex flex-col h-full min-h-0 overflow-hidden">
          <ChatDetailsPanel
            conversation={conversation}
            workspaceId={workspaceId}
            currentUserId={currentUserId}
            className="border-0"
          />
        </div>
      </Drawer>
    </div>
  );
}
