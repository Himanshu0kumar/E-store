import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getCategories, createCategory } from "@/services/category.service";
import { requireAdmin } from "@/lib/auth/requireRole";

export async function GET(req) {
  try {
    const authResult = await requireAdmin(req);
    if (authResult instanceof NextResponse) return authResult;

    await connectDB();
    const categories = await getCategories();
    return NextResponse.json({ success: true, data: categories }, { status: 200 });
  } catch (error) {
    console.error("Get categories error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

export async function POST(req) {
  try {
    const authResult = await requireAdmin(req);
    if (authResult instanceof NextResponse) return authResult;

    await connectDB();
    const { name } = await req.json();
    const category = await createCategory(name);

    return NextResponse.json(
      { success: true, data: category, message: "Category created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create category error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}