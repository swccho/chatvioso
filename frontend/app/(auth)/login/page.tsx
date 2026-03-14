"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { login } from "@/lib/auth";
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

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const mutation = useMutation({
    mutationFn: () => login(email, password),
    onSuccess: () => {
      router.push("/app");
      router.refresh();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  const errorMessage =
    mutation.error instanceof Error ? mutation.error.message : null;
  const errors = mutation.error as { errors?: Record<string, string[]> } | undefined;
  const fieldErrors = errors?.errors ?? {};

  return (
    <AuthCard>
      <AuthFormHeader
        title="Chatvioso"
        description="Sign in to your account"
      />
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <FormField
          label="Email"
          htmlFor="login-email"
          error={fieldErrors.email?.[0]}
          required
        >
          <Input
            id="login-email"
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
          id="login-password"
          label="Password"
          value={password}
          onChange={setPassword}
          disabled={mutation.isPending}
          autoComplete="current-password"
          required
          error={fieldErrors.password?.[0]}
        />
        {errorMessage && !fieldErrors.email?.length && !fieldErrors.password?.length && (
          <FormErrorText>{errorMessage}</FormErrorText>
        )}
        <AuthSubmitButton loading={mutation.isPending}>
          Sign in
        </AuthSubmitButton>
      </form>
      <div className="mt-6 space-y-2">
        <AuthFooterText
          text="Don't have an account?"
          linkLabel="Sign up"
          href="/register"
        />
        <p className="text-center text-sm text-primary-muted">
          <Link
            href="/forgot-password"
            className="text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 rounded"
          >
            Forgot password?
          </Link>
        </p>
      </div>
    </AuthCard>
  );
}
