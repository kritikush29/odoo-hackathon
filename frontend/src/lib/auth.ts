/**
 * Auth helper for client-side session management.
 * Calls the Next.js auth route handlers which manage the JWT cookie.
 */

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "staff" | "customer" | "finance_lead";
}

export interface SessionResponse {
  user: User | null;
  authenticated: boolean;
}

/** Fetch the current session from the auth cookie */
export async function getSession(): Promise<SessionResponse> {
  try {
    const res = await fetch("/api/auth/session", { credentials: "include" });
    if (!res.ok) return { user: null, authenticated: false };
    return res.json();
  } catch {
    return { user: null, authenticated: false };
  }
}

/** Login: sends credentials to the Next.js auth handler which sets the cookie */
export async function login(email: string, password: string): Promise<User> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    credentials: "include",
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({ message: "Login failed" }));
    throw new Error(data.message || "Login failed");
  }

  return res.json();
}

/** Signup: creates a new account */
export async function signup(
  name: string,
  email: string,
  password: string
): Promise<User> {
  const res = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
    credentials: "include",
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({ message: "Signup failed" }));
    throw new Error(data.message || "Signup failed");
  }

  return res.json();
}

/** Logout: clears the auth cookie */
export async function logout(): Promise<void> {
  await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });
}

/** Request password reset email */
export async function forgotPassword(email: string): Promise<void> {
  const res = await fetch("/api/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(data.message || "Request failed");
  }
}

/** Reset password with token */
export async function resetPassword(
  token: string,
  password: string
): Promise<void> {
  const res = await fetch("/api/auth/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({ message: "Reset failed" }));
    throw new Error(data.message || "Reset failed");
  }
}

/** Get the dashboard path for a given role */
export function getDashboardPath(role: User["role"]): string {
  switch (role) {
    case "admin":
    case "finance_lead":
      return "/admin/dashboard";
    case "staff":
      return "/staff/dashboard";
    case "customer":
      return "/customer/dashboard";
    default:
      return "/login";
  }
}
