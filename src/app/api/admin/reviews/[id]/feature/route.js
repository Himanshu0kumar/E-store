import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { toggleReviewFeatured } from "@/services/review.service";

// PATCH /api/admin/reviews/[id]/feature - Pin or unpin review
export async function PATCH(req, { params }) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const updated = await toggleReviewFeatured(id);
    return NextResponse.json({
      success: true,
      message: updated.featured ? "Review pinned to top" : "Review unpinned",
      data: updated,
    });
  } catch (error) {
    console.error("PATCH /api/admin/reviews/[id]/feature error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to toggle featured" },
      { status: 400 }
    );
  }
}
