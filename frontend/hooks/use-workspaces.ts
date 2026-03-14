"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchWorkspaces,
  createWorkspace as createWorkspaceApi,
  updateWorkspace as updateWorkspaceApi,
  uploadWorkspaceLogo as uploadWorkspaceLogoApi,
} from "@/lib/workspaces";
import { useWorkspaceStore } from "@/stores/workspace-store";

export function useWorkspaces() {
  return useQuery({
    queryKey: ["workspaces"],
    queryFn: fetchWorkspaces,
  });
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();
  const setCurrent = useWorkspaceStore((s) => s.setCurrentWorkspace);

  return useMutation({
    mutationFn: ({ name, description }: { name: string; description?: string }) =>
      createWorkspaceApi(name, description),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      setCurrent(data);
    },
  });
}

export function useUpdateWorkspace(workspaceId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name?: string; description?: string; slug?: string | null }) =>
      updateWorkspaceApi(workspaceId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      if (workspaceId) {
        queryClient.invalidateQueries({ queryKey: ["workspace", workspaceId] });
      }
    },
  });
}

export function useUploadWorkspaceLogo(workspaceId: number | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => uploadWorkspaceLogoApi(workspaceId!, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      if (workspaceId) {
        queryClient.invalidateQueries({ queryKey: ["workspace", workspaceId] });
      }
    },
  });
}
