"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, signupSchema, type LoginInput, type SignupInput } from "@/lib/schemas";
import { login, signup } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { BillingLoop } from "@/components/motion/billing-loop";
import { CheckCircle, Circle } from "@phosphor-icons/react";

export default function LoginPage() {
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Login form
  const loginForm = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  // Signup form
  const signupForm = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const signupPassword = signupForm.watch("password") || "";

  // Password rules validation for signup
  const passwordRules = [
    { label: "More than 8 characters", met: signupPassword.length > 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(signupPassword) },
    { label: "One lowercase letter", met: /[a-z]/.test(signupPassword) },
    { label: "One special character", met: /[^A-Za-z0-9]/.test(signupPassword) },
  ];

  const handleLoginSubmit = async (data: LoginInput) => {
    setApiError(null);
    setLoading(true);
    try {
      const user = await login(data.email, data.password);
      if (user.role === "admin" || user.role === "finance_lead") {
        router.push("/admin");
      } else if (user.role === "staff") {
        router.push("/staff");
      } else {
        router.push("/customer");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Invalid credentials";
      setApiError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (data: SignupInput) => {
    setApiError(null);
    setLoading(true);
    try {
      const user = await signup(data.name, data.email, data.password);
      if (user.role === "customer") {
        router.push("/customer");
      } else {
        router.push("/login");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registration failed";
      setApiError(message);
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (email: string, pass: string) => {
    setApiError(null);
    setLoading(true);
    try {
      const user = await login(email, pass);
      if (user.role === "admin" || user.role === "finance_lead") {
        router.push("/admin");
      } else if (user.role === "staff") {
        router.push("/staff");
      } else {
        router.push("/customer");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Quick login failed";
      setApiError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 bg-paper">
      {/* Decorative top branding */}
      <div className="mb-6 flex flex-col items-center">
        <Link href="/" className="flex items-center gap-2 group mb-2">
          <div className="w-8 h-8 rounded-leaf bg-primary flex items-center justify-center text-surface font-semibold text-lg">
            B
          </div>
          <span className="font-semibold text-xl tracking-tight text-ink">
            Brightloop
          </span>
        </Link>
        <p className="text-xs text-muted">
          Unified recurring billing & subscription management
        </p>
      </div>

      <div className="w-full max-w-md bg-surface border border-border shape-leaf p-6 sm:p-8">
        {/* Tab switch */}
        <div className="flex border border-border rounded-leaf p-1 bg-paper mb-6">
          <button
            type="button"
            onClick={() => {
              setTab("login");
              setApiError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-medium rounded-leaf transition-colors ${
              tab === "login"
                ? "bg-surface text-ink font-semibold border border-border"
                : "text-muted hover:text-ink"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("signup");
              setApiError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-medium rounded-leaf transition-colors ${
              tab === "signup"
                ? "bg-surface text-ink font-semibold border border-border"
                : "text-muted hover:text-ink"
            }`}
          >
            Create Account
          </button>
        </div>

        {apiError && (
          <div className="mb-4 px-3.5 py-2.5 bg-[#FBECE9] border border-[#E8B1A7] text-status-overdue text-xs rounded-leaf">
            {apiError}
          </div>
        )}

        {tab === "login" ? (
          <form
            onSubmit={loginForm.handleSubmit(handleLoginSubmit)}
            className="flex flex-col gap-4"
          >
            <Field
              label="Work email"
              required
              error={loginForm.formState.errors.email?.message}
            >
              <Input
                type="email"
                placeholder="you@company.com"
                error={!!loginForm.formState.errors.email}
                {...loginForm.register("email")}
              />
            </Field>

            <Field
              label="Password"
              required
              error={loginForm.formState.errors.password?.message}
            >
              <Input
                type="password"
                placeholder="••••••••"
                error={!!loginForm.formState.errors.password}
                {...loginForm.register("password")}
              />
            </Field>

            <div className="flex items-center justify-between text-xs">
              <Link
                href="/forgot-password"
                className="text-muted hover:text-primary transition-colors"
              >
                Forgot your password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
              className="w-full mt-2"
            >
              Sign In to Brightloop
            </Button>
          </form>
        ) : (
          <form
            onSubmit={signupForm.handleSubmit(handleSignupSubmit)}
            className="flex flex-col gap-3.5"
          >
            <Field
              label="Full name"
              required
              error={signupForm.formState.errors.name?.message}
            >
              <Input
                placeholder="Kritik Kushwaha"
                error={!!signupForm.formState.errors.name}
                {...signupForm.register("name")}
              />
            </Field>

            <Field
              label="Work email"
              required
              error={signupForm.formState.errors.email?.message}
            >
              <Input
                type="email"
                placeholder="you@company.com"
                error={!!signupForm.formState.errors.email}
                {...signupForm.register("email")}
              />
            </Field>

            <Field
              label="Password"
              required
              error={signupForm.formState.errors.password?.message}
            >
              <Input
                type="password"
                placeholder="Create a strong password"
                error={!!signupForm.formState.errors.password}
                {...signupForm.register("password")}
              />
            </Field>

            {/* Live Password Rules */}
            <div className="p-3 bg-paper border border-border rounded-leaf flex flex-col gap-1.5 text-xs">
              <span className="text-[11px] font-medium text-muted uppercase tracking-wider">
                Password requirements:
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
                  <span
                    className={
                      r.met ? "text-ink font-medium" : "text-muted"
                    }
                  >
                    {r.label}
                  </span>
                </div>
              ))}
            </div>

            <Field
              label="Confirm password"
              required
              error={signupForm.formState.errors.confirmPassword?.message}
            >
              <Input
                type="password"
                placeholder="Re-enter password"
                error={!!signupForm.formState.errors.confirmPassword}
                {...signupForm.register("confirmPassword")}
              />
            </Field>

            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
              className="w-full mt-2"
            >
              Create Account
            </Button>
          </form>
        )}

        {/* Quick Demo Access Bar for hackathon judges & testers */}
        <div className="mt-6 pt-5 border-t border-border">
          <p className="text-[11px] font-medium text-muted uppercase tracking-wider mb-2 text-center">
            Demo instant switch
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => quickLogin("admin@brightloop.in", "Admin@123")}
              className="px-2.5 py-1.5 bg-paper hover:bg-sand/50 border border-border rounded-leaf text-ink font-medium text-left transition-colors cursor-pointer"
            >
              <div className="font-semibold text-primary">Admin</div>
              <div className="text-[10px] text-muted">admin@brightloop.in</div>
            </button>
            <button
              type="button"
              onClick={() => quickLogin("staff1@brightloop.in", "Staff@123")}
              className="px-2.5 py-1.5 bg-paper hover:bg-sand/50 border border-border rounded-leaf text-ink font-medium text-left transition-colors cursor-pointer"
            >
              <div className="font-semibold text-confirmed">Staff</div>
              <div className="text-[10px] text-muted">staff1@brightloop.in</div>
            </button>
            <button
              type="button"
              onClick={() => quickLogin("finance@brightloop.in", "Finance@123")}
              className="px-2.5 py-1.5 bg-paper hover:bg-sand/50 border border-border rounded-leaf text-ink font-medium text-left transition-colors cursor-pointer"
            >
              <div className="font-semibold text-status-active">Finance</div>
              <div className="text-[10px] text-muted">finance@brightloop.in</div>
            </button>
            <button
              type="button"
              onClick={() => quickLogin("customer@example.com", "Customer@123")}
              className="px-2.5 py-1.5 bg-paper hover:bg-sand/50 border border-border rounded-leaf text-ink font-medium text-left transition-colors cursor-pointer"
            >
              <div className="font-semibold text-accent">Customer</div>
              <div className="text-[10px] text-muted">Portal access</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
