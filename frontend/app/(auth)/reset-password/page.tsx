"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { resetPassword } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import {
  AuthCard,
  AuthFormHeader,
  AuthSubmitButton,
  AuthFooterText,
} from "@/features/auth/components";
import { FormField } from "@/components/shared/form-field";
import { FormErrorText } from "@/components/shared/form-error-text";
import { PasswordField } from "@/features/auth/components";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      resetPassword(token, password, passwordConfirmation),
    onSuccess: () => {
      router.push("/login");
      router.refresh();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== passwordConfirmation) return;
    mutation.mutate();
  };

  const errors = mutation.error as { errors?: Record<string, string[]> } | undefined;
  const fieldErrors = errors?.errors ?? {};
  const errorMessage = mutation.error instanceof Error ? mutation.error.message : null;
  const passwordsMatch = password === passwordConfirmation;

  if (!token) {
    return (
      <AuthCard>
        <AuthFormHeader
          title="Invalid link"
          description="This reset link is missing a token. Please request a new one."
        />
        <AuthFooterText
          text=""
          linkLabel="Back to sign in"
          href="/login"
          className="mt-6"
        />
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <AuthFormHeader
        title="Set new password"
        description="Enter your new password below."
      />
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <PasswordField
          id="reset-password"
          label="New password"
          value={password}
          onChange={setPassword}
          placeholder="At least 8 characters"
          disabled={mutation.isPending}
          autoComplete="new-password"
          required
          error={fieldErrors.password?.[0]}
        />
        <FormField
          label="Confirm new password"
          htmlFor="reset-password-confirm"
          error={
            passwordConfirmation && !passwordsMatch
              ? "Passwords do not match"
              : fieldErrors.password_confirmation?.[0]
          }
          required
        >
          <Input
            id="reset-password-confirm"
            type="password"
            placeholder="••••••••"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            disabled={mutation.isPending}
            autoComplete="new-password"
            required
            className={
              passwordConfirmation && !passwordsMatch ? "border-state-danger" : ""
            }
          />
        </FormField>
        {errorMessage && !Object.keys(fieldErrors).length && (
          <FormErrorText>{errorMessage}</FormErrorText>
        )}
        <AuthSubmitButton
          loading={mutation.isPending}
          disabled={!!passwordConfirmation && !passwordsMatch}
        >
          Reset password
        </AuthSubmitButton>
      </form>
      <AuthFooterText
        text="Remember your password?"
        linkLabel="Back to sign in"
        href="/login"
        className="mt-6"
      />
    </AuthCard>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<AuthCard><AuthFormHeader title="Loading…" /></AuthCard>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
