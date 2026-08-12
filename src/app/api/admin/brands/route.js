import { connectDB } from "@/lib/db";
import { getBrands, createBrand } from "@/services/brand.service";

export async function GET() {
  try {
    await connectDB();
    const brands = await getBrands();
    return Response.json({ success: true, data: brands }, { status: 200 });
  } catch (error) {
    console.error("Get brands error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const { name } = await req.json();
    const brand = await createBrand(name);

    return Response.json(
      { success: true, data: brand, message: "Brand created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create brand error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}