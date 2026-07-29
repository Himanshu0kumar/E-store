import { connectDB } from "@/lib/db";
import { verifyToken } from "@/services/auth.service";
import {
  getWishlist,
  addToWishlist,
  isProductInWishlist,
  clearWishlist,
} from "@/services/wishlist.service";

async function verifyAuth(req) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  if (!token) {
    throw new Error("No token provided");
  }
  const decoded = await verifyToken(token);
  return decoded.userId;
}

// GET: Fetch wishlist
export async function GET(req) {
  try {
    await connectDB();
    const userId = await verifyAuth(req);

    const wishlist = await getWishlist(userId);

    return Response.json(
      {
        success: true,
        data: wishlist,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fetch wishlist error:", error);
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: error.message === "No token provided" ? 401 : 400 }
    );
  }
}

// POST: Add to wishlist
export async function POST(req) {
  try {
    await connectDB();
    const userId = await verifyAuth(req);
    const { productId, priority } = await req.json();

    if (!productId) {
      return Response.json(
        {
          success: false,
          error: "Product ID is required",
        },
        { status: 400 }
      );
    }

    const wishlist = await addToWishlist(userId, productId, priority || "medium");

    return Response.json(
      {
        success: true,
        data: wishlist,
        message: "Item added to wishlist",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Add to wishlist error:", error);
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: error.message === "No token provided" ? 401 : 400 }
    );
  }
}

// DELETE: Clear wishlist
export async function DELETE(req) {
  try {
    await connectDB();
    const userId = await verifyAuth(req);

    const wishlist = await clearWishlist(userId);

    return Response.json(
      {
        success: true,
        data: wishlist,
        message: "Wishlist cleared successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Clear wishlist error:", error);
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: error.message === "No token provided" ? 401 : 400 }
    );
  }
}