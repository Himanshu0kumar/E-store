import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { updateReviewStatus } from "@/services/review.service";
import { requireAdmin } from "@/lib/auth/requireRole";

// PATCH /api/admin/reviews/[id]/status - Moderate review status
export async function PATCH(req, { params }) {
  try {
    const authResult = await requireAdmin(req);
    if (authResult instanceof NextResponse) return authResult;

    await connectDB();
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await req.json();

    const { status } = body;
    if (!status) {
      return NextResponse.json(
        { success: false, error: "Status is required" },
        { status: 400 }
      );
    }

    const updated = await updateReviewStatus(id, status);
    return NextResponse.json({
      success: true,
      message: `Review status updated to ${status}`,
      data: updated,
    });
  } catch (error) {
    console.error("PATCH /api/admin/reviews/[id]/status error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update review status" },
      { status: 400 }
    );
  }
}
