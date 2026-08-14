import BlogPost from "@/models/BlogPost";
import BlogCategory from "@/models/BlogCategory";

// Slugify helper
export const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");

// Calculate read time based on word count (avg 200 words per minute)
export const calculateReadTime = (content) => {
  if (!content) return 3;
  const wordCount = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / 200));
};

const INITIAL_BLOG_CATEGORIES = [
  { name: "Guides", description: "Product care, sizing, and style guides" },
  { name: "Sustainability", description: "Eco-friendly practices and ethical sourcing" },
  { name: "Product", description: "New arrivals and product spotlights" },
  { name: "Company", description: "Behind-the-scenes stories and team updates" },
];

const INITIAL_BLOG_POSTS = [
  {
    slug: "how-to-choose-the-right-size",
    title: "How to Choose the Right Size Every Time",
    excerpt: "Our sizing charts explained, plus a few tricks for measuring yourself accurately at home.",
    category: "Guides",
    author: { name: "Maya Chen", role: "Head of Product", avatar: "" },
    publishedAt: new Date("2026-07-12"),
    readTime: 6,
    featured: true,
    status: "published",
    views: 342,
    coverImage: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&q=80",
    tags: ["Sizing", "Fashion", "Guide"],
    content: `
      <p>Getting the right size on the first try saves everyone time — you skip the exchange, and we skip the extra shipping. Here's the short version of how our sizing actually works.</p>
      <p>Every product page includes a size chart specific to that item, not a generic one for the whole site. Fit varies enough between a fitted tee and a relaxed hoodie that a single chart never tells the full story.</p>
      <h3>Pro Tips for Accurate Home Measurement</h3>
      <p>If you're between two sizes, our general rule is: size up for anything you want to layer, size down for anything meant to sit close to the body. When in doubt, check the garment's chest and length measurements against something you already own that fits well.</p>
      <p>For footwear specifically, we recommend measuring your foot in the evening — feet swell slightly over the course of a day, and evening measurements tend to be the most reliable for all-day comfort.</p>
      <p>Still unsure? Reach out before you order — our support team would rather answer a sizing question upfront than process a return afterward.</p>
    `,
  },
  {
    slug: "inside-our-supply-chain",
    title: "Inside Our Supply Chain: Where Everything Comes From",
    excerpt: "A transparent look at the factories and materials behind every product we sell.",
    category: "Sustainability",
    author: { name: "Daniel Ruiz", role: "Operations Lead", avatar: "" },
    publishedAt: new Date("2026-06-28"),
    readTime: 8,
    featured: false,
    status: "published",
    views: 215,
    coverImage: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80",
    tags: ["Supply Chain", "Sustainability", "Ethics"],
    content: `
      <p>We get asked fairly often where our products actually come from, so here's the honest, unglamorous answer.</p>
      <p>We work with a small number of manufacturing partners, most of whom we've worked with for over five years. We visit in person at least once a year — not as a photo opportunity, but to actually walk the floor.</p>
      <h3>Traceable & Responsible Sourcing</h3>
      <p>Materials are sourced with a preference for traceable origins over the cheapest available option. That sometimes means a higher cost, which we try to absorb rather than pass entirely onto you.</p>
      <p>None of this makes us perfect — there's always more to improve. But we'd rather be transparent about where we are today than make promises we can't back up.</p>
    `,
  },
  {
    slug: "new-arrivals-summer-2026",
    title: "What's New This Summer",
    excerpt: "A first look at the pieces we're most excited about this season.",
    category: "Product",
    author: { name: "Priya Nair", role: "Merchandising Lead", avatar: "" },
    publishedAt: new Date("2026-06-15"),
    readTime: 4,
    featured: false,
    status: "published",
    views: 189,
    coverImage: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=80",
    tags: ["Summer", "New Arrivals", "Trends"],
    content: `
      <p>Summer's lineup leans lighter — literally. We've reworked a few core styles in breathable linen blends that hold their shape better than typical summer fabrics.</p>
      <p>A few favorites from the team: the relaxed short-sleeve shirt (finally, one that doesn't wrinkle after twenty minutes), and a lightweight version of last year's popular trail sneaker.</p>
      <p>Everything in this drop is available now, in limited quantities per size — we intentionally keep summer runs smaller.</p>
    `,
  },
  {
    slug: "caring-for-natural-fabrics",
    title: "Caring for Natural Fabrics: A Practical Guide",
    excerpt: "Wool, linen, and cotton all want different things from you. Here's how to keep each looking new.",
    category: "Guides",
    author: { name: "Maya Chen", role: "Head of Product", avatar: "" },
    publishedAt: new Date("2026-05-30"),
    readTime: 7,
    featured: false,
    status: "published",
    views: 412,
    coverImage: "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=800&q=80",
    tags: ["Care", "Cotton", "Linen", "Wool"],
    content: `
      <p>Natural fabrics reward a little extra care, and punish neglect more visibly than synthetics do. Here's the fabric-by-fabric breakdown.</p>
      <ul>
        <li><strong>Wool:</strong> wash cold, on a wool or hand-wash cycle, and always lay flat to dry. Hanging a wet wool sweater will stretch it out permanently.</li>
        <li><strong>Linen:</strong> gets softer with every wash, so don't be precious with it. It wrinkles by nature — that's not a flaw, it's the fabric doing what linen does.</li>
        <li><strong>Cotton:</strong> shrinks most in the first wash, so if a cotton piece fits perfectly out of the box, wash it cold and expect a very slight change after wash one.</li>
      </ul>
    `,
  },
  {
    slug: "our-packaging-overhaul",
    title: "Why We Redesigned Our Packaging",
    excerpt: "Cutting plastic by 80% without cutting corners on protecting your order in transit.",
    category: "Sustainability",
    author: { name: "Daniel Ruiz", role: "Operations Lead", avatar: "" },
    publishedAt: new Date("2026-05-18"),
    readTime: 5,
    featured: false,
    status: "published",
    views: 140,
    coverImage: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&q=80",
    tags: ["Packaging", "Eco", "Recycled"],
    content: `
      <p>Our old packaging worked fine — it just used a lot more plastic than it needed to. This year we redesigned it from scratch.</p>
      <p>The new mailers are made from recycled paper stock with a compostable liner, replacing the plastic poly bags we used previously.</p>
      <p>The tradeoff: paper mailers cost slightly more per unit than plastic ones did. We decided that was worth it.</p>
    `,
  },
  {
    slug: "meet-the-team-behind-the-brand",
    title: "Meet the Team Behind the Brand",
    excerpt: "Five people, one warehouse, and a shared obsession with getting the details right.",
    category: "Company",
    author: { name: "Priya Nair", role: "Merchandising Lead", avatar: "" },
    publishedAt: new Date("2026-04-22"),
    readTime: 9,
    featured: false,
    status: "published",
    views: 298,
    coverImage: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80",
    tags: ["Team", "Culture", "Behind The Scenes"],
    content: `
      <p>We're a small team, which means most of us wear several hats. Here's a quick introduction to the people behind the brand.</p>
      <p>Maya leads product and sizing — if you've ever emailed us about fit, there's a good chance she saw your message.</p>
      <p>Daniel runs operations, from our manufacturing relationships to packaging decisions like the one above.</p>
      <p>The rest of the team rotates through support, photography, and everything in between. Small team, a lot of coffee.</p>
    `,
  },
];

