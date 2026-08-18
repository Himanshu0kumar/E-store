import { NextResponse } from "next/server";
import { authMiddleware } from "./auth.middleware";
import { securityMiddleware } from "./security.middleware";

/**
 * Main Next.js Middleware Entrypoint located inside src/middleware/ folder.
 * Sequentially executes authentication/role checks and applies security response headers.
 */
export function middleware(req) {
  // 1. Run Authentication & Role Middleware
  const authResponse = authMiddleware(req);

  // If auth middleware triggered a redirect, return immediately
  if (authResponse.status >= 300 && authResponse.status < 400) {
    return authResponse;
  }

  // 2. Apply Security Headers to response
  return securityMiddleware(req, authResponse);
}

export function mainMiddleware(req) {
  return middleware(req);
}

/**
 * Static route matchers required by Next.js compiler.
 */
export const config = {
  matcher: [
    "/wishlist/:path*",
    "/wishlist",
    "/cart/:path*",
    "/cart",
    "/checkout/:path*",
    "/checkout",
    "/user/dashboard/:path*",
    "/user/dashboard",
    "/profile/:path*",
    "/profile",
    "/orders/:path*",
    "/orders",
    "/admin/:path*",
    "/admin",
    "/dashboard/:path*",
    "/dashboard",
    "/login",
    "/register",
  ],
};

export { authMiddleware } from "./auth.middleware";
export { securityMiddleware } from "./security.middleware";
