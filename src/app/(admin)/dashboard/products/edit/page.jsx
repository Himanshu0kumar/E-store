"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import CollapsibleSection from "@/components/ui/CollapsibleSection";
import ImageDropzone from "@/components/ui/ImageDropzone";
import PrefixInput from "@/components/ui/PrefixInput";
import Toggle from "@/components/ui/Toggle";
import Select from "@/components/ui/Select";
import Checkbox from "@/components/ui/Checkbox";
import LabelToggle from "@/components/ui/LabelToggle";
import DeleteConfirmDialog from "@/components/ui/DeleteConfirmDialog";

import { uploadImages } from "@/store/slices/uploadSlice";
import { fetchProductById, updateProduct, deleteProduct, clearUpdateStatus, clearDeleteStatus } from "@/store/slices/productSlice";

const Editor = dynamic(() => import("@/components/ui/Editor"), {
  ssr: false,
  loading: () => (
    <div className="p-4 text-sm text-slate-400">Loading editor...</div>
  ),
});

export default function EditProductPage() {
  const params = useParams();
  const productId = params.id;
  const router = useRouter();
  const dispatch = useDispatch();
  const { selectedProduct, loading, updateStatus, deleteStatus, error } = useSelector((state) => state.products);

  const [publish, setPublish] = useState(true);
  const [showMessage, setShowMessage] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [form, setForm] = useState({
    name: "",
    subDescription: "",
    content: "",
    images: [],
    productCode: "",
    productSKU: "",
    quantity: "",
    category: "",
    colors: "",
    sizes: "",
    tags: "",
    gender: { men: false, women: false, kids: false },
    saleLabel: { enabled: false, value: "" },
    newLabel: { enabled: false, value: "" },
    regularPrice: "",
    salePrice: "",
    priceIncludesTaxes: false,
    tax: "",
  });

  // Fetch product on mount
  useEffect(() => {
    if (productId) {
      dispatch(fetchProductById(productId));
    }
  }, [productId, dispatch]);

  // Pre-populate form when product is fetched
  useEffect(() => {
    if (selectedProduct) {
      setForm({
        name: selectedProduct.name || "",
        subDescription: selectedProduct.subDescription || "",
        content: selectedProduct.description || "",
        images: selectedProduct.images || [],
        productCode: selectedProduct.productCode || "",
        productSKU: selectedProduct.productSKU || "",
        quantity: selectedProduct.quantity || "",
        category: selectedProduct.category || "",
        colors: selectedProduct.colors?.[0] || "",
        sizes: selectedProduct.sizes?.[0] || "",
        tags: selectedProduct.tags || "",
        gender: selectedProduct.gender || { men: false, women: false, kids: false },
        saleLabel: selectedProduct.saleLabel || { enabled: false, value: "" },
        newLabel: selectedProduct.newLabel || { enabled: false, value: "" },
        regularPrice: selectedProduct.regularPrice || "",
        salePrice: selectedProduct.salePrice || "",
        priceIncludesTaxes: selectedProduct.priceIncludesTaxes || false,
        tax: selectedProduct.tax || "",
      });
      setPublish(selectedProduct.publish ?? true);
    }
  }, [selectedProduct]);

  // Show success message and auto-hide for update
  useEffect(() => {
    if (updateStatus === "succeeded") {
      setShowMessage(true);
      const timer = setTimeout(() => {
        setShowMessage(false);
        dispatch(clearUpdateStatus());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [updateStatus, dispatch]);

  // Handle delete success
  useEffect(() => {
    if (deleteStatus === "succeeded") {
      setShowDeleteDialog(false);
      router.push("/dashboard/products");
    }
  }, [deleteStatus, router]);

  const handleUpdateProduct = async () => {
    try {
      let imageUrls = form.images;

      const hasNewImages = form.images.some((img) => img instanceof File);
      if (hasNewImages) {
        const newImages = form.images.filter((img) => img instanceof File);
        const uploadedUrls = await dispatch(uploadImages(newImages)).unwrap();
        const oldImages = form.images.filter((img) => !(img instanceof File));
        imageUrls = [...oldImages, ...uploadedUrls];
      }

      const payload = {
        name: form.name,
        subDescription: form.subDescription,
        description: form.content,
        images: imageUrls,
        productCode: form.productCode,
        productSKU: form.productSKU,
        quantity: Number(form.quantity) || 0,
        category: form.category,
        colors: form.colors ? [form.colors] : [],
        sizes: form.sizes ? [form.sizes] : [],
        tags: form.tags,
        gender: form.gender,
        saleLabel: form.saleLabel,
        newLabel: form.newLabel,
        regularPrice: Number(form.regularPrice) || 0,
        salePrice: Number(form.salePrice) || 0,
        priceIncludesTaxes: form.priceIncludesTaxes,
        tax: Number(form.tax) || 0,
        publish,
      };

      await dispatch(updateProduct({ id: productId, productData: payload })).unwrap();
    } catch (err) {
      console.error("Failed to update product:", err);
    }
  };

  const handleDeleteProduct = async () => {
    try {
      await dispatch(deleteProduct(productId)).unwrap();
    } catch (err) {
      console.error("Failed to delete product:", err);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500"></div>
            <p className="mt-2 text-sm text-slate-400">Loading product...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* PAGE HEADER */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Link href="/dashboard/products/list" className="text-slate-400 hover:text-slate-600">
            ← Back
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Edit product</h1>
        <div className="mt-1 flex items-center gap-2 text-sm text-slate-400">
          <span className="text-slate-600">Dashboard</span>
          <span>•</span>
          <span className="text-slate-600">Product</span>
          <span>•</span>
          <span>Edit</span>
        </div>
      </div>

      {/* SUCCESS MESSAGE */}
      {showMessage && updateStatus === "succeeded" && (
        <div className="mb-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 border border-emerald-200 flex items-center gap-2">
          <span className="text-lg">✓</span>
          <span>Product updated successfully!</span>
        </div>
      )}

      {/* ERROR MESSAGE */}
      {(updateStatus === "failed" || deleteStatus === "failed") && (
        <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200 flex items-center gap-2">
          <span className="text-lg">✕</span>
          <span>{error || "Failed to perform action"}</span>
        </div>
      )}

      {/* SECTIONS */}
      <div className="space-y-5">
        <CollapsibleSection
          title="Details"
          description="Title, short description, image..."
          defaultOpen
        >
          <input
            type="text"
            placeholder="Product name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          />

          <textarea
            rows={4}
            placeholder="Sub description"
            value={form.subDescription}
            onChange={(e) => setForm({ ...form, subDescription: e.target.value })}
            className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          />

          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">Content</p>
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <Editor
                data={form.content}
                onChange={(event, editor) => {
                  const data = editor.getData();
                  setForm({ ...form, content: data });
                }}
                config={{
                  licenseKey: "GPL",
                  placeholder: "Write something awesome...",
                  toolbar: [
                    "heading", "|", "bold", "italic", "link",
                    "bulletedList", "numberedList", "|",
                    "outdent", "indent", "|",
                    "imageUpload", "blockQuote", "undo", "redo",
                  ],
                }}
              />
            </div>
          </div>

          <ImageDropzone
            files={form.images}
            onFilesChange={(images) => setForm({ ...form, images })}
          />
        </CollapsibleSection>

        <CollapsibleSection
          title="Properties"
          description="Additional functions and attributes..."
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="mb-2 text-sm font-medium text-slate-500">Product code</p>
              <input
                type="text"
                placeholder="Product code"
                value={form.productCode}
                onChange={(e) => setForm({ ...form, productCode: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-slate-500">Product SKU</p>
              <input
                type="text"
                placeholder="Product SKU"
                value={form.productSKU}
                onChange={(e) => setForm({ ...form, productSKU: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="mb-2 text-sm font-medium text-slate-500">Quantity</p>
              <input
                type="number"
                placeholder="0"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
            <Select
              label="Category"
              value={form.category}
              onChange={(val) => setForm({ ...form, category: val })}
              options={[
                { value: "face-masks", label: "Face masks" },
                { value: "clothing", label: "Clothing" },
                { value: "accessories", label: "Accessories" },
              ]}
              placeholder="Face masks"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Colors"
              value={form.colors}
              onChange={(val) => setForm({ ...form, colors: val })}
              options={[
                { value: "red", label: "Red" },
                { value: "blue", label: "Blue" },
                { value: "black", label: "Black" },
                { value: "white", label: "White" },
              ]}
            />
            <Select
              label="Sizes"
              value={form.sizes}
              onChange={(val) => setForm({ ...form, sizes: val })}
              options={[
                { value: "s", label: "Small" },
                { value: "m", label: "Medium" },
                { value: "l", label: "Large" },
                { value: "xl", label: "XL" },
              ]}
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-slate-500">Tags</p>
            <input
              type="text"
              placeholder="Tags"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div>
            <p className="mb-3 text-sm font-medium text-slate-700">Gender</p>
            <div className="flex gap-6">
              <Checkbox
                label="Men"
                checked={form.gender.men}
                onChange={(val) =>
                  setForm({ ...form, gender: { ...form.gender, men: val } })
                }
              />
              <Checkbox
                label="Women"
                checked={form.gender.women}
                onChange={(val) =>
                  setForm({ ...form, gender: { ...form.gender, women: val } })
                }
              />
              <Checkbox
                label="Kids"
                checked={form.gender.kids}
                onChange={(val) =>
                  setForm({ ...form, gender: { ...form.gender, kids: val } })
                }
              />
            </div>
          </div>

          <LabelToggle
            enabled={form.saleLabel.enabled}
            onEnabledChange={(val) =>
              setForm({
                ...form,
                saleLabel: { ...form.saleLabel, enabled: val },
              })
            }
            label="Sale label"
            value={form.saleLabel.value}
            onValueChange={(val) =>
              setForm({
                ...form,
                saleLabel: { ...form.saleLabel, value: val },
              })
            }
            placeholder="Sale label"
          />

          <LabelToggle
            enabled={form.newLabel.enabled}
            onEnabledChange={(val) =>
              setForm({
                ...form,
                newLabel: { ...form.newLabel, enabled: val },
              })
            }
            label="New label"
            value={form.newLabel.value}
            onValueChange={(val) =>
              setForm({
                ...form,
                newLabel: { ...form.newLabel, value: val },
              })
            }
            placeholder="New label"
          />
        </CollapsibleSection>

        <CollapsibleSection
          title="Pricing"
          description="Price related inputs"
        >
          <PrefixInput
            label="Regular price"
            prefix="₹"
            value={form.regularPrice}
            onChange={(val) => setForm({ ...form, regularPrice: val })}
          />

          <PrefixInput
            label="Sale price"
            prefix="₹"
            value={form.salePrice}
            onChange={(val) => setForm({ ...form, salePrice: val })}
          />

          <Toggle
            checked={form.priceIncludesTaxes}
            onChange={(val) => setForm({ ...form, priceIncludesTaxes: val })}
            label="Price includes taxes"
          />

          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              form.priceIncludesTaxes ? "max-h-0 opacity-0" : "max-h-24 opacity-100"
            }`}
          >
            <PrefixInput
              label="Tax (%)"
              prefix="%"
              value={form.tax}
              onChange={(val) => setForm({ ...form, tax: val })}
            />
          </div>
        </CollapsibleSection>
      </div>

      {/* FOOTER BAR */}
      <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
        <div className="flex gap-3">
          <Toggle checked={publish} onChange={setPublish} label="Publish" />
          <button
            type="button"
            onClick={() => setShowDeleteDialog(true)}
            className="rounded-xl bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
          >
            Delete
          </button>
        </div>

        <button
          type="button"
          onClick={handleUpdateProduct}
          disabled={updateStatus === "loading"}
          className="rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {updateStatus === "loading" ? "Updating..." : "Update product"}
        </button>
      </div>

      {/* DELETE CONFIRMATION DIALOG */}
      <DeleteConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete product?"
        description={`Are you sure you want to delete "${form.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteProduct}
        onCancel={() => setShowDeleteDialog(false)}
        isLoading={deleteStatus === "loading"}
      />
    </div>
  );
}