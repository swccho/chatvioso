import type { ApiSuccess, User, UserSettings } from "@/types/api";
import { apiRequest, getToken } from "./api-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://chatvioso.test";

export async function fetchProfile(): Promise<User> {
  const res = await apiRequest<ApiSuccess<User>>("/profile");
  return res.data;
}

export async function updateProfile(data: {
  name?: string;
  email?: string;
}): Promise<User> {
  const res = await apiRequest<ApiSuccess<User>>("/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function uploadAvatar(file: File): Promise<{ avatar_url: string }> {
  const token = getToken();
  const formData = new FormData();
  formData.append("avatar", file);
  const headers: HeadersInit = { Accept: "application/json" };
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_URL}/api/profile/avatar`, {
    method: "POST",
    body: formData,
    headers,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = (data as { message?: string }).message ?? "Upload failed";
    const err = new Error(message) as Error & { errors?: Record<string, string[]> };
    err.errors = (data as { errors?: Record<string, string[]> }).errors;
    throw err;
  }
  return (data as ApiSuccess<{ avatar_url: string }>).data;
}

export async function updatePassword(data: {
  current_password: string;
  password: string;
  password_confirmation: string;
}): Promise<void> {
  await apiRequest("/profile/password", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function fetchNotificationPreferences(): Promise<UserSettings> {
  const res = await apiRequest<ApiSuccess<UserSettings>>(
    "/profile/notification-preferences"
  );
  return res.data;
}

export async function updateNotificationPreferences(
  prefs: Partial<UserSettings>
): Promise<UserSettings> {
  const res = await apiRequest<ApiSuccess<UserSettings>>(
    "/profile/notification-preferences",
    { method: "PUT", body: JSON.stringify(prefs) }
  );
  return res.data;
}
