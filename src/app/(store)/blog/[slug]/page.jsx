"use client";

import { useParams, notFound } from "next/navigation";
import { Calendar, Clock, ArrowLeft, Share2 } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

// ----------------------------------------------------------------
// Same mock data as the blog listing page. In a real app this
// would live in one shared file (or come from your CMS/API) so
// the listing and detail pages never drift out of sync.
// ----------------------------------------------------------------
const BLOG_POSTS = [
  {
    slug: "how-to-choose-the-right-size",
    title: "How to Choose the Right Size Every Time",
    excerpt: "Our sizing charts explained, plus a few tricks for measuring yourself accurately at home.",
    category: "Guides",
    author: "Maya Chen",
    authorRole: "Head of Product",
    date: "2026-07-12",
    readMinutes: 6,
    image: "https://picsum.photos/seed/blog-1/1200/600",
    content: [
      "Getting the right size on the first try saves everyone time — you skip the exchange, and we skip the extra shipping. Here's the short version of how our sizing actually works.",
      "Every product page includes a size chart specific to that item, not a generic one for the whole site. Fit varies enough between a fitted tee and a relaxed hoodie that a single chart never tells the full story.",
      "If you're between two sizes, our general rule is: size up for anything you want to layer, size down for anything meant to sit close to the body. When in doubt, check the garment's chest and length measurements against something you already own that fits well.",
      "For footwear specifically, we recommend measuring your foot in the evening — feet swell slightly over the course of a day, and evening measurements tend to be the most reliable for all-day comfort.",
      "Still unsure? Reach out before you order — our support team would rather answer a sizing question upfront than process a return afterward.",
    ],
  },
  {
    slug: "inside-our-supply-chain",
    title: "Inside Our Supply Chain: Where Everything Comes From",
    excerpt: "A transparent look at the factories and materials behind every product we sell.",
    category: "Sustainability",
    author: "Daniel Ruiz",
    authorRole: "Operations Lead",
    date: "2026-06-28",
    readMinutes: 8,
    image: "https://picsum.photos/seed/blog-2/1200/600",
    content: [
      "We get asked fairly often where our products actually come from, so here's the honest, unglamorous answer.",
      "We work with a small number of manufacturing partners, most of whom we've worked with for over five years. We visit in person at least once a year — not as a photo opportunity, but to actually walk the floor.",
      "Materials are sourced with a preference for traceable origins over the cheapest available option. That sometimes means a higher cost, which we try to absorb rather than pass entirely onto you.",
      "None of this makes us perfect — there's always more to improve. But we'd rather be transparent about where we are today than make promises we can't back up.",
    ],
  },
  {
    slug: "new-arrivals-summer-2026",
    title: "What's New This Summer",
    excerpt: "A first look at the pieces we're most excited about this season.",
    category: "Product",
    author: "Priya Nair",
    authorRole: "Merchandising Lead",
    date: "2026-06-15",
    readMinutes: 4,
    image: "https://picsum.photos/seed/blog-3/1200/600",
    content: [
      "Summer's lineup leans lighter — literally. We've reworked a few core styles in breathable linen blends that hold their shape better than typical summer fabrics.",
      "A few favorites from the team: the relaxed short-sleeve shirt (finally, one that doesn't wrinkle after twenty minutes), and a lightweight version of last year's popular trail sneaker.",
      "Everything in this drop is available now, in limited quantities per size — we intentionally keep summer runs smaller.",
    ],
  },
  {
    slug: "caring-for-natural-fabrics",
    title: "Caring for Natural Fabrics: A Practical Guide",
    excerpt: "Wool, linen, and cotton all want different things from you. Here's how to keep each looking new.",
    category: "Guides",
    author: "Maya Chen",
    authorRole: "Head of Product",
    date: "2026-05-30",
    readMinutes: 7,
    image: "https://picsum.photos/seed/blog-4/1200/600",
    content: [
      "Natural fabrics reward a little extra care, and punish neglect more visibly than synthetics do. Here's the fabric-by-fabric breakdown.",
      "Wool: wash cold, on a wool or hand-wash cycle, and always lay flat to dry. Hanging a wet wool sweater will stretch it out permanently.",
      "Linen: gets softer with every wash, so don't be precious with it. It wrinkles by nature — that's not a flaw, it's the fabric doing what linen does.",
      "Cotton: shrinks most in the first wash, so if a cotton piece fits perfectly out of the box, wash it cold and expect a very slight change after wash one.",
    ],
  },
  {
    slug: "our-packaging-overhaul",
    title: "Why We Redesigned Our Packaging",
    excerpt: "Cutting plastic by 80% without cutting corners on protecting your order in transit.",
    category: "Sustainability",
    author: "Daniel Ruiz",
    authorRole: "Operations Lead",
    date: "2026-05-18",
    readMinutes: 5,
    image: "https://picsum.photos/seed/blog-5/1200/600",
    content: [
      "Our old packaging worked fine — it just used a lot more plastic than it needed to. This year we redesigned it from scratch.",
      "The new mailers are made from recycled paper stock with a compostable liner, replacing the plastic poly bags we used previously.",
      "The tradeoff: paper mailers cost slightly more per unit than plastic ones did. We decided that was worth it.",
    ],
  },
  {
    slug: "meet-the-team-behind-the-brand",
    title: "Meet the Team Behind the Brand",
    excerpt: "Five people, one warehouse, and a shared obsession with getting the details right.",
    category: "Company",
    author: "Priya Nair",
    authorRole: "Merchandising Lead",
    date: "2026-04-22",
    readMinutes: 9,
    image: "https://picsum.photos/seed/blog-6/1200/600",
    content: [
      "We're a small team, which means most of us wear several hats. Here's a quick introduction to the people behind the brand.",
      "Maya leads product and sizing — if you've ever emailed us about fit, there's a good chance she saw your message.",
      "Daniel runs operations, from our manufacturing relationships to packaging decisions like the one above.",
      "The rest of the team rotates through support, photography, and everything in between. Small team, a lot of coffee.",
    ],
  },
  {
    slug: "return-policy-explained",
    title: "Our Return Policy, Explained Simply",
    excerpt: "No hidden fine print — here's exactly how returns and exchanges work.",
    category: "Guides",
    author: "Maya Chen",
    authorRole: "Head of Product",
    date: "2026-04-03",
    readMinutes: 3,
    image: "https://picsum.photos/seed/blog-7/1200/600",
    content: [
      "Returns are free within 30 days of delivery, on unworn items with tags attached. That's really it — no restocking fee, no store-credit-only fine print.",
      "To start one, use the return link in your order confirmation email. A prepaid label is generated automatically.",
      "Refunds land back on your original payment method within 5–7 business days of us receiving the item.",
    ],
  },
];

