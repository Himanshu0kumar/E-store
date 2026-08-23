import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getInventoryLogs } from "@/services/inventory.service";
import { requireAdmin } from "@/lib/auth/requireRole";

// GET inventory audit logs
export async function GET(req) {
  try {
    const authResult = await requireAdmin(req);
    if (authResult instanceof NextResponse) return authResult;

    await connectDB();
    const { searchParams } = new URL(req.url);

    const productId = searchParams.get("productId") || undefined;
    const changeType = searchParams.get("changeType") || "all";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const data = await getInventoryLogs({
      productId,
      changeType,
      page,
      limit,
    });

    return NextResponse.json({ success: true, ...data });
  } catch (error) {
    console.error("Get inventory logs error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}
