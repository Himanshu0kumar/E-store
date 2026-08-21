import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { updateUserRole } from "@/services/user.service";

// PATCH /api/admin/users/[id]/role - Quick role change
export async function PATCH(req, { params }) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await req.json();

    const { role } = body;
    if (!role) {
      return NextResponse.json(
        { success: false, error: "Role is required" },
        { status: 400 }
      );
    }

    const updatedUser = await updateUserRole(id, role);
    return NextResponse.json({
      success: true,
      message: `User role updated to ${role}`,
      data: updatedUser,
    });
  } catch (error) {
    console.error("PATCH /api/admin/users/[id]/role error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update user role" },
      { status: 400 }
    );
  }
}
