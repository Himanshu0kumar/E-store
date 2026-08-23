import { handleMiddleware } from "@/lib/middleware";

export function middleware(req) {
  return handleMiddleware(req);
}

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
    "/api/admin/:path*",
  ],
};
