import { NextResponse } from "next/server";

// POST /api/auth/logout - User logout
export async function POST() {
  const response = NextResponse.json({ message: "Logged out successfully" });

  // Clear the auth token cookie
  response.cookies.set("auth-token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  });

  return response;
}
