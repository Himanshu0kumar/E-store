import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { resetPermissionsToDefault } from "@/services/permission.service";

// POST /api/admin/permissions/reset - Reset role permissions to system defaults
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json().catch(() => ({}));
    const { role } = body;

    const result = await resetPermissionsToDefault(role || null);
    return NextResponse.json({
      success: true,
      message: role
        ? `Permissions for ${role} have been reset to factory defaults`
        : "All role permissions have been reset to factory defaults",
      data: result,
    });
  } catch (error) {
    console.error("POST /api/admin/permissions/reset error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to reset permissions" },
      { status: 500 }
    );
  }
}
