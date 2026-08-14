import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getBlogPostBySlug } from "@/services/blog.service";

// GET single blog post by slug
export async function GET(req, { params }) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const { slug } = resolvedParams;

    const data = await getBlogPostBySlug(slug);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("GET blog post by slug error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 404 }
    );
  }
}
