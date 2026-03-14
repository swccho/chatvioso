import type { ApiSuccess, Message, MessageReactionItem } from "@/types/api";
import { apiRequest, getToken } from "./api-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://chatvioso.test";

export interface MessagesPage {
  messages: Message[];
  next_cursor: string | null;
  prev_cursor: string | null;
}

export async function fetchMessages(
  workspaceId: number,
  conversationId: number,
  cursor?: string | null,
  perPage = 20
): Promise<MessagesPage> {
  const params = new URLSearchParams();
  if (cursor) params.set("cursor", cursor);
  params.set("per_page", String(perPage));
  const q = params.toString();
  const res = await apiRequest<ApiSuccess<MessagesPage>>(
    `/workspaces/${workspaceId}/conversations/${conversationId}/messages${q ? `?${q}` : ""}`
  );
  return res.data;
}

export async function sendMessage(
  workspaceId: number,
  conversationId: number,
  body: string,
  parentId?: number | null,
  files?: File[]
): Promise<Message> {
  if (files?.length) {
    const formData = new FormData();
    formData.append("body", body);
    if (parentId != null) formData.append("parent_id", String(parentId));
    files.forEach((f) => formData.append("attachments[]", f));
    const token = getToken();
    const headers: HeadersInit = { Accept: "application/json" };
    if (token) (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    const res = await fetch(
      `${API_URL}/api/workspaces/${workspaceId}/conversations/${conversationId}/messages`,
      { method: "POST", body: formData, headers }
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message = (data as { message?: string }).message ?? "Request failed";
      const err = new Error(message) as Error & { status: number; errors?: Record<string, string[]> };
      err.status = res.status;
      err.errors = (data as { errors?: Record<string, string[]> }).errors;
      throw err;
    }
    return (data as ApiSuccess<Message>).data;
  }
  const res = await apiRequest<ApiSuccess<Message>>(
    `/workspaces/${workspaceId}/conversations/${conversationId}/messages`,
    {
      method: "POST",
      body: JSON.stringify({ body, parent_id: parentId ?? null }),
    }
  );
  return res.data;
}

export async function updateMessage(
  workspaceId: number,
  conversationId: number,
  messageId: number,
  body: string
): Promise<Message> {
  const res = await apiRequest<ApiSuccess<Message>>(
    `/workspaces/${workspaceId}/conversations/${conversationId}/messages/${messageId}`,
    { method: "PUT", body: JSON.stringify({ body }) }
  );
  return res.data;
}

export async function deleteMessage(
  workspaceId: number,
  conversationId: number,
  messageId: number
): Promise<void> {
  await apiRequest(
    `/workspaces/${workspaceId}/conversations/${conversationId}/messages/${messageId}`,
    { method: "DELETE" }
  );
}

export interface ReactionPayload {
  message_id: number;
  reactions: MessageReactionItem[];
  current_user_reacted: string[];
}

export async function addOrToggleReaction(
  workspaceId: number,
  conversationId: number,
  messageId: number,
  emoji: string
): Promise<ReactionPayload> {
  const res = await apiRequest<ApiSuccess<ReactionPayload>>(
    `/workspaces/${workspaceId}/conversations/${conversationId}/messages/${messageId}/reactions`,
    { method: "POST", body: JSON.stringify({ emoji }) }
  );
  return res.data;
}

export async function pinMessage(
  workspaceId: number,
  conversationId: number,
  messageId: number
): Promise<Message> {
  const res = await apiRequest<ApiSuccess<Message>>(
    `/workspaces/${workspaceId}/conversations/${conversationId}/messages/${messageId}/pin`,
    { method: "POST" }
  );
  return res.data;
}

export async function unpinMessage(
  workspaceId: number,
  conversationId: number,
  messageId: number
): Promise<Message> {
  const res = await apiRequest<ApiSuccess<Message>>(
    `/workspaces/${workspaceId}/conversations/${conversationId}/messages/${messageId}/pin`,
    { method: "DELETE" }
  );
  return res.data;
}

export async function fetchPinnedMessages(
  workspaceId: number,
  conversationId: number
): Promise<Message[]> {
  const res = await apiRequest<ApiSuccess<Message[] | { data: Message[] }>>(
    `/workspaces/${workspaceId}/conversations/${conversationId}/pinned`
  );
  const d = res.data;
  return Array.isArray(d) ? d : (d as { data?: Message[] }).data ?? [];
}

export interface ConversationFilesResponse {
  data: import("@/types/api").Attachment[];
  meta?: { current_page: number; last_page: number };
}

export async function fetchConversationFiles(
  workspaceId: number,
  conversationId: number,
  page = 1
): Promise<ConversationFilesResponse> {
  const res = await apiRequest<ApiSuccess<ConversationFilesResponse>>(
    `/workspaces/${workspaceId}/conversations/${conversationId}/files?page=${page}&per_page=20`
  );
  return res.data;
}
