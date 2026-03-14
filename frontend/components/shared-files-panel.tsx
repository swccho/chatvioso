"use client";

import { Button } from "@/components/ui/button";
import { InlineLoader } from "@/components/shared/inline-loader";
import { EmptyState } from "@/components/shared/empty-state";
import { RetryBlock } from "@/components/shared/retry-block";
import { useConversationFiles } from "@/hooks/use-messages";
import { getToken } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import type { Attachment } from "@/types/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://chatvioso.test";

function getDownloadUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${API_URL}/api${p}`;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatFileDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: d.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
    });
  } catch {
    return "";
  }
}

export function SharedFilesPanel({
  workspaceId,
  conversationId,
  showTitle = true,
}: {
  workspaceId: number;
  conversationId: number;
  showTitle?: boolean;
}) {
  const { data, isLoading, isError, refetch } = useConversationFiles(
    workspaceId,
    conversationId
  );
  const files = data?.data ?? [];

  const handleDownload = async (att: Attachment) => {
    const token = getToken();
    const url = getDownloadUrl(att.download_url);
    const headers: HeadersInit = {};
    if (token)
      (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    const res = await fetch(url, { headers });
    if (!res.ok) return;
    const blob = await res.blob();
    const u = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = u;
    a.download = att.original_name;
    a.click();
    URL.revokeObjectURL(u);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <InlineLoader aria-label="Loading shared files" />
      </div>
    );
  }

  if (isError) {
    return (
      <RetryBlock
        message="Couldn’t load shared files."
        onRetry={() => refetch()}
        retryLabel="Try again"
        className="py-4"
      />
    );
  }

  if (files.length === 0) {
    return (
      <div className="py-4">
        <EmptyState
          title="No files shared yet"
          description="Files shared in this conversation will appear here."
          className="py-6"
        />
      </div>
    );
  }

  return (
    <ul className={cn("space-y-2", showTitle ? "mt-0" : "")} role="list">
      {files.map((att) => (
        <li
          key={att.id}
          className="flex flex-col gap-0.5 min-w-0 rounded-md border border-border-muted bg-surface-muted/50 px-3 py-2"
        >
          <div className="flex items-center justify-between gap-2 min-w-0">
            <span
              className="text-sm text-primary truncate"
              title={att.original_name}
            >
              {att.original_name}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="shrink-0 text-primary-muted h-8 px-2"
              onClick={() => handleDownload(att)}
              aria-label={`Download ${att.original_name}`}
            >
              Download
            </Button>
          </div>
          <div className="flex items-center gap-2 text-xs text-primary-muted">
            {att.size != null && (
              <span>{formatFileSize(att.size)}</span>
            )}
            {att.created_at && (
              <>
                {att.size != null && <span aria-hidden>·</span>}
                <span>{formatFileDate(att.created_at)}</span>
              </>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
