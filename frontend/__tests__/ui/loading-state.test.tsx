import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LoadingState } from "@/components/ui/loading-state";

describe("LoadingState", () => {
  it("renders default loading message", () => {
    render(<LoadingState />);
    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });

  it("renders custom message", () => {
    render(<LoadingState message="Fetching…" />);
    expect(screen.getByText("Fetching…")).toBeInTheDocument();
  });
});
