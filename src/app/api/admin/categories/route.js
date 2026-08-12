import { connectDB } from "@/lib/db";
import { getCategories, createCategory } from "@/services/category.service";

export async function GET() {
  try {
    await connectDB();
    const categories = await getCategories();
    return Response.json({ success: true, data: categories }, { status: 200 });
  } catch (error) {
    console.error("Get categories error:", error);
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
    const category = await createCategory(name);

    return Response.json(
      { success: true, data: category, message: "Category created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create category error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}