import { describe, it, expect, vi } from "vitest";
import jwt from "jsonwebtoken";
import { GET as getSettings, PUT as updateSettings } from "@/app/api/admin/settings/route";
import { GET as getProfile, PUT as updateProfile } from "@/app/api/admin/profile/route";

vi.mock("@/lib/db", () => ({
  connectDB: vi.fn().mockResolvedValue(true),
}));

vi.mock("@/models/Settings", () => {
  const mockSettingsDoc = {
    _id: "settings123",
    storeName: "ShopX Store",
    storeEmail: "support@shopx.com",
    storePhone: "+91 9876543210",
    currency: "INR",
    taxRate: 18,
    shippingFee: 50,
    freeShippingThreshold: 999,
    lowStockThreshold: 5,
    maintenanceMode: false,
    orderEmailNotifications: true,
  };

  return {
    default: {
      findOne: vi.fn().mockResolvedValue(mockSettingsDoc),
      create: vi.fn().mockResolvedValue(mockSettingsDoc),
      findByIdAndUpdate: vi.fn().mockResolvedValue(mockSettingsDoc),
    },
  };
});

vi.mock("@/models/User", () => {
  const mockAdminDoc = {
    _id: "admin123",
    name: "Admin User",
    email: "admin@shopx.com",
    role: "admin",
    status: "active",
    select: vi.fn().mockResolvedValue({
      _id: "admin123",
      name: "Admin User",
      email: "admin@shopx.com",
      role: "admin",
    }),
    save: vi.fn().mockResolvedValue(true),
  };

  return {
    default: {
      findById: vi.fn().mockImplementation(() => ({
        select: vi.fn().mockResolvedValue(mockAdminDoc),
      })),
      findOne: vi.fn().mockResolvedValue(null),
    },
  };
});

describe("Admin Settings & Profile API Endpoints", () => {
  const secret = process.env.JWT_SECRET;

  const createAdminReq = (body = null) => {
    const token = jwt.sign(
      { userId: "admin123", role: "admin", email: "admin@shopx.com" },
      secret
    );
    return {
      cookies: { get: (name) => (name === "accessToken" ? { value: token } : null) },
      headers: { get: () => null },
      json: async () => body,
    };
  };

  const createUserReq = () => {
    const token = jwt.sign(
      { userId: "user123", role: "user", email: "user@shopx.com" },
      secret
    );
    return {
      cookies: { get: (name) => (name === "accessToken" ? { value: token } : null) },
      headers: { get: () => null },
    };
  };

  it("GET /api/admin/settings - rejects non-admin users with 403", async () => {
    const req = createUserReq();
    const res = await getSettings(req);
    expect(res.status).toBe(403);
  });

  it("GET /api/admin/settings - allows admin to fetch store settings", async () => {
    const req = createAdminReq();
    const res = await getSettings(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.storeName).toBe("ShopX Store");
  });

  it("PUT /api/admin/settings - updates store configuration for admin", async () => {
    const req = createAdminReq({
      storeName: "Updated ShopX Store",
      taxRate: 12,
    });
    const res = await updateSettings(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
  });

  it("GET /api/admin/profile - returns profile for authenticated admin", async () => {
    const req = createAdminReq();
    const res = await getProfile(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
  });
});
