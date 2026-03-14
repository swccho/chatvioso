import { create } from "zustand";
import type { Conversation } from "@/types/api";

interface ConversationStore {
  currentConversation: Conversation | null;
  setCurrentConversation: (conversation: Conversation | null) => void;
}

export const useConversationStore = create<ConversationStore>((set) => ({
  currentConversation: null,
  setCurrentConversation: (conversation) => set({ currentConversation: conversation }),
}));
