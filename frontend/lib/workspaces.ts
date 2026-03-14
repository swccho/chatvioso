import type { ApiSuccess, Workspace, WorkspaceMember, WorkspaceInvitation } from "@/types/api";
import { apiRequest, getToken } from "./api-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://chatvioso.test";

export async function fetchWorkspaces(): Promise<Workspace[]> {
  const res = await apiRequest<ApiSuccess<Workspace[]>>("/workspaces");
  return res.data;
}

export async function fetchWorkspace(id: number): Promise<Workspace> {
  const res = await apiRequest<ApiSuccess<Workspace>>(`/workspaces/${id}`);
  return res.data;
}

export async function createWorkspace(name: string, description?: string): Promise<Workspace> {
  const res = await apiRequest<ApiSuccess<Workspace>>("/workspaces", {
    method: "POST",
    body: JSON.stringify({ name, description: description ?? null }),
  });
  return res.data;
}

export async function updateWorkspace(
  id: number,
  data: { name?: string; description?: string; slug?: string | null }
): Promise<Workspace> {
  const res = await apiRequest<ApiSuccess<Workspace>>(`/workspaces/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function uploadWorkspaceLogo(
  workspaceId: number,
  file: File
): Promise<{ logo_url: string }> {
  const token = getToken();
  const formData = new FormData();
  formData.append("logo", file);
  const headers: HeadersInit = { Accept: "application/json" };
  if (token) (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_URL}/api/workspaces/${workspaceId}/logo`, {
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
  return (data as ApiSuccess<{ logo_url: string }>).data;
}

export async function fetchWorkspaceMembers(workspaceId: number): Promise<WorkspaceMember[]> {
  const res = await apiRequest<ApiSuccess<WorkspaceMember[]>>(
    `/workspaces/${workspaceId}/members`
  );
  return res.data;
}

export async function updateMemberRole(
  workspaceId: number,
  memberId: number,
  role: string
): Promise<WorkspaceMember> {
  const res = await apiRequest<ApiSuccess<WorkspaceMember>>(
    `/workspaces/${workspaceId}/members/${memberId}`,
    { method: "PUT", body: JSON.stringify({ role }) }
  );
  return res.data;
}

export async function removeMember(
  workspaceId: number,
  memberId: number
): Promise<void> {
  await apiRequest(`/workspaces/${workspaceId}/members/${memberId}`, {
    method: "DELETE",
  });
}

export async function fetchWorkspaceInvitations(
  workspaceId: number
): Promise<WorkspaceInvitation[]> {
  const res = await apiRequest<ApiSuccess<WorkspaceInvitation[]>>(
    `/workspaces/${workspaceId}/invitations`
  );
  return res.data;
}

export async function inviteToWorkspace(
  workspaceId: number,
  email: string,
  role: string
): Promise<WorkspaceInvitation> {
  const res = await apiRequest<ApiSuccess<WorkspaceInvitation>>(
    `/workspaces/${workspaceId}/invitations`,
    { method: "POST", body: JSON.stringify({ email, role }) }
  );
  return res.data;
}

export async function acceptInvitation(token: string): Promise<WorkspaceMember> {
  const res = await apiRequest<ApiSuccess<WorkspaceMember>>(
    "/workspaces/invitations/accept",
    { method: "POST", body: JSON.stringify({ token }) }
  );
  return res.data;
}
