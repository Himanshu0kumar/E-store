import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import {
  createProduct,
  getAllProducts,
} from "@/services/product.service";

// GET all products
export async function GET() {
  await connectDB();

  const products = await getAllProducts();
  return NextResponse.json(products);
}

// POST create product (admin later protect it)
export async function POST(req) {
  await connectDB();

  const body = await req.json();

  const product = await createProduct(body);

  return NextResponse.json(product);
}