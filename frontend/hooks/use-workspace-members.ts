"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchWorkspaceMembers,
  updateMemberRole as updateMemberRoleApi,
  removeMember as removeMemberApi,
} from "@/lib/workspaces";

export function useWorkspaceMembers(workspaceId: number | null) {
  return useQuery({
    queryKey: ["workspace", workspaceId, "members"],
    queryFn: () => fetchWorkspaceMembers(workspaceId!),
    enabled: !!workspaceId,
  });
}

export function useUpdateMemberRole(workspaceId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memberId, role }: { memberId: number; role: string }) =>
      updateMemberRoleApi(workspaceId!, memberId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workspace", workspaceId, "members"],
      });
    },
  });
}

export function useRemoveMember(workspaceId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: number) => removeMemberApi(workspaceId!, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workspace", workspaceId, "members"],
      });
    },
  });
}