const formatDate = (isoDate) =>
  new Date(isoDate).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

export default function BlogDetailPage() {
  const params = useParams();
  const post = BLOG_POSTS.find((p) => p.slug === params.slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = BLOG_POSTS.filter(
    (p) => p.category === post.category && p.slug !== post.slug
  ).slice(0, 3);

  return (
    <div className="min-h-screen bg-[#F8F7F4] flex flex-col">
      <Header />

      <div className="max-w-3xl mx-auto px-4 py-10 flex-1 w-full">
        <a
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-emerald-600 transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Journal
        </a>

        <span className="inline-block px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium mb-3">
          {post.category}
        </span>

        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 mt-5 text-sm text-slate-500">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            {formatDate(post.date)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            {post.readMinutes} min read
          </span>
          <button className="flex items-center gap-1.5 hover:text-emerald-600 transition ml-auto">
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>

        <div className="rounded-2xl overflow-hidden mt-6 aspect-video bg-slate-100">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Article body */}
        <div className="mt-8 space-y-5">
          {post.content.map((paragraph, idx) => (
            <p key={idx} className="text-slate-700 leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Author card */}
        <div className="mt-10 bg-white border border-slate-200 shadow-sm rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-semibold shrink-0">
            {post.author.split(" ").map((n) => n[0]).join("")}
          </div>
          <div>
            <p className="text-slate-900 font-semibold">{post.author}</p>
            <p className="text-slate-500 text-sm">{post.authorRole}</p>
          </div>
        </div>

        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-14">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              More in {post.category}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedPosts.map((related) => (
                <a
                  key={related.slug}
                  href={`/blog/${related.slug}`}
                  className="group bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden hover:shadow-md transition"
                >
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={related.image}
                      alt={related.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-slate-900 group-hover:text-emerald-600 transition line-clamp-2">
                      {related.title}
                    </h3>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}