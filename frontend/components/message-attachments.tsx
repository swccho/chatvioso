"use client";

import { useEffect, useRef, useState } from "react";
import type { Attachment } from "@/types/api";
import { getToken } from "@/lib/api-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://chatvioso.test";

function getDownloadUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${API_URL}/api${p}`;
}

function isImageMime(mime: string): boolean {
  return mime.startsWith("image/");
}

export function MessageAttachments({ attachments }: { attachments: Attachment[] }) {
  if (!attachments?.length) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {attachments.map((att) => (
        <AttachmentBlock key={att.id} attachment={att} />
      ))}
    </div>
  );
}

function AttachmentBlock({ attachment }: { attachment: Attachment }) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const blobUrlRef = useRef<string | null>(null);
  const isImage = isImageMime(attachment.mime_type);

  useEffect(() => {
    if (!isImage) return;
    const token = getToken();
    const url = getDownloadUrl(attachment.download_url);
    const headers: HeadersInit = {};
    if (token) (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    fetch(url, { headers })
      .then((r) => (r.ok ? r.blob() : Promise.reject()))
      .then((blob) => {
        const u = URL.createObjectURL(blob);
        blobUrlRef.current = u;
        setBlobUrl(u);
      })
      .catch(() => setError(true));
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [attachment.download_url, attachment.mime_type, isImage]);

  const handleDownload = async () => {
    const token = getToken();
    const url = getDownloadUrl(attachment.download_url);
    const headers: HeadersInit = {};
    if (token) (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    const res = await fetch(url, { headers });
    if (!res.ok) return;
    const blob = await res.blob();
    const u = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = u;
    a.download = attachment.original_name;
    a.click();
    URL.revokeObjectURL(u);
  };

  if (isImage) {
    if (error) {
      return (
        <button
          type="button"
          onClick={handleDownload}
          className="text-sm text-primary-secondary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 rounded"
        >
          {attachment.original_name}
        </button>
      );
    }
    if (blobUrl) {
      return (
        <a
          href={blobUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block max-w-[200px] rounded border border-border-muted overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        >
          <img
            src={blobUrl}
            alt={attachment.original_name}
            className="max-h-40 w-auto object-cover"
          />
        </a>
      );
    }
    return (
      <span className="text-sm text-primary-muted">
        Loading… {attachment.original_name}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      className="inline-flex items-center gap-1 rounded border border-border-muted bg-surface-muted px-2 py-1 text-sm text-primary hover:bg-surface-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
    >
      {attachment.original_name}
      <span className="text-xs text-primary-muted">
        ({(attachment.size / 1024).toFixed(1)} KB)
      </span>
    </button>
  );
}
