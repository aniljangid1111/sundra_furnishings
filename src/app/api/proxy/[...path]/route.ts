import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BACKEND_URL =
  process.env.BACKEND_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

async function proxyRequest(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const path = resolvedParams.path.join("/");
    const url = new URL(request.url);
    const targetUrl = `${BACKEND_URL}/api/${path}${url.search}`;

    const token = request.cookies.get("sundara_auth_token")?.value;

    const headers = new Headers();
    request.headers.forEach((val, key) => {
      const lower = key.toLowerCase();
      // Filter out hop-by-hop and browser-specific headers
      if (!["host", "connection", "cookie", "content-length"].includes(lower)) {
        headers.set(key, val);
      }
    });

    // Automatically inject Bearer Token from secure httpOnly cookie
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const method = request.method;
    const hasBody = !["GET", "HEAD"].includes(method);

    let body: any = undefined;
    if (hasBody) {
      body = await request.blob();
    }

    const backendResponse = await fetch(targetUrl, {
      method,
      headers,
      body,
    });

    const responseData = await backendResponse.text();

    return new NextResponse(responseData, {
      status: backendResponse.status,
      headers: {
        "Content-Type":
          backendResponse.headers.get("content-type") || "application/json",
      },
    });
  } catch (error: any) {
    console.error("[Proxy Error]:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to reach backend service.",
      },
      { status: 502 }
    );
  }
}

export const GET = (req: NextRequest, ctx: any) => proxyRequest(req, ctx);
export const POST = (req: NextRequest, ctx: any) => proxyRequest(req, ctx);
export const PUT = (req: NextRequest, ctx: any) => proxyRequest(req, ctx);
export const DELETE = (req: NextRequest, ctx: any) => proxyRequest(req, ctx);
export const PATCH = (req: NextRequest, ctx: any) => proxyRequest(req, ctx);

