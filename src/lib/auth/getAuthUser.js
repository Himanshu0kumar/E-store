import { verifyToken } from "@/services/auth.service";

// Use at the top of any protected route:
//   const userId = await getAuthUser(req);
//   if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
export const getAuthUser = async (req) => {
  const token = req.cookies.get("accessToken")?.value;
  if (!token) return null;

  try {
    const decoded = await verifyToken(token, "access");
    return decoded.userId;
  } catch {
    return null;
  }
};