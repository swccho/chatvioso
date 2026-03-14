"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";

export function SearchForm({ workspaceId }: { workspaceId: number }) {
  const router = useRouter();
  const [q, setQ] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = q.trim();
    if (trimmed) {
      router.push(
        `/app/workspaces/${workspaceId}/search?q=${encodeURIComponent(trimmed)}`
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-2">
      <label htmlFor="workspace-search" className="sr-only">
        Search workspace
      </label>
      <Input
        id="workspace-search"
        type="search"
        placeholder="Search…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="h-9 text-sm border-border-muted bg-surface text-primary placeholder:text-primary-muted"
        aria-label="Search workspace"
      />
    </form>
  );
}
