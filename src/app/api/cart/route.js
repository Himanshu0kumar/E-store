import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import { verifyToken } from "@/services/auth.service";
import {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart,
  applyCoupon,
  updateShipping,
} from "@/services/cart.service";

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

// GET: Fetch cart
export async function GET(req) {
  try {
    await connectDB();
    const userId = await verifyAuth(req);

    const cart = await getCart(userId);

    return Response.json(
      {
        success: true,
        data: cart,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fetch cart error:", error);
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: error.message === "No token provided" ? 401 : 400 }
    );
  }
}

// POST: Add to cart
export async function POST(req) {
  try {
    await connectDB();
    const userId = await verifyAuth(req);
    const { productId, quantity, selectedColor, selectedSize } = await req.json();

    if (!productId) {
      return Response.json(
        {
          success: false,
          error: "Product ID is required",
        },
        { status: 400 }
      );
    }

    const result = await addToCart(
      userId,
      productId,
      quantity || 1,
      selectedColor,
      selectedSize
    );
    const cartData = result?.cart || result;
    const alreadyExists = Boolean(result?.alreadyExists);

    return Response.json(
      {
        success: true,
        data: cartData,
        message: alreadyExists
          ? "Item quantity updated in cart"
          : "Item added to cart successfully",
        alreadyExists,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Add to cart error:", error);
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: error.message === "No token provided" ? 401 : 400 }
    );
  }
}

// DELETE: Clear cart
export async function DELETE(req) {
  try {
    await connectDB();
    const userId = await verifyAuth(req);

    const cart = await clearCart(userId);

    return Response.json(
      {
        success: true,
        data: cart,
        message: "Cart cleared successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Clear cart error:", error);
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: error.message === "No token provided" ? 401 : 400 }
    );
  }
}

// PUT: Update item or apply coupon
export async function PUT(req) {
  try {
    await connectDB();
    const userId = await verifyAuth(req);
    const data = await req.json();

    if (data.couponCode) {
      // Apply coupon
      const cart = await applyCoupon(userId, data.couponCode, data.discount);
      return Response.json(
        {
          success: true,
          data: cart,
          message: "Coupon applied successfully",
        },
        { status: 200 }
      );
    }

    if (data.shipping !== undefined) {
      // Update shipping
      const cart = await updateShipping(userId, data.shipping);
      return Response.json(
        {
          success: true,
          data: cart,
          message: "Shipping updated successfully",
        },
        { status: 200 }
      );
    }

    return Response.json(
      {
        success: false,
        error: "Invalid request",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("Update cart error:", error);
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: error.message === "No token provided" ? 401 : 400 }
    );
  }
}