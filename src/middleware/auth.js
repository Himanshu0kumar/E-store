import { NextResponse } from "next/server";

// Routes that require a login.
const PROTECTED_PATHS = ["/user/dashboard", "/profile", "/orders", "/checkout"];

// Routes that require the "admin" role specifically.
const ADMIN_PATHS = ["/admin"];

// Auth pages a logged-in user shouldn't be able to see again.
const AUTH_PATHS = ["/login", "/register"];

// Decodes a JWT's payload WITHOUT verifying its signature. This is
// fine for middleware's purpose — a cheap early redirect for UX —
// because it is never the actual security boundary. The real check
// happens server-side in requireRole()/getAuthUser(), which DOES
// verify the signature against the secret. Middleware runs on the
// Edge runtime, where Node's `jsonwebtoken` signature verification
// isn't reliably available, so we avoid depending on it here.
// A forged/tampered token might slip past this decode, but it will
// always be rejected by the real check in the API route or page.
function decodeJwtPayload(token) {
  try {
    const payload = token.split(".")[1];
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(normalized);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export function middleware(req) {
  const { pathname } = req.nextUrl;
  const accessToken = req.cookies.get("accessToken")?.value;

  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path));
  const isAdminPath = ADMIN_PATHS.some((path) => pathname.startsWith(path));
  const isAuthPage = AUTH_PATHS.some((path) => pathname.startsWith(path));

  // We only check that the cookie EXISTS here — middleware runs on
  // the Edge runtime and can't safely verify a jsonwebtoken-signed
  // JWT there. Real verification still happens in getAuthUser() /
  // requireRole() on the actual API routes / server components.
  // This just stops a page from rendering at all when there's
  // obviously no/an active session, before any client-side JS runs.
  if ((isProtected || isAdminPath) && !accessToken) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminPath && accessToken) {
    const payload = decodeJwtPayload(accessToken);
    if (payload?.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  if (isAuthPage && accessToken) {
    return NextResponse.redirect(new URL("/user/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/user/dashboard/:path*",
    "/profile/:path*",
    "/orders/:path*",
    "/checkout/:path*",
    "/admin/:path*",
    "/login",
    "/register",
  ],
};