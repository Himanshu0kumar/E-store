"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, Edit, Trash2, Download } from "lucide-react";
import {
  fetchProductById,
  deleteProduct,
  clearDeleteStatus,
} from "@/store/slices/productSlice";
import DeleteConfirmDialog from "@/components/ui/DeleteConfirmDialog";
import ProductDetailsView from "@/components/ui/ProductDetailsView";

export default function AdminProductDetailsPage() {
  const params = useParams();
  const productId = params.id;
  const router = useRouter();
  const dispatch = useDispatch();
  const { selectedProduct, loading, deleteStatus, error } = useSelector(
    (state) => state.products
  );

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Fetch product on mount
  useEffect(() => {
    if (productId) {
      dispatch(fetchProductById(productId));
    }
  }, [productId, dispatch]);

  // Handle delete success
  useEffect(() => {
    if (deleteStatus === "succeeded") {
      setShowDeleteDialog(false);
      router.push("/dashboard/products/list");
    }
  }, [deleteStatus, router]);

  const handleDeleteProduct = async () => {
    try {
      await dispatch(deleteProduct(productId)).unwrap();
    } catch (err) {
      console.error("Failed to delete product:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500"></div>
          <p className="mt-2 text-sm text-slate-400">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!selectedProduct) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-600">Product not found</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* PAGE HEADER */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <Link
            href="/dashboard/products/list"
            className="inline-flex items-center gap-2 text-slate-400 transition hover:text-slate-600"
          >
            <ArrowLeft size={18} />
            <span>Back</span>
          </Link>

          <div className="flex gap-3">
            <button className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100">
              <Download size={18} />
              Export
            </button>
            <Link
              href={`/dashboard/products/${productId}/edit`}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100"
            >
              <Edit size={18} />
              Edit
            </Link>
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
            >
              <Trash2 size={18} />
              Delete
            </button>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-slate-900">
          {selectedProduct.name}
        </h1>
        <div className="mt-1 flex items-center gap-2 text-sm text-slate-400">
          <span className="text-slate-600">Dashboard</span>
          <span>•</span>
          <span className="text-slate-600">Product</span>
          <span>•</span>
          <span>View</span>
        </div>
      </div>

      {/* ERROR MESSAGE */}
      {deleteStatus === "failed" && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span className="text-lg">✕</span>
          <span>{error || "Failed to delete product"}</span>
        </div>
      )}

      {/* PRODUCT DETAILS */}
      <div className="rounded-xl border border-slate-200 bg-white p-8">
        <ProductDetailsView product={selectedProduct} isAdmin={true} />
      </div>

      {/* DELETE CONFIRMATION DIALOG */}
      <DeleteConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete product?"
        description={`Are you sure you want to delete "${selectedProduct?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteProduct}
        onCancel={() => setShowDeleteDialog(false)}
        isLoading={deleteStatus === "loading"}
      />
    </div>
  );
}