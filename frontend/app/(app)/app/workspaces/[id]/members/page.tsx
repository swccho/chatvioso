"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { useWorkspaceMembers, useUpdateMemberRole, useRemoveMember } from "@/hooks/use-workspace-members";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { InlineLoader } from "@/components/shared/inline-loader";
import { EmptyState } from "@/components/shared/empty-state";
import {
  SettingsLayout,
  SettingsPageHeader,
  SettingsSection,
  SettingsCard,
  DangerZoneSection,
} from "@/features/settings/components";

export default function WorkspaceMembersPage() {
  const params = useParams();
  const router = useRouter();
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const id = Number(params.id);
  const { data: workspaces } = useWorkspaces();
  const workspace = workspaces?.find((w) => w.id === id);
  const { data: currentUser } = useCurrentUser();
  const { data: members, isLoading } = useWorkspaceMembers(id);
  const updateRole = useUpdateMemberRole(id);
  const removeMember = useRemoveMember(id);

  if (!workspace) {
    return (
      <SettingsLayout>
        <p className="text-sm text-primary-muted">Workspace not found.</p>
      </SettingsLayout>
    );
  }

  const canManage =
    workspace.role === "owner" || workspace.role === "admin";
  const currentMember = members?.find((m) => m.user_id === currentUser?.id);

  const handleLeaveClick = () => {
    if (!currentMember || currentMember.role === "owner") return;
    setLeaveDialogOpen(true);
  };

  const handleLeaveConfirm = () => {
    if (!currentMember || currentMember.role === "owner") return;
    removeMember.mutate(currentMember.id, {
      onSuccess: () => router.push("/app"),
    });
  };

  return (
    <SettingsLayout>
      <ConfirmDialog
        open={leaveDialogOpen}
        onOpenChange={setLeaveDialogOpen}
        title="Leave workspace"
        description={`Are you sure you want to leave ${workspace.name}? You will need to be re-invited to rejoin.`}
        confirmLabel="Leave"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={handleLeaveConfirm}
      />

      <SettingsPageHeader
        title="Members"
        description={workspace.name}
      />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <InlineLoader aria-label="Loading members" />
        </div>
      ) : !members?.length ? (
        <EmptyState
          title="No members yet"
          description="Invite people to this workspace from workspace settings."
          className="py-12"
        />
      ) : (
        <SettingsSection title="Members">
          <SettingsCard>
            <ul className="divide-y divide-border-muted" role="list">
              {members.map((m) => (
                <li
                  key={m.id}
                  className="py-3 flex flex-wrap items-center justify-between gap-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Avatar
                      src={m.user.avatar_url ?? undefined}
                      name={m.user.name}
                      size="sm"
                      className="shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-primary truncate">{m.user.name}</p>
                      <p className="text-xs text-primary-muted truncate">{m.user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-primary-muted capitalize">{m.role}</span>
                    {canManage && m.role !== "owner" && m.user_id !== currentUser?.id && (
                      <>
                        <select
                          className="rounded-md border border-border-muted bg-surface text-primary text-sm px-2 py-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-0"
                          value={m.role}
                          onChange={(e) =>
                            updateRole.mutate({
                              memberId: m.id,
                              role: e.target.value,
                            })
                          }
                          disabled={updateRole.isPending}
                          aria-label={`Change role for ${m.user.name}`}
                        >
                          <option value="admin">Admin</option>
                          <option value="member">Member</option>
                        </select>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeMember.mutate(m.id)}
                          disabled={removeMember.isPending}
                          aria-label={`Remove ${m.user.name} from workspace`}
                        >
                          Remove
                        </Button>
                      </>
                    )}
                    {m.user_id === currentUser?.id && m.role !== "owner" && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleLeaveClick}
                        disabled={removeMember.isPending}
                        aria-label="Leave workspace"
                      >
                        Leave workspace
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </SettingsCard>
        </SettingsSection>
      )}

      {currentMember && currentMember.role !== "owner" && (
        <DangerZoneSection
          title="Leave workspace"
          description="You will lose access to this workspace and need to be re-invited to rejoin."
        >
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleLeaveClick}
            disabled={removeMember.isPending}
          >
            Leave workspace
          </Button>
        </DangerZoneSection>
      )}
    </SettingsLayout>
  );
}
