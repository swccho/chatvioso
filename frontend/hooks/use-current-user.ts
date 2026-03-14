"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchCurrentUser } from "@/lib/auth";
import { getToken } from "@/lib/api-client";

export function useCurrentUser() {
  const hasToken = typeof window !== "undefined" && !!getToken();

  return useQuery({
    queryKey: ["currentUser"],
    queryFn: fetchCurrentUser,
    enabled: hasToken,
    staleTime: 5 * 60 * 1000,
  });
}
