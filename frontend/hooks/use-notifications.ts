"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchNotifications,
  markNotificationRead as markReadApi,
  markAllNotificationsRead as markAllReadApi,
  fetchUnreadCount,
} from "@/lib/notifications";

export const notificationsQueryKey = ["notifications"];

export function useNotifications(unreadOnly = false) {
  return useQuery({
    queryKey: [...notificationsQueryKey, unreadOnly],
    queryFn: () => fetchNotifications(unreadOnly),
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: [...notificationsQueryKey, "unread-count"],
    queryFn: fetchUnreadCount,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markReadApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsQueryKey });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllReadApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsQueryKey });
    },
  });
}
