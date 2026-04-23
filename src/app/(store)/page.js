"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "@/store/slices/productSlice";
import Link from "next/link";

export default function ProductsPage() {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector(
    (state) => state.products
  );

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  if (loading) return <p>Loading products...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="p-6 grid grid-cols-4 gap-6">
      {items.map((product) => (
        <Link key={product._id} href={`/products/${product._id}`}>
          <div className="border p-4 rounded cursor-pointer hover:shadow-lg">
            <img
              src={product.images?.[0]}
              alt={product.name}
              className="h-40 w-full object-cover"
            />
            <h2 className="text-lg font-semibold mt-2">
              {product.name}
            </h2>
            <p className="text-gray-600">₹{product.price}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}