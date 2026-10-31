"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  type ForgotPasswordInput,
  type ResetPasswordInput,
} from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { CheckCircle, ArrowLeft, Circle } from "@phosphor-icons/react";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<"request" | "sent" | "reset">("request");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const requestForm = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const resetForm = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const newPassword = resetForm.watch("password") || "";
  const passwordRules = [
    { label: "More than 8 characters", met: newPassword.length > 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(newPassword) },
    { label: "One lowercase letter", met: /[a-z]/.test(newPassword) },
    { label: "One special character", met: /[^A-Za-z0-9]/.test(newPassword) },
  ];

  const handleRequestSubmit = async (data: ForgotPasswordInput) => {
    setLoading(true);
    // Simulate API call to /auth/forgot-password
    await new Promise((resolve) => setTimeout(resolve, 600));
    setSubmittedEmail(data.email);
    setLoading(false);
    setStep("sent");
  };

  const handleResetSubmit = async (_data: ResetPasswordInput) => {
    setLoading(true);
    // Simulate API call to /auth/reset-password
    await new Promise((resolve) => setTimeout(resolve, 600));
    setLoading(false);
    setSuccess(true);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 bg-paper">
      <div className="mb-6 flex flex-col items-center">
        <Link href="/" className="flex items-center gap-2 group mb-2">
          <div className="w-8 h-8 rounded-leaf bg-primary flex items-center justify-center text-surface font-semibold text-lg">
            B
          </div>
          <span className="font-semibold text-xl tracking-tight text-ink">
            Brightloop
          </span>
        </Link>
      </div>

      <div className="w-full max-w-md bg-surface border border-border shape-leaf p-6 sm:p-8">
        {step === "request" && (
          <div>
            <h1 className="text-xl font-bold font-[var(--font-bricolage)] text-ink mb-1">
              Reset your password
            </h1>
            <p className="text-xs text-muted mb-6">
              Enter your verified email and we will send you a secure password reset link.
            </p>

            <form
              onSubmit={requestForm.handleSubmit(handleRequestSubmit)}
              className="flex flex-col gap-4"
            >
              <Field
                label="Work email"
                required
                error={requestForm.formState.errors.email?.message}
              >
                <Input
                  type="email"
                  placeholder="you@company.com"
                  error={!!requestForm.formState.errors.email}
                  {...requestForm.register("email")}
                />
              </Field>

              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={loading}
                className="w-full mt-2"
              >
                Send Reset Link
              </Button>
            </form>
          </div>
        )}

        {step === "sent" && !success && (
          <div className="text-center py-2">
            <div className="w-12 h-12 bg-[#EAF3EC] border border-[#B8D8BF] text-status-active rounded-leaf flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={24} weight="fill" />
            </div>
            <h2 className="text-lg font-bold font-[var(--font-bricolage)] text-ink mb-1">
              Check your inbox
            </h2>
            <p className="text-xs text-muted mb-6 leading-relaxed">
              We sent a password reset link to{" "}
              <strong className="text-ink">{submittedEmail}</strong>. Follow the instructions to recover your account.
            </p>

            <div className="p-3 bg-paper border border-border rounded-leaf mb-6 text-xs text-left">
              <span className="font-medium text-ink block mb-1">Testing locally?</span>
              <span className="text-muted">
                You can immediately proceed to set a new password without leaving the test environment.
              </span>
              <button
                type="button"
                onClick={() => setStep("reset")}
                className="mt-2 text-primary font-semibold hover:underline block cursor-pointer"
              >
                Simulate clicking reset link →
              </button>
            </div>
          </div>
        )}

        {step === "reset" && !success && (
          <div>
            <h1 className="text-xl font-bold font-[var(--font-bricolage)] text-ink mb-1">
              Create new password
            </h1>
            <p className="text-xs text-muted mb-6">
              Ensure your new password meets the security requirements below.
            </p>

            <form
              onSubmit={resetForm.handleSubmit(handleResetSubmit)}
              className="flex flex-col gap-4"
            >
              <Field
                label="New password"
                required
                error={resetForm.formState.errors.password?.message}
              >
                <Input
                  type="password"
                  placeholder="••••••••"
                  error={!!resetForm.formState.errors.password}
                  {...resetForm.register("password")}
                />
              </Field>

              <div className="p-3 bg-paper border border-border rounded-leaf flex flex-col gap-1.5 text-xs">
                <span className="text-[11px] font-medium text-muted uppercase tracking-wider">
                  Requirements:
                </span>
                {passwordRules.map((r, i) => (
                  <div key={i} className="flex items-center gap-2 text-ink">
                    {r.met ? (
                      <CheckCircle
                        size={14}
                        weight="fill"
                        className="text-status-active shrink-0"
                      />
                    ) : (
                      <Circle size={14} className="text-muted/60 shrink-0" />
                    )}
                    <span className={r.met ? "text-ink font-medium" : "text-muted"}>
                      {r.label}
                    </span>
                  </div>
                ))}
              </div>

              <Field
                label="Confirm new password"
                required
                error={resetForm.formState.errors.confirmPassword?.message}
              >
                <Input
                  type="password"
                  placeholder="••••••••"
                  error={!!resetForm.formState.errors.confirmPassword}
                  {...resetForm.register("confirmPassword")}
                />
              </Field>

              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={loading}
                className="w-full mt-2"
              >
                Update Password
              </Button>
            </form>
          </div>
        )}

        {success && (
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-[#EAF3EC] border border-[#B8D8BF] text-status-active rounded-leaf flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={24} weight="fill" />
            </div>
            <h2 className="text-lg font-bold font-[var(--font-bricolage)] text-ink mb-1">
              Password updated
            </h2>
            <p className="text-xs text-muted mb-6">
              Your password has been securely reset. You can now log in with your new credentials.
            </p>
            <Link href="/login">
              <Button variant="primary" size="md" className="w-full">
                Return to Sign In
              </Button>
            </Link>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-border text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-ink transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
