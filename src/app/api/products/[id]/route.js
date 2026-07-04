import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import {
  getProductById,
  updateProduct,
  deleteProduct,
} from "@/services/product.service";

// GET single product
export async function GET(req, { params }) {
  await connectDB();

  const { id } = await params; // <-- await params before destructuring
  const product = await getProductById(id);

  if (!product) {
    return NextResponse.json({ message: "Product not found" }, { status: 404 });
  }

  return NextResponse.json(product);
}

// UPDATE product
// export async function PUT(req, { params }) {
//   await connectDB();

//   const body = await req.json();

//   const updated = await updateProduct(params.id, body);

//   return NextResponse.json(updated);
// }

export async function PUT(req, { params }) {
  await connectDB();

  const { id } = await params; 

  const body = await req.json();

  const updated = await updateProduct(id, body);

  return NextResponse.json(updated);
}

// DELETE product
export async function DELETE(req, { params }) {
  await connectDB();
  const {id} = await params ;
  await deleteProduct(id);

  return NextResponse.json({ message: "Deleted successfully" });
}