"use client";

import { useState } from "react";
import { MoreHorizontal, Reply, Pin, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Message } from "@/types/api";
import { useAddReaction, usePinMessage } from "@/hooks/use-messages";
import { MessageBubbleText } from "./message-bubble-text";
import { MessageBubbleMeta } from "./message-bubble-meta";
import { MessageBubbleAttachments } from "./message-bubble-attachments";
import { Dropdown, DropdownItem } from "@/components/ui/dropdown";
import { IconButton } from "@/components/ui/icon-button";

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
        "group relative rounded-2xl px-4 py-2.5 max-w-[85%]",
        isOwn
          ? "bg-message-own ml-auto"
          : "bg-message-other mr-0"
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
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
            <Dropdown
              align="end"
              side="bottom"
              trigger={
                <IconButton
                  icon={<MoreHorizontal className="size-4" />}
                  aria-label="Message actions"
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 text-primary-muted hover:text-primary"
                />
              }
            >
              <div className="py-1">
                <DropdownItem onClick={() => onReply(message)} className="flex items-center gap-2">
                  <Reply className="size-4 shrink-0" />
                  Reply
                </DropdownItem>
                {workspaceId && conversationId && (
                  <DropdownItem
                    onClick={() =>
                      pinMessage.mutate({
                        messageId: message.id,
                        pin: !message.pinned_at,
                      })
                    }
                    disabled={pinMessage.isPending}
                    className="flex items-center gap-2"
                  >
                    <Pin className="size-4 shrink-0" />
                    {message.pinned_at ? "Unpin" : "Pin"}
                  </DropdownItem>
                )}
                {isOwn && (
                  <>
                    <DropdownItem
                      onClick={() => {
                        setEditBody(message.body);
                        setEditing(true);
                      }}
                      className="flex items-center gap-2"
                    >
                      <Pencil className="size-4 shrink-0" />
                      Edit
                    </DropdownItem>
                    <DropdownItem
                      onClick={() => onDelete(message)}
                      className="flex items-center gap-2 text-state-danger focus:text-state-danger"
                    >
                      <Trash2 className="size-4 shrink-0" />
                      Delete
                    </DropdownItem>
                  </>
                )}
              </div>
            </Dropdown>
          </div>
          <MessageBubbleAttachments attachments={message.attachments ?? []} />
          <div className={cn("flex items-center gap-2 mt-1", isOwn ? "justify-end" : "justify-start")}>
            <MessageBubbleMeta time={message.created_at} className="text-[11px] opacity-90" />
          </div>
          {workspaceId && conversationId && (message.reactions?.length ?? 0) > 0 && (
            <div className="flex flex-wrap items-center gap-1 mt-1.5">
              {(message.reactions ?? []).map((r) => (
                <button
                  key={r.emoji}
                  type="button"
                  onClick={() =>
                    addReaction.mutate({ messageId: message.id, emoji: r.emoji })
                  }
                  disabled={addReaction.isPending}
                  className={cn(
                    "text-xs rounded-md px-1.5 py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1",
                    (message.current_user_reacted ?? []).includes(r.emoji)
                      ? "bg-brand-soft/80 text-message-own-text"
                      : "bg-black/5 text-primary-muted hover:bg-black/10"
                  )}
                  aria-label={`React ${r.emoji} (${r.count})`}
                >
                  {r.emoji} {r.count > 1 ? r.count : ""}
                </button>
              ))}
            </div>
          )}
          {workspaceId && conversationId && (
            <div
              className={cn(
                "absolute opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 py-1 px-1.5 rounded-lg border border-border-default bg-surface shadow-card z-10",
                isOwn ? "bottom-0 right-0 -translate-y-full translate-x-0" : "bottom-0 left-0 -translate-y-full"
              )}
            >
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
                  className="p-1 rounded hover:bg-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1 text-base leading-none"
                  aria-label={`React with ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
