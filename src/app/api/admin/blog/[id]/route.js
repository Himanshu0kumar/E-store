import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import {
  getBlogPostById,
  updateBlogPost,
  deleteBlogPost,
} from "@/services/blog.service";

// GET single blog post by ID
export async function GET(req, { params }) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const post = await getBlogPostById(id);
    return NextResponse.json({ success: true, data: post });
  } catch (error) {
    console.error("GET admin blog post by ID error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 404 }
    );
  }
}

// PUT update blog post by ID
export async function PUT(req, { params }) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await req.json();

    const post = await updateBlogPost(id, body);
    return NextResponse.json({ success: true, data: post });
  } catch (error) {
    console.error("PUT update blog post error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

// DELETE blog post by ID
export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const post = await deleteBlogPost(id);
    return NextResponse.json({ success: true, data: post });
  } catch (error) {
    console.error("DELETE blog post error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
