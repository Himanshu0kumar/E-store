import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import {
  getBlogCategories,
  createBlogCategory,
} from "@/services/blogCategory.service";
import { seedInitialBlogData } from "@/services/blog.service";
import { requireAdmin } from "@/lib/auth/requireRole";

// GET all blog categories for admin
export async function GET(req) {
  try {
    const authResult = await requireAdmin(req);
    if (authResult instanceof NextResponse) return authResult;

    await connectDB();
    await seedInitialBlogData();
    const categories = await getBlogCategories();
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error("GET admin blog categories error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST create blog category
export async function POST(req) {
  try {
    const authResult = await requireAdmin(req);
    if (authResult instanceof NextResponse) return authResult;

    await connectDB();
    const body = await req.json();
    const category = await createBlogCategory(body);
    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error) {
    console.error("POST create blog category error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
