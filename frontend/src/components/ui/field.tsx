"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface FieldWrapperProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function Field({
  label,
  error,
  hint,
  required,
  className,
  children,
}: FieldWrapperProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label className="text-xs font-medium text-ink flex items-center justify-between">
          <span>
            {label}
            {required && <span className="text-accent ml-1">*</span>}
          </span>
          {hint && <span className="text-[11px] text-muted font-normal">{hint}</span>}
        </label>
      )}
      {children}
      {error && (
        <span className="text-xs text-status-overdue font-medium mt-0.5 animate-fadeIn">
          {error}
        </span>
      )}
    </div>
  );
}

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full px-3.5 py-2 text-sm bg-surface text-ink border rounded-leaf transition-colors",
          "placeholder:text-muted/60",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
          "disabled:opacity-50 disabled:bg-sand/30 disabled:cursor-not-allowed",
          error
            ? "border-status-overdue focus:ring-status-overdue"
            : "border-border hover:border-muted/40",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full px-3.5 py-2 text-sm bg-surface text-ink border rounded-leaf transition-colors resize-y min-h-[80px]",
          "placeholder:text-muted/60",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
          "disabled:opacity-50 disabled:bg-sand/30 disabled:cursor-not-allowed",
          error
            ? "border-status-overdue focus:ring-status-overdue"
            : "border-border hover:border-muted/40",
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          "w-full px-3.5 py-2 text-sm bg-surface text-ink border rounded-leaf transition-colors cursor-pointer",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
          "disabled:opacity-50 disabled:bg-sand/30 disabled:cursor-not-allowed",
          error
            ? "border-status-overdue focus:ring-status-overdue"
            : "border-border hover:border-muted/40",
          className
        )}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = "Select";
