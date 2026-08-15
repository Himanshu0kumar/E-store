"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Tag,
  Loader,
} from "lucide-react";
import {
  getBrands,
  createBrand,
  renameBrand,
  deleteBrand,
} from "@/store/slices/brandSlice";

// Module-level constant so this fallback array never gets a fresh
// identity on re-render (a fresh `[]` in a default parameter caused
// an infinite render loop on the categories page — same fix here,
// preemptively).
const EMPTY_BRANDS = [];

export default function ManageBrandsPage() {
  const dispatch = useDispatch();
  const brandState = useSelector((state) => state.brand);
  const { brands = EMPTY_BRANDS, loading = false, error = null } =
    brandState || {};

  const [editingBrandId, setEditingBrandId] = useState(null);
  const [editingValue, setEditingValue] = useState("");

  const [isAddingBrand, setIsAddingBrand] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");

  const [deleteTarget, setDeleteTarget] = useState(null); // { brandId, name }
  const [savingAction, setSavingAction] = useState(false);

  useEffect(() => {
    dispatch(getBrands());
  }, [dispatch]);

  const handleAddBrand = async (e) => {
    e.preventDefault();
    if (!newBrandName.trim()) return;
    setSavingAction(true);
    const result = await dispatch(createBrand(newBrandName));
    setSavingAction(false);
    if (createBrand.fulfilled.match(result)) {
      setNewBrandName("");
      setIsAddingBrand(false);
    }
  };

  const startEditing = (brandId, currentName) => {
    setEditingBrandId(brandId);
    setEditingValue(currentName);
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!editingValue.trim() || !editingBrandId) return;

    setSavingAction(true);
    const result = await dispatch(
      renameBrand({ brandId: editingBrandId, name: editingValue })
    );
    setSavingAction(false);

    if (renameBrand.fulfilled.match(result)) {
      setEditingBrandId(null);
      setEditingValue("");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setSavingAction(true);
    await dispatch(deleteBrand(deleteTarget.brandId));
    setSavingAction(false);
    setDeleteTarget(null);
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
          <span>Dashboard</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-900 font-medium">Brands</span>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Manage Brands
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {brands.length} {brands.length === 1 ? "brand" : "brands"}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setIsAddingBrand(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Add Brand
          </motion.button>
        </div>

        {!brandState && (
          <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl text-sm">
            The brand slice isn't registered in your Redux store yet — add{" "}
            <code className="font-mono bg-amber-100 px-1 rounded">
              brand: brandReducer
            </code>{" "}
            to your store's reducer config to load real data here.
          </div>
        )}

        {error && (
          <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* New brand form */}
        <AnimatePresence>
          {isAddingBrand && (
            <motion.form
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              onSubmit={handleAddBrand}
              className="bg-white border border-emerald-300 shadow-sm rounded-2xl p-4 mb-4 flex gap-2 overflow-hidden"
            >
              <input
                type="text"
                autoFocus
                value={newBrandName}
                onChange={(e) => setNewBrandName(e.target.value)}
                placeholder="Brand name (e.g. Nike)"
                className="flex-1 px-4 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition text-sm"
              />
              <button
                type="submit"
                disabled={savingAction}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition disabled:opacity-50"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingBrand(false);
                  setNewBrandName("");
                }}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition"
              >
                Cancel
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Brand list */}
        {loading && brands.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <Loader className="w-6 h-6 text-emerald-600 animate-spin" />
          </div>
        ) : brands.length === 0 ? (
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-12 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-slate-50 flex items-center justify-center">
              <Tag className="w-7 h-7 text-slate-400" />
            </div>
            <h3 className="text-slate-900 font-semibold mb-1">No brands yet</h3>
            <p className="text-slate-500 text-sm">
              Add your first brand to start tagging products.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl divide-y divide-slate-100 overflow-hidden">
            {brands.map((brand, idx) => {
              const isEditingThis = editingBrandId === brand._id;

              return (
                <motion.div
                  key={brand._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: idx * 0.04 }}
                  className="flex items-center gap-2 p-4 hover:bg-slate-50/60 transition"
                >
                  <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    <Tag className="w-4 h-4 text-slate-500" />
                  </div>

                  {isEditingThis ? (
                    <form onSubmit={saveEdit} className="flex-1 flex gap-2">
                      <input
                        type="text"
                        autoFocus
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-slate-50 border border-emerald-300 text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                      <button
                        type="submit"
                        disabled={savingAction}
                        aria-label="Save"
                        className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingBrandId(null)}
                        aria-label="Cancel"
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </form>
                  ) : (
                    <>
                      <span className="flex-1 font-medium text-slate-900">
                        {brand.name}
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => startEditing(brand._id, brand.name)}
                        aria-label="Rename brand"
                        className="p-2 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition"
                      >
                        <Pencil className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() =>
                          setDeleteTarget({ brandId: brand._id, name: brand.name })
                        }
                        aria-label="Delete brand"
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
              onClick={() => setDeleteTarget(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full"
            >
              <div className="w-11 h-11 rounded-full bg-rose-50 flex items-center justify-center mb-4">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                Delete brand?
              </h3>
              <p className="text-sm text-slate-500 mb-6">
                <span className="font-medium text-slate-700">{deleteTarget.name}</span>{" "}
                will be permanently removed. This can't be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  disabled={savingAction}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={savingAction}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 text-white font-medium hover:bg-rose-700 transition disabled:opacity-50"
                >
                  {savingAction ? "Deleting..." : "Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}