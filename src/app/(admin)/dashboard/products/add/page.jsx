"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import CollapsibleSection from "@/components/ui/CollapsibleSection";
import ImageDropzone from "@/components/ui/ImageDropzone";
import PrefixInput from "@/components/ui/PrefixInput";
import Toggle from "@/components/ui/Toggle";
import Select from "@/components/ui/Select";
import Checkbox from "@/components/ui/Checkbox";
import LabelToggle from "@/components/ui/LabelToggle";

const Editor = dynamic(() => import("@/components/ui/Editor"), {
  ssr: false,
  loading: () => (
    <div className="p-4 text-sm text-slate-400">Loading editor...</div>
  ),
});

export default function AddProductPage() {
  const [publish, setPublish] = useState(true);

  const [form, setForm] = useState({
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
    colors: "",
    sizes: "",
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
  });

  const handleCreateProduct = () => {
    console.log({ ...form, publish });
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

          {/* GRID: Colors & Sizes */}
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
          title="Pricing"
          description="Price related inputs"
        >
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
          className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Create product
        </button>
      </div>
    </div>
  );
}