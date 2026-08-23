import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import {
  updateBlogCategory,
  deleteBlogCategory,
} from "@/services/blogCategory.service";
import { requireAdmin } from "@/lib/auth/requireRole";

// PUT update category
export async function PUT(req, { params }) {
  try {
    const authResult = await requireAdmin(req);
    if (authResult instanceof NextResponse) return authResult;

    await connectDB();
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await req.json();

    const category = await updateBlogCategory(id, body);
    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    console.error("PUT update blog category error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

// DELETE category
export async function DELETE(req, { params }) {
  try {
    const authResult = await requireAdmin(req);
    if (authResult instanceof NextResponse) return authResult;

    await connectDB();
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const category = await deleteBlogCategory(id);
    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    console.error("DELETE blog category error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
