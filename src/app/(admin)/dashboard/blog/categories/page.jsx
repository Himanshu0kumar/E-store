"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchBlogCategories,
  createBlogCategory,
  updateBlogCategory,
  deleteBlogCategory,
} from "@/store/slices/blogCategorySlice";
import {
  ArrowLeft,
  Plus,
  FolderTree,
  Edit2,
  Trash2,
  Check,
  X,
  Loader2,
  Sparkles,
} from "lucide-react";

export default function BlogCategoriesPage() {
  const dispatch = useDispatch();
  const { categories, loading, actionLoading, error } = useSelector(
    (state) => state.blogCategory
  );

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  useEffect(() => {
    dispatch(fetchBlogCategories());
  }, [dispatch]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const res = await dispatch(createBlogCategory({ name, description }));
    if (createBlogCategory.fulfilled.match(res)) {
      setName("");
      setDescription("");
    }
  };

  const handleStartEdit = (cat) => {
    setEditingId(cat._id);
    setEditName(cat.name);
    setEditDescription(cat.description || "");
  };

  const handleSaveEdit = async (id) => {
    if (!editName.trim()) return;
    const res = await dispatch(
      updateBlogCategory({
        id,
        categoryData: { name: editName, description: editDescription },
      })
    );
    if (updateBlogCategory.fulfilled.match(res)) {
      setEditingId(null);
    }
  };

  const handleDelete = async (id, catName) => {
    if (window.confirm(`Delete blog category "${catName}"?`)) {
      dispatch(deleteBlogCategory(id));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/blog"
            className="p-2 rounded-2xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-emerald-600 text-xs font-semibold uppercase tracking-wider mb-0.5">
              <FolderTree className="w-4 h-4" /> Taxonomy
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              Blog Categories
            </h1>
          </div>
        </div>

        <Link
          href="/dashboard/blog/add"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-600 text-white font-medium text-xs hover:bg-emerald-700 transition"
        >
          <Plus className="w-4 h-4" /> Create Article
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Grid: Create Form + Category List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Create Category Form */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4 h-fit">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Add New Category
          </h2>

          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Category Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Technology"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Description
              </label>
              <textarea
                rows={3}
                placeholder="Short overview of articles in this category..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={actionLoading || !name.trim()}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 text-white font-medium text-xs hover:bg-emerald-700 transition disabled:opacity-50"
            >
              {actionLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Add Category
            </button>
          </form>
        </div>

        {/* Category List */}
        <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Existing Categories ({categories.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              Loading categories...
            </div>
          ) : categories.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No categories created yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {categories.map((cat) => (
                <div
                  key={cat._id}
                  className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/60 transition"
                >
                  {editingId === cat._id ? (
                    <div className="flex-1 flex flex-col sm:flex-row gap-2 items-center">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-900 w-full sm:w-1/3"
                      />
                      <input
                        type="text"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-700 flex-1 w-full"
                      />
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleSaveEdit(cat._id)}
                          className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1.5 rounded-lg bg-slate-200 text-slate-600 hover:bg-slate-300"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 text-sm">
                            {cat.name}
                          </h3>
                          <span className="text-[10px] font-mono text-slate-400">
                            ({cat.slug})
                          </span>
                        </div>
                        {cat.description && (
                          <p className="text-xs text-slate-500 mt-0.5">
                            {cat.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleStartEdit(cat)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat._id, cat.name)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
