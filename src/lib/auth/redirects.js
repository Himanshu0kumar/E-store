/**
 * Authentication and authorization role definitions.
 */
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
};

/**
 * Default post-login destination routes mapped by user role.
 * - Admin users route to the Admin Dashboard (/dashboard).
 * - Standard users route to the Storefront Home page (/).
 */
export const DEFAULT_ROLE_REDIRECTS = {
  [ROLES.ADMIN]: "/dashboard",
  [ROLES.USER]: "/",
};

/**
 * Validates a redirect path to guard against Open Redirect vulnerabilities.
 * Ensures the target path is a safe relative URI (starts with '/' and not '//').
 *
 * @param {string|null} path - The candidate redirect path.
 * @returns {boolean} True if the path is a safe relative URI.
 */
export function isSafeRedirectPath(path) {
  if (!path || typeof path !== "string") return false;
  return path.startsWith("/") && !path.startsWith("//");
}

/**
 * Resolves the appropriate post-authentication redirect URL.
 *
 * @param {Object|string|null} userOrRole - User object containing `role` or role string.
 * @param {string|null} redirectParam - Optional intended redirect path requested by the client.
 * @returns {string} The resolved safe target route.
 */
export function getPostLoginRedirect(userOrRole, redirectParam = null) {
  // If an explicit intended path was specified and is safe, prioritize it
  if (isSafeRedirectPath(redirectParam)) {
    return redirectParam;
  }

  const role = typeof userOrRole === "object" ? userOrRole?.role : userOrRole;

  // Fallback based on user role, defaulting to Home page
  return DEFAULT_ROLE_REDIRECTS[role] || DEFAULT_ROLE_REDIRECTS[ROLES.USER];
}
