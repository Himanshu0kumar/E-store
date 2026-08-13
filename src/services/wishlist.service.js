import mongoose from "mongoose";
import Wishlist from "@/models/Wishlist";
import Product from "@/models/Product";

// Get Wishlist
export const getWishlist = async (userId) => {
  try {
    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      wishlist = await Wishlist.create({ userId });
    } else {
      let modified = false;
      wishlist.items.forEach((item) => {
        if (!item._id) {
          item._id = new mongoose.Types.ObjectId();
          modified = true;
        }
      });
      if (modified) {
        await wishlist.save();
      }
    }

    return await Wishlist.findOne({ userId }).populate("items.productId");
  } catch (error) {
    throw new Error(error.message);
  }
};

// Add to Wishlist
export const addToWishlist = async (userId, productId, priority = "medium") => {
  try {
    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error("Product not found");
    }

    // Get or create wishlist
    let wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      wishlist = await Wishlist.create({ userId });
    }

    // Check if product already in wishlist
    const existingItem = wishlist.items.find(
      (item) => item.productId.toString() === productId
    );

    if (existingItem) {
      throw new Error("Product already in wishlist");
    }

    // Add to wishlist
    wishlist.items.push({
      _id: new mongoose.Types.ObjectId(),
      productId,
      priority,
    });

    await wishlist.save();
    return await Wishlist.findOne({ userId }).populate("items.productId");
  } catch (error) {
    throw new Error(error.message);
  }
};

// Remove from Wishlist
export const removeFromWishlist = async (userId, itemId) => {
  try {
    const wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      throw new Error("Wishlist not found");
    }

    let item = wishlist.items.id(itemId);
    if (!item) {
      item = wishlist.items.find(
        (i) =>
          i._id?.toString() === itemId ||
          i.productId?.toString() === itemId ||
          i.productId?._id?.toString() === itemId
      );
    }
    if (!item) {
      throw new Error("Item not found in wishlist");
    }

    wishlist.items.pull(item._id || item);
    await wishlist.save();

    return await Wishlist.findOne({ userId }).populate("items.productId");
  } catch (error) {
    throw new Error(error.message);
  }
};

// Check if Product in Wishlist
export const isProductInWishlist = async (userId, productId) => {
  try {
    const wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      return false;
    }

    return wishlist.items.some(
      (item) => item.productId.toString() === productId
    );
  } catch (error) {
    throw new Error(error.message);
  }
};

// Update Wishlist Item Priority
export const updateWishlistItemPriority = async (userId, itemId, priority) => {
  try {
    const wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      throw new Error("Wishlist not found");
    }

    const item = wishlist.items.id(itemId);
    if (!item) {
      throw new Error("Item not found in wishlist");
    }

    item.priority = priority;
    await wishlist.save();

    return await Wishlist.findOne({ userId }).populate("items.productId");
  } catch (error) {
    throw new Error(error.message);
  }
};

// Add Note to Wishlist Item
export const addNoteToWishlistItem = async (userId, itemId, note) => {
  try {
    const wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      throw new Error("Wishlist not found");
    }

    const item = wishlist.items.id(itemId);
    if (!item) {
      throw new Error("Item not found in wishlist");
    }

    item.note = note;
    await wishlist.save();

    return await Wishlist.findOne({ userId }).populate("items.productId");
  } catch (error) {
    throw new Error(error.message);
  }
};

// Clear Wishlist
export const clearWishlist = async (userId) => {
  try {
    const wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      throw new Error("Wishlist not found");
    }

    wishlist.items = [];
    await wishlist.save();

    return wishlist;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Move Wishlist Item to Cart (returns both wishlist and cart)
export const moveToCart = async (userId, productId, quantity = 1) => {
  try {
    // Remove from wishlist
    const wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      throw new Error("Wishlist not found");
    }

    const itemToMove = wishlist.items.find(
      (item) => item.productId.toString() === productId
    );
    if (!itemToMove) {
      throw new Error("Item not found in wishlist");
    }

    itemToMove.deleteOne();
    await wishlist.save();

    // Add to cart (using cart service)
    const { addToCart } = require("./cart.service");
    const cart = await addToCart(userId, productId, quantity);

    return {
      wishlist: await Wishlist.findOne({ userId }).populate("items.productId"),
      cart,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get Wishlist Summary
export const getWishlistSummary = async (userId) => {
  try {
    const wishlist = await Wishlist.findOne({ userId }).populate("items.productId");
    if (!wishlist) {
      throw new Error("Wishlist not found");
    }

    // Calculate total value
    const totalValue = wishlist.items.reduce((sum, item) => {
      return sum + (item.productId?.regularPrice || 0);
    }, 0);

    return {
      totalItems: wishlist.items.length,
      totalValue,
      items: wishlist.items,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};