// Seed default categories & posts if DB is empty
export const seedInitialBlogData = async () => {
  const categoryCount = await BlogCategory.countDocuments();
  if (categoryCount === 0) {
    for (const cat of INITIAL_BLOG_CATEGORIES) {
      await BlogCategory.create({ ...cat, slug: slugify(cat.name) });
    }
  }

  const postCount = await BlogPost.countDocuments();
  if (postCount === 0) {
    for (const post of INITIAL_BLOG_POSTS) {
      await BlogPost.create(post);
    }
  }
};

// GET Public Published Blog Posts
export const getPublicBlogPosts = async ({
  page = 1,
  limit = 10,
  category = "All",
  search = "",
  tag = "",
} = {}) => {
  await seedInitialBlogData();

  const query = { status: "published" };

  if (category && category !== "All") {
    query.category = category;
  }

  if (tag) {
    query.tags = tag;
  }

  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), "i");
    query.$or = [
      { title: searchRegex },
      { excerpt: searchRegex },
      { content: searchRegex },
      { tags: searchRegex },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const posts = await BlogPost.find(query)
    .sort({ featured: -1, publishedAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await BlogPost.countDocuments(query);

  return {
    posts,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / Number(limit)) || 1,
  };
};

// GET Single Blog Post by Slug
export const getBlogPostBySlug = async (slug) => {
  await seedInitialBlogData();
  const post = await BlogPost.findOne({ slug, status: "published" });
  if (!post) {
    throw new Error("Blog post not found");
  }

  // Increment view count asynchronously
  post.views = (post.views || 0) + 1;
  await post.save();

  // Find related posts in same category
  const relatedPosts = await BlogPost.find({
    category: post.category,
    slug: { $ne: post.slug },
    status: "published",
  })
    .limit(3)
    .select("title slug excerpt coverImage publishedAt readTime category");

  // Find top popular posts by view count
  const popularPosts = await BlogPost.find({
    slug: { $ne: post.slug },
    status: "published",
  })
    .sort({ views: -1, publishedAt: -1 })
    .limit(4)
    .select("title slug excerpt coverImage publishedAt readTime category views");

  return { post, relatedPosts, popularPosts };
};

// Admin: GET All Posts
export const getAllBlogPostsAdmin = async ({
  page = 1,
  limit = 20,
  status = "all",
  search = "",
  category = "all",
} = {}) => {
  await seedInitialBlogData();

  const query = {};

  if (status && status !== "all") {
    query.status = status;
  }

  if (category && category !== "all") {
    query.category = category;
  }

  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), "i");
    query.$or = [
      { title: searchRegex },
      { excerpt: searchRegex },
      { "author.name": searchRegex },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const posts = await BlogPost.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await BlogPost.countDocuments(query);
  const totalPublished = await BlogPost.countDocuments({ status: "published" });
  const totalDrafts = await BlogPost.countDocuments({ status: "draft" });
  const totalViewsResult = await BlogPost.aggregate([
    { $group: { _id: null, totalViews: { $sum: "$views" } } },
  ]);

  return {
    posts,
    total,
    totalPublished,
    totalDrafts,
    totalViews: totalViewsResult[0]?.totalViews || 0,
    page: Number(page),
    totalPages: Math.ceil(total / Number(limit)) || 1,
  };
};

