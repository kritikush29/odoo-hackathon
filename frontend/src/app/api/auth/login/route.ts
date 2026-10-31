import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    const isMock = process.env.NEXT_PUBLIC_USE_MOCK === "true";

    if (isMock) {
      // Mock auth validation
      let user = null;
      if (email === "admin@brightloop.in" && password === "Admin@123") {
        user = {
          id: "usr_admin_01",
          name: "Admin User",
          email: "admin@brightloop.in",
          role: "admin",
        };
      } else if (
        email === "finance@brightloop.in" &&
        password === "Finance@123"
      ) {
        user = {
          id: "usr_fin_01",
          name: "Finance Lead",
          email: "finance@brightloop.in",
          role: "finance_lead",
        };
      } else if (
        email.startsWith("staff") &&
        (password === "Staff@123" || password === "Admin@123")
      ) {
        user = {
          id: "usr_staff_01",
          name: "Staff Member",
          email,
          role: "staff",
        };
      } else if (password === "Customer@123" || password === "Password@123") {
        user = {
          id: "usr_cust_01",
          name: "Valued Customer",
          email,
          role: "customer",
        };
      }

      if (!user) {
        return NextResponse.json(
          { message: "Invalid email or password" },
          { status: 401 }
        );
      }

      // Generate a mock JWT token
      const tokenPayload = {
        sub: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
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

    // Real FastAPI backend integration
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const res = await fetch(`${backendUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { message: data.detail || data.message || "Invalid credentials" },
        { status: res.status }
      );
    }

    const token = data.access_token || data.token;
    const cookieStore = cookies();
    cookieStore.set("brightloop_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({ user: data.user });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
