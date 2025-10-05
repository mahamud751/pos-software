import { NextRequest, NextResponse } from "next/server";
import { verifyToken, getTokenFromRequest } from "@/lib/auth";

export async function withAuth(request: NextRequest) {
  try {
    // Get token from request
    const token = getTokenFromRequest(request);

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Add user info to request headers for use in route handlers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("user-id", decoded.userId.toString());
    requestHeaders.set("user-role", decoded.role);

    // Clone the request with new headers
    const newRequest = new NextRequest(request, {
      headers: requestHeaders,
    });

    return newRequest;
  } catch (error) {
    console.error("Auth middleware error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
