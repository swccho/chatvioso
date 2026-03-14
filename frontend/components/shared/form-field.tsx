"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { FormErrorText } from "./form-error-text";
import { FormHelperText } from "./form-helper-text";

export interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  helper?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FormField({
  label,
  htmlFor,
  error,
  helper,
  required,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={htmlFor}>
        {label}
        {required && <span className="text-state-danger ml-0.5" aria-hidden>*</span>}
      </Label>
      {children}
      {error && <FormErrorText>{error}</FormErrorText>}
      {helper && !error && <FormHelperText>{helper}</FormHelperText>}
    </div>
  );
}
