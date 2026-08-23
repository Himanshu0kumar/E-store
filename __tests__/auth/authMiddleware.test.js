import { describe, it, expect } from "vitest";
import { authMiddleware } from "@/lib/middleware/auth.middleware";
import jwt from "jsonwebtoken";

function createMockRequest(pathname, token = null, searchParams = {}) {
  const url = new URL(`http://localhost:3000${pathname}`);
  Object.entries(searchParams).forEach(([k, v]) => url.searchParams.set(k, v));

  return {
    nextUrl: url,
    url: url.toString(),
    cookies: {
      get: (name) => (name === "accessToken" && token ? { value: token } : null),
    },
    headers: {
      get: (name) => (name.toLowerCase() === "authorization" && token ? `Bearer ${token}` : null),
    },
  };
}

describe("Edge Auth Middleware (authMiddleware)", () => {
  const secret = process.env.JWT_SECRET;

  it("should redirect unauthenticated request for protected page /cart to /login", () => {
    const req = createMockRequest("/cart");
    const res = authMiddleware(req);

    expect(res.status).toBe(307); // NextResponse.redirect default status
    expect(res.headers.get("location")).toContain("/login?redirect=%2Fcart");
  });

  it("should redirect unauthenticated request for admin page /dashboard to /login", () => {
    const req = createMockRequest("/dashboard");
    const res = authMiddleware(req);

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/login?redirect=%2Fdashboard");
  });

  it("should redirect non-admin user attempting to access /dashboard to Home /", () => {
    const userToken = jwt.sign(
      { userId: "u_1", role: "user", type: "access" },
      secret
    );
    const req = createMockRequest("/dashboard", userToken);
    const res = authMiddleware(req);

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost:3000/");
  });

  it("should redirect authenticated user accessing /login to default role destination", () => {
    const userToken = jwt.sign(
      { userId: "u_1", role: "user", type: "access" },
      secret
    );
    const req = createMockRequest("/login", userToken);
    const res = authMiddleware(req);

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost:3000/");
  });

  it("should redirect authenticated admin user accessing /login to /dashboard", () => {
    const adminToken = jwt.sign(
      { userId: "a_1", role: "admin", type: "access" },
      secret
    );
    const req = createMockRequest("/login", adminToken);
    const res = authMiddleware(req);

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost:3000/dashboard");
  });

  it("should return JSON 401 for unauthenticated requests to /api/admin/*", async () => {
    const req = createMockRequest("/api/admin/users/stats");
    const res = authMiddleware(req);

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toContain("Unauthorized");
  });

  it("should return JSON 403 for non-admin requests to /api/admin/*", async () => {
    const userToken = jwt.sign(
      { userId: "u_1", role: "user", type: "access" },
      secret
    );
    const req = createMockRequest("/api/admin/users/stats", userToken);
    const res = authMiddleware(req);

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error).toContain("Forbidden");
  });

  it("should allow admin requests to /api/admin/* to proceed", () => {
    const adminToken = jwt.sign(
      { userId: "a_1", role: "admin", type: "access" },
      secret
    );
    const req = createMockRequest("/api/admin/users/stats", adminToken);
    const res = authMiddleware(req);

    expect(res.status).toBe(200); // NextResponse.next()
  });
});
