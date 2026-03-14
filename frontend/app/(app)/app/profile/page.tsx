"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar } from "@/components/ui/avatar";
import {
  useProfile,
  useUpdateProfile,
  useUploadAvatar,
  useUpdatePassword,
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from "@/hooks/use-profile";
import { FullPageLoader } from "@/components/shared/full-page-loader";
import { ErrorState } from "@/components/shared/error-state";
import { FormErrorText } from "@/components/shared/form-error-text";
import {
  SettingsLayout,
  SettingsPageHeader,
  SettingsSection,
  SettingsCard,
  SettingsForm,
  SettingsFormRow,
  SettingsFormActions,
} from "@/features/settings/components";

export default function ProfilePage() {
  const { data: profile, isLoading, error } = useProfile();
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();
  const updatePassword = useUpdatePassword();
  const { data: notificationPrefs } = useNotificationPreferences();
  const updateNotificationPrefs = useUpdateNotificationPreferences();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [emailOnMention, setEmailOnMention] = useState(true);
  const [inAppNotifications, setInAppNotifications] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setEmail(profile.email);
      setEmailOnMention(profile.settings?.email_on_mention ?? true);
      setInAppNotifications(profile.settings?.in_app_notifications ?? true);
    }
  }, [profile]);

  useEffect(() => {
    if (notificationPrefs) {
      setEmailOnMention(notificationPrefs.email_on_mention);
      setInAppNotifications(notificationPrefs.in_app_notifications);
    }
  }, [notificationPrefs]);

  if (isLoading) return <FullPageLoader message="Loading profile…" />;
  if (error) {
    return (
      <SettingsLayout>
        <ErrorState
          message={error instanceof Error ? error.message : "Failed to load profile"}
        />
      </SettingsLayout>
    );
  }
  if (!profile) return null;

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(
      { name: name.trim() || undefined, email: email.trim() || undefined }
    );
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadAvatar.mutate(file);
    e.target.value = "";
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== newPasswordConfirm) return;
    updatePassword.mutate(
      {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: newPasswordConfirm,
      },
      {
        onSuccess: () => {
          setCurrentPassword("");
          setNewPassword("");
          setNewPasswordConfirm("");
        },
      }
    );
  };

  const handleNotificationPrefsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateNotificationPrefs.mutate({
      email_on_mention: emailOnMention,
      in_app_notifications: inAppNotifications,
    });
  };

  return (
    <SettingsLayout>
      <SettingsPageHeader
        title="Profile &amp; settings"
        description="Manage your account and preferences."
      />

      <div className="space-y-6">
        <SettingsSection title="Profile">
          <SettingsCard>
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="shrink-0 flex flex-col items-start gap-2">
                <Avatar
                  src={profile.avatar_url ?? undefined}
                  name={profile.name}
                  size="xl"
                  className="ring-2 ring-border-muted"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                  onChange={handleAvatarChange}
                  aria-hidden
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploadAvatar.isPending}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploadAvatar.isPending ? "Uploading…" : "Change photo"}
                </Button>
                {uploadAvatar.error && (
                  <FormErrorText>
                    {uploadAvatar.error instanceof Error
                      ? uploadAvatar.error.message
                      : "Upload failed"}
                  </FormErrorText>
                )}
              </div>
              <SettingsForm onSubmit={handleProfileSubmit} className="flex-1 min-w-0">
                <SettingsFormRow>
                  <Label htmlFor="profile-name" className="text-primary">
                    Name
                  </Label>
                  <Input
                    id="profile-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={updateProfile.isPending}
                    className="border-border-muted bg-surface text-primary"
                  />
                </SettingsFormRow>
                <SettingsFormRow>
                  <Label htmlFor="profile-email" className="text-primary">
                    Email
                  </Label>
                  <Input
                    id="profile-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={updateProfile.isPending}
                    className="border-border-muted bg-surface text-primary"
                  />
                </SettingsFormRow>
                {updateProfile.error && (
                  <FormErrorText>
                    {updateProfile.error instanceof Error
                      ? updateProfile.error.message
                      : "Update failed"}
                  </FormErrorText>
                )}
                <SettingsFormActions>
                  <Button type="submit" disabled={updateProfile.isPending}>
                    {updateProfile.isPending ? "Saving…" : "Save profile"}
                  </Button>
                </SettingsFormActions>
              </SettingsForm>
            </div>
          </SettingsCard>
        </SettingsSection>

        <SettingsSection title="Change password">
          <SettingsCard>
            <SettingsForm onSubmit={handlePasswordSubmit}>
              <SettingsFormRow>
                <Label htmlFor="current-password" className="text-primary">
                  Current password
                </Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  disabled={updatePassword.isPending}
                  autoComplete="current-password"
                  className="border-border-muted bg-surface text-primary"
                />
              </SettingsFormRow>
              <SettingsFormRow>
                <Label htmlFor="new-password" className="text-primary">
                  New password
                </Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  disabled={updatePassword.isPending}
                  autoComplete="new-password"
                  className="border-border-muted bg-surface text-primary"
                />
              </SettingsFormRow>
              <SettingsFormRow>
                <Label htmlFor="new-password-confirm" className="text-primary">
                  Confirm new password
                </Label>
                <Input
                  id="new-password-confirm"
                  type="password"
                  value={newPasswordConfirm}
                  onChange={(e) => setNewPasswordConfirm(e.target.value)}
                  required
                  minLength={8}
                  disabled={updatePassword.isPending}
                  autoComplete="new-password"
                  className="border-border-muted bg-surface text-primary"
                />
              </SettingsFormRow>
              {newPassword && newPassword !== newPasswordConfirm && (
                <FormErrorText>Passwords do not match.</FormErrorText>
              )}
              {updatePassword.error && (
                <FormErrorText>
                  {updatePassword.error instanceof Error
                    ? updatePassword.error.message
                    : "Password update failed"}
                </FormErrorText>
              )}
              <SettingsFormActions>
                <Button type="submit" disabled={updatePassword.isPending}>
                  {updatePassword.isPending ? "Updating…" : "Update password"}
                </Button>
              </SettingsFormActions>
            </SettingsForm>
          </SettingsCard>
        </SettingsSection>

        <SettingsSection title="Notification preferences">
          <SettingsCard>
            <SettingsForm onSubmit={handleNotificationPrefsSubmit}>
              <label className="flex items-center gap-2 cursor-pointer text-primary">
                <input
                  type="checkbox"
                  checked={emailOnMention}
                  onChange={(e) => setEmailOnMention(e.target.checked)}
                  disabled={updateNotificationPrefs.isPending}
                  className="rounded border-border-muted text-brand focus:ring-brand"
                  aria-label="Email when mentioned"
                />
                <span className="text-sm">Email when mentioned</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-primary mt-2">
                <input
                  type="checkbox"
                  checked={inAppNotifications}
                  onChange={(e) => setInAppNotifications(e.target.checked)}
                  disabled={updateNotificationPrefs.isPending}
                  className="rounded border-border-muted text-brand focus:ring-brand"
                  aria-label="In-app notifications"
                />
                <span className="text-sm">In-app notifications</span>
              </label>
              {updateNotificationPrefs.error && (
                <FormErrorText>
                  {updateNotificationPrefs.error instanceof Error
                    ? updateNotificationPrefs.error.message
                    : "Update failed"}
                </FormErrorText>
              )}
              <SettingsFormActions>
                <Button
                  type="submit"
                  disabled={updateNotificationPrefs.isPending}
                >
                  {updateNotificationPrefs.isPending
                    ? "Saving…"
                    : "Save preferences"}
                </Button>
              </SettingsFormActions>
            </SettingsForm>
          </SettingsCard>
        </SettingsSection>
      </div>
    </SettingsLayout>
  );
}
