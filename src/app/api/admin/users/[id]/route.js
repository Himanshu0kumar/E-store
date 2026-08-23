import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import {
  getUserById,
  updateUser,
  deleteUser,
} from "@/services/user.service";
import { requireAdmin } from "@/lib/auth/requireRole";

// GET /api/admin/users/[id] - Fetch single user details with order history
export async function GET(req, { params }) {
  try {
    const authResult = await requireAdmin(req);
    if (authResult instanceof NextResponse) return authResult;

    await connectDB();
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const user = await getUserById(id);
    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("GET /api/admin/users/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch user details" },
      { status: 404 }
    );
  }
}

// PUT /api/admin/users/[id] - Update user details
export async function PUT(req, { params }) {
  try {
    const authResult = await requireAdmin(req);
    if (authResult instanceof NextResponse) return authResult;

    await connectDB();
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await req.json();

    const updatedUser = await updateUser(id, body);
    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("PUT /api/admin/users/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update user" },
      { status: 400 }
    );
  }
}

// DELETE /api/admin/users/[id] - Delete user
export async function DELETE(req, { params }) {
  try {
    const authResult = await requireAdmin(req);
    if (authResult instanceof NextResponse) return authResult;

    await connectDB();
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const result = await deleteUser(id);
    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
      data: result,
    });
  } catch (error) {
    console.error("DELETE /api/admin/users/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete user" },
      { status: 400 }
    );
  }
}
