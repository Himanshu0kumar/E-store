import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import {
  updateSubcategory,
  deleteSubcategory,
} from "@/services/category.service";
import { requireAdmin } from "@/lib/auth/requireRole";

export async function PUT(req, { params }) {
  try {
    const authResult = await requireAdmin(req);
    if (authResult instanceof NextResponse) return authResult;

    await connectDB();
    const { categoryId, subcategoryId } = await params;
    const { name } = await req.json();
    const category = await updateSubcategory(categoryId, subcategoryId, name);

    return NextResponse.json(
      { success: true, data: category, message: "Subcategory updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update subcategory error:", error);
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
    const { categoryId, subcategoryId } = await params;
    const category = await deleteSubcategory(categoryId, subcategoryId);

    return NextResponse.json(
      { success: true, data: category, message: "Subcategory deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete subcategory error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}