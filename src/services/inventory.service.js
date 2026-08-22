import mongoose from "mongoose";
import Product from "@/models/Product";
import InventoryLog from "@/models/InventoryLog";

/**
 * Get comprehensive inventory overview, stats, and filtered product inventory
 */
export async function getInventoryOverview({
  search = "",
  stockStatus = "all",
  category = "all",
  page = 1,
  limit = 10,
  sort = "stock_asc",
} = {}) {
  try {
    // 1. Calculate overall inventory stats across entire catalog
    const allProducts = await Product.find({}).lean();

    let totalUnitsInStock = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let inStockCount = 0;
    let totalValuation = 0;

    allProducts.forEach((p) => {
      const qty = Number(p.quantity) || 0;
      const threshold = Number(p.lowStockThreshold) || 5;
      const price = Number(p.salePrice) > 0 ? Number(p.salePrice) : Number(p.regularPrice) || 0;

      totalUnitsInStock += qty;
      totalValuation += qty * price;

      if (qty === 0) {
        outOfStockCount++;
      } else if (qty <= threshold) {
        lowStockCount++;
      } else {
        inStockCount++;
      }
    });

    const stats = {
      totalProducts: allProducts.length,
      totalUnitsInStock,
      inStockCount,
      lowStockCount,
      outOfStockCount,
      totalValuation: Math.round(totalValuation * 100) / 100,
    };

    // 2. Build filtered list of products
    const filter = {};

    if (category && category !== "all") {
      filter.category = { $regex: new RegExp(`^${category}$`, "i") };
    }

    if (search && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { productSKU: { $regex: q, $options: "i" } },
        { productCode: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } },
        { brand: { $regex: q, $options: "i" } },
      ];
    }

    // Status filter
    if (stockStatus === "out_of_stock") {
      filter.quantity = 0;
    } else if (stockStatus === "in_stock") {
      // In stock and greater than threshold
      filter.$expr = {
        $gt: ["$quantity", { $ifNull: ["$lowStockThreshold", 5] }],
      };
    } else if (stockStatus === "low_stock") {
      // Greater than 0 and less than or equal to threshold
      filter.$expr = {
        $and: [
          { $gt: ["$quantity", 0] },
          { $lte: ["$quantity", { $ifNull: ["$lowStockThreshold", 5] }] },
        ],
      };
    }

    // Sort setup
    let sortOption = { quantity: 1 };
    if (sort === "stock_desc") sortOption = { quantity: -1 };
    if (sort === "name_asc") sortOption = { name: 1 };
    if (sort === "name_desc") sortOption = { name: -1 };
    if (sort === "newest") sortOption = { createdAt: -1 };
    if (sort === "price_desc") sortOption = { regularPrice: -1 };
    if (sort === "price_asc") sortOption = { regularPrice: 1 };

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));
    const skip = (pageNum - 1) * limitNum;

    const [products, totalCount] = await Promise.all([
      Product.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(filter),
    ]);

    // Enhance each product with status flag and valuation
    const enrichedProducts = products.map((p) => {
      const qty = Number(p.quantity) || 0;
      const threshold = Number(p.lowStockThreshold) || 5;
      const price = Number(p.salePrice) > 0 ? Number(p.salePrice) : Number(p.regularPrice) || 0;

      let status = "in_stock";
      if (qty === 0) status = "out_of_stock";
      else if (qty <= threshold) status = "low_stock";

      return {
        ...p,
        stockStatus: status,
        effectivePrice: price,
        valuation: Math.round(qty * price * 100) / 100,
      };
    });

    return {
      stats,
      products: enrichedProducts,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum),
      },
    };
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Update stock for a single product with audit log
 */
export async function updateProductStock({
  productId,
  quantity,
  adjustBy,
  lowStockThreshold,
  reason = "Manual stock update",
  performedBy = "Admin",
}) {
  try {
    const product = await Product.findById(productId);
    if (!product) throw new Error("Product not found");

    const previousStock = Number(product.quantity) || 0;
    let newStock = previousStock;

    if (adjustBy !== undefined && adjustBy !== null) {
      newStock = Math.max(0, previousStock + Number(adjustBy));
    } else if (quantity !== undefined && quantity !== null) {
      newStock = Math.max(0, Number(quantity));
    }

    const quantityChange = newStock - previousStock;

    // Update threshold if provided
    if (lowStockThreshold !== undefined && lowStockThreshold !== null) {
      product.lowStockThreshold = Math.max(0, Number(lowStockThreshold));
    }

    product.quantity = newStock;
    await product.save();

    // Create audit log if quantity changed
    if (quantityChange !== 0) {
      await InventoryLog.create({
        product: product._id,
        productName: product.name,
        productSKU: product.productSKU || "",
        changeType: quantityChange > 0 ? "restock" : "manual_adjustment",
        quantityChange,
        previousStock,
        newStock,
        reason: reason || "Manual adjustment from Inventory Hub",
        performedBy: performedBy || "Admin",
      });
    }

    return product;
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Bulk restock multiple products at once
 */
export async function bulkRestockProducts({
  items = [],
  reason = "Bulk restock",
  performedBy = "Admin",
}) {
  try {
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error("No items provided for bulk restock");
    }

    const results = [];

    for (const item of items) {
      const { productId, addQuantity } = item;
      const addQty = Number(addQuantity);

      if (!productId || isNaN(addQty) || addQty <= 0) continue;

      const product = await Product.findById(productId);
      if (!product) continue;

      const previousStock = Number(product.quantity) || 0;
      const newStock = previousStock + addQty;

      product.quantity = newStock;
      await product.save();

      await InventoryLog.create({
        product: product._id,
        productName: product.name,
        productSKU: product.productSKU || "",
        changeType: "restock",
        quantityChange: addQty,
        previousStock,
        newStock,
        reason: reason || "Bulk Restock Batch",
        performedBy: performedBy || "Admin",
      });

      results.push({
        productId: product._id,
        name: product.name,
        previousStock,
        newStock,
      });
    }

    return results;
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Get inventory audit logs
 */
export async function getInventoryLogs({
  productId,
  changeType,
  page = 1,
  limit = 20,
} = {}) {
  try {
    const filter = {};

    if (productId) {
      filter.product = productId;
    }

    if (changeType && changeType !== "all") {
      filter.changeType = changeType;
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      InventoryLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate("product", "name images category price regularPrice salePrice")
        .populate("referenceOrder", "orderNumber")
        .lean(),
      InventoryLog.countDocuments(filter),
    ]);

    return {
      logs,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    };
  } catch (error) {
    throw new Error(error.message);
  }
}
