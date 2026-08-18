import { NextResponse } from "next/server";
import { getPostLoginRedirect } from "@/lib/auth/redirects";

// Protected routes requiring user login
export const PROTECTED_PATHS = [
  "/wishlist",
  "/cart",
  "/checkout",
  "/user/dashboard",
  "/profile",
  "/orders",
];

// Admin routes requiring admin role
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
  const accessToken = req.cookies.get("accessToken")?.value;

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
