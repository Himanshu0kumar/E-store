import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { updateUserStatus } from "@/services/user.service";
import { requireAdmin } from "@/lib/auth/requireRole";

// PATCH /api/admin/users/[id]/status - Quick status toggle (active, inactive, banned)
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

    const updatedUser = await updateUserStatus(id, status);
    return NextResponse.json({
      success: true,
      message: `User account status updated to ${status}`,
      data: updatedUser,
    });
  } catch (error) {
    console.error("PATCH /api/admin/users/[id]/status error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update user status" },
      { status: 400 }
    );
  }
}
