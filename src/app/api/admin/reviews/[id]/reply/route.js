import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { addAdminReply } from "@/services/review.service";

// PATCH /api/admin/reviews/[id]/reply - Add or update admin reply
export async function PATCH(req, { params }) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await req.json();

    const { comment } = body;
    if (!comment) {
      return NextResponse.json(
        { success: false, error: "Reply comment is required" },
        { status: 400 }
      );
    }

    const updated = await addAdminReply(id, comment);
    return NextResponse.json({
      success: true,
      message: "Merchant reply posted successfully",
      data: updated,
    });
  } catch (error) {
    console.error("PATCH /api/admin/reviews/[id]/reply error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to post reply" },
      { status: 400 }
    );
  }
}
