import { NextResponse } from "next/server";

const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://e-store-red-six.vercel.app",
];

if (process.env.NEXT_PUBLIC_API_URL) {
  try {
    const parsed = new URL(process.env.NEXT_PUBLIC_API_URL).origin;
    if (!ALLOWED_ORIGINS.includes(parsed)) {
      ALLOWED_ORIGINS.push(parsed);
    }
  } catch {
    // Ignore invalid URL
  }
}

/**
 * Security & CORS headers middleware for defense-in-depth API access.
 */
export function securityMiddleware(req, res = NextResponse.next()) {
  const origin = req.headers.get("origin");

  // Handle CORS headers if request origin is in allowed origins list
  if (origin && (ALLOWED_ORIGINS.includes(origin) || process.env.NODE_ENV !== "production")) {
    res.headers.set("Access-Control-Allow-Origin", origin);
    res.headers.set("Access-Control-Allow-Credentials", "true");
    res.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    res.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With, Cookie"
    );
  }

  // Handle OPTIONS preflight requests directly
  if (req.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 200,
      headers: res.headers,
    });
  }

  // Standard security headers
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return res;
}
