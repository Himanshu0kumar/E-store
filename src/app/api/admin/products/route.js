import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/auth/requireRole";
import {
  createProduct,
  getAllProducts,
} from "@/services/product.service";

// GET all products
export async function GET(req) {
  try {
    await connectDB();

    const auth = await requireRole(req, ["admin"]);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

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
    await connectDB();

    const auth = await requireRole(req, ["admin"]);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const product = await createProduct(body);

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}