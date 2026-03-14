import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MessageBubble } from "@/components/message-bubble";
import type { Message } from "@/types/api";

vi.mock("@/hooks/use-messages", () => ({
  useAddReaction: () => ({ mutate: vi.fn(), isPending: false }),
  usePinMessage: () => ({ mutate: vi.fn(), isPending: false }),
}));

const baseMessage: Message = {
  id: 1,
  conversation_id: 1,
  user_id: 1,
  body: "Hello world",
  parent_id: null,
  type: "message",
  created_at: "2024-01-01T12:00:00Z",
  updated_at: "2024-01-01T12:00:00Z",
  user: { id: 1, name: "Alice", email: "alice@example.com" },
  reactions: [],
  current_user_reacted: [],
  pinned_at: null,
  attachments: [],
};

describe("MessageBubble", () => {
  it("renders message body", () => {
    render(
      <MessageBubble
        message={baseMessage}
        isOwn={false}
        workspaceId={1}
        conversationId={1}
        onReply={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    expect(screen.getByText("Hello world")).toBeInTheDocument();
  });

  it("renders sender name for other user message", () => {
    render(
      <MessageBubble
        message={baseMessage}
        isOwn={false}
        workspaceId={1}
        conversationId={1}
        onReply={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

  it("calls onReply when Reply clicked", () => {
    const onReply = vi.fn();
    render(
      <MessageBubble
        message={baseMessage}
        isOwn={false}
        workspaceId={1}
        conversationId={1}
        onReply={onReply}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    const replyBtn = screen.getByRole("button", { name: /reply to this message/i });
    fireEvent.click(replyBtn);
    expect(onReply).toHaveBeenCalledWith(baseMessage);
  });

  it("calls onDelete when Delete clicked for own message", () => {
    const onDelete = vi.fn();
    render(
      <MessageBubble
        message={{ ...baseMessage, user_id: 99 }}
        isOwn={true}
        workspaceId={1}
        conversationId={1}
        onReply={vi.fn()}
        onEdit={vi.fn()}
        onDelete={onDelete}
      />
    );
    const deleteBtn = screen.getByRole("button", { name: /delete this message/i });
    fireEvent.click(deleteBtn);
    expect(onDelete).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
  });
});
