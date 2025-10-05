import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

interface JwtPayload {
  userId: number;
  email: string;
  role: string;
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    ) as JwtPayload;
    return decoded;
  } catch (_error) {
    return null;
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  // Get token from Authorization header
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  // Get token from cookies
  const cookieHeader = request.headers.get("cookie");
  if (cookieHeader) {
    const cookies = cookieHeader.split(";").map((cookie) => cookie.trim());
    const authTokenCookie = cookies.find((cookie) =>
      cookie.startsWith("auth-token=")
    );
    if (authTokenCookie) {
      return authTokenCookie.split("=")[1];
    }
  }

  return null;
}
