import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAllReviews } from "@/services/review.service";
import { requireAdmin } from "@/lib/auth/requireRole";

// GET /api/admin/reviews - Paginated review list with filters
export async function GET(req) {
  try {
    const authResult = await requireAdmin(req);
    if (authResult instanceof NextResponse) return authResult;

    await connectDB();
    const { searchParams } = new URL(req.url);

    const page = searchParams.get("page") || 1;
    const limit = searchParams.get("limit") || 10;
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";
    const rating = searchParams.get("rating") || "all";
    const productId = searchParams.get("productId") || null;
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const result = await getAllReviews({
      page,
      limit,
      search,
      status,
      rating,
      productId,
      sortBy,
      sortOrder,
    });

    return NextResponse.json({
      success: true,
      data: result.reviews,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("GET /api/admin/reviews error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
