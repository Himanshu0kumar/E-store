import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { updateBrand, deleteBrand } from "@/services/brand.service";
import { requireAdmin } from "@/lib/auth/requireRole";

export async function PUT(req, { params }) {
  try {
    const authResult = await requireAdmin(req);
    if (authResult instanceof NextResponse) return authResult;

    await connectDB();
    const { brandId } = await params;
    const { name } = await req.json();
    const brand = await updateBrand(brandId, name);

    return NextResponse.json(
      { success: true, data: brand, message: "Brand updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update brand error:", error);
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
    const { brandId } = await params;
    await deleteBrand(brandId);

    return NextResponse.json(
      { success: true, data: brandId, message: "Brand deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete brand error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}