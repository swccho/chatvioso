import type { Conversation } from "@/types/api";

export function getConversationDisplayName(
  conversation: Conversation,
  currentUserId: number
): string {
  if (conversation.name) return conversation.name;
  if (conversation.type === "direct" && conversation.members?.length) {
    const other = conversation.members.find((m) => m.user_id !== currentUserId);
    return other?.user?.name ?? "Direct message";
  }
  return "Conversation";
}
