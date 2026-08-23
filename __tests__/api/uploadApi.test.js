import { describe, it, expect, vi } from "vitest";
import { POST } from "@/app/api/upload/route";
import jwt from "jsonwebtoken";

vi.mock("@/lib/cloudinary", () => ({
  default: {
    uploader: {
      upload_stream: vi.fn(),
    },
  },
}));

function createMockUploadRequest(token = null) {
  return {
    cookies: {
      get: (name) => (name === "accessToken" && token ? { value: token } : null),
    },
    headers: {
      get: (name) => (name.toLowerCase() === "authorization" && token ? `Bearer ${token}` : null),
    },
  };
}

describe("API Route: POST /api/upload", () => {
  const secret = process.env.JWT_SECRET;

  it("should return 401 Unauthorized when unauthenticated request attempts to upload files", async () => {
    const req = createMockUploadRequest();
    const res = await POST(req);

    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain("Unauthorized");
  });

  it("should accept request when authenticated user token is provided", async () => {
    const userToken = jwt.sign(
      { userId: "u_300", role: "user", type: "access" },
      secret
    );
    const req = createMockUploadRequest(userToken);
    req.formData = vi.fn().mockResolvedValue({
      getAll: () => [],
    });

    const res = await POST(req);
    expect(res.status).toBe(400); // 400 because no files were attached, but passed 401 auth check!
    const data = await res.json();
    expect(data.message).toBe("No files provided");
  });
});
