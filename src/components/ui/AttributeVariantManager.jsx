"use client";

import { useState, useMemo, useEffect } from "react";
import { Plus, X, Wand2 } from "lucide-react";

// Hard safety cap. Cartesian products grow FAST — 4 attributes with
// 5 values each is already 625 rows. Shopify caps at 100 variants
// per product for the same reason; we do the same rather than let
// someone accidentally generate a table with 10,000 rows.
const MAX_VARIANTS = 100;

let uid = 0;
const nextId = () => `id_${Date.now()}_${uid++}`;

// Cartesian product of each attribute's values, e.g.
// [{name: "Color", values:["Red","Blue"]}, {name:"Size", values:["S","M"]}]
// -> [{Color:"Red",Size:"S"}, {Color:"Red",Size:"M"}, {Color:"Blue",Size:"S"}, {Color:"Blue",Size:"M"}]
function cartesianProduct(attributes) {
  const usable = attributes.filter((attr) => attr.name.trim() && attr.values.length > 0);
  if (usable.length === 0) return [];

  return usable.reduce(
    (combos, attr) =>
      combos.flatMap((combo) =>
        attr.values.map((value) => ({ ...combo, [attr.name]: value }))
      ),
    [{}]
  );
}

const combinationKey = (combination) =>
  Object.entries(combination)
    .map(([k, v]) => `${k}:${v}`)
    .join("|");

const combinationLabel = (combination) => Object.values(combination).join(" / ");

