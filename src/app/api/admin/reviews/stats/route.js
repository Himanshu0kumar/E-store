import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getReviewStats } from "@/services/review.service";
import { requireAdmin } from "@/lib/auth/requireRole";

// GET /api/admin/reviews/stats - Overview analytics and star distribution
export async function GET(req) {
  try {
    const authResult = await requireAdmin(req);
    if (authResult instanceof NextResponse) return authResult;

    await connectDB();
    const stats = await getReviewStats();
    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("GET /api/admin/reviews/stats error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch review statistics" },
      { status: 500 }
    );
  }
}
