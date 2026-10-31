import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    const isMock = process.env.NEXT_PUBLIC_USE_MOCK === "true";

    if (isMock) {
      // Create customer account in mock mode
      const user = {
        id: `usr_${Date.now()}`,
        name,
        email,
        role: "customer" as const,
      };

      const tokenPayload = {
        sub: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
      };
      const token = Buffer.from(JSON.stringify(tokenPayload)).toString("base64");

      const cookieStore = cookies();
      cookieStore.set("brightloop_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });

      return NextResponse.json({ user });
    }

    // Real backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const res = await fetch(`${backendUrl}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { message: data.detail || data.message || "Signup failed" },
        { status: res.status }
      );
    }

    const token = data.access_token || data.token;
    if (token) {
      const cookieStore = cookies();
      cookieStore.set("brightloop_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return NextResponse.json({ user: data.user || data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
