import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ErrorState } from "@/components/ui/error-state";

describe("ErrorState", () => {
  it("renders title and message", () => {
    render(<ErrorState message="Something failed." />);
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Something failed.")).toBeInTheDocument();
  });

  it("renders custom title when provided", () => {
    render(<ErrorState title="Oops" message="Failed." />);
    expect(screen.getByText("Oops")).toBeInTheDocument();
  });

  it("renders retry button and calls onRetry when clicked", () => {
    const onRetry = vi.fn();
    render(<ErrorState message="Error" onRetry={onRetry} />);
    const btn = screen.getByRole("button", { name: /try again/i });
    fireEvent.click(btn);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("does not render retry button when onRetry is missing", () => {
    render(<ErrorState message="Error" />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
