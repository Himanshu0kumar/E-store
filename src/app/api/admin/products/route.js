import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import {
  createProduct,
  getAllProducts,
} from "@/services/product.service";
import { requireAdmin } from "@/lib/auth/requireRole";

// GET all products (Admin view)
export async function GET(req) {
  try {
    const authResult = await requireAdmin(req);
    if (authResult instanceof NextResponse) return authResult;

    await connectDB();
    const products = await getAllProducts();
    return NextResponse.json(products);
  } catch (error) {
    console.error("Get products error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

// POST create product
export async function POST(req) {
  try {
    const authResult = await requireAdmin(req);
    if (authResult instanceof NextResponse) return authResult;

    await connectDB();
    const body = await req.json();
    const product = await createProduct(body);

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json(
      { success: false, message: error.message, error: error.message },
      { status: 400 }
    );
  }
}