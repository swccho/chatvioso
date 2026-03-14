"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useWorkspaces } from "@/hooks/use-workspaces";
import {
  useWorkspaceInvitations,
  useInviteToWorkspace,
} from "@/hooks/use-workspace-invitations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  SettingsLayout,
  SettingsPageHeader,
  SettingsSection,
  SettingsCard,
  SettingsForm,
  SettingsFormRow,
  SettingsFormActions,
} from "@/features/settings/components";
import { FormErrorText } from "@/components/shared/form-error-text";
import { InlineLoader } from "@/components/shared/inline-loader";
import { EmptyState } from "@/components/shared/empty-state";
import { RetryBlock } from "@/components/shared/retry-block";

const ROLES = [
  { value: "admin", label: "Admin" },
  { value: "member", label: "Member" },
];

export default function WorkspaceInvitationsPage() {
  const params = useParams();
  const id = Number(params.id);
  const { data: workspaces } = useWorkspaces();
  const workspace = workspaces?.find((w) => w.id === id);
  const { data: invitations, isLoading, isError, refetch } = useWorkspaceInvitations(id);
  const invite = useInviteToWorkspace(id);

  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");

  if (!workspace) {
    return (
      <SettingsLayout>
        <p className="text-sm text-primary-muted">Workspace not found.</p>
      </SettingsLayout>
    );
  }

  const canInvite =
    workspace.role === "owner" || workspace.role === "admin";

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    invite.mutate(
      { email, role },
      {
        onSuccess: () => setEmail(""),
      }
    );
  };

  return (
    <SettingsLayout>
      <SettingsPageHeader
        title="Invitations"
        description={workspace.name}
      />

      {canInvite && (
        <SettingsSection title="Invite by email">
          <SettingsCard>
            <SettingsForm onSubmit={handleInvite}>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 sm:flex-wrap sm:items-end">
                <div className="flex-1 w-full sm:min-w-[200px]">
                  <SettingsFormRow>
                    <Label htmlFor="invite-email" className="text-primary">
                      Email
                    </Label>
                    <Input
                      id="invite-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="colleague@example.com"
                      required
                      disabled={invite.isPending}
                      className="border-border-muted bg-surface text-primary"
                    />
                  </SettingsFormRow>
                </div>
                <div className="w-full sm:min-w-[120px]">
                  <SettingsFormRow>
                    <Label htmlFor="invite-role" className="text-primary">
                      Role
                    </Label>
                    <select
                      id="invite-role"
                      className="h-10 w-full rounded-md border border-border-muted bg-surface px-3 text-sm text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-0"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      disabled={invite.isPending}
                    >
                      {ROLES.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </SettingsFormRow>
                </div>
                <SettingsFormActions className="pt-0">
                  <Button type="submit" disabled={invite.isPending}>
                    {invite.isPending ? "Sending…" : "Send invite"}
                  </Button>
                </SettingsFormActions>
              </div>
              {invite.error && (
                <FormErrorText>
                  {invite.error instanceof Error
                    ? invite.error.message
                    : "Failed to send invite"}
                </FormErrorText>
              )}
            </SettingsForm>
          </SettingsCard>
        </SettingsSection>
      )}

      <SettingsSection title="Pending invitations">
        <SettingsCard>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <InlineLoader aria-label="Loading invitations" />
            </div>
          ) : isError ? (
            <RetryBlock
              message="Couldn’t load invitations."
              onRetry={() => refetch()}
              retryLabel="Try again"
              className="py-4"
            />
          ) : !invitations?.length ? (
            <EmptyState
              title="No pending invitations"
              description="Invitations you send will appear here until they’re accepted or expire."
              className="py-8"
            />
          ) : (
            <ul className="divide-y divide-border-muted" role="list">
              {invitations.map((inv) => (
                <li
                  key={inv.id}
                  className="py-3 flex flex-wrap items-center justify-between gap-2 first:pt-0 last:pb-0"
                >
                  <span className="text-sm text-primary truncate">{inv.email}</span>
                  <span className="text-xs text-primary-muted capitalize shrink-0">{inv.role}</span>
                </li>
              ))}
            </ul>
          )}
        </SettingsCard>
      </SettingsSection>
    </SettingsLayout>
  );
}
