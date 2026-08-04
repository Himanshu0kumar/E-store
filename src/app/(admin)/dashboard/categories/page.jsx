"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  FolderTree,
  Loader,
} from "lucide-react";
import {
  getCategories,
  createCategory,
  renameCategory,
  deleteCategory,
  addSubcategory,
  renameSubcategory,
  deleteSubcategory,
} from "@/store/slices/categorySlice";

// Module-level constant, not recreated on every render. Used as the
// fallback when the "category" slice isn't in the store yet — a
// fresh `[]` literal in a default parameter gets a new identity on
// every render, which would re-trigger any effect keyed on it and
// cause an infinite render loop. This one reference never changes.
const EMPTY_CATEGORIES = [];

export default function ManageCategoriesPage() {
  const dispatch = useDispatch();
  // Falls back to safe defaults if the "category" slice hasn't been
  // registered in the store yet, instead of crashing the whole page.
  // If you're seeing categories never load, the real fix is adding
  // `category: categoryReducer` to your store's reducer object.
  const categoryState = useSelector((state) => state.category);
  const { categories = EMPTY_CATEGORIES, loading = false, error = null } =
    categoryState || {};

  const [expandedIds, setExpandedIds] = useState(new Set());

  // Inline edit state: { type: "category" | "subcategory", categoryId, subcategoryId? }
  const [editingTarget, setEditingTarget] = useState(null);
  const [editingValue, setEditingValue] = useState("");

  const [addingSubcategoryFor, setAddingSubcategoryFor] = useState(null);
  const [newSubcategoryName, setNewSubcategoryName] = useState("");

  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const [deleteTarget, setDeleteTarget] = useState(null); // { type, categoryId, subcategoryId?, name }
  const [savingAction, setSavingAction] = useState(false);

  useEffect(() => {
    dispatch(getCategories());
  }, [dispatch]);

  // Auto-expand any category we haven't seen before (newly fetched
  // or newly created), without re-expanding one the user deliberately
  // collapsed earlier.
  useEffect(() => {
    setExpandedIds((current) => {
      const idsToAdd = categories.filter((cat) => !current.has(cat._id));
      if (idsToAdd.length === 0) return current; // no change — same reference, no re-render
      const next = new Set(current);
      idsToAdd.forEach((cat) => next.add(cat._id));
      return next;
    });
  }, [categories]);

  const toggleExpanded = (categoryId) => {
    setExpandedIds((current) => {
      const next = new Set(current);
      next.has(categoryId) ? next.delete(categoryId) : next.add(categoryId);
      return next;
    });
  };

  // ---- Add category ----
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setSavingAction(true);
    const result = await dispatch(createCategory(newCategoryName));
    setSavingAction(false);
    if (createCategory.fulfilled.match(result)) {
      setNewCategoryName("");
      setIsAddingCategory(false);
    }
  };

  // ---- Add subcategory ----
  const handleAddSubcategory = async (categoryId, e) => {
    e.preventDefault();
    if (!newSubcategoryName.trim()) return;
    setSavingAction(true);
    const result = await dispatch(
      addSubcategory({ categoryId, name: newSubcategoryName })
    );
    setSavingAction(false);
    if (addSubcategory.fulfilled.match(result)) {
      setNewSubcategoryName("");
      setAddingSubcategoryFor(null);
    }
  };

  // ---- Rename (category or subcategory) ----
  const startEditing = (target, currentName) => {
    setEditingTarget(target);
    setEditingValue(currentName);
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    if (!editingValue.trim() || !editingTarget) return;

    setSavingAction(true);
    const result =
      editingTarget.type === "category"
        ? await dispatch(
            renameCategory({ categoryId: editingTarget.categoryId, name: editingValue })
          )
        : await dispatch(
            renameSubcategory({
              categoryId: editingTarget.categoryId,
              subcategoryId: editingTarget.subcategoryId,
              name: editingValue,
            })
          );
    setSavingAction(false);

    if (
      renameCategory.fulfilled.match(result) ||
      renameSubcategory.fulfilled.match(result)
    ) {
      setEditingTarget(null);
      setEditingValue("");
    }
  };

  // ---- Delete ----
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setSavingAction(true);

    if (deleteTarget.type === "category") {
      await dispatch(deleteCategory(deleteTarget.categoryId));
    } else {
      await dispatch(
        deleteSubcategory({
          categoryId: deleteTarget.categoryId,
          subcategoryId: deleteTarget.subcategoryId,
        })
      );
    }

    setSavingAction(false);
    setDeleteTarget(null);
  };

  const totalSubcategories = categories.reduce(
    (sum, cat) => sum + cat.subcategories.length,
    0
  );

  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
          <span>Dashboard</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-900 font-medium">Categories</span>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Manage Categories
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {categories.length} categories, {totalSubcategories} subcategories
            </p>
          </div>
          <button
            onClick={() => setIsAddingCategory(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </button>
        </div>

        {!categoryState && (
          <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl text-sm">
            The category slice isn't registered in your Redux store yet — add{" "}
            <code className="font-mono bg-amber-100 px-1 rounded">
              category: categoryReducer
            </code>{" "}
            to your store's reducer config to load real data here.
          </div>
        )}

        {error && (
          <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* New category form */}
        {isAddingCategory && (
          <form
            onSubmit={handleAddCategory}
            className="bg-white border border-emerald-300 shadow-sm rounded-2xl p-4 mb-4 flex gap-2"
          >
            <input
              type="text"
              autoFocus
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Category name (e.g. Footwear)"
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
                setIsAddingCategory(false);
                setNewCategoryName("");
              }}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition"
            >
              Cancel
            </button>
          </form>
        )}

        {/* Loading state */}
        {loading && categories.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <Loader className="w-6 h-6 text-emerald-600 animate-spin" />
          </div>
        ) : categories.length === 0 ? (
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-12 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-slate-50 flex items-center justify-center">
              <FolderTree className="w-7 h-7 text-slate-400" />
            </div>
            <h3 className="text-slate-900 font-semibold mb-1">No categories yet</h3>
            <p className="text-slate-500 text-sm">
              Add your first category to start organizing products.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {categories.map((category) => {
              const isExpanded = expandedIds.has(category._id);
              const isEditingThis =
                editingTarget?.type === "category" &&
                editingTarget.categoryId === category._id;

              return (
                <div
                  key={category._id}
                  className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden"
                >
                  {/* Category row */}
                  <div className="flex items-center gap-2 p-4">
                    <button
                      onClick={() => toggleExpanded(category._id)}
                      className="p-1 rounded-lg hover:bg-slate-100 transition shrink-0"
                      aria-label={isExpanded ? "Collapse" : "Expand"}
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-slate-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                      )}
                    </button>

                    {isEditingThis ? (
                      <form onSubmit={saveEdit} className="flex-1 flex gap-2">
                        <input
                          type="text"
                          autoFocus
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          className="flex-1 px-3 py-1.5 rounded-lg bg-slate-50 border border-emerald-300 text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20"
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
                          onClick={() => setEditingTarget(null)}
                          aria-label="Cancel"
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </form>
                    ) : (
                      <>
                        <span className="flex-1 font-semibold text-slate-900">
                          {category.name}
                        </span>
                        <span className="text-xs text-slate-400 mr-2">
                          {category.subcategories.length}{" "}
                          {category.subcategories.length === 1 ? "item" : "items"}
                        </span>
                        <button
                          onClick={() =>
                            startEditing(
                              { type: "category", categoryId: category._id },
                              category.name
                            )
                          }
                          aria-label="Rename category"
                          className="p-2 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteTarget({
                              type: "category",
                              categoryId: category._id,
                              name: category.name,
                            })
                          }
                          aria-label="Delete category"
                          className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Subcategories */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-slate-50/50 pl-11 pr-4 py-2">
                      {category.subcategories.map((sub) => {
                        const isEditingSub =
                          editingTarget?.type === "subcategory" &&
                          editingTarget.subcategoryId === sub._id;

                        return (
                          <div
                            key={sub._id}
                            className="flex items-center gap-2 py-1.5 group"
                          >
                            {isEditingSub ? (
                              <form onSubmit={saveEdit} className="flex-1 flex gap-2">
                                <input
                                  type="text"
                                  autoFocus
                                  value={editingValue}
                                  onChange={(e) => setEditingValue(e.target.value)}
                                  className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-emerald-300 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20"
                                />
                                <button
                                  type="submit"
                                  disabled={savingAction}
                                  aria-label="Save"
                                  className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition disabled:opacity-50"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingTarget(null)}
                                  aria-label="Cancel"
                                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </form>
                            ) : (
                              <>
                                <span className="flex-1 text-sm text-slate-600">
                                  {sub.name}
                                </span>
                                <button
                                  onClick={() =>
                                    startEditing(
                                      {
                                        type: "subcategory",
                                        categoryId: category._id,
                                        subcategoryId: sub._id,
                                      },
                                      sub.name
                                    )
                                  }
                                  aria-label="Rename subcategory"
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition opacity-0 group-hover:opacity-100"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() =>
                                    setDeleteTarget({
                                      type: "subcategory",
                                      categoryId: category._id,
                                      subcategoryId: sub._id,
                                      name: sub.name,
                                    })
                                  }
                                  aria-label="Delete subcategory"
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition opacity-0 group-hover:opacity-100"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        );
                      })}

                      {/* Add subcategory */}
                      {addingSubcategoryFor === category._id ? (
                        <form
                          onSubmit={(e) => handleAddSubcategory(category._id, e)}
                          className="flex gap-2 py-2"
                        >
                          <input
                            type="text"
                            autoFocus
                            value={newSubcategoryName}
                            onChange={(e) => setNewSubcategoryName(e.target.value)}
                            placeholder="Subcategory name"
                            className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
                          />
                          <button
                            type="submit"
                            disabled={savingAction}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 transition disabled:opacity-50"
                          >
                            Add
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setAddingSubcategoryFor(null);
                              setNewSubcategoryName("");
                            }}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-100 transition"
                          >
                            Cancel
                          </button>
                        </form>
                      ) : (
                        <button
                          onClick={() => setAddingSubcategoryFor(category._id)}
                          className="flex items-center gap-1.5 py-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add subcategory
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setDeleteTarget(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <div className="w-11 h-11 rounded-full bg-rose-50 flex items-center justify-center mb-4">
              <Trash2 className="w-5 h-5 text-rose-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Delete {deleteTarget.type === "category" ? "category" : "subcategory"}?
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              {deleteTarget.type === "category" ? (
                <>
                  This will also delete all subcategories under{" "}
                  <span className="font-medium text-slate-700">{deleteTarget.name}</span>.
                  This can't be undone.
                </>
              ) : (
                <>
                  <span className="font-medium text-slate-700">{deleteTarget.name}</span>{" "}
                  will be permanently removed.
                </>
              )}
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
          </div>
        </div>
      )}
    </div>
  );
}