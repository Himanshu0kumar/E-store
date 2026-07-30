"use client";

import { useState, useMemo } from "react";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Pagination from "@/components/common/Pagination";

// ----------------------------------------------------------------
// Mock blog posts. Replace with a real API/CMS fetch — the
// filtering/pagination below only cares that each post has this
// shape. `slug` is what the details page (/blog/[slug]) looks up.
// ----------------------------------------------------------------
const BLOG_CATEGORIES = ["All", "Guides", "Product", "Sustainability", "Company"];

const BLOG_POSTS = [
  {
    slug: "how-to-choose-the-right-size",
    title: "How to Choose the Right Size Every Time",
    excerpt: "Our sizing charts explained, plus a few tricks for measuring yourself accurately at home.",
    category: "Guides",
    author: "Maya Chen",
    date: "2026-07-12",
    readMinutes: 6,
    image: "https://picsum.photos/seed/blog-1/800/500",
  },
  {
    slug: "inside-our-supply-chain",
    title: "Inside Our Supply Chain: Where Everything Comes From",
    excerpt: "A transparent look at the factories and materials behind every product we sell.",
    category: "Sustainability",
    author: "Daniel Ruiz",
    date: "2026-06-28",
    readMinutes: 8,
    image: "https://picsum.photos/seed/blog-2/800/500",
  },
  {
    slug: "new-arrivals-summer-2026",
    title: "What's New This Summer",
    excerpt: "A first look at the pieces we're most excited about this season.",
    category: "Product",
    author: "Priya Nair",
    date: "2026-06-15",
    readMinutes: 4,
    image: "https://picsum.photos/seed/blog-3/800/500",
  },
  {
    slug: "caring-for-natural-fabrics",
    title: "Caring for Natural Fabrics: A Practical Guide",
    excerpt: "Wool, linen, and cotton all want different things from you. Here's how to keep each looking new.",
    category: "Guides",
    author: "Maya Chen",
    date: "2026-05-30",
    readMinutes: 7,
    image: "https://picsum.photos/seed/blog-4/800/500",
  },
  {
    slug: "our-packaging-overhaul",
    title: "Why We Redesigned Our Packaging",
    excerpt: "Cutting plastic by 80% without cutting corners on protecting your order in transit.",
    category: "Sustainability",
    author: "Daniel Ruiz",
    date: "2026-05-18",
    readMinutes: 5,
    image: "https://picsum.photos/seed/blog-5/800/500",
  },
  {
    slug: "meet-the-team-behind-the-brand",
    title: "Meet the Team Behind the Brand",
    excerpt: "Five people, one warehouse, and a shared obsession with getting the details right.",
    category: "Company",
    author: "Priya Nair",
    date: "2026-04-22",
    readMinutes: 9,
    image: "https://picsum.photos/seed/blog-6/800/500",
  },
  {
    slug: "return-policy-explained",
    title: "Our Return Policy, Explained Simply",
    excerpt: "No hidden fine print — here's exactly how returns and exchanges work.",
    category: "Guides",
    author: "Maya Chen",
    date: "2026-04-03",
    readMinutes: 3,
    image: "https://picsum.photos/seed/blog-7/800/500",
  },
];

const POSTS_PER_PAGE = 4;

const formatDate = (isoDate) =>
  new Date(isoDate).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredPosts = useMemo(() => {
    if (activeCategory === "All") return BLOG_POSTS;
    return BLOG_POSTS.filter((post) => post.category === activeCategory);
  }, [activeCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedPosts = filteredPosts.slice(
    (safePage - 1) * POSTS_PER_PAGE,
    safePage * POSTS_PER_PAGE
  );

  const [featured, ...rest] = paginatedPosts;

  return (
    <div className="min-h-screen bg-[#F8F7F4] flex flex-col">
      <Header />

      {/* Hero */}
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 py-14 text-center">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2">
            The Journal
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Stories, guides, and behind-the-scenes
          </h1>
          <p className="text-slate-500 mt-3 max-w-xl mx-auto">
            Sizing tips, care guides, and a look at how we make what we make.
          </p>
        </div>
      </div>

      {/* Category filter */}
      <div className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex gap-2 overflow-x-auto">
          {BLOG_CATEGORIES.map((category) => {
            const isActive = activeCategory === category;
            return (
              <button
                key={category}
                onClick={() => {
                  setActiveCategory(category);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                  isActive
                    ? "bg-emerald-600 text-white"
                    : "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12 flex-1 w-full">
        {paginatedPosts.length === 0 ? (
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-16 text-center">
            <p className="text-slate-500">No posts in this category yet.</p>
          </div>
        ) : (
          <>
            {/* Featured (first) post, larger */}
            {featured && (
              <a
                href={`/blog/${featured.slug}`}
                className="group block bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden mb-8 hover:shadow-md transition"
              >
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="aspect-video md:aspect-auto overflow-hidden">
                    <img
                      src={featured.image}
                      alt={featured.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>
                  <div className="p-6 sm:p-8 flex flex-col justify-center">
                    <span className="inline-block w-fit px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium mb-3">
                      {featured.category}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight group-hover:text-emerald-600 transition">
                      {featured.title}
                    </h2>
                    <p className="text-slate-500 mt-2 text-sm leading-relaxed">
                      {featured.excerpt}
                    </p>
                    <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(featured.date)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {featured.readMinutes} min read
                      </span>
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
                    className="group bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition"
                  >
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    </div>
                    <div className="p-5">
                      <span className="inline-block px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium mb-2">
                        {post.category}
                      </span>
                      <h3 className="text-slate-900 font-semibold group-hover:text-emerald-600 transition">
                        {post.title}
                      </h3>
                      <p className="text-slate-500 text-sm mt-1.5 line-clamp-2">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(post.date)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {post.readMinutes} min
                        </span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}

            <Pagination
              currentPage={safePage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}