"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchProfile,
  updateProfile as updateProfileApi,
  uploadAvatar as uploadAvatarApi,
  updatePassword as updatePasswordApi,
  fetchNotificationPreferences,
  updateNotificationPreferences as updateNotificationPreferencesApi,
} from "@/lib/profile";
import type { UserSettings } from "@/types/api";

export const profileQueryKey = ["profile"];

export function useProfile() {
  return useQuery({
    queryKey: profileQueryKey,
    queryFn: fetchProfile,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfileApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileQueryKey });
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
}

export function useUploadAvatar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => uploadAvatarApi(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileQueryKey });
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: (data: {
      current_password: string;
      password: string;
      password_confirmation: string;
    }) => updatePasswordApi(data),
  });
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: [...profileQueryKey, "notification-preferences"],
    queryFn: fetchNotificationPreferences,
  });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (prefs: Partial<UserSettings>) =>
      updateNotificationPreferencesApi(prefs),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileQueryKey });
      queryClient.invalidateQueries({
        queryKey: [...profileQueryKey, "notification-preferences"],
      });
    },
  });
}
