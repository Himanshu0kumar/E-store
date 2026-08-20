import axios from "axios";

/**
 * Centralized Axios instance for all API calls.
 *
 * - baseURL is intentionally left empty so requests use relative paths
 *   (e.g. "/api/auth/login"). This makes the app work identically on
 *   localhost:3000 during development and on the deployed Vercel domain
 *   in production — no environment variable required.
 *
 * - withCredentials ensures httpOnly cookies (access + refresh tokens)
 *   are sent and received automatically by the browser.
 */
const api = axios.create({
  baseURL: "",
  timeout: 15000, // 15-second timeout to avoid hanging requests
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ── Request Interceptor ─────────────────────────────────────────────
// Attach the Bearer token from localStorage (if present) to every
// outgoing request. This is a fallback for flows that don't rely
// solely on httpOnly cookies.
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ────────────────────────────────────────────
// Normalise error responses so callers always receive a consistent
// { message, status } shape instead of raw Axios error objects.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const customError = {
      message: error.response?.data?.error
        || error.response?.data?.message
        || error.message
        || "Something went wrong",
      status: error.response?.status || 500,
    };

    return Promise.reject(customError);
  }
);

export default api;