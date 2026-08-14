"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import dynamic from "next/dynamic";
import {
  fetchBlogPostById,
  updateBlogPost,
  clearBlogError,
} from "@/store/slices/blogSlice";
import { fetchBlogCategories } from "@/store/slices/blogCategorySlice";
import { uploadImages } from "@/store/slices/uploadSlice";
import ImageDropzone from "@/components/ui/ImageDropzone";
import Toggle from "@/components/ui/Toggle";
import {
  ArrowLeft,
  Check,
  Globe,
  Loader2,
} from "lucide-react";
import Link from "next/link";

const Editor = dynamic(() => import("@/components/ui/Editor"), {
  ssr: false,
  loading: () => (
    <div className="p-6 text-sm text-slate-400 border border-slate-200 rounded-xl bg-slate-50">
      Loading editor...
    </div>
  ),
});

export default function EditBlogPostPage({ params }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const router = useRouter();
  const dispatch = useDispatch();

  const { currentPost, detailLoading, actionLoading, error } = useSelector(
    (state) => state.blog
  );
  const { categories } = useSelector((state) => state.blogCategory);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Guides");
  const [tagsInput, setTagsInput] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [publish, setPublish] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [authorName, setAuthorName] = useState("");
  const [authorRole, setAuthorRole] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchBlogCategories());
    if (id) {
      dispatch(fetchBlogPostById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (currentPost) {
      setTitle(currentPost.title || "");
      setSlug(currentPost.slug || "");
      setExcerpt(currentPost.excerpt || "");
      setContent(currentPost.content || "");
      setCategory(currentPost.category || "Guides");
      setTagsInput(Array.isArray(currentPost.tags) ? currentPost.tags.join(", ") : "");
      if (currentPost.coverImage) {
        setImageFiles([currentPost.coverImage]);
      }
      setPublish(currentPost.status === "published");
      setFeatured(Boolean(currentPost.featured));
      setAuthorName(currentPost.author?.name || "");
      setAuthorRole(currentPost.author?.role || "");
      setSeoTitle(currentPost.seoTitle || "");
      setSeoDescription(currentPost.seoDescription || "");
    }
  }, [currentPost]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    dispatch(clearBlogError());

    try {
      setIsSubmitting(true);

      let finalCoverImageUrl = currentPost?.coverImage || "";

      if (imageFiles && imageFiles.length > 0) {
        const filesToUpload = imageFiles.filter((f) => f instanceof File);
        const existingUrls = imageFiles.filter((f) => typeof f === "string");

        if (filesToUpload.length > 0) {
          const uploadedUrls = await dispatch(uploadImages(filesToUpload)).unwrap();
          finalCoverImageUrl = uploadedUrls[0] || existingUrls[0] || "";
        } else if (existingUrls.length > 0) {
          finalCoverImageUrl = existingUrls[0];
        }
      } else {
        finalCoverImageUrl = "";
      }

      const result = await dispatch(
        updateBlogPost({
          id,
          postData: {
            title,
            slug,
            excerpt,
            content,
            category,
            tags: tagsInput,
            coverImage: finalCoverImageUrl,
            status: publish ? "published" : "draft",
            featured,
            author: {
              name: authorName,
              role: authorRole,
            },
            seoTitle,
            seoDescription,
          },
        })
      );

      if (updateBlogPost.fulfilled.match(result)) {
        router.push("/dashboard/blog");
      }
    } catch (err) {
      console.error("Update blog post error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (detailLoading) {
    return (
      <div className="p-16 text-center text-slate-400 text-sm">
        Loading article data...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-24">
      {/* Top Header */}
      <div className="flex items-center justify-between bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/blog"
            className="p-2 rounded-2xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Edit Article
            </h1>
            <p className="text-xs text-slate-500">
              Update article content, image, category, and publishing status.
            </p>
          </div>
        </div>

        <a
          href={`/blog/${slug}`}
          target="_blank"
          rel="noreferrer"
          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
        >
          View Live
        </a>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Article Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-base font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                URL Slug
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono">
                  /blog/
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full pl-16 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Short Excerpt / Teaser *
              </label>
              <textarea
                rows={3}
                required
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* CKEditor Rich Text Content Area */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div>
              <p className="mb-2 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Content *
              </p>
              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <Editor
                  data={content}
                  onChange={(event, editor) => {
                    const data = editor.getData();
                    setContent(data);
                  }}
                  config={{
                    licenseKey: "GPL",
                    placeholder: "Write something awesome...",
                    toolbar: [
                      "heading",
                      "|",
                      "bold",
                      "italic",
                      "link",
                      "bulletedList",
                      "numberedList",
                      "|",
                      "outdent",
                      "indent",
                      "|",
                      "imageUpload",
                      "blockQuote",
                      "undo",
                      "redo",
                    ],
                  }}
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 uppercase tracking-wider">
              <Globe className="w-4 h-4 text-emerald-600" /> SEO Metadata
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  Meta Title
                </label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">
                  Meta Description
                </label>
                <textarea
                  rows={2}
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Options Area */}
        <div className="space-y-6">
          {/* Image Dropzone Component (Uploads to Cloudinary) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
            <ImageDropzone
              files={imageFiles}
              onFilesChange={(files) => setImageFiles(files)}
            />
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Publishing Options
            </label>

            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {categories.length > 0 ? (
                  categories.map((c) => (
                    <option key={c._id} value={c.name}>
                      {c.name}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Guides">Guides</option>
                    <option value="Sustainability">Sustainability</option>
                    <option value="Product">Product</option>
                    <option value="Company">Company</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">
                Tags (Comma separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-800 block">
                  Featured Article
                </span>
                <span className="text-[10px] text-slate-400">
                  Highlight at the top of the blog page
                </span>
              </div>
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Author Info
            </label>

            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">
                Author Name
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">
                Author Role
              </label>
              <input
                type="text"
                value={authorRole}
                onChange={(e) => setAuthorRole(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>
      </form>

      {/* FOOTER BAR (Publish toggle & Save button at the bottom) */}
      <div className="mt-8 flex items-center justify-between border-t border-slate-200 bg-white p-5 rounded-3xl shadow-sm">
        <Toggle
          checked={publish}
          onChange={setPublish}
          label="Publish immediately on save"
        />

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || actionLoading}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting || actionLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Check className="w-4 h-4" /> Save Article Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
}
