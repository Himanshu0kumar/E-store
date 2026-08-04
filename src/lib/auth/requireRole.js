import { verifyToken } from "@/services/auth.service";

// Use on any route that must be restricted to specific roles (e.g.
// admin-only endpoints). Unlike getAuthUser(), this also checks
// PERMISSION LEVEL, not just identity — the role comes from the
// signed access token's claims, not anything the client can spoof.
//
//   const auth = await requireRole(req, ["admin"]);
//   if (!auth) {
//     return Response.json({ success: false, error: "Forbidden" }, { status: 403 });
//   }
//   // auth.userId, auth.role are now available
//
// Returns null if there's no valid token OR the token's role isn't
// in allowedRoles — callers don't need to distinguish "not logged
// in" from "logged in but not allowed," both are just "no access."
export const requireRole = async (req, allowedRoles = []) => {
  const token = req.cookies.get("accessToken")?.value;
  if (!token) return null;

  try {
    const decoded = await verifyToken(token, "access");

    if (!decoded.role || !allowedRoles.includes(decoded.role)) {
      return null;
    }

    return { userId: decoded.userId, role: decoded.role };
  } catch {
    return null;
  }
};