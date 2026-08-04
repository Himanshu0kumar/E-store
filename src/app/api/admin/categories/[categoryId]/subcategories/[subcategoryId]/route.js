import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth/requireRole";
import {
  updateSubcategory,
  deleteSubcategory,
} from "@/services/category.service";

export async function PUT(req, { params }) {
  try {
    await connectDB();

    const auth = await requireRole(req, ["admin"]);
    if (!auth) {
      return Response.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const { categoryId, subcategoryId } = await params;
    const { name } = await req.json();
    const category = await updateSubcategory(categoryId, subcategoryId, name);

    return Response.json(
      { success: true, data: category, message: "Subcategory updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update subcategory error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();

    const auth = await requireRole(req, ["admin"]);
    if (!auth) {
      return Response.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const { categoryId, subcategoryId } = await params;
    const category = await deleteSubcategory(categoryId, subcategoryId);

    return Response.json(
      { success: true, data: category, message: "Subcategory deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete subcategory error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}