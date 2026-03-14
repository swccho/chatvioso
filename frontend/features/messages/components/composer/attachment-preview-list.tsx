"use client";

import { cn } from "@/lib/utils";

export interface AttachmentPreviewListProps {
  files: File[];
  onRemove: (index: number) => void;
  className?: string;
}

export function AttachmentPreviewList({
  files,
  onRemove,
  className,
}: AttachmentPreviewListProps) {
  if (files.length === 0) return null;

  return (
    <div
      className={cn("mb-2 flex flex-wrap gap-2", className)}
      role="list"
      aria-label="Attachments"
    >
      {files.map((file, i) => (
        <span
          key={`${file.name}-${i}`}
          className="inline-flex items-center gap-1.5 rounded-md bg-surface-muted px-2.5 py-1.5 text-sm text-primary"
          role="listitem"
        >
          <span className="truncate max-w-[120px]" title={file.name}>
            {file.name}
          </span>
          <button
            type="button"
            onClick={() => onRemove(i)}
            className="shrink-0 text-primary-muted hover:text-primary focus:outline-none focus:ring-2 focus:ring-brand rounded p-0.5"
            aria-label={`Remove ${file.name}`}
          >
            ×
          </button>
        </span>
      ))}
    </div>
  );
}
