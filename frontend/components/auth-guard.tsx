"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/use-current-user";
import { getToken } from "@/lib/api-client";

const FALLBACK_MESSAGE = "Loading…";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { data: user, isLoading, isFetched } = useCurrentUser();
  const hasToken = typeof window !== "undefined" && !!getToken();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!hasToken) {
      router.replace("/login");
      return;
    }
    if (!isLoading && isFetched && !user) {
      router.replace("/login");
    }
  }, [mounted, hasToken, isLoading, isFetched, user, router]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app">
        <p className="text-sm text-primary-muted">{FALLBACK_MESSAGE}</p>
      </div>
    );
  }

  if (!hasToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app">
        <p className="text-sm text-primary-muted">Redirecting to login…</p>
      </div>
    );
  }

  if (isLoading || (isFetched && !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app">
        <p className="text-sm text-primary-muted">{FALLBACK_MESSAGE}</p>
      </div>
    );
  }

  return <>{children}</>;
}
