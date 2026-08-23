import { authMiddleware } from "./auth.middleware";
import { securityMiddleware } from "./security.middleware";

/**
 * Main Middleware Handler.
 * Sequentially executes authentication/role checks and applies security response headers.
 */
export function handleMiddleware(req) {
  // 1. Run Authentication & Role Middleware
  const authResponse = authMiddleware(req);

  // If auth middleware triggered a redirect (30x) or JSON error response (401/403), return immediately
  if (authResponse.status >= 300) {
    return authResponse;
  }

  // 2. Apply Security Headers to response
  return securityMiddleware(req, authResponse);
}

export { authMiddleware } from "./auth.middleware";
export { securityMiddleware } from "./security.middleware";
