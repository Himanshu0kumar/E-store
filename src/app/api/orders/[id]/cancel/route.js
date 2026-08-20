import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/auth/getAuthUser";
import { cancelOrder } from "@/services/order.service";
import User from "@/models/User";

async function verifyAuth(req) {
  const userId = await getAuthUser(req);
  if (!userId) {
    throw new Error("Unauthorized");
  }
  return userId;
}

// POST: Cancel order with reason
export async function POST(req, { params }) {
  try {
    await connectDB();
    const userId = await verifyAuth(req);
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const user = await User.findById(userId);
    const isAdmin = user?.role === "admin";

    const body = await req.json().catch(() => ({}));
    const reason = body?.reason || "Customer cancelled the order";

    const cancelledOrder = await cancelOrder(id, userId, {
      reason,
      cancelledBy: isAdmin ? "admin" : "user",
    });

    return Response.json(
      {
        success: true,
        data: cancelledOrder,
        message: "Order has been cancelled successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Cancel order error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: error.message === "Unauthorized" ? 401 : 400 }
    );
  }
}
