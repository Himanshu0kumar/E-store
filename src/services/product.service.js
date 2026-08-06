import Product from "@/models/Product";

// Works out the price range to store alongside the product, so
// listing pages can show "From $X" (or a range) without walking
// every variant on every read.
const computePriceRange = (data) => {
  if (data.hasVariants && Array.isArray(data.variants) && data.variants.length > 0) {
    const prices = data.variants.map((v) => Number(v.salePrice ?? v.price) || 0);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }

  const effectivePrice = data.salePrice ?? data.regularPrice;
  return { min: effectivePrice, max: effectivePrice };
};

// A variant-enabled product needs at least one attribute and at
// least one variant row — "hasVariants: true" with nothing behind
// it is a contradiction the UI shouldn't be able to produce, but
// the API shouldn't trust the client not to send it anyway.
const validateVariants = (data) => {
  if (!data.hasVariants) return;

  if (!Array.isArray(data.attributes) || data.attributes.length === 0) {
    throw new Error("At least one attribute is required when hasVariants is true");
  }

  if (!Array.isArray(data.variants) || data.variants.length === 0) {
    throw new Error("At least one variant is required when hasVariants is true");
  }

  data.variants.forEach((variant, index) => {
    if (variant.price === undefined || variant.price === null || variant.price === "") {
      throw new Error(`Variant ${index + 1} is missing a price`);
    }
  });
};

// Create Product
export const createProduct = async (data) => {
  validateVariants(data);
  const priceRange = computePriceRange(data);
  return await Product.create({ ...data, priceRange });
};

// Get All Products
export const getAllProducts = async () => {
  return await Product.find().sort({ createdAt: -1 });
};

// Get Single Product
export const getProductById = async (id) => {
  return await Product.findById(id);
};

// Update Product
export const updateProduct = async (id, data) => {
  validateVariants(data);
  const priceRange = computePriceRange(data);
  return await Product.findByIdAndUpdate(
    id,
    { ...data, priceRange },
    { new: true }
  );
};

// Delete Product
export const deleteProduct = async (id) => {
  return await Product.findByIdAndDelete(id);
};