import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth/requireRole";
import { getBrands, createBrand } from "@/services/brand.service";

export async function GET(req) {
  try {
    await connectDB();

    const auth = await requireRole(req, ["admin"]);
    if (!auth) {
      return Response.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

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

    const auth = await requireRole(req, ["admin"]);
    if (!auth) {
      return Response.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

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