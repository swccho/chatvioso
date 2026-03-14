"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ComposerContainer } from "./composer-container";
import { ComposerTextarea } from "./composer-textarea";
import { ComposerActions } from "./composer-actions";
import { ComposerAttachmentButton } from "./composer-attachment-button";
import { ComposerSendButton } from "./composer-send-button";
import { AttachmentPreviewList } from "./attachment-preview-list";
import { ComposerReplyPreview } from "./composer-reply-preview";
import type { Message } from "@/types/api";
import type { Conversation } from "@/types/api";

const TYPING_DEBOUNCE_MS = 1500;
const MAX_ATTACHMENTS = 5;

export interface MessageComposerProps {
  conversation: Conversation | null;
  currentUserId: number;
  disabled?: boolean;
  onSubmit: (body: string, parentId?: number | null, files?: File[]) => void;
  replyTo: Message | null;
  onClearReply: () => void;
  onTyping?: () => void;
}

export function MessageComposer({
  conversation,
  currentUserId,
  disabled,
  onSubmit,
  replyTo,
  onClearReply,
  onTyping,
}: MessageComposerProps) {
  const [body, setBody] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (replyTo) {
      // Focus is handled by ComposerTextarea ref if needed; container doesn't hold ref
    }
  }, [replyTo]);

  const scheduleTyping = useCallback(() => {
    if (!onTyping) return;
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    onTyping();
    typingTimeoutRef.current = setTimeout(() => {
      typingTimeoutRef.current = null;
    }, TYPING_DEBOUNCE_MS);
  }, [onTyping]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  const submitIfAllowed = useCallback(() => {
    const trimmed = body.trim();
    if (!trimmed && files.length === 0) return;
    onSubmit(trimmed || " ", replyTo?.id ?? null, files.length ? files : undefined);
    setBody("");
    setFiles([]);
    onClearReply();
  }, [body, files, replyTo?.id, onSubmit, onClearReply]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitIfAllowed();
  };

  const addFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const added = Array.from(e.target.files ?? []);
    setFiles((prev) => [...prev, ...added].slice(0, MAX_ATTACHMENTS));
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const openFileInput = () => fileInputRef.current?.click();

  const canSend = Boolean(body.trim() || files.length > 0);
  const isDisabled = disabled ?? false;

  if (!conversation) {
    return (
      <ComposerContainer>
        <p className="text-sm text-primary-muted">Select a conversation to send messages.</p>
      </ComposerContainer>
    );
  }

  return (
    <ComposerContainer>
      {replyTo && (
        <ComposerReplyPreview replyTo={replyTo} onClear={onClearReply} />
      )}
      <AttachmentPreviewList files={files} onRemove={removeFile} />
      <form onSubmit={handleSubmit} className="flex gap-3 items-end">
        <label htmlFor="message-composer-input" className="sr-only">
          Message
        </label>
        <ComposerTextarea
          value={body}
          onChange={(v) => {
            setBody(v);
            scheduleTyping();
          }}
          onSubmit={submitIfAllowed}
          disabled={isDisabled}
        />
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.txt"
          className="hidden"
          onChange={addFiles}
          aria-hidden
        />
        <ComposerActions>
          <ComposerAttachmentButton onClick={openFileInput} disabled={isDisabled} />
          <ComposerSendButton
            disabled={!canSend || isDisabled}
            loading={isDisabled}
          />
        </ComposerActions>
      </form>
    </ComposerContainer>
  );
}
