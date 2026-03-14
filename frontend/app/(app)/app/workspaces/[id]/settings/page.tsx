"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { useUpdateWorkspace, useUploadWorkspaceLogo } from "@/hooks/use-workspaces";
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

export default function WorkspaceSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const { data: workspaces } = useWorkspaces();
  const workspace = workspaces?.find((w) => w.id === id);
  const updateWorkspace = useUpdateWorkspace(id);
  const uploadLogo = useUploadWorkspaceLogo(id);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (workspace) {
      setName(workspace.name);
      setSlug(workspace.slug ?? "");
      setDescription(workspace.description ?? "");
    }
  }, [workspace]);

  if (!workspace) {
    return (
      <SettingsLayout>
        <p className="text-sm text-primary-muted">Workspace not found or you don&apos;t have access.</p>
      </SettingsLayout>
    );
  }

  const isOwnerOrAdmin =
    workspace.role === "owner" || workspace.role === "admin";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwnerOrAdmin) return;
    updateWorkspace.mutate(
      { name, description: description || undefined, slug: slug || null },
      { onSuccess: () => router.refresh() }
    );
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadLogo.mutate(file);
    e.target.value = "";
  };

  return (
    <SettingsLayout>
      <SettingsPageHeader
        title="Workspace settings"
        description={workspace.name}
      />

      {isOwnerOrAdmin && (
        <>
          <SettingsSection title="Workspace info">
            <SettingsCard>
              <div className="flex items-start gap-4 mb-4">
                {workspace.logo_url ? (
                  <img
                    src={workspace.logo_url}
                    alt=""
                    className="w-16 h-16 rounded-lg object-cover border border-border-muted"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-surface-muted flex items-center justify-center text-primary-muted text-2xl font-medium border border-border-muted">
                    {workspace.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="hidden"
                    onChange={handleLogoChange}
                    aria-hidden
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={uploadLogo.isPending}
                  >
                    {uploadLogo.isPending ? "Uploading…" : "Change logo"}
                  </Button>
                </div>
              </div>

              <SettingsForm onSubmit={handleSubmit}>
                <SettingsFormRow>
                  <Label htmlFor="ws-name" className="text-primary">
                    Name
                  </Label>
                  <Input
                    id="ws-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={updateWorkspace.isPending}
                    className="border-border-muted bg-surface text-primary"
                  />
                </SettingsFormRow>
                <SettingsFormRow>
                  <Label htmlFor="ws-slug" className="text-primary">
                    Slug (optional)
                  </Label>
                  <Input
                    id="ws-slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    disabled={updateWorkspace.isPending}
                    className="border-border-muted bg-surface text-primary"
                  />
                </SettingsFormRow>
                <SettingsFormRow>
                  <Label htmlFor="ws-desc" className="text-primary">
                    Description
                  </Label>
                  <Input
                    id="ws-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={updateWorkspace.isPending}
                    className="border-border-muted bg-surface text-primary"
                  />
                </SettingsFormRow>
                {updateWorkspace.error && (
                  <FormErrorText>
                    {updateWorkspace.error instanceof Error
                      ? updateWorkspace.error.message
                      : "Update failed"}
                  </FormErrorText>
                )}
                <SettingsFormActions>
                  <Button type="submit" disabled={updateWorkspace.isPending}>
                    {updateWorkspace.isPending ? "Saving…" : "Save changes"}
                  </Button>
                </SettingsFormActions>
              </SettingsForm>
            </SettingsCard>
          </SettingsSection>
        </>
      )}

      {!isOwnerOrAdmin && (
        <p className="text-sm text-primary-muted" role="status">
          You don&apos;t have permission to edit workspace settings. Only owners and admins can update settings.
        </p>
      )}

      <SettingsSection title="Members &amp; leave">
        <SettingsCard>
          <p className="text-sm text-primary-muted">
            To leave this workspace or manage members, go to the{" "}
            <Link
              href={`/app/workspaces/${id}/members`}
              className="text-brand underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 rounded"
            >
              Members
            </Link>{" "}
            page.
          </p>
        </SettingsCard>
      </SettingsSection>
    </SettingsLayout>
  );
}
