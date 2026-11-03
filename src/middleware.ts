import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_COOKIE_NAME = "sundara_auth_token";

// Protected routes requiring active authentication
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/invoices",
  "/purchases",
  "/inventory",
  "/imports",
  "/products",
  "/categories",
  "/sales-channels",
  "/suppliers",
  "/warehouses",
  "/users",
  "/roles",
  "/reports",
  "/settings",
  "/insights",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const isAuthenticated = Boolean(token);

  // 1. If visiting root "/" -> redirect based on auth status
  if (pathname === "/") {
    const targetUrl = isAuthenticated ? "/dashboard" : "/login";
    return NextResponse.redirect(new URL(targetUrl, request.url));
  }

  // 2. If user is already logged in and tries to access "/login" -> redirect to "/dashboard"
  if (pathname === "/login") {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // 3. If accessing a protected route without token -> redirect to "/login"
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (/api/*)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, icons)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

