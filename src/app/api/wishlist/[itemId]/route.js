import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/auth/getAuthUser";
import {
  removeFromWishlist,
  updateWishlistItemPriority,
  addNoteToWishlistItem,
  moveToCart,
} from "@/services/wishlist.service";

async function verifyAuth(req) {
  const userId = await getAuthUser(req);
  if (!userId) {
    throw new Error("No token provided");
  }
  return userId;
}

// PUT: Update wishlist item (priority or note)
export async function PUT(req, { params }) {
  try {
    await connectDB();
    const userId = await verifyAuth(req);
    const { itemId } = await params;
    const data = await req.json();

    if (data.priority) {
      const wishlist = await updateWishlistItemPriority(
        userId,
        itemId,
        data.priority
      );
      return Response.json(
        {
          success: true,
          data: wishlist,
          message: "Priority updated",
        },
        { status: 200 }
      );
    }

    if (data.note !== undefined) {
      const wishlist = await addNoteToWishlistItem(userId, itemId, data.note);
      return Response.json(
        {
          success: true,
          data: wishlist,
          message: "Note added",
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
    console.error("Update wishlist item error:", error);
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: error.message === "No token provided" ? 401 : 400 }
    );
  }
}

// DELETE: Remove from wishlist
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const userId = await verifyAuth(req);
    const { itemId } = await params;

    const wishlist = await removeFromWishlist(userId, itemId);

    return Response.json(
      {
        success: true,
        data: wishlist,
        message: "Item removed from wishlist",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Remove wishlist item error:", error);
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: error.message === "No token provided" ? 401 : 400 }
    );
  }
}