// ----------------------------------------------------------------
// Chip input for one attribute's values (type + Enter/comma to add)
// ----------------------------------------------------------------
function ValueChipInput({ values, onChange }) {
  const [draft, setDraft] = useState("");

  const addValue = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    if (values.some((v) => v.toLowerCase() === trimmed.toLowerCase())) {
      setDraft("");
      return; // silently skip duplicates
    }
    onChange([...values, trimmed]);
    setDraft("");
  };

  const removeValue = (value) => {
    onChange(values.filter((v) => v !== value));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addValue();
    } else if (e.key === "Backspace" && !draft && values.length > 0) {
      removeValue(values[values.length - 1]);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100 transition">
      {values.map((value) => (
        <span
          key={value}
          className="flex items-center gap-1 pl-2.5 pr-1.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-sm"
        >
          {value}
          <button
            type="button"
            onClick={() => removeValue(value)}
            className="p-0.5 rounded hover:bg-slate-200 transition"
            aria-label={`Remove ${value}`}
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addValue}
        placeholder={values.length === 0 ? "Type a value, press Enter..." : "Add another..."}
        className="flex-1 min-w-[100px] text-sm outline-none py-1 placeholder-slate-400"
      />
    </div>
  );
}

/**
 * Attributes + generated variant matrix, with per-variant price/
 * stock overrides. This is the same model Shopify/Amazon/Flipkart
 * use: attributes define the axes (Color, Size, ...), the matrix is
 * every combination, and price/stock are set per-row — most rows
 * usually just inherit the base price unless a specific combination
 * (e.g. a larger size, a premium color) needs to cost more.
 *
 * Props:
 *  - attributes, onAttributesChange: [{ id, name, values: string[] }]
 *  - variants, onVariantsChange: [{ key, combination, sku, price, salePrice, stock, enabled }]
 *  - basePrice: the product's regular price, used as the default for
 *    new variant rows so admins only edit the ones that differ.
 */
export default function AttributeVariantManager({
  attributes,
  onAttributesChange,
  variants,
  onVariantsChange,
  basePrice,
}) {
  const [bulkPrice, setBulkPrice] = useState("");
  const [bulkStock, setBulkStock] = useState("");

  const combinations = useMemo(() => cartesianProduct(attributes), [attributes]);
  const truncated = combinations.length > MAX_VARIANTS;
  const usedCombinations = truncated ? combinations.slice(0, MAX_VARIANTS) : combinations;

  // Regenerate the variant list whenever attributes/values change,
  // but PRESERVE existing price/stock/sku for combinations that
  // already existed — adding one new size shouldn't wipe out the
  // prices you already set on the other rows.
  useEffect(() => {
    const existingByKey = new Map(variants.map((v) => [v.key, v]));

    const next = usedCombinations.map((combination) => {
      const key = combinationKey(combination);
      const existing = existingByKey.get(key);
      if (existing) return existing;

      return {
        key,
        combination,
        sku: "",
        price: basePrice || "",
        salePrice: "",
        stock: "",
        enabled: true,
      };
    });

    // Only update if the set of keys actually changed, to avoid an
    // unnecessary re-render loop (same lesson as the categories page
    // infinite-loop fix — don't call the setter with an
    // effectively-identical result on every render).
    const sameLength = next.length === variants.length;
    const sameKeys = sameLength && next.every((v, i) => v.key === variants[i]?.key);
    if (!sameKeys) {
      onVariantsChange(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usedCombinations]);

  const addAttribute = () => {
    onAttributesChange([...attributes, { id: nextId(), name: "", values: [] }]);
  };

  const updateAttributeName = (id, name) => {
    onAttributesChange(
      attributes.map((attr) => (attr.id === id ? { ...attr, name } : attr))
    );
  };

  const updateAttributeValues = (id, values) => {
    onAttributesChange(
      attributes.map((attr) => (attr.id === id ? { ...attr, values } : attr))
    );
  };

  const removeAttribute = (id) => {
    onAttributesChange(attributes.filter((attr) => attr.id !== id));
  };

  const updateVariantField = (key, field, value) => {
    onVariantsChange(
      variants.map((v) => (v.key === key ? { ...v, [field]: value } : v))
    );
  };

  const applyBulkPrice = () => {
    if (bulkPrice === "") return;
    onVariantsChange(variants.map((v) => ({ ...v, price: bulkPrice })));
  };

  const applyBulkStock = () => {
    if (bulkStock === "") return;
    onVariantsChange(variants.map((v) => ({ ...v, stock: bulkStock })));
  };

  return (
    <div className="space-y-6">
      {/* Attributes */}
      <div className="space-y-4">
        {attributes.map((attr) => (
          <div key={attr.id} className="rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-3 mb-3">
              <input
                type="text"
                value={attr.name}
                onChange={(e) => updateAttributeName(attr.id, e.target.value)}
                placeholder="Attribute name (e.g. Color, Size, Material)"
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              />
              <button
                type="button"
                onClick={() => removeAttribute(attr.id)}
                aria-label="Remove attribute"
                className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <ValueChipInput
              values={attr.values}
              onChange={(values) => updateAttributeValues(attr.id, values)}
            />
          </div>
        ))}

        <button
          type="button"
          onClick={addAttribute}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-slate-300 text-slate-500 text-sm font-medium hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50/50 transition"
        >
          <Plus className="w-4 h-4" />
          Add attribute
        </button>
      </div>

      {/* Variant matrix */}
      {variants.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-slate-700">
              {variants.length} variant{variants.length === 1 ? "" : "s"}
            </p>
            {truncated && (
              <p className="text-xs text-rose-600">
                Showing the first {MAX_VARIANTS} combinations — reduce attribute
                values to generate fewer variants.
              </p>
            )}
          </div>

          {/* Bulk apply — the Shopify/Flipkart "same for all" shortcut,
              since most products don't actually vary price/stock per
              combination and re-typing the same number 20 times is
              exactly the kind of busywork this should prevent. */}
          <div className="flex flex-wrap items-center gap-2 mb-3 p-3 rounded-xl bg-slate-50">
            <Wand2 className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-xs text-slate-500 shrink-0">Apply to all:</span>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="0"
                step="0.01"
                value={bulkPrice}
                onChange={(e) => setBulkPrice(e.target.value)}
                placeholder="Price"
                className="w-24 rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition"
              />
              <button
                type="button"
                onClick={applyBulkPrice}
                className="px-3 py-1.5 rounded-lg bg-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-300 transition"
              >
                Apply
              </button>
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="0"
                value={bulkStock}
                onChange={(e) => setBulkStock(e.target.value)}
                placeholder="Stock"
                className="w-24 rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition"
              />
              <button
                type="button"
                onClick={applyBulkStock}
                className="px-3 py-1.5 rounded-lg bg-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-300 transition"
              >
                Apply
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left text-xs font-medium text-slate-500 uppercase tracking-wide">
                  <th className="px-3 py-2.5">Variant</th>
                  <th className="px-3 py-2.5">SKU</th>
                  <th className="px-3 py-2.5 w-28">Price</th>
                  <th className="px-3 py-2.5 w-28">Sale Price</th>
                  <th className="px-3 py-2.5 w-24">Stock</th>
                  <th className="px-3 py-2.5 w-20">Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {variants.map((variant) => (
                  <tr
                    key={variant.key}
                    className={variant.enabled ? "" : "opacity-50"}
                  >
                    <td className="px-3 py-2 font-medium text-slate-900 whitespace-nowrap">
                      {combinationLabel(variant.combination)}
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={variant.sku}
                        onChange={(e) =>
                          updateVariantField(variant.key, "sku", e.target.value)
                        }
                        placeholder="Optional"
                        className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={variant.price}
                        onChange={(e) =>
                          updateVariantField(variant.key, "price", e.target.value)
                        }
                        className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={variant.salePrice}
                        onChange={(e) =>
                          updateVariantField(variant.key, "salePrice", e.target.value)
                        }
                        placeholder="—"
                        className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min="0"
                        value={variant.stock}
                        onChange={(e) =>
                          updateVariantField(variant.key, "stock", e.target.value)
                        }
                        className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={variant.enabled}
                        onChange={(e) =>
                          updateVariantField(variant.key, "enabled", e.target.checked)
                        }
                        className="w-4 h-4 accent-emerald-600"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}