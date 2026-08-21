import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUserStats } from "@/services/user.service";

// GET /api/admin/users/stats - Get aggregate user metrics
export async function GET() {
  try {
    await connectDB();
    const stats = await getUserStats();
    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("GET /api/admin/users/stats error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch user statistics" },
      { status: 500 }
    );
  }
}
