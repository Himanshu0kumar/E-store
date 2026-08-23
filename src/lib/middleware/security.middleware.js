import { NextResponse } from "next/server";

/**
 * Security headers middleware to enhance application defense in depth.
 */
export function securityMiddleware(req, res = NextResponse.next()) {
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return res;
}
