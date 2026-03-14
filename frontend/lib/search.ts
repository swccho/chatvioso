import type { ApiSuccess } from "@/types/api";
import { apiRequest } from "./api-client";
import type { User } from "@/types/api";
import type { Conversation } from "@/types/api";
import type { Message } from "@/types/api";

export interface SearchResults {
  users: User[];
  conversations: Conversation[];
  messages: Message[];
}

export async function searchWorkspace(
  workspaceId: number,
  q: string,
  type: "users" | "conversations" | "messages" | "all" = "all"
): Promise<SearchResults> {
  const params = new URLSearchParams({ q, type });
  const res = await apiRequest<ApiSuccess<SearchResults>>(
    `/workspaces/${workspaceId}/search?${params}`
  );
  return res.data;
}
