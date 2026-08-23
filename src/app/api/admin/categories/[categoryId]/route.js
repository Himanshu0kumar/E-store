import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { updateCategory, deleteCategory } from "@/services/category.service";
import { requireAdmin } from "@/lib/auth/requireRole";

export async function PUT(req, { params }) {
  try {
    const authResult = await requireAdmin(req);
    if (authResult instanceof NextResponse) return authResult;

    await connectDB();
    const { categoryId } = await params;
    const { name } = await req.json();
    const category = await updateCategory(categoryId, name);

    return NextResponse.json(
      { success: true, data: category, message: "Category updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update category error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const authResult = await requireAdmin(req);
    if (authResult instanceof NextResponse) return authResult;

    await connectDB();
    const { categoryId } = await params;
    await deleteCategory(categoryId);

    return NextResponse.json(
      { success: true, data: categoryId, message: "Category deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete category error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}