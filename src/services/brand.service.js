import Brand from "@/models/Brand";

// Get all brands, sorted alphabetically
export const getBrands = async () => {
  return await Brand.find().sort({ name: 1 });
};

// Create a new brand
export const createBrand = async (name) => {
  if (!name || !name.trim()) {
    throw new Error("Brand name is required");
  }

  const existing = await Brand.findOne({ name: name.trim() });
  if (existing) {
    throw new Error("A brand with this name already exists");
  }

  return await Brand.create({ name: name.trim() });
};

// Rename a brand
export const updateBrand = async (brandId, name) => {
  if (!name || !name.trim()) {
    throw new Error("Brand name is required");
  }

  const brand = await Brand.findById(brandId);
  if (!brand) {
    throw new Error("Brand not found");
  }

  brand.name = name.trim();
  await brand.save();
  return brand;
};

// Delete a brand
export const deleteBrand = async (brandId) => {
  const brand = await Brand.findByIdAndDelete(brandId);
  if (!brand) {
    throw new Error("Brand not found");
  }
  return brand;
};