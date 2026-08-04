import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth/requireRole";
import { addSubcategory } from "@/services/category.service";

export async function POST(req, { params }) {
  try {
    await connectDB();

    const auth = await requireRole(req, ["admin"]);
    if (!auth) {
      return Response.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const { categoryId } = await params;
    const { name } = await req.json();
    const category = await addSubcategory(categoryId, name);

    return Response.json(
      { success: true, data: category, message: "Subcategory added successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Add subcategory error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}