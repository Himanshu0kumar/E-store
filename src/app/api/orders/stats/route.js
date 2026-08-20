import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/auth/getAuthUser";
import { getOrderStats } from "@/services/order.service";
import User from "@/models/User";

async function verifyAuth(req) {
  const userId = await getAuthUser(req);
  if (!userId) {
    throw new Error("Unauthorized");
  }
  return userId;
}

// GET: Order statistics for admin dashboard
export async function GET(req) {
  try {
    await connectDB();
    const userId = await verifyAuth(req);

    const user = await User.findById(userId);
    if (!user || user.role !== "admin") {
      return Response.json(
        { success: false, error: "Only admins can access order statistics" },
        { status: 403 }
      );
    }

    const stats = await getOrderStats();

    return Response.json(
      {
        success: true,
        data: stats,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Order stats error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}
