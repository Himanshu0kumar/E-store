import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { checkUserReviewEligibility } from "@/services/review.service";

// GET /api/products/[id]/reviews/eligibility?userId=...
export async function GET(req, { params }) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    const eligibility = await checkUserReviewEligibility(id, userId);
    return NextResponse.json({
      success: true,
      data: eligibility,
    });
  } catch (error) {
    console.error("GET review eligibility error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to check review eligibility" },
      { status: 500 }
    );
  }
}
