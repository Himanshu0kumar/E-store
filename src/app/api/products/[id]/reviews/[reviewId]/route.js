import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import {
  updateCustomerReview,
  deleteCustomerReview,
} from "@/services/review.service";

// PUT /api/products/[id]/reviews/[reviewId] - Customer edit review
export async function PUT(req, { params }) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const { reviewId } = resolvedParams;
    const body = await req.json();

    const { userId, rating, title, comment } = body;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 401 }
      );
    }

    const updated = await updateCustomerReview({
      reviewId,
      userId,
      rating,
      title,
      comment,
    });

    return NextResponse.json({
      success: true,
      message: "Review updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("PUT customer review error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update review" },
      { status: 400 }
    );
  }
}

// DELETE /api/products/[id]/reviews/[reviewId] - Customer delete review
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const { reviewId } = resolvedParams;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 401 }
      );
    }

    const result = await deleteCustomerReview({
      reviewId,
      userId,
    });

    return NextResponse.json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (error) {
    console.error("DELETE customer review error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete review" },
      { status: 400 }
    );
  }
}
