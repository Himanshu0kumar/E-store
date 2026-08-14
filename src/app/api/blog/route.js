import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getPublicBlogPosts } from "@/services/blog.service";

// GET public published blog posts
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const page = searchParams.get("page") || 1;
    const limit = searchParams.get("limit") || 10;
    const category = searchParams.get("category") || "All";
    const search = searchParams.get("search") || "";
    const tag = searchParams.get("tag") || "";

    const result = await getPublicBlogPosts({ page, limit, category, search, tag });
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("GET public blog posts error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
