import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = cookies();
  const token = cookieStore.get("brightloop_token")?.value;

  if (!token) {
    return NextResponse.json({ user: null, authenticated: false });
  }

  const isMock = process.env.NEXT_PUBLIC_USE_MOCK === "true";

  if (isMock) {
    try {
      const decoded = JSON.parse(
        Buffer.from(token, "base64").toString("utf-8")
      );
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        return NextResponse.json({ user: null, authenticated: false });
      }
      return NextResponse.json({
        user: {
          id: decoded.sub || decoded.id,
          name: decoded.name,
          email: decoded.email,
          role: decoded.role,
        },
        authenticated: true,
      });
    } catch {
      return NextResponse.json({ user: null, authenticated: false });
    }
  }

  // Real FastAPI backend
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const res = await fetch(`${backendUrl}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      return NextResponse.json({ user: null, authenticated: false });
    }

    const user = await res.json();
    return NextResponse.json({ user, authenticated: true });
  } catch {
    return NextResponse.json({ user: null, authenticated: false });
  }
}
