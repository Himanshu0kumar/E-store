import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import {
  getAllRolePermissions,
  updateRolePermissions,
} from "@/services/permission.service";
import { requireAdmin } from "@/lib/auth/requireRole";

// GET /api/admin/permissions - Fetch dynamic permissions matrix for all roles
export async function GET(req) {
  try {
    const authResult = await requireAdmin(req);
    if (authResult instanceof NextResponse) return authResult;

    await connectDB();
    const permissions = await getAllRolePermissions();
    return NextResponse.json({
      success: true,
      data: permissions,
    });
  } catch (error) {
    console.error("GET /api/admin/permissions error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch permissions" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/permissions - Update permissions for a given role
export async function PUT(req) {
  try {
    const authResult = await requireAdmin(req);
    if (authResult instanceof NextResponse) return authResult;

    await connectDB();
    const body = await req.json();
    const { role, permissions, displayName, description } = body;

    if (!role || !permissions) {
      return NextResponse.json(
        { success: false, error: "Role and permissions payload are required" },
        { status: 400 }
      );
    }

    const updatedRoleDoc = await updateRolePermissions(role, permissions, {
      displayName,
      description,
    });

    return NextResponse.json({
      success: true,
      message: `Permissions updated successfully for ${role}`,
      data: updatedRoleDoc,
    });
  } catch (error) {
    console.error("PUT /api/admin/permissions error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update permissions" },
      { status: 400 }
    );
  }
}
