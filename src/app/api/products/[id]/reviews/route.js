import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import {
  getProductReviews,
  createReview,
} from "@/services/review.service";

// GET /api/products/[id]/reviews - Fetch approved product reviews with stats breakdown
export async function GET(req, { params }) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page") || 1;
    const limit = searchParams.get("limit") || 10;
    const sort = searchParams.get("sort") || "newest";
    const rating = searchParams.get("rating") || "all";
    const userId = searchParams.get("userId") || null;

    const result = await getProductReviews(id, {
      page,
      limit,
      sort,
      rating,
      userId,
    });
    return NextResponse.json({
      success: true,
      data: result.reviews,
      eligibility: result.eligibility,
      stats: {
        averageRating: result.averageRating,
        totalReviews: result.totalReviews,
        breakdown: result.breakdown,
      },
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("GET /api/products/[id]/reviews error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch product reviews" },
      { status: 500 }
    );
  }
}

// POST /api/products/[id]/reviews - Submit customer review
export async function POST(req, { params }) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await req.json();

    const { userId, rating, title, comment } = body;
    if (!userId || !rating || !comment) {
      return NextResponse.json(
        { success: false, error: "Rating (1-5) and comment are required" },
        { status: 400 }
      );
    }

    const review = await createReview({
      productId: id,
      userId,
      rating: Number(rating),
      title,
      comment,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Thank you! Your review has been submitted.",
        data: review,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/products/[id]/reviews error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit review" },
      { status: 400 }
    );
  }
}
