import { cookies } from "next/headers";
import { verifyToken } from "@/services/auth.service";

// Use at the top of any protected route:
//   const userId = await getAuthUser(req);
//   if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
export const getAuthUser = async (req) => {
  let token = req?.cookies?.get?.("accessToken")?.value;

  if (!token && req?.headers) {
    const authHeader = typeof req.headers.get === "function" ? req.headers.get("authorization") : req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }
  }

  if (!token) {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get("accessToken")?.value;
    } catch {
      // Ignore if called outside server context
    }
  }

  if (!token) return null;

  try {
    const decoded = await verifyToken(token, "access");
    return decoded.userId || decoded.id;
  } catch {
    return null;
  }
};