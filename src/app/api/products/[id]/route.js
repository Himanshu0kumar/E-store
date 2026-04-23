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

  const product = await getProductById(params.id);

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

  const { id } = await params; // 👈 FIX

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