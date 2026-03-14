"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Message } from "@/types/api";
import { useAddReaction, usePinMessage } from "@/hooks/use-messages";
import { MessageBubbleText } from "./message-bubble-text";
import { MessageBubbleMeta } from "./message-bubble-meta";
import { MessageBubbleAttachments } from "./message-bubble-attachments";

const QUICK_EMOJIS = ["👍", "❤️", "😂", "😮", "😢"];

export interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  workspaceId: number | null;
  conversationId: number | null;
  onReply: (message: Message) => void;
  onEdit: (message: Message, newBody: string) => void;
  onDelete: (message: Message) => void;
  showSenderName?: boolean;
  isFirstInGroup?: boolean;
}

export function MessageBubble({
  message,
  isOwn,
  workspaceId,
  conversationId,
  onReply,
  onEdit,
  onDelete,
  showSenderName = true,
  isFirstInGroup = true,
}: MessageBubbleProps) {
  const [editing, setEditing] = useState(false);
  const [editBody, setEditBody] = useState(message.body);
  const addReaction = useAddReaction(workspaceId, conversationId);
  const pinMessage = usePinMessage(workspaceId, conversationId);

  const handleSaveEdit = () => {
    if (editBody.trim() !== message.body) {
      onEdit(message, editBody.trim());
    }
    setEditing(false);
  };

  return (
    <div
      className={cn(
        "group relative rounded-2xl px-3 py-2 shadow-soft",
        isOwn
          ? "bg-message-own ml-8"
          : "bg-message-other mr-8"
      )}
    >
      <div className="flex items-baseline gap-2 flex-wrap">
        {showSenderName && !isOwn && message.user && (
          <span className="text-sm font-medium text-primary shrink-0">
            {message.user.name}
          </span>
        )}
        {message.parent_id && message.parent && (
          <span className="text-xs text-primary-muted italic">
            replying to {message.parent.user?.name ?? "message"}
          </span>
        )}
      </div>
      {editing ? (
        <div className="mt-1">
          <label htmlFor={`edit-message-${message.id}`} className="sr-only">
            Edit message
          </label>
          <textarea
            id={`edit-message-${message.id}`}
            value={editBody}
            onChange={(e) => setEditBody(e.target.value)}
            className="w-full rounded-md border border-border-muted bg-surface p-2 text-sm min-h-[60px] text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-0"
            aria-label="Edit message"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSaveEdit();
              }
              if (e.key === "Escape") setEditing(false);
            }}
          />
          <div className="flex gap-2 mt-1">
            <button
              type="button"
              onClick={handleSaveEdit}
              className="text-xs text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1 rounded"
              aria-label="Save edit"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="text-xs text-primary-muted hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1 rounded"
              aria-label="Cancel edit"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <MessageBubbleText isOwn={isOwn}>{message.body}</MessageBubbleText>
          <MessageBubbleAttachments attachments={message.attachments ?? []} />
          <div className="flex items-center justify-end gap-2 mt-1">
            <MessageBubbleMeta time={message.created_at} />
          </div>
          {workspaceId && conversationId && (
            <div className="flex flex-wrap items-center gap-1 mt-1">
              {(message.reactions ?? []).map((r) => (
                <button
                  key={r.emoji}
                  type="button"
                  onClick={() =>
                    addReaction.mutate({ messageId: message.id, emoji: r.emoji })
                  }
                  disabled={addReaction.isPending}
                  className={cn(
                    "text-sm rounded px-1.5 py-0.5 border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1",
                    (message.current_user_reacted ?? []).includes(r.emoji)
                      ? "bg-brand-soft border-brand"
                      : "bg-surface-muted border-border-muted hover:bg-surface"
                  )}
                  aria-label={`React ${r.emoji} (${r.count})`}
                >
                  {r.emoji} {r.count}
                </button>
              ))}
              {QUICK_EMOJIS.filter(
                (e) => !(message.reactions ?? []).some((r) => r.emoji === e)
              ).map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() =>
                    addReaction.mutate({ messageId: message.id, emoji })
                  }
                  disabled={addReaction.isPending}
                  className="text-sm rounded px-1.5 py-0.5 bg-surface-muted border border-border-muted hover:bg-surface opacity-0 group-hover:opacity-100 transition-opacity focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1"
                  aria-label={`React with ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
          <div
            className="absolute top-1 right-2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity flex gap-1"
            role="group"
            aria-label="Message actions"
          >
            <button
              type="button"
              onClick={() => onReply(message)}
              className="text-xs text-primary-muted hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1 rounded"
              aria-label="Reply to this message"
            >
              Reply
            </button>
            {workspaceId && conversationId && (
              <button
                type="button"
                onClick={() =>
                  pinMessage.mutate({
                    messageId: message.id,
                    pin: !message.pinned_at,
                  })
                }
                disabled={pinMessage.isPending}
                className="text-xs text-primary-muted hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1 rounded disabled:opacity-50"
                aria-label={message.pinned_at ? "Unpin" : "Pin"}
              >
                {message.pinned_at ? "Unpin" : "Pin"}
              </button>
            )}
            {isOwn && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setEditBody(message.body);
                    setEditing(true);
                  }}
                  className="text-xs text-primary-muted hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1 rounded"
                  aria-label="Edit this message"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(message)}
                  className="text-xs text-state-danger hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-state-danger focus-visible:ring-offset-1 rounded"
                  aria-label="Delete this message"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
