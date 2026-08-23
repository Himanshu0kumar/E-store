import { NextResponse } from "next/server";
import { getPostLoginRedirect } from "@/lib/auth/redirects";

// Protected page routes requiring user login
export const PROTECTED_PATHS = [
  "/wishlist",
  "/cart",
  "/checkout",
  "/user/dashboard",
  "/profile",
  "/orders",
];

// Admin page routes requiring admin role
export const ADMIN_PATHS = ["/admin", "/dashboard"];

// Auth pages that authenticated users shouldn't re-visit
export const AUTH_PATHS = ["/login", "/register"];

/**
 * Decodes JWT payload without verifying signature (used for early UX redirects in Edge runtime).
 * Cryptographic token verification is performed server-side on API routes / server actions.
 */
export function decodeJwtPayload(token) {
  try {
    const payload = token.split(".")[1];
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(normalized);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

/**
 * Authentication and role authorization middleware handler.
 */
export function authMiddleware(req) {
  const { pathname } = req.nextUrl;

  // Extract token from cookie or Authorization header
  let accessToken = req.cookies.get("accessToken")?.value;
  if (!accessToken) {
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      accessToken = authHeader.split(" ")[1];
    }
  }

  // Early protection for /api/admin/* API endpoints
  if (pathname.startsWith("/api/admin")) {
    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Missing authentication token" },
        { status: 401 }
      );
    }
    const payload = decodeJwtPayload(accessToken);
    if (!payload || payload.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }
    return NextResponse.next();
  }

  const isProtected = PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
  const isAdminPath = ADMIN_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
  const isAuthPage = AUTH_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  // 1. Unauthenticated users accessing protected or admin routes -> redirect to /login
  if ((isProtected || isAdminPath) && !accessToken) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Non-admin users accessing admin routes -> redirect to Home
  if (isAdminPath && accessToken) {
    const payload = decodeJwtPayload(accessToken);
    if (payload?.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // 3. Authenticated users visiting auth pages (/login, /register) -> redirect to role dashboard/home
  if (isAuthPage && accessToken) {
    const redirectParam =
      req.nextUrl.searchParams.get("redirect") || req.nextUrl.searchParams.get("from");
    const payload = decodeJwtPayload(accessToken);
    const targetPath = getPostLoginRedirect(payload?.role, redirectParam);
    return NextResponse.redirect(new URL(targetPath, req.url));
  }

  return NextResponse.next();
}
