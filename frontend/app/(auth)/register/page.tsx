"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { register as registerApi } from "@/lib/auth";
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

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      registerApi(name, email, password, passwordConfirmation),
    onSuccess: () => {
      router.push("/app");
      router.refresh();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== passwordConfirmation) return;
    mutation.mutate();
  };

  const errorMessage =
    mutation.error instanceof Error ? mutation.error.message : null;
  const errors = mutation.error as { errors?: Record<string, string[]> } | undefined;
  const fieldErrors = errors?.errors ?? {};
  const passwordsMatch = password === passwordConfirmation;

  return (
    <AuthCard>
      <AuthFormHeader
        title="Chatvioso"
        description="Create your account"
      />
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <FormField
          label="Name"
          htmlFor="register-name"
          error={fieldErrors.name?.[0]}
          required
        >
          <Input
            id="register-name"
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={mutation.isPending}
            autoComplete="name"
            required
            className={fieldErrors.name ? "border-state-danger" : ""}
          />
        </FormField>
        <FormField
          label="Email"
          htmlFor="register-email"
          error={fieldErrors.email?.[0]}
          required
        >
          <Input
            id="register-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={mutation.isPending}
            autoComplete="email"
            required
            className={fieldErrors.email ? "border-state-danger" : ""}
          />
        </FormField>
        <PasswordField
          id="register-password"
          label="Password"
          value={password}
          onChange={setPassword}
          placeholder="At least 8 characters"
          disabled={mutation.isPending}
          autoComplete="new-password"
          required
          error={fieldErrors.password?.[0]}
        />
        <FormField
          label="Confirm password"
          htmlFor="register-password-confirm"
          error={
            passwordConfirmation && !passwordsMatch
              ? "Passwords do not match"
              : fieldErrors.password_confirmation?.[0]
          }
          required
        >
          <Input
            id="register-password-confirm"
            type="password"
            placeholder="••••••••"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            disabled={mutation.isPending}
            autoComplete="new-password"
            required
            className={
              passwordConfirmation && !passwordsMatch
                ? "border-state-danger"
                : ""
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
          Create account
        </AuthSubmitButton>
      </form>
      <AuthFooterText
        text="Already have an account?"
        linkLabel="Sign in"
        href="/login"
        className="mt-6"
      />
    </AuthCard>
  );
}
