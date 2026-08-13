import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import { verifyToken } from "@/services/auth.service";
import { updateCartItemQuantity, removeFromCart } from "@/services/cart.service";

async function verifyAuth(req) {
  let token = req.headers.get("authorization")?.split(" ")[1];
  if (!token) {
    const cookieStore = await cookies();
    token = cookieStore.get("accessToken")?.value;
  }
  if (!token) {
    throw new Error("No token provided");
  }
  const decoded = await verifyToken(token);
  return decoded.userId;
}

// PUT: Update item quantity
export async function PUT(req, { params }) {
  try {
    await connectDB();
    const userId = await verifyAuth(req);
    const { itemId } = await params;
    const { quantity } = await req.json();

    if (!quantity || quantity < 1) {
      return Response.json(
        {
          success: false,
          error: "Quantity must be at least 1",
        },
        { status: 400 }
      );
    }

    const cart = await updateCartItemQuantity(userId, itemId, quantity);

    return Response.json(
      {
        success: true,
        data: cart,
        message: "Item quantity updated",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update cart item error:", error);
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: error.message === "No token provided" ? 401 : 400 }
    );
  }
}

// DELETE: Remove item from cart
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const userId = await verifyAuth(req);
    const { itemId } = await params;

    const cart = await removeFromCart(userId, itemId);

    return Response.json(
      {
        success: true,
        data: cart,
        message: "Item removed from cart",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Remove cart item error:", error);
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: error.message === "No token provided" ? 401 : 400 }
    );
  }
}