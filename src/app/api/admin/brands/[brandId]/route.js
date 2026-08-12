import { connectDB } from "@/lib/db";
import { updateBrand, deleteBrand } from "@/services/brand.service";

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const { brandId } = await params;
    const { name } = await req.json();
    const brand = await updateBrand(brandId, name);

    return Response.json(
      { success: true, data: brand, message: "Brand updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update brand error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const { brandId } = await params;
    await deleteBrand(brandId);

    return Response.json(
      { success: true, data: brandId, message: "Brand deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete brand error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}