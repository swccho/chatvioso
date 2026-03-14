"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/form-field";
import { cn } from "@/lib/utils";

export interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  autoComplete?: string;
  required?: boolean;
  error?: string;
  className?: string;
}

export function PasswordField({
  id,
  label,
  value,
  onChange,
  placeholder = "••••••••",
  disabled,
  autoComplete,
  required,
  error,
  className,
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <FormField
      label={label}
      htmlFor={id}
      error={error}
      required={required}
      className={className}
    >
      <div className="relative">
        <Input
          id={id}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          required={required}
          className={cn("pr-10", error && "border-state-danger")}
        />
        <button
          type="button"
          tabIndex={-1}
          aria-label={showPassword ? "Hide password" : "Show password"}
          className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center rounded p-1 text-primary-muted hover:text-primary focus:outline-none focus:ring-2 focus:ring-brand rounded"
          onClick={() => setShowPassword((p) => !p)}
        >
          {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    </FormField>
  );
}
