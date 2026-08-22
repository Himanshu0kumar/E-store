import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { voteReviewHelpful } from "@/services/review.service";

// POST /api/products/[id]/reviews/[reviewId]/vote - Helpful vote
export async function POST(req, { params }) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const { reviewId } = resolvedParams;
    const body = await req.json().catch(() => ({}));

    const { userId, vote = "up" } = body;
    const updated = await voteReviewHelpful(reviewId, userId || null, vote);

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("POST helpful vote error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to register vote" },
      { status: 400 }
    );
  }
}
