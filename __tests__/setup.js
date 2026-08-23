import { vi } from "vitest";

// Environment variables setup for test suites (loads from process.env with fallback)
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-jwt-secret-key-999999999";
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "test-jwt-refresh-secret-key-999999999";

// Global reset before each test
beforeEach(() => {
  vi.clearAllMocks();
});
