import mongoose from "mongoose";
import Cart from "@/models/Cart";
import Product from "@/models/Product";

// Get Cart
export const getCart = async (userId) => {
  try {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = await Cart.create({ userId });
    } else {
      let modified = false;
      cart.items.forEach((item) => {
        if (!item._id) {
          item._id = new mongoose.Types.ObjectId();
          modified = true;
        }
      });
      if (modified) {
        await cart.save();
      }
    }

    return await Cart.findOne({ userId }).populate("items.productId");
  } catch (error) {
    throw new Error(error.message);
  }
};

// Add to Cart
export const addToCart = async (userId, productId, quantity = 1, selectedColor, selectedSize) => {
  try {
    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error("Product not found");
    }

    // Validate quantity
    if (quantity < 1) {
      throw new Error("Quantity must be at least 1");
    }

    if (quantity > product.quantity) {
      throw new Error("Requested quantity exceeds available stock");
    }

    // Get or create cart
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = await Cart.create({ userId });
    }

    // Check if item already exists in cart
    const existingItem = cart.items.find(
      (item) =>
        item.productId.toString() === productId &&
        item.selectedColor === selectedColor &&
        item.selectedSize === selectedSize
    );

    if (existingItem) {
      // Update quantity
      existingItem.quantity += quantity;
      if (existingItem.quantity > product.quantity) {
        throw new Error("Requested quantity exceeds available stock");
      }
    } else {
      // Add new item
      cart.items.push({
        _id: new mongoose.Types.ObjectId(),
        productId,
        quantity,
        price: product.salePrice || product.regularPrice,
        selectedColor,
        selectedSize,
      });
    }

    await cart.save();
    const populated = await Cart.findOne({ userId }).populate("items.productId");
    return { cart: populated, alreadyExists: Boolean(existingItem) };
  } catch (error) {
    throw new Error(error.message);
  }
};

// Update Cart Item Quantity
export const updateCartItemQuantity = async (userId, itemId, quantity) => {
  try {
    if (quantity < 1) {
      throw new Error("Quantity must be at least 1");
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      throw new Error("Cart not found");
    }

    let item = cart.items.id(itemId);
    if (!item) {
      item = cart.items.find(
        (i) =>
          i._id?.toString() === itemId ||
          i.productId?.toString() === itemId ||
          i.productId?._id?.toString() === itemId
      );
    }
    if (!item) {
      throw new Error("Item not found in cart");
    }

    // Validate stock
    const product = await Product.findById(item.productId);
    if (product && quantity > product.quantity) {
      throw new Error("Requested quantity exceeds available stock");
    }

    item.quantity = quantity;
    await cart.save();

    return await Cart.findOne({ userId }).populate("items.productId");
  } catch (error) {
    throw new Error(error.message);
  }
};

// Remove from Cart
export const removeFromCart = async (userId, itemId) => {
  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      throw new Error("Cart not found");
    }

    let item = cart.items.id(itemId);
    if (!item) {
      item = cart.items.find(
        (i) =>
          i._id?.toString() === itemId ||
          i.productId?.toString() === itemId ||
          i.productId?._id?.toString() === itemId
      );
    }
    if (!item) {
      throw new Error("Item not found in cart");
    }

    cart.items.pull(item._id || item);
    await cart.save();

    return await Cart.findOne({ userId }).populate("items.productId");
  } catch (error) {
    throw new Error(error.message);
  }
};

// Clear Cart
export const clearCart = async (userId) => {
  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      throw new Error("Cart not found");
    }

    cart.items = [];
    cart.subtotal = 0;
    cart.tax = 0;
    cart.total = 0;
    cart.discount = 0;
    cart.couponCode = null;

    await cart.save();
    return cart;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Apply Coupon
export const applyCoupon = async (userId, couponCode, discount) => {
  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      throw new Error("Cart not found");
    }

    cart.couponCode = couponCode;
    cart.discount = discount;

    await cart.save();
    return cart;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Update Shipping
export const updateShipping = async (userId, shippingCost) => {
  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      throw new Error("Cart not found");
    }

    cart.shipping = shippingCost;
    await cart.save();

    return cart;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Convert Cart to Order (status change)
export const convertCartToOrder = async (userId) => {
  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      throw new Error("Cart not found");
    }

    if (cart.items.length === 0) {
      throw new Error("Cart is empty");
    }

    cart.status = "converted";
    await cart.save();

    // Create new active cart for user
    const newCart = await Cart.create({ userId });

    return newCart;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get Cart Summary
export const getCartSummary = async (userId) => {
  try {
    const cart = await Cart.findOne({ userId }).populate("items.productId");
    if (!cart) {
      throw new Error("Cart not found");
    }

    return {
      itemCount: cart.items.length,
      subtotal: cart.subtotal,
      tax: cart.tax,
      shipping: cart.shipping,
      discount: cart.discount,
      total: cart.total,
      couponCode: cart.couponCode,
      items: cart.items,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};