"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchWorkspaceInvitations,
  inviteToWorkspace as inviteApi,
} from "@/lib/workspaces";

export function useWorkspaceInvitations(workspaceId: number | null) {
  return useQuery({
    queryKey: ["workspace", workspaceId, "invitations"],
    queryFn: () => fetchWorkspaceInvitations(workspaceId!),
    enabled: !!workspaceId,
  });
}

export function useInviteToWorkspace(workspaceId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, role }: { email: string; role: string }) =>
      inviteApi(workspaceId!, email, role),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workspace", workspaceId, "invitations"],
      });
    },
  });
}
