import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { deleteReview } from "@/services/review.service";
import Review from "@/models/Review";

// GET /api/admin/reviews/[id] - Get review details
export async function GET(req, { params }) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const review = await Review.findById(id)
      .populate("product", "name images regularPrice salePrice category")
      .populate("user", "name email avatar")
      .lean();

    if (!review) {
      return NextResponse.json(
        { success: false, error: "Review not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: review,
    });
  } catch (error) {
    console.error("GET /api/admin/reviews/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch review" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/reviews/[id] - Delete review
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const result = await deleteReview(id);
    return NextResponse.json({
      success: true,
      message: "Review deleted successfully",
      data: result,
    });
  } catch (error) {
    console.error("DELETE /api/admin/reviews/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete review" },
      { status: 400 }
    );
  }
}
