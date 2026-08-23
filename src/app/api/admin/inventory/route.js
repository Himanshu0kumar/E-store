import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import {
  getInventoryOverview,
  updateProductStock,
} from "@/services/inventory.service";
import { requireAdmin } from "@/lib/auth/requireRole";

// GET inventory overview & statistics
export async function GET(req) {
  try {
    const authResult = await requireAdmin(req);
    if (authResult instanceof NextResponse) return authResult;

    await connectDB();
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search") || "";
    const stockStatus = searchParams.get("stockStatus") || "all";
    const category = searchParams.get("category") || "all";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const sort = searchParams.get("sort") || "stock_asc";

    const data = await getInventoryOverview({
      search,
      stockStatus,
      category,
      page,
      limit,
      sort,
    });

    return NextResponse.json({ success: true, ...data });
  } catch (error) {
    console.error("Get inventory overview error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}

// PATCH adjust product stock
export async function PATCH(req) {
  try {
    const authResult = await requireAdmin(req);
    if (authResult instanceof NextResponse) return authResult;

    await connectDB();
    const body = await req.json();
    const {
      productId,
      quantity,
      adjustBy,
      lowStockThreshold,
      reason,
      performedBy,
    } = body;

    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 }
      );
    }

    const updated = await updateProductStock({
      productId,
      quantity,
      adjustBy,
      lowStockThreshold,
      reason,
      performedBy: performedBy || authResult.userId,
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    console.error("Update product stock error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}
