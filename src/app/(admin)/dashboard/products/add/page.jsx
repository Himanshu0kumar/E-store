"use client";

import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import dynamic from "next/dynamic";
import CollapsibleSection from "@/components/ui/CollapsibleSection";
import ImageDropzone from "@/components/ui/ImageDropzone";
import PrefixInput from "@/components/ui/PrefixInput";
import Toggle from "@/components/ui/Toggle";
import Select from "@/components/ui/Select";
import Checkbox from "@/components/ui/Checkbox";
import LabelToggle from "@/components/ui/LabelToggle";
import AttributeVariantManager from "@/components/ui/AttributeVariantManager";

import { uploadImages } from "@/store/slices/uploadSlice";
import { createProduct } from "@/store/slices/productSlice";
import { getCategories } from "@/store/slices/categorySlice";
import { getBrands } from "@/store/slices/brandSlice";

const Editor = dynamic(() => import("@/components/ui/Editor"), {
  ssr: false,
  loading: () => (
    <div className="p-4 text-sm text-slate-400">Loading editor...</div>
  ),
});

export default function AddProductPage() {

  const dispatch = useDispatch();
  const [publish, setPublish] = useState(true);

  
  const { categories, loading: categoriesLoading } = useSelector(
    (state) => state.category
  );
  const { brands, loading: brandsLoading } = useSelector(
    (state) => state.brand
  );

  useEffect(() => {
    dispatch(getCategories());
    dispatch(getBrands());
  }, [dispatch]);

  
  const categoryOptions = useMemo(() => {
    const list = [];
    const added = new Set();

    (categories || []).forEach((category) => {
      if (category.name && !added.has(category.name.toLowerCase())) {
        list.push({ value: category.name, label: category.name });
        added.add(category.name.toLowerCase());
      }
      if (category.subcategories && Array.isArray(category.subcategories)) {
        category.subcategories.forEach((sub) => {
          if (sub.name && !added.has(sub.name.toLowerCase())) {
            list.push({ value: sub.name, label: `${category.name} / ${sub.name}` });
            added.add(sub.name.toLowerCase());
          }
        });
      }
    });

    return list;
  }, [categories]);

  const brandOptions = useMemo(() => {
    const list = [];
    const added = new Set();

    (brands || []).forEach((brand) => {
      if (brand.name && !added.has(brand.name.toLowerCase())) {
        list.push({ value: brand.name, label: brand.name });
        added.add(brand.name.toLowerCase());
      }
    });

    return list;
  }, [brands]);

  const initialFormState = {
    // Details
    name: "",
    subDescription: "",
    content: "",
    images: [],
    // Properties
    productCode: "",
    productSKU: "",
    quantity: "",
    category: "",
    brand: "",
    tags: "",
    gender: {
      men: false,
      women: false,
      kids: false,
    },
    saleLabel: {
      enabled: false,
      value: "",
    },
    newLabel: {
      enabled: false,
      value: "",
    },
    // Pricing
    regularPrice: "",
    salePrice: "",
    priceIncludesTaxes: false,
    tax: "",
  };

  const [form, setForm] = useState(initialFormState);

 
  const [hasVariants, setHasVariants] = useState(false);
  const [attributes, setAttributes] = useState([]);
  const [variants, setVariants] = useState([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

 

  const handleCreateProduct = async () => {
    try {
      setIsSubmitting(true);
      setErrorMessage("");

      if (!form.name.trim()) {
        setErrorMessage("Please enter a product name.");
        return;
      }

      let imageUrls = [];
      if (form.images.length > 0) {
        imageUrls = await dispatch(uploadImages(form.images)).unwrap();
      }

      const payload = {
        name: form.name,
        subDescription: form.subDescription,
        description: form.content.trim() || form.subDescription.trim() || form.name.trim(),
        images: imageUrls,
        productCode: form.productCode,
        productSKU: form.productSKU,
        quantity: Number(form.quantity) || 0,
        category: form.category,
        brand: form.brand,
        tags: form.tags,
        gender: form.gender,
        saleLabel: form.saleLabel,
        newLabel: form.newLabel,
        regularPrice: Number(form.regularPrice) || 0,
        salePrice: Number(form.salePrice) || 0,
        priceIncludesTaxes: form.priceIncludesTaxes,
        tax: Number(form.tax) || 0,
        hasVariants,
        attributes: hasVariants
          ? attributes
              .filter((attr) => attr.name.trim() && attr.values.length > 0)
              .map((attr) => ({ name: attr.name.trim(), values: attr.values }))
          : [],
        variants: hasVariants
          ? variants
              .filter((v) => v.enabled)
              .map((v) => ({
                combination: v.combination,
                sku: v.sku,
                price: Number(v.price) || 0,
                salePrice: v.salePrice ? Number(v.salePrice) : undefined,
                stock: Number(v.stock) || 0,
              }))
          : [],
        publish,
      };

      await dispatch(createProduct(payload)).unwrap();

      // Clear all fields
      setForm(initialFormState);
      setHasVariants(false);
      setAttributes([]);
      setVariants([]);
      setPublish(true);

      // Show success message
      setShowMessage(true);
      setTimeout(() => {
        setShowMessage(false);
      }, 3000);
    } catch (err) {
      const msg = typeof err === "string" ? err : err?.message || err?.error || "Failed to create product";
      console.error("Failed to create product:", msg);
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      {/* PAGE HEADER */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Create a new product</h1>
        <div className="mt-1 flex items-center gap-2 text-sm text-slate-400">
          <span className="text-slate-600">Dashboard</span>
          <span>•</span>
          <span className="text-slate-600">Product</span>
          <span>•</span>
          <span>Create</span>
        </div>
      </div>

      {/* SUCCESS MESSAGE */}
      {showMessage && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <span className="text-lg">✓</span>
          <span>Product added successfully!</span>
        </div>
      )}

      {/* ERROR MESSAGE */}
      {errorMessage && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span className="text-lg">✕</span>
          <span>{errorMessage}</span>
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
          {/* GRID: Product code & Product SKU */}
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

          {/* GRID: Quantity & Category */}
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
            <div>
              <Select
                label="Category"
                value={form.category}
                onChange={(val) => setForm({ ...form, category: val })}
                options={categoryOptions}
                placeholder={
                  categoriesLoading ? "Loading categories..." : "Select a category"
                }
              />
              {/* <a
                href="/admin/categories"
                className="mt-1.5 inline-block text-xs font-medium text-emerald-600 hover:text-emerald-700 transition"
              >
                Manage categories
              </a> */}
            </div>
          </div>

          {/* GRID: Brand */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Select
                label="Brand"
                value={form.brand}
                onChange={(val) => setForm({ ...form, brand: val })}
                options={brandOptions}
                placeholder={brandsLoading ? "Loading brands..." : "Select a brand"}
              />
              {/* <a
                href="/admin/brands"
                className="mt-1.5 inline-block text-xs font-medium text-emerald-600 hover:text-emerald-700 transition"
              >
                Manage brands
              </a> */}
            </div>
          </div>

          {/* TAGS */}
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

          {/* GENDER */}
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

          {/* SALE LABEL */}
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

          {/* NEW LABEL */}
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
          title="Attributes & Variants"
          description="Add options like color or size, and set pricing per combination"
        >
          <Toggle
            checked={hasVariants}
            onChange={setHasVariants}
            label="This product has multiple variants (e.g. color, size)"
          />

          {hasVariants && (
            <AttributeVariantManager
              attributes={attributes}
              onAttributesChange={setAttributes}
              variants={variants}
              onVariantsChange={setVariants}
              basePrice={form.regularPrice}
            />
          )}
        </CollapsibleSection>

        <CollapsibleSection
          title="Pricing"
          description="Price related inputs"
        >
          {hasVariants && (
            <p className="text-xs text-slate-500 -mt-1">
              This price is used as the default for new variants — edit
              individual variant rows above to charge more or less for
              specific combinations.
            </p>
          )}

          <PrefixInput
            label="Regular price"
            prefix="$"
            value={form.regularPrice}
            onChange={(val) => setForm({ ...form, regularPrice: val })}
          />

          <PrefixInput
            label="Sale price"
            prefix="$"
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
        <Toggle checked={publish} onChange={setPublish} label="Publish" />

        <button
          type="button"
          onClick={handleCreateProduct}
          disabled={isSubmitting}
          className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Creating..." : "Create product"}
        </button>
      </div>
    </div>
  );
}