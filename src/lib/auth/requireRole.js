import { cookies } from "next/headers";
import { verifyToken } from "@/services/auth.service";
import { NextResponse } from "next/server";

/**
 * Validates request authentication and role authorization.
 * Checks Cookies first, then Authorization Header, then Next.js cookies().
 *
 * Usage:
 *   const auth = await requireRole(req, ["admin"]);
 *   if (auth.error) {
 *     return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
 *   }
 *   const { userId, role } = auth;
 */
export const requireRole = async (req, allowedRoles = []) => {
  let token = req?.cookies?.get?.("accessToken")?.value;

  if (!token && req?.headers) {
    const authHeader =
      typeof req.headers.get === "function"
        ? req.headers.get("authorization")
        : req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }
  }

  if (!token) {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get("accessToken")?.value;
    } catch {
      // Ignore if called outside server context
    }
  }

  if (!token) {
    return { error: "Unauthorized: Missing authentication token", status: 401 };
  }

  try {
    const decoded = await verifyToken(token, "access");

    if (!decoded.role || (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role))) {
      return { error: "Forbidden: Insufficient role permissions", status: 403 };
    }

    return { userId: decoded.userId || decoded.id, role: decoded.role };
  } catch (error) {
    return { error: error.message || "Invalid or expired authentication token", status: 401 };
  }
};

/**
 * Helper specifically for Admin-only routes.
 * Returns NextResponse directly if unauthorized/forbidden, or auth object { userId, role } if allowed.
 */
export const requireAdmin = async (req) => {
  const auth = await requireRole(req, ["admin"]);
  if (auth.error) {
    return NextResponse.json({ success: false, error: auth.error }, { status: auth.status });
  }
  return auth;
};