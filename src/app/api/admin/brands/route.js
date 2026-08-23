import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getBrands, createBrand } from "@/services/brand.service";
import { requireAdmin } from "@/lib/auth/requireRole";

export async function GET(req) {
  try {
    const authResult = await requireAdmin(req);
    if (authResult instanceof NextResponse) return authResult;

    await connectDB();
    const brands = await getBrands();
    return NextResponse.json({ success: true, data: brands }, { status: 200 });
  } catch (error) {
    console.error("Get brands error:", error);
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
    const brand = await createBrand(name);

    return NextResponse.json(
      { success: true, data: brand, message: "Brand created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create brand error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}