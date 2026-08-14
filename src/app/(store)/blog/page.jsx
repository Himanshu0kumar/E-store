"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPublicBlogPosts } from "@/store/slices/blogSlice";
import { fetchBlogCategories } from "@/store/slices/blogCategorySlice";
import { Calendar, Clock, Search, Eye, Sparkles } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Pagination from "@/components/common/Pagination";

const formatDate = (isoDate) => {
  if (!isoDate) return "";
  return new Date(isoDate).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

export default function BlogPage() {
  const dispatch = useDispatch();
  const { posts, totalPages, loading } = useSelector((state) => state.blog);
  const { categories } = useSelector((state) => state.blogCategory);

  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchBlogCategories());
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      fetchPublicBlogPosts({
        page: currentPage,
        limit: 7,
        category: activeCategory,
        search: searchQuery,
      })
    );
  }, [dispatch, currentPage, activeCategory, searchQuery]);

  const [featured, ...rest] = posts || [];

  return (
    <div className="min-h-screen bg-[#F8F7F4] flex flex-col">
      <Header />

      {/* Hero */}
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 py-14 text-center">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2 flex items-center justify-center gap-1.5">
            <Sparkles className="w-4 h-4" /> The Journal
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Stories, guides, and behind-the-scenes
          </h1>
          <p className="text-slate-500 mt-3 max-w-xl mx-auto text-sm">
            Sizing tips, care guides, and a look at how we make what we make.
          </p>

          {/* Search bar */}
          <div className="mt-6 max-w-md mx-auto relative">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search articles, guides, or topics..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Category filter */}
      <div className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex gap-2 overflow-x-auto">
          <button
            onClick={() => {
              setActiveCategory("All");
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              activeCategory === "All"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
            }`}
          >
            All Posts
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => {
                setActiveCategory(cat.name);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                activeCategory === cat.name
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12 flex-1 w-full">
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-sm">
            Loading articles...
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-16 text-center">
            <p className="text-slate-500 text-sm">
              No articles found matching your filter.
            </p>
          </div>
        ) : (
          <>
            {/* Featured (first) post */}
            {featured && (
              <a
                href={`/blog/${featured.slug}`}
                className="group block bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden mb-8 hover:shadow-md transition"
              >
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="aspect-video md:aspect-auto overflow-hidden bg-slate-100 min-h-[260px]">
                    {featured.coverImage ? (
                      <img
                        src={featured.coverImage}
                        alt={featured.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold text-3xl">
                        {featured.title.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="p-6 sm:p-8 flex flex-col justify-center">
                    <span className="inline-block w-fit px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-3">
                      {featured.category}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight group-hover:text-emerald-600 transition">
                      {featured.title}
                    </h2>
                    <p className="text-slate-500 mt-2 text-sm leading-relaxed line-clamp-3">
                      {featured.excerpt}
                    </p>
                    <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(featured.publishedAt || featured.createdAt)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {featured.readTime || 5} min read
                      </span>
                      {featured.views > 0 && (
                        <span className="flex items-center gap-1.5 ml-auto">
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                          {featured.views}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </a>
            )}

            {/* Remaining posts, grid */}
            {rest.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
                {rest.map((post) => (
                  <a
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className="group bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition flex flex-col"
                  >
                    <div className="aspect-video overflow-hidden bg-slate-100">
                      {post.coverImage ? (
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold text-2xl">
                          {post.title.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="inline-block px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-2">
                          {post.category}
                        </span>
                        <h3 className="text-slate-900 font-bold group-hover:text-emerald-600 transition line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-slate-500 text-xs mt-1.5 line-clamp-2">
                          {post.excerpt}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(post.publishedAt || post.createdAt)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {post.readTime || 5} min
                        </span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}