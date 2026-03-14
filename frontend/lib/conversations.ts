import type {
  ApiSuccess,
  Conversation,
  ConversationMember,
} from "@/types/api";
import { apiRequest } from "./api-client";

export async function fetchConversations(
  workspaceId: number
): Promise<Conversation[]> {
  const res = await apiRequest<ApiSuccess<Conversation[]>>(
    `/workspaces/${workspaceId}/conversations`
  );
  return res.data;
}

export async function createDirectConversation(
  workspaceId: number,
  otherUserId: number
): Promise<Conversation> {
  const res = await apiRequest<ApiSuccess<Conversation>>(
    `/workspaces/${workspaceId}/conversations/direct`,
    { method: "POST", body: JSON.stringify({ other_user_id: otherUserId }) }
  );
  return res.data;
}

export async function createGroupConversation(
  workspaceId: number,
  name: string,
  memberIds: number[]
): Promise<Conversation> {
  const res = await apiRequest<ApiSuccess<Conversation>>(
    `/workspaces/${workspaceId}/conversations/group`,
    { method: "POST", body: JSON.stringify({ name, member_ids: memberIds }) }
  );
  return res.data;
}

export async function createChannel(
  workspaceId: number,
  name: string,
  isPrivate = false
): Promise<Conversation> {
  const res = await apiRequest<ApiSuccess<Conversation>>(
    `/workspaces/${workspaceId}/conversations/channel`,
    { method: "POST", body: JSON.stringify({ name, is_private: isPrivate }) }
  );
  return res.data;
}

export async function fetchConversation(
  workspaceId: number,
  conversationId: number
): Promise<Conversation> {
  const res = await apiRequest<ApiSuccess<Conversation>>(
    `/workspaces/${workspaceId}/conversations/${conversationId}`
  );
  return res.data;
}

export async function updateConversation(
  workspaceId: number,
  conversationId: number,
  data: { name?: string }
): Promise<Conversation> {
  const res = await apiRequest<ApiSuccess<Conversation>>(
    `/workspaces/${workspaceId}/conversations/${conversationId}`,
    { method: "PUT", body: JSON.stringify(data) }
  );
  return res.data;
}

export async function fetchConversationMembers(
  workspaceId: number,
  conversationId: number
): Promise<ConversationMember[]> {
  const res = await apiRequest<ApiSuccess<ConversationMember[]>>(
    `/workspaces/${workspaceId}/conversations/${conversationId}/members`
  );
  return res.data;
}

export async function markConversationRead(
  workspaceId: number,
  conversationId: number
): Promise<void> {
  await apiRequest(
    `/workspaces/${workspaceId}/conversations/${conversationId}/read`,
    { method: "POST" }
  );
}
