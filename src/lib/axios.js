import axios from "axios";

/**
 * Centralized Axios instance for all API calls.
 *
 * - In client-side browser context, baseURL defaults to relative path ("")
 *   so requests automatically target the current origin (localhost during dev,
 *   Vercel domain in production), eliminating cross-origin CORS blocks.
 *
 * - withCredentials ensures httpOnly cookies (access + refresh tokens)
 *   are sent and received automatically by the browser.
 */
const getBaseURL = () => {
  if (typeof window !== "undefined") {
    return "";
  }
  return process.env.NEXT_PUBLIC_API_URL || "";
};

const api = axios.create({
  baseURL: getBaseURL(),
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
      message:
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Something went wrong",
      status: error.response?.status || 500,
    };

    return Promise.reject(customError);
  }
);

export default api;