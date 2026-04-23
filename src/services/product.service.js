import Product from "@/models/Product";

// Create Product
export const createProduct = async (data) => {
  return await Product.create(data);
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
  return await Product.findByIdAndUpdate(id, data, { new: true });
};

// Delete Product
export const deleteProduct = async (id) => {
  return await Product.findByIdAndDelete(id);
};