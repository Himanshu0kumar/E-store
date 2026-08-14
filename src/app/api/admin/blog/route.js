import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import {
  getAllBlogPostsAdmin,
  createBlogPost,
} from "@/services/blog.service";

// GET all blog posts for admin
export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const page = searchParams.get("page") || 1;
    const limit = searchParams.get("limit") || 20;
    const status = searchParams.get("status") || "all";
    const category = searchParams.get("category") || "all";
    const search = searchParams.get("search") || "";

    const result = await getAllBlogPostsAdmin({ page, limit, status, category, search });
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("GET admin blog posts error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST create blog post
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const post = await createBlogPost(body);
    return NextResponse.json({ success: true, data: post }, { status: 201 });
  } catch (error) {
    console.error("POST create blog post error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
