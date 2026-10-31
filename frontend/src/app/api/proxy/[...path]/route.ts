import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function proxy(request: NextRequest, { params }: { params: { path: string[] } }) {
  const targetPath = "/" + (params.path || []).join("/");
  const url = new URL(targetPath, BACKEND_URL);

  // Preserve query string
  request.nextUrl.searchParams.forEach((val, key) => {
    url.searchParams.set(key, val);
  });

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    // Exclude host and cookie to prevent backend conflicts
    if (key !== "host" && key !== "cookie") {
      headers.set(key, value);
    }
  });

  // Attach auth token from httpOnly cookie
  const cookieStore = cookies();
  const token = cookieStore.get("brightloop_token")?.value;
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  try {
    let body: BodyInit | undefined = undefined;
    if (request.method !== "GET" && request.method !== "HEAD") {
      body = await request.arrayBuffer();
    }

    const res = await fetch(url.toString(), {
      method: request.method,
      headers,
      body,
      // @ts-expect-error duplex required for streaming bodies in some node fetch runtimes
      duplex: "half",
    });

    const responseData = await res.arrayBuffer();
    const responseHeaders = new Headers();
    res.headers.forEach((val, key) => {
      responseHeaders.set(key, val);
    });

    return new NextResponse(responseData, {
      status: res.status,
      statusText: res.statusText,
      headers: responseHeaders,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Proxy request failed";
    return NextResponse.json({ message }, { status: 502 });
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
