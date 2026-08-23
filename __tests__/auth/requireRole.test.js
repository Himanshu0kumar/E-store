import { describe, it, expect, vi } from "vitest";
import { requireRole, requireAdmin } from "@/lib/auth/requireRole";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

describe("Server Auth Guard (requireRole & requireAdmin)", () => {
  const secret = process.env.JWT_SECRET;

  it("should return 401 error if no token is provided in request", async () => {
    const req = { cookies: { get: () => null }, headers: { get: () => null } };
    const result = await requireRole(req, ["admin"]);

    expect(result).toEqual({
      error: "Unauthorized: Missing authentication token",
      status: 401,
    });
  });

  it("should return 401 error if token is malformed or invalid", async () => {
    const req = {
      cookies: { get: () => ({ value: "invalid.token.string" }) },
      headers: { get: () => null },
    };
    const result = await requireRole(req, ["admin"]);

    expect(result.status).toBe(401);
    expect(result.error).toContain("Invalid or expired");
  });

  it("should return 403 error if user role is not allowed", async () => {
    const token = jwt.sign(
      { userId: "user_123", role: "user", type: "access" },
      secret,
      { expiresIn: "15m" }
    );
    const req = {
      cookies: { get: () => ({ value: token }) },
      headers: { get: () => null },
    };

    const result = await requireRole(req, ["admin"]);
    expect(result).toEqual({
      error: "Forbidden: Insufficient role permissions",
      status: 403,
    });
  });

  it("should return auth object for valid admin token in cookie", async () => {
    const token = jwt.sign(
      { userId: "admin_789", role: "admin", type: "access" },
      secret,
      { expiresIn: "15m" }
    );
    const req = {
      cookies: { get: () => ({ value: token }) },
      headers: { get: () => null },
    };

    const result = await requireRole(req, ["admin"]);
    expect(result).toEqual({
      userId: "admin_789",
      role: "admin",
    });
  });

  it("should return auth object for valid admin token in Authorization header", async () => {
    const token = jwt.sign(
      { userId: "admin_789", role: "admin", type: "access" },
      secret,
      { expiresIn: "15m" }
    );
    const req = {
      cookies: { get: () => null },
      headers: { get: (name) => (name.toLowerCase() === "authorization" ? `Bearer ${token}` : null) },
    };

    const result = await requireRole(req, ["admin"]);
    expect(result).toEqual({
      userId: "admin_789",
      role: "admin",
    });
  });

  describe("requireAdmin Helper", () => {
    it("should return a 401 NextResponse when unauthenticated", async () => {
      const req = { cookies: { get: () => null }, headers: { get: () => null } };
      const res = await requireAdmin(req);

      expect(res).toBeInstanceOf(NextResponse);
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe("Unauthorized: Missing authentication token");
    });

    it("should return a 403 NextResponse when user role is not admin", async () => {
      const token = jwt.sign(
        { userId: "user_456", role: "user", type: "access" },
        secret,
        { expiresIn: "15m" }
      );
      const req = {
        cookies: { get: () => ({ value: token }) },
        headers: { get: () => null },
      };

      const res = await requireAdmin(req);
      expect(res).toBeInstanceOf(NextResponse);
      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe("Forbidden: Insufficient role permissions");
    });

    it("should return userId and role object when user is admin", async () => {
      const token = jwt.sign(
        { userId: "admin_999", role: "admin", type: "access" },
        secret,
        { expiresIn: "15m" }
      );
      const req = {
        cookies: { get: () => ({ value: token }) },
        headers: { get: () => null },
      };

      const result = await requireAdmin(req);
      expect(result).not.toBeInstanceOf(NextResponse);
      expect(result).toEqual({ userId: "admin_999", role: "admin" });
    });
  });
});
