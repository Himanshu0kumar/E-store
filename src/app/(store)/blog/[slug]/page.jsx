"use client";

import { useEffect, useState, use } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBlogPostBySlug, clearCurrentPost } from "@/store/slices/blogSlice";
import {
  Calendar,
  Clock,
  ArrowLeft,
  Share2,
  Eye,
  User,
  Flame,
  ChevronRight,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";

const formatDate = (isoDate) => {
  if (!isoDate) return "";
  return new Date(isoDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function BlogDetailPage({ params }) {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;

  const dispatch = useDispatch();
  const {
    currentPost: post,
    relatedPosts,
    popularPosts,
    detailLoading,
    error,
  } = useSelector((state) => state.blog);

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (slug) {
      dispatch(fetchBlogPostBySlug(slug));
    }
    return () => {
      dispatch(clearCurrentPost());
    };
  }, [dispatch, slug]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (newsletterEmail) {
      setSubscribed(true);
      setNewsletterEmail("");
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  if (detailLoading) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] flex flex-col">
        <Header />
        <div className="max-w-6xl mx-auto px-4 py-24 flex-1 text-center text-slate-400 text-sm">
          Loading article...
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] flex flex-col">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-24 flex-1 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Article Not Found
          </h2>
          <p className="text-slate-500 text-sm mb-6">
            The article you are looking for might have been moved or removed.
          </p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-medium text-xs hover:bg-emerald-700 transition shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Journal
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7F4] flex flex-col">
      <Header />

      {/* Top Banner / Breadcrumb area */}
      <div className="bg-white border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-emerald-600 transition mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Journal
          </Link>

          <div className="flex items-center gap-2 mb-3">
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
              {post.category}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight leading-tight max-w-4xl">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 mt-6 text-xs text-slate-500">
            <span className="flex items-center gap-1.5 font-medium">
              <Calendar className="w-4 h-4 text-emerald-600" />
              {formatDate(post.publishedAt || post.createdAt)}
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1.5 font-medium">
              <Clock className="w-4 h-4 text-emerald-600" />
              {post.readTime || 5} min read
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1.5 font-medium">
              <Eye className="w-4 h-4 text-emerald-600" />
              {post.views || 1} views
            </span>

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 hover:text-emerald-600 transition ml-auto font-semibold px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50"
            >
              <Share2 className="w-3.5 h-3.5" />
              {copied ? "Link Copied!" : "Share"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Container Layout */}
      <div className="max-w-6xl mx-auto px-4 py-10 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Article Content (Left Column) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Cover Image */}
            {post.coverImage && (
              <div className="rounded-3xl overflow-hidden aspect-video bg-slate-100 border border-slate-200/80 shadow-sm">
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Article Excerpt Callout */}
            {post.excerpt && (
              <div className="p-5 rounded-2xl bg-white border-l-4 border-emerald-500 shadow-sm text-slate-700 text-sm font-medium leading-relaxed italic">
                "{post.excerpt}"
              </div>
            )}

            {/* Article HTML Body */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm text-slate-800 leading-relaxed text-base">
              <div
                className="prose max-w-none prose-emerald prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-700 prose-p:leading-relaxed"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>

            {/* Article Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">
                  Tags:
                </span>
                {post.tags.map((tag, idx) => (
                  <Link
                    key={idx}
                    href={`/blog?tag=${encodeURIComponent(tag)}`}
                    className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-medium hover:bg-emerald-50 hover:text-emerald-700 transition"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Author Bio Box */}
            {post.author && (
              <div className="bg-white border border-slate-200/80 shadow-sm rounded-3xl p-6 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold shrink-0 text-lg shadow-sm">
                  {post.author.name ? (
                    post.author.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                  ) : (
                    <User className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                    Written By
                  </p>
                  <h3 className="text-slate-900 font-bold text-base mt-0.5">
                    {post.author.name || "Admin"}
                  </h3>
                  <p className="text-slate-500 text-xs mt-0.5">
                    {post.author.role || "Author & Contributor"}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar Column */}
          <div className="lg:col-span-4 space-y-6">
            {/* POPULAR ARTICLES WIDGET */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 sm:p-6 space-y-4 sticky top-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    <Flame className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Popular Articles
                  </h3>
                </div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Trending
                </span>
              </div>

              {popularPosts && popularPosts.length > 0 ? (
                <div className="space-y-3.5 divide-y divide-slate-100">
                  {popularPosts.map((item) => (
                    <Link
                      key={item.slug}
                      href={`/blog/${item.slug}`}
                      className="group pt-3 first:pt-0 block"
                    >
                      <div className="min-w-0">
                        <span className="inline-block text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mb-1">
                          {item.category}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-600 transition line-clamp-2 leading-snug">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" /> {item.views || 0} views
                          </span>
                          <span>•</span>
                          <span>{item.readTime || 5} min read</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No popular articles yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* RELATED POSTS SECTION (Bottom Grid) */}
        {relatedPosts && relatedPosts.length > 0 && (
          <div className="mt-16 pt-10 border-t border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                  Recommended Reading
                </span>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                  More in {post.category}
                </h2>
              </div>

              <Link
                href={`/blog?category=${encodeURIComponent(post.category)}`}
                className="text-xs font-semibold text-slate-600 hover:text-emerald-600 flex items-center gap-1 transition"
              >
                View all <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedPosts.map((related) => (
                <Link
                  key={related.slug}
                  href={`/blog/${related.slug}`}
                  className="group bg-white border border-slate-200/80 shadow-sm rounded-2xl overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition flex flex-col"
                >
                  <div className="aspect-video overflow-hidden bg-slate-100">
                    {related.coverImage ? (
                      <img
                        src={related.coverImage}
                        alt={related.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold">
                        {related.title.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="inline-block text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mb-1.5">
                        {related.category}
                      </span>
                      <h3 className="text-xs font-bold text-slate-900 group-hover:text-emerald-600 transition line-clamp-2 leading-snug">
                        {related.title}
                      </h3>
                      {related.excerpt && (
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                          {related.excerpt}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(related.publishedAt)}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {related.readTime || 5} min
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}