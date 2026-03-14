import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EmptyState } from "@/components/ui/empty-state";

describe("EmptyState", () => {
  it("renders title and optional description", () => {
    render(<EmptyState title="No items" description="Add one to get started." />);
    expect(screen.getByText("No items")).toBeInTheDocument();
    expect(screen.getByText("Add one to get started.")).toBeInTheDocument();
  });

  it("renders action button when onAction and actionLabel provided", () => {
    const onAction = vi.fn();
    render(
      <EmptyState
        title="Empty"
        actionLabel="Create"
        onAction={onAction}
      />
    );
    const btn = screen.getByRole("button", { name: /create/i });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it("does not render button when onAction is missing", () => {
    render(<EmptyState title="Empty" actionLabel="Create" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
