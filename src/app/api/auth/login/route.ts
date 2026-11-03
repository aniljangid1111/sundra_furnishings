import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const AUTH_COOKIE_NAME = "sundara_auth_token";
const USER_COOKIE_NAME = "sundara_user";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days

const BACKEND_URL =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

/**
 * POST /api/auth/login
 * BFF Login Endpoint:
 * 1. Forwards credentials directly to Express Backend
 * 2. Receives JWT token
 * 3. Sets JWT in secure httpOnly cookie (inaccessible to Client JS / XSS Safe)
 * 4. Returns ONLY the public user object (Zero token leakage!)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    const backendRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await backendRes.json();

    if (!backendRes.ok || !data.success || !data.data?.token) {
      return NextResponse.json(
        {
          success: false,
          message: data.message || "Invalid credentials",
        },
        { status: backendRes.status || 401 }
      );
    }

    const { token, user } = data.data;
    const isProduction = process.env.NODE_ENV === "production";

    // Create client response (Token is strictly excluded from JSON response)
    const response = NextResponse.json({
      success: true,
      message: "Authentication successful",
      user,
    });

    // 1. Secure HTTP-Only cookie for JWT (Zero LocalStorage, Zero Client Access)
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
      {
        success: false,
        message: error?.message || "Internal server authentication error",
      },
      { status: 500 }
    );
  }
}

