import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken, getTokenFromRequest } from "@/lib/auth";

// GET /api/auth/verify - Verify user authentication
export async function GET(request: NextRequest) {
  try {
    // Get token from request
    const token = getTokenFromRequest(request);

    if (!token) {
      return NextResponse.json(
        { error: "No authentication token provided" },
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

    // Find user by ID
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    // Check if user exists and is active
    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: "User not found or account deactivated" },
        { status: 401 }
      );
    }

    // Return user data (excluding password)
    const { ...userWithoutPassword } = user;

    return NextResponse.json({
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
