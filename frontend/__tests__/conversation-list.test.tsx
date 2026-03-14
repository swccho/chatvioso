import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { getConversationDisplayName, ConversationList } from "@/components/conversation-list";
import type { Conversation } from "@/types/api";

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

const mockUseWorkspaceStore = vi.fn();
const mockUseConversationStore = vi.fn();
const mockUseCurrentUser = vi.fn();
const mockUseConversations = vi.fn();

vi.mock("@/stores/workspace-store", () => ({
  useWorkspaceStore: (selector?: (s: { currentWorkspace: unknown }) => unknown) => {
    const state = mockUseWorkspaceStore();
    return selector ? selector(state) : state;
  },
}));

vi.mock("@/stores/conversation-store", () => ({
  useConversationStore: () => mockUseConversationStore(),
}));

vi.mock("@/hooks/use-current-user", () => ({
  useCurrentUser: () => mockUseCurrentUser(),
}));

vi.mock("@/hooks/use-conversations", () => ({
  useConversations: (id: number | null) => mockUseConversations(id),
}));

describe("getConversationDisplayName", () => {
  it("returns conversation name when set", () => {
    const conv = { name: "General", type: "channel", members: [] } as Conversation;
    expect(getConversationDisplayName(conv, 1)).toBe("General");
  });

  it("returns other user name for direct conversation", () => {
    const conv = {
      name: null,
      type: "direct",
      members: [
        { user_id: 1, user: { name: "Me" } },
        { user_id: 2, user: { name: "Alice" } },
      ],
    } as unknown as Conversation;
    expect(getConversationDisplayName(conv, 1)).toBe("Alice");
  });

  it("returns default for direct when no other member", () => {
    const conv = { name: null, type: "direct", members: [] } as Conversation;
    expect(getConversationDisplayName(conv, 1)).toBe("Conversation");
  });
});

describe("ConversationList", () => {
  beforeEach(() => {
    mockUseWorkspaceStore.mockReturnValue({ currentWorkspace: { id: 1, name: "WS" } });
    mockUseConversationStore.mockReturnValue({ currentConversation: null });
    mockUseCurrentUser.mockReturnValue({ data: { id: 1, name: "Me" } });
    mockUseConversations.mockReturnValue({ data: [], isLoading: false });
  });

  it("shows empty state when no conversations", () => {
    mockUseConversations.mockReturnValue({ data: [], isLoading: false });
    render(<ConversationList />);
    expect(screen.getByText("No conversations yet")).toBeInTheDocument();
  });

  it("shows loading state when loading", () => {
    mockUseConversations.mockReturnValue({ data: undefined, isLoading: true });
    render(<ConversationList />);
    expect(screen.getByText("Loading conversations…")).toBeInTheDocument();
  });

  it("shows select workspace when no current workspace", () => {
    mockUseWorkspaceStore.mockReturnValue({ currentWorkspace: null });
    render(<ConversationList />);
    expect(screen.getByText("Select a workspace")).toBeInTheDocument();
  });
});
