import { describe, it, expect, vi } from "vitest";
import { POST } from "@/app/api/admin/inventory/bulk/route";
import jwt from "jsonwebtoken";
import * as inventoryService from "@/services/inventory.service";

// Mock Database Connection and Inventory Service
vi.mock("@/lib/db", () => ({
  connectDB: vi.fn().mockResolvedValue(true),
}));

vi.mock("@/services/inventory.service", () => ({
  bulkRestockProducts: vi.fn(),
}));

function createMockPostRequest(body, token = null) {
  return {
    json: vi.fn().mockResolvedValue(body),
    cookies: {
      get: (name) => (name === "accessToken" && token ? { value: token } : null),
    },
    headers: {
      get: (name) => (name.toLowerCase() === "authorization" && token ? `Bearer ${token}` : null),
    },
  };
}

describe("API Route: POST /api/admin/inventory/bulk", () => {
  const secret = process.env.JWT_SECRET;

  it("should return 401 Unauthorized when request has no token", async () => {
    const req = createMockPostRequest({ items: [{ productId: "p1", quantity: 10 }] });
    const res = await POST(req);

    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain("Unauthorized");
  });

  it("should return 403 Forbidden when called by a non-admin user", async () => {
    const userToken = jwt.sign(
      { userId: "user_100", role: "user", type: "access" },
      secret
    );
    const req = createMockPostRequest({ items: [{ productId: "p1", quantity: 10 }] }, userToken);
    const res = await POST(req);

    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain("Forbidden");
  });

  it("should return 400 Bad Request when items list is empty or missing", async () => {
    const adminToken = jwt.sign(
      { userId: "admin_100", role: "admin", type: "access" },
      secret
    );
    const req = createMockPostRequest({ items: [] }, adminToken);
    const res = await POST(req);

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.message).toContain("Items list is required");
  });

  it("should successfully process bulk restock when called by an admin", async () => {
    const adminToken = jwt.sign(
      { userId: "admin_100", role: "admin", type: "access" },
      secret
    );
    const mockItems = [{ productId: "p1", quantity: 50 }];
    
    vi.spyOn(inventoryService, "bulkRestockProducts").mockResolvedValueOnce([
      { productId: "p1", newStock: 100 },
    ]);

    const req = createMockPostRequest({ items: mockItems, reason: "Monthly Restock" }, adminToken);
    const res = await POST(req);

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.message).toContain("Successfully restocked 1 items");
    expect(inventoryService.bulkRestockProducts).toHaveBeenCalledWith({
      items: mockItems,
      reason: "Monthly Restock",
      performedBy: "admin_100",
    });
  });
});
