import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/auth/getAuthUser";
import { getOrderById, updateOrderStatus } from "@/services/order.service";
import Order from "@/models/Order";
import User from "@/models/User";

async function verifyAuth(req) {
  const userId = await getAuthUser(req);
  if (!userId) {
    throw new Error("Unauthorized");
  }
  return userId;
}

// GET: Fetch a single order by ID
export async function GET(req, { params }) {
  try {
    await connectDB();
    const userId = await verifyAuth(req);
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const user = await User.findById(userId);
    const isAdmin = user?.role === "admin";

    const order = await getOrderById(id, userId, isAdmin);

    return Response.json({ success: true, data: order }, { status: 200 });
  } catch (error) {
    console.error("Get order details error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: error.message === "Unauthorized" ? 401 : 404 }
    );
  }
}

// PUT: Update order (Admin only)
export async function PUT(req, { params }) {
  try {
    await connectDB();
    const userId = await verifyAuth(req);
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const user = await User.findById(userId);
    if (!user || user.role !== "admin") {
      return Response.json(
        { success: false, error: "Only admins can update order details" },
        { status: 403 }
      );
    }

    const body = await req.json();

    const updatedOrder = await updateOrderStatus(id, {
      status: body.status,
      courierInfo: body.courierInfo,
      location: body.location,
      description: body.description,
      paymentStatus: body.paymentStatus,
      notes: body.notes,
    });

    return Response.json(
      {
        success: true,
        data: updatedOrder,
        message: "Order updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update order error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

// DELETE: Delete order (Admin only)
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const userId = await verifyAuth(req);
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const user = await User.findById(userId);
    if (!user || user.role !== "admin") {
      return Response.json(
        { success: false, error: "Only admins can delete orders" },
        { status: 403 }
      );
    }

    await Order.findByIdAndDelete(id);

    return Response.json(
      { success: true, message: "Order deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete order error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
