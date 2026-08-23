import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import {
  getProductById,
  updateProduct,
  deleteProduct,
} from "@/services/product.service";
import { requireAdmin } from "@/lib/auth/requireRole";

// GET single product
export async function GET(req, { params }) {
  try {
    const authResult = await requireAdmin(req);
    if (authResult instanceof NextResponse) return authResult;

    await connectDB();

    const { id } = await params;
    const product = await getProductById(id);

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { message: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// PUT update product
export async function PUT(req, { params }) {
  try {
    const authResult = await requireAdmin(req);
    if (authResult instanceof NextResponse) return authResult;

    await connectDB();

    const { id } = await params;
    const body = await req.json();

    const product = await updateProduct(id, body);

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { success: false, message: error.message, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE product
export async function DELETE(req, { params }) {
  try {
    const authResult = await requireAdmin(req);
    if (authResult instanceof NextResponse) return authResult;

    await connectDB();

    const { id } = await params;
    const product = await deleteProduct(id);

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { message: "Failed to delete product" },
      { status: 500 }
    );
  }
}