// Admin: GET Single Post by ID
export const getBlogPostById = async (id) => {
  const post = await BlogPost.findById(id);
  if (!post) {
    throw new Error("Blog post not found");
  }
  return post;
};

// Admin: Create Blog Post
export const createBlogPost = async (data) => {
  if (!data.title || !data.title.trim()) {
    throw new Error("Title is required");
  }
  if (!data.excerpt || !data.excerpt.trim()) {
    throw new Error("Excerpt is required");
  }
  if (!data.content || !data.content.trim()) {
    throw new Error("Content is required");
  }

  const slug = data.slug ? slugify(data.slug) : slugify(data.title);
  const existing = await BlogPost.findOne({ slug });
  if (existing) {
    throw new Error("A blog post with this slug already exists");
  }

  const readTime = data.readTime || calculateReadTime(data.content);

  const post = await BlogPost.create({
    ...data,
    slug,
    readTime,
    tags: Array.isArray(data.tags)
      ? data.tags
      : (data.tags || "").split(",").map((t) => t.trim()).filter(Boolean),
  });

  return post;
};

// Admin: Update Blog Post
export const updateBlogPost = async (id, data) => {
  const post = await BlogPost.findById(id);
  if (!post) {
    throw new Error("Blog post not found");
  }

  if (data.title) post.title = data.title.trim();

  if (data.slug && data.slug !== post.slug) {
    const newSlug = slugify(data.slug);
    const existing = await BlogPost.findOne({ slug: newSlug, _id: { $ne: id } });
    if (existing) {
      throw new Error("A blog post with this slug already exists");
    }
    post.slug = newSlug;
  }

  if (data.excerpt !== undefined) post.excerpt = data.excerpt;
  if (data.content !== undefined) {
    post.content = data.content;
    post.readTime = data.readTime || calculateReadTime(data.content);
  }
  if (data.coverImage !== undefined) post.coverImage = data.coverImage;
  if (data.category !== undefined) post.category = data.category;
  if (data.tags !== undefined) {
    post.tags = Array.isArray(data.tags)
      ? data.tags
      : (data.tags || "").split(",").map((t) => t.trim()).filter(Boolean);
  }
  if (data.author !== undefined) post.author = { ...post.author, ...data.author };
  if (data.status !== undefined) post.status = data.status;
  if (data.featured !== undefined) post.featured = data.featured;
  if (data.seoTitle !== undefined) post.seoTitle = data.seoTitle;
  if (data.seoDescription !== undefined) post.seoDescription = data.seoDescription;

  await post.save();
  return post;
};

// Admin: Delete Blog Post
export const deleteBlogPost = async (id) => {
  const post = await BlogPost.findByIdAndDelete(id);
  if (!post) {
    throw new Error("Blog post not found");
  }
  return post;
};
