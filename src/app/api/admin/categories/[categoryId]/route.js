import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth/requireRole";
import { updateCategory, deleteCategory } from "@/services/category.service";

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

    const { categoryId } = await params;
    const { name } = await req.json();
    const category = await updateCategory(categoryId, name);

    return Response.json(
      { success: true, data: category, message: "Category updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update category error:", error);
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

    const { categoryId } = await params;
    await deleteCategory(categoryId);

    return Response.json(
      { success: true, data: categoryId, message: "Category deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete category error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}