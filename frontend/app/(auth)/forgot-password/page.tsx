"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { forgotPassword } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import {
  AuthCard,
  AuthFormHeader,
  AuthSubmitButton,
  AuthFooterText,
} from "@/features/auth/components";
import { FormField } from "@/components/shared/form-field";
import { FormErrorText } from "@/components/shared/form-error-text";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const mutation = useMutation({
    mutationFn: () => forgotPassword(email),
    onSuccess: () => setSubmitted(true),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  const errors = mutation.error as { errors?: Record<string, string[]> } | undefined;
  const fieldErrors = errors?.errors ?? {};
  const errorMessage = mutation.error instanceof Error ? mutation.error.message : null;

  if (submitted && !mutation.isError) {
    return (
      <AuthCard>
        <AuthFormHeader
          title="Check your email"
          description="If an account exists for that address, we've sent instructions to reset your password."
        />
        <AuthFooterText
          text="Remember your password?"
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
        title="Forgot password?"
        description="Enter your email and we'll send you a reset link."
      />
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <FormField
          label="Email"
          htmlFor="forgot-email"
          error={fieldErrors.email?.[0]}
          required
        >
          <Input
            id="forgot-email"
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
        {errorMessage && !fieldErrors.email?.length && (
          <FormErrorText>{errorMessage}</FormErrorText>
        )}
        <AuthSubmitButton loading={mutation.isPending}>
          Send reset link
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
