import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const AUTH_COOKIE_NAME = "sundara_auth_token";
const USER_COOKIE_NAME = "sundara_user";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

/**
 * GET /api/auth/session
 * Returns the currently active session user from cookies
 */
export async function GET(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const userCookie = request.cookies.get(USER_COOKIE_NAME)?.value;

  if (!token || !userCookie) {
    return NextResponse.json(
      { success: false, isAuthenticated: false, user: null },
      { status: 401 }
    );
  }

  try {
    const user = JSON.parse(userCookie);
    return NextResponse.json({
      success: true,
      isAuthenticated: true,
      user,
    });
  } catch {
    return NextResponse.json(
      { success: false, isAuthenticated: false, user: null },
      { status: 401 }
    );
  }
}

/**
 * POST /api/auth/session
 * Stores the JWT token in an httpOnly cookie (inaccessible to JavaScript / XSS safe)
 * and stores user metadata in a session cookie.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, user } = body;

    if (!token || !user) {
      return NextResponse.json(
        { success: false, message: "Token and user data are required" },
        { status: 400 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: "Session established successfully",
      user,
    });

    const isProduction = process.env.NODE_ENV === "production";

    // 1. Secure HTTP-Only cookie for JWT Token (Zero LocalStorage!)
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: COOKIE_MAX_AGE,
    });

    // 2. Client-accessible cookie for User profile & permissions
    response.cookies.set({
      name: USER_COOKIE_NAME,
      value: JSON.stringify(user),
      httpOnly: false,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: COOKIE_MAX_AGE,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to set session" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/auth/session
 * Destroys the authentication cookies on user logout
 */
export async function DELETE() {
  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully",
  });

  response.cookies.delete(AUTH_COOKIE_NAME);
  response.cookies.delete(USER_COOKIE_NAME);

  return response;
}

