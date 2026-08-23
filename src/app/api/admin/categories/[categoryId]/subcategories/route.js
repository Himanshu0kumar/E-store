import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { addSubcategory } from "@/services/category.service";
import { requireAdmin } from "@/lib/auth/requireRole";

export async function POST(req, { params }) {
  try {
    const authResult = await requireAdmin(req);
    if (authResult instanceof NextResponse) return authResult;

    await connectDB();
    const { categoryId } = await params;
    const { name } = await req.json();
    const category = await addSubcategory(categoryId, name);

    return NextResponse.json(
      { success: true, data: category, message: "Subcategory added successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Add subcategory error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}