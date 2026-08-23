import { describe, it, expect, vi } from "vitest";
import { GET } from "@/app/api/admin/users/stats/route";
import jwt from "jsonwebtoken";
import * as userService from "@/services/user.service";

vi.mock("@/lib/db", () => ({
  connectDB: vi.fn().mockResolvedValue(true),
}));

vi.mock("@/services/user.service", () => ({
  getUserStats: vi.fn(),
}));

function createMockGetRequest(token = null) {
  return {
    cookies: {
      get: (name) => (name === "accessToken" && token ? { value: token } : null),
    },
    headers: {
      get: (name) => (name.toLowerCase() === "authorization" && token ? `Bearer ${token}` : null),
    },
  };
}

describe("API Route: GET /api/admin/users/stats", () => {
  const secret = process.env.JWT_SECRET;

  it("should return 401 Unauthorized when unauthenticated", async () => {
    const req = createMockGetRequest();
    const res = await GET(req);

    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.success).toBe(false);
  });

  it("should return 403 Forbidden when called by regular user", async () => {
    const userToken = jwt.sign(
      { userId: "u_200", role: "user", type: "access" },
      secret
    );
    const req = createMockGetRequest(userToken);
    const res = await GET(req);

    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.success).toBe(false);
  });

  it("should return 200 OK with user statistics when called by admin", async () => {
    const adminToken = jwt.sign(
      { userId: "a_200", role: "admin", type: "access" },
      secret
    );
    const mockStats = { totalUsers: 150, activeUsers: 140, newThisMonth: 12 };

    vi.spyOn(userService, "getUserStats").mockResolvedValueOnce(mockStats);

    const req = createMockGetRequest(adminToken);
    const res = await GET(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data).toEqual(mockStats);
  });
});
