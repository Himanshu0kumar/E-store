import { NextResponse } from "next/server";

// Routes that require a login.
const PROTECTED_PATHS = ["/user/dashboard", "/profile", "/orders", "/checkout"];

// Auth pages a logged-in user shouldn't be able to see again.
const AUTH_PATHS = ["/login", "/register"];

export function middleware(req) {
  const { pathname } = req.nextUrl;
  const accessToken = req.cookies.get("accessToken")?.value;

  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path));
  const isAuthPage = AUTH_PATHS.some((path) => pathname.startsWith(path));

  // We only check that the cookie EXISTS here — middleware runs on
  // the Edge runtime and can't safely verify a jsonwebtoken-signed
  // JWT there. Real verification still happens in getAuthUser() on
  // the actual API routes / server components. This just stops a
  // page from rendering at all when there's obviously no/an active
  // session, before any client-side JS runs.
  if (isProtected && !accessToken) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
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
    "/login",
    "/register",
  ],
};