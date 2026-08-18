import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/auth/getAuthUser";
import {
  getWishlist,
  addToWishlist,
  isProductInWishlist,
  clearWishlist,
} from "@/services/wishlist.service";

async function verifyAuth(req) {
  const userId = await getAuthUser(req);
  if (!userId) {
    throw new Error("No token provided");
  }
  return userId;
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

    const result = await addToWishlist(userId, productId, priority || "medium");
    const wishlistData = result?.wishlist || result;
    const alreadyExists = Boolean(result?.alreadyExists);

    return Response.json(
      {
        success: true,
        data: wishlistData,
        message: alreadyExists
          ? "Product is already in your wishlist"
          : "Item added to wishlist",
        alreadyExists,
      },
      { status: 200 }
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