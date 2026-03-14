"use client";

import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { useWorkspaceSearch } from "@/hooks/use-search";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { SettingsLayout } from "@/features/settings/components";
import { PageHeader } from "@/components/shared/page-header";

export default function WorkspaceSearchPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const workspaceId = Number(params.id);
  const q = searchParams.get("q") ?? "";
  const type = (searchParams.get("type") as "users" | "conversations" | "messages" | "all") || "all";

  const { data: workspaces } = useWorkspaces();
  const workspace = workspaces?.find((w) => w.id === workspaceId);
  const { data, isLoading, error } = useWorkspaceSearch(workspaceId, q, type);

  if (!workspace) {
    return (
      <SettingsLayout>
        <p className="text-sm text-primary-muted">Workspace not found.</p>
      </SettingsLayout>
    );
  }

  return (
    <SettingsLayout>
      <div className="space-y-6">
        <PageHeader
          title={`Search in ${workspace.name}`}
          description={q.trim() ? `Results for "${q}"` : undefined}
        />
        {!q.trim() ? (
        <EmptyState
          title="Enter a search term"
          description="Search for users, conversations, or messages in this workspace."
        />
      ) : isLoading ? (
        <LoadingState message="Searching…" />
      ) : error ? (
        <ErrorState
          message={error instanceof Error ? error.message : "Search failed"}
          onRetry={() => window.location.reload()}
        />
      ) : !data ? null : (
        <div className="space-y-6">
          {(type === "users" || type === "all") && (
            <section aria-labelledby="search-users-heading">
              <h2 id="search-users-heading" className="text-sm font-medium text-primary">
                Users
              </h2>
              {data.users.length === 0 ? (
                <p className="text-sm text-primary-muted mt-1">No users found.</p>
              ) : (
                <ul className="mt-2 space-y-1" role="list">
                  {data.users.map((u) => (
                    <li key={u.id}>
                      <Link
                        href="/app/profile"
                        className="text-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 rounded"
                      >
                        {u.name} ({u.email})
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
          {(type === "conversations" || type === "all") && (
            <section aria-labelledby="search-conversations-heading">
              <h2 id="search-conversations-heading" className="text-sm font-medium text-primary">
                Conversations
              </h2>
              {data.conversations.length === 0 ? (
                <p className="text-sm text-primary-muted mt-1">No conversations found.</p>
              ) : (
                <ul className="mt-2 space-y-1" role="list">
                  {data.conversations.map((c) => (
                    <li key={c.id}>
                      <Link
                        href={`/app/workspaces/${workspaceId}/conversations/${c.id}`}
                        className="text-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 rounded"
                      >
                        {c.name ?? `Conversation ${c.id}`}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
          {(type === "messages" || type === "all") && (
            <section aria-labelledby="search-messages-heading">
              <h2 id="search-messages-heading" className="text-sm font-medium text-primary">
                Messages
              </h2>
              {data.messages.length === 0 ? (
                <p className="text-sm text-primary-muted mt-1">No messages found.</p>
              ) : (
                <ul className="mt-2 space-y-2" role="list">
                  {data.messages.map((m) => (
                    <li key={m.id}>
                      <Link
                        href={`/app/workspaces/${workspaceId}/conversations/${m.conversation_id}`}
                        className="block text-sm text-primary hover:bg-surface-muted rounded p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                      >
                        <span className="text-primary-muted">
                          {m.user?.name ?? "Someone"}:
                        </span>{" "}
                        {m.body.slice(0, 100)}
                        {m.body.length > 100 ? "…" : ""}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
        </div>
      )}
      </div>
    </SettingsLayout>
  );
}
