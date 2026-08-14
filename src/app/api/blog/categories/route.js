import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getBlogCategories } from "@/services/blogCategory.service";
import { seedInitialBlogData } from "@/services/blog.service";

// GET public blog categories
export async function GET() {
  try {
    await connectDB();
    await seedInitialBlogData();
    const categories = await getBlogCategories();
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error("GET public blog categories error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
