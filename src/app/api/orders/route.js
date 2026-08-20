import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/auth/getAuthUser";
import { createOrder, getUserOrders, getAllOrders } from "@/services/order.service";
import User from "@/models/User";

async function verifyAuth(req) {
  const userId = await getAuthUser(req);
  if (!userId) {
    throw new Error("Unauthorized");
  }
  return userId;
}

// GET: Fetch orders (user's orders, or all orders if admin requested)
export async function GET(req) {
  try {
    await connectDB();
    const userId = await verifyAuth(req);

    const { searchParams } = new URL(req.url);
    const isAdminMode = searchParams.get("admin") === "true";
    const status = searchParams.get("status") || "all";
    const paymentStatus = searchParams.get("paymentStatus") || "all";
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const sort = searchParams.get("sort") || "newest";

    const user = await User.findById(userId);
    if (!user) {
      return Response.json({ success: false, error: "User not found" }, { status: 404 });
    }

    if (isAdminMode && user.role === "admin") {
      const data = await getAllOrders({
        status,
        paymentStatus,
        search,
        page,
        limit,
        sort,
      });
      return Response.json({ success: true, data }, { status: 200 });
    }

    // Default to fetching logged-in user's own orders
    const data = await getUserOrders(userId, {
      status,
      search,
      page,
      limit,
    });

    return Response.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error("Fetch orders error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}

// POST: Place a new order
export async function POST(req) {
  try {
    await connectDB();
    const userId = await verifyAuth(req);
    const body = await req.json();

    const order = await createOrder({
      userId,
      items: body.items,
      shippingAddress: body.shippingAddress,
      billingAddress: body.billingAddress,
      paymentInfo: body.paymentInfo,
      pricing: body.pricing,
      contact: body.contact,
    });

    return Response.json(
      {
        success: true,
        data: order,
        message: "Order placed successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create order error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: error.message === "Unauthorized" ? 401 : 400 }
    );
  }
}
