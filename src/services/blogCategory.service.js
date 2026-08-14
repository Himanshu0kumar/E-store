import BlogCategory from "@/models/BlogCategory";

// Slugify helper
const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");

export const getBlogCategories = async () => {
  return await BlogCategory.find().sort({ name: 1 });
};

export const createBlogCategory = async (data) => {
  const name = typeof data === "string" ? data : data.name;
  if (!name || !name.trim()) {
    throw new Error("Category name is required");
  }

  const slug = data.slug || slugify(name);
  const existing = await BlogCategory.findOne({
    $or: [{ name: name.trim() }, { slug }],
  });

  if (existing) {
    throw new Error("A blog category with this name or slug already exists");
  }

  return await BlogCategory.create({
    name: name.trim(),
    slug,
    description: data.description || "",
  });
};

export const updateBlogCategory = async (id, data) => {
  const category = await BlogCategory.findById(id);
  if (!category) {
    throw new Error("Blog category not found");
  }

  if (data.name) {
    category.name = data.name.trim();
    category.slug = data.slug || slugify(data.name);
  }

  if (data.description !== undefined) {
    category.description = data.description;
  }

  await category.save();
  return category;
};

export const deleteBlogCategory = async (id) => {
  const category = await BlogCategory.findByIdAndDelete(id);
  if (!category) {
    throw new Error("Blog category not found");
  }
  return category;
};
