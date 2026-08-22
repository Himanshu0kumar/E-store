import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { bulkRestockProducts } from "@/services/inventory.service";

// POST bulk restock products
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { items, reason, performedBy } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Items list is required for bulk restock" },
        { status: 400 }
      );
    }

    const results = await bulkRestockProducts({
      items,
      reason,
      performedBy,
    });

    return NextResponse.json({
      success: true,
      message: `Successfully restocked ${results.length} items`,
      results,
    });
  } catch (error) {
    console.error("Bulk restock error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}
