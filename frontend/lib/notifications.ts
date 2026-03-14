import type { ApiSuccess } from "@/types/api";
import { apiRequest } from "./api-client";

export interface NotificationItem {
  id: string;
  type: string;
  data: {
    type?: string;
    title?: string;
    body?: string;
    link?: string;
    workspace_id?: number;
    invitation_id?: number;
  };
  read_at: string | null;
  created_at: string;
}

export interface NotificationsResponse {
  data: NotificationItem[];
  meta: { current_page: number; last_page: number; total: number };
}

export async function fetchNotifications(unreadOnly = false): Promise<NotificationsResponse> {
  const res = await apiRequest<ApiSuccess<NotificationsResponse>>(
    `/notifications?per_page=20${unreadOnly ? "&unread_only=1" : ""}`
  );
  return res.data;
}

export async function markNotificationRead(id: string): Promise<void> {
  await apiRequest(`/notifications/${id}/read`, { method: "POST" });
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiRequest("/notifications/read-all", { method: "POST" });
}

export async function fetchUnreadCount(): Promise<number> {
  const res = await apiRequest<ApiSuccess<{ count: number }>>(
    "/notifications/unread-count"
  );
  return res.data.count;
}
