import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { getAllProducts, createProduct } from "@/services/product.service";

const INITIAL_PRODUCTS = [
  {
    name: "Classic Crewneck Tee",
    subDescription: "Premium 100% Organic Cotton T-Shirt",
    description: "Ultra-soft crewneck tee designed for daily comfort and timeless style.",
    images: ["https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80"],
    category: "Clothing",
    brand: "Nike",
    quantity: 50,
    regularPrice: 39.99,
    salePrice: 29.99,
    rating: 4.8,
    publish: true,
    attributes: [
      { name: "Size", values: ["S", "M", "L", "XL"] },
      { name: "Color", values: ["Black", "White", "Emerald"] },
    ],
  },
  {
    name: "Minimalist Leather Watch",
    subDescription: "Genuine Italian Leather Strap Watch",
    description: "Sleek stainless steel case with precision quartz movement and water resistance.",
    images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80"],
    category: "Accessories",
    brand: "Adidas",
    quantity: 30,
    regularPrice: 149.99,
    salePrice: 119.99,
    rating: 4.9,
    publish: true,
    attributes: [
      { name: "Color", values: ["Black", "Amber"] },
    ],
  },
  {
    name: "Everyday Running Sneakers",
    subDescription: "Breathable Mesh Performance Shoes",
    description: "Lightweight cushioned running shoes designed for high endurance and daily comfort.",
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80"],
    category: "Footwear",
    brand: "Puma",
    quantity: 40,
    regularPrice: 129.99,
    salePrice: 99.99,
    rating: 4.7,
    publish: true,
    attributes: [
      { name: "Size", values: ["S", "M", "L", "XL"] },
      { name: "Color", values: ["Rose", "Blue", "Black"] },
    ],
  },
  {
    name: "Noise-Cancelling Wireless Headphones",
    subDescription: "Over-Ear Bluetooth Headphones with HD Audio",
    description: "Active noise cancellation with 40-hour battery life and ultra-comfortable ear cushions.",
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80"],
    category: "Electronics",
    brand: "Sony",
    quantity: 25,
    regularPrice: 249.99,
    salePrice: 199.99,
    rating: 4.9,
    publish: true,
    attributes: [
      { name: "Color", values: ["Black", "White"] },
    ],
  },
  {
    name: "Tailored Chino Trousers",
    subDescription: "Stretch Cotton Slim Fit Pants",
    description: "Modern tailored chinos offering versatile style for work and weekends.",
    images: ["https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80"],
    category: "Clothing",
    brand: "Zara",
    quantity: 35,
    regularPrice: 69.99,
    salePrice: 49.99,
    rating: 4.6,
    publish: true,
    attributes: [
      { name: "Size", values: ["S", "M", "L", "XL"] },
      { name: "Color", values: ["Black", "Amber"] },
    ],
  },
  {
    name: "Ceramic Minimalist Table Lamp",
    subDescription: "Modern Warm White Ambient Lighting",
    description: "Handcrafted ceramic base with linen shade for soft, elegant room illumination.",
    images: ["https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80"],
    category: "Home",
    brand: "IKEA",
    quantity: 20,
    regularPrice: 89.99,
    rating: 4.5,
    publish: true,
    attributes: [
      { name: "Color", values: ["White", "Amber"] },
    ],
  },
];

// GET all public products
export async function GET() {
  try {
    await connectDB();
    let products = await getAllProducts();

    // Auto-seed initial products if database is currently empty
    if (!products || products.length === 0) {
      for (const item of INITIAL_PRODUCTS) {
        await createProduct(item);
      }
      products = await getAllProducts();
    }

    return NextResponse.json(products);
  } catch (error) {
    console.error("Get public products error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
