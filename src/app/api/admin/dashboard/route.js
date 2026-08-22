import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getDashboardAnalytics } from "@/services/dashboard.service";

// GET real-time admin dashboard metrics & analytics
export async function GET() {
  try {
    await connectDB();
    const data = await getDashboardAnalytics();

    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error("Dashboard analytics error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}
