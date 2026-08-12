import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getProductById } from "@/services/product.service";

// GET single public product by ID
export async function GET(req, { params }) {
  try {
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
    console.error("Error fetching public product:", error);
    return NextResponse.json(
      { message: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
