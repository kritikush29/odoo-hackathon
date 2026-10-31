import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("brightloop_token")?.value;
  const { pathname } = request.nextUrl;

  // Public paths that do not require authentication
  if (
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/mockServiceWorker.js") ||
    pathname.includes(".")
  ) {
    // If logged in and hitting /login, redirect to role dashboard
    if (token && pathname.startsWith("/login")) {
      try {
        const payload = JSON.parse(
          Buffer.from(token.split(".")[1] || token, "base64").toString("utf-8")
        );
        const role = payload.role;
        if (role === "admin" || role === "finance_lead") {
          return NextResponse.redirect(new URL("/admin", request.url));
        } else if (role === "staff") {
          return NextResponse.redirect(new URL("/staff", request.url));
        } else if (role === "customer") {
          return NextResponse.redirect(new URL("/customer", request.url));
        }
      } catch {
        // invalid token format, continue to login
      }
    }
    return NextResponse.next();
  }

  // Protected paths
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role validation
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1] || token, "base64").toString("utf-8")
    );
    const role = payload.role;

    if (pathname.startsWith("/admin")) {
      if (role !== "admin" && role !== "finance_lead") {
        const target = role === "staff" ? "/staff" : "/customer";
        return NextResponse.redirect(new URL(target, request.url));
      }
    } else if (pathname.startsWith("/staff")) {
      if (role !== "staff" && role !== "admin") {
        const target = role === "customer" ? "/customer" : "/admin";
        return NextResponse.redirect(new URL(target, request.url));
      }
    } else if (pathname.startsWith("/customer")) {
      if (role !== "customer" && role !== "admin") {
        const target = role === "staff" ? "/staff" : "/admin";
        return NextResponse.redirect(new URL(target, request.url));
      }
    }
  } catch {
    // If token is unparseable, clear it and redirect to login
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("brightloop_token");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/staff/:path*",
    "/customer/:path*",
    "/login",
  ],
};
