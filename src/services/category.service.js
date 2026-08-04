import Category from "@/models/Category";

// Get all categories, sorted alphabetically
export const getCategories = async () => {
  return await Category.find().sort({ name: 1 });
};

// Create a new top-level category
export const createCategory = async (name) => {
  if (!name || !name.trim()) {
    throw new Error("Category name is required");
  }

  const existing = await Category.findOne({ name: name.trim() });
  if (existing) {
    throw new Error("A category with this name already exists");
  }

  return await Category.create({ name: name.trim(), subcategories: [] });
};

// Rename a category
export const updateCategory = async (categoryId, name) => {
  if (!name || !name.trim()) {
    throw new Error("Category name is required");
  }

  const category = await Category.findById(categoryId);
  if (!category) {
    throw new Error("Category not found");
  }

  category.name = name.trim();
  await category.save();
  return category;
};

// Delete a category (and, implicitly, all its subcategories)
export const deleteCategory = async (categoryId) => {
  const category = await Category.findByIdAndDelete(categoryId);
  if (!category) {
    throw new Error("Category not found");
  }
  return category;
};

// Add a subcategory under a given category
export const addSubcategory = async (categoryId, name) => {
  if (!name || !name.trim()) {
    throw new Error("Subcategory name is required");
  }

  const category = await Category.findById(categoryId);
  if (!category) {
    throw new Error("Category not found");
  }

  const duplicate = category.subcategories.some(
    (sub) => sub.name.toLowerCase() === name.trim().toLowerCase()
  );
  if (duplicate) {
    throw new Error("A subcategory with this name already exists");
  }

  category.subcategories.push({ name: name.trim() });
  await category.save();
  return category;
};

// Rename a subcategory
export const updateSubcategory = async (categoryId, subcategoryId, name) => {
  if (!name || !name.trim()) {
    throw new Error("Subcategory name is required");
  }

  const category = await Category.findById(categoryId);
  if (!category) {
    throw new Error("Category not found");
  }

  const subcategory = category.subcategories.id(subcategoryId);
  if (!subcategory) {
    throw new Error("Subcategory not found");
  }

  subcategory.name = name.trim();
  await category.save();
  return category;
};

// Delete a subcategory
export const deleteSubcategory = async (categoryId, subcategoryId) => {
  const category = await Category.findById(categoryId);
  if (!category) {
    throw new Error("Category not found");
  }

  const subcategory = category.subcategories.id(subcategoryId);
  if (!subcategory) {
    throw new Error("Subcategory not found");
  }

  subcategory.deleteOne();
  await category.save();
  return category;
};