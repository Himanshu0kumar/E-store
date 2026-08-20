import mongoose from "mongoose";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Cart from "@/models/Cart";
import User from "@/models/User";

/**
 * Generate a unique readable Flipkart-style order number.
 * e.g., OD389201948291
 */
function generateOrderNumber() {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `OD${timestamp}${random}`;
}

/**
 * Create a new Order from checkout
 */
export async function createOrder({
  userId,
  items,
  shippingAddress,
  billingAddress,
  paymentInfo = {},
  pricing,
  contact = {},
}) {
  try {
    if (!userId) throw new Error("User ID is required");
    if (!items || !items.length) throw new Error("No items provided for order");
    if (!shippingAddress) throw new Error("Shipping address is required");

    // Fetch user details
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    // Validate and prepare items snapshot with live product check
    const orderItems = [];
    let calculatedSubtotal = 0;

    for (const item of items) {
      const prodId = item.productId?._id || item.productId;
      const product = await Product.findById(prodId);

      if (!product) {
        throw new Error(`Product "${item.name || prodId}" no longer exists`);
      }

      if (product.quantity < item.quantity) {
        throw new Error(
          `Insufficient stock for "${product.name}". Available: ${product.quantity}`
        );
      }

      const itemPrice = item.price ?? product.salePrice ?? product.regularPrice;
      calculatedSubtotal += itemPrice * item.quantity;

      const itemImage =
        item.image ||
        (Array.isArray(product.images) && product.images.length > 0
          ? product.images[0]
          : "");

      orderItems.push({
        productId: product._id,
        name: product.name,
        image: itemImage,
        price: itemPrice,
        regularPrice: product.regularPrice,
        quantity: item.quantity,
        selectedColor: item.selectedColor || "",
        selectedSize: item.selectedSize || "",
        sku: product.productSKU || "",
      });
    }

    const subtotal = pricing?.subtotal ?? calculatedSubtotal;
    const discount = pricing?.discount ?? 0;
    const couponCode = pricing?.couponCode ?? null;
    const shippingFee = pricing?.shippingFee ?? (subtotal >= 100 ? 0 : 6.99);
    const tax = pricing?.tax ?? subtotal * 0.08;
    const totalAmount =
      pricing?.totalAmount ?? subtotal - discount + shippingFee + tax;

    const orderNumber = generateOrderNumber();

    // Default tracking event for newly placed order
    const initialTrackingEvent = {
      status: "placed",
      title: "Order Placed",
      description: "Your order has been placed and is waiting for confirmation.",
      location: `${shippingAddress.city || ""}, ${shippingAddress.state || ""}`.trim() || "Warehouse",
      timestamp: new Date(),
    };

    // Estimated delivery: 4 to 6 days from now
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

    const isCod = paymentInfo.method === "cod";

    const newOrder = await Order.create({
      orderNumber,
      user: userId,
      customer: {
        name: user.name || shippingAddress.fullName || "Customer",
        email: user.email || contact.email,
        phone: user.phone || contact.phone || shippingAddress.phone || "",
      },
      items: orderItems,
      shippingAddress: {
        fullName: shippingAddress.fullName || user.name,
        phone: contact.phone || shippingAddress.phone || user.phone || "",
        email: contact.email || user.email,
        street: shippingAddress.street,
        city: shippingAddress.city,
        state: shippingAddress.state,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country || "United States",
        type: shippingAddress.type || "home",
      },
      billingAddress: billingAddress || shippingAddress,
      paymentInfo: {
        method: paymentInfo.method || "card",
        status: isCod ? "pending" : paymentInfo.status || "paid",
        transactionId:
          paymentInfo.transactionId ||
          (!isCod ? `TXN_${Date.now()}_${Math.floor(100 + Math.random() * 900)}` : ""),
        cardLast4: paymentInfo.cardLast4 || (paymentInfo.method === "card" ? "4242" : ""),
        paidAt: isCod ? null : new Date(),
      },
      pricing: {
        subtotal,
        discount,
        couponCode,
        shippingFee,
        tax,
        totalAmount,
      },
      orderStatus: "placed",
      trackingEvents: [initialTrackingEvent],
      courierInfo: {
        partner: "Ekart Logistics",
        trackingNumber: `EKP${Math.floor(100000000 + Math.random() * 900000000)}`,
        estimatedDelivery,
      },
    });

    // 1. Decrement product stock quantities
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { quantity: -item.quantity },
      });
    }

    // 2. Increment user totalOrders and totalSpent
    await User.findByIdAndUpdate(userId, {
      $inc: {
        totalOrders: 1,
        totalSpent: Math.round(totalAmount),
        loyaltyPoints: Math.round(totalAmount / 10),
      },
    });

    // 3. Clear user's active Cart
    await Cart.findOneAndUpdate(
      { userId },
      { $set: { items: [], couponCode: null, discount: 0, subtotal: 0, total: 0 } }
    );

    return newOrder;
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Get orders for a specific User with filters & pagination
 */
export async function getUserOrders(userId, { status, search, page = 1, limit = 10 } = {}) {
  try {
    const filter = { user: userId };

    if (status && status !== "all") {
      if (status === "active") {
        filter.orderStatus = { $in: ["placed", "confirmed", "processing", "shipped", "out_for_delivery"] };
      } else {
        filter.orderStatus = status;
      }
    }

    if (search && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { orderNumber: { $regex: q, $options: "i" } },
        { "items.name": { $regex: q, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate("items.productId", "name images category regularPrice salePrice"),
      Order.countDocuments(filter),
    ]);

    return {
      orders,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Get a single order by ID or orderNumber
 */
export async function getOrderById(orderId, userId = null, isAdmin = false) {
  try {
    let query = {};
    if (mongoose.Types.ObjectId.isValid(orderId)) {
      query._id = orderId;
    } else {
      query.orderNumber = orderId;
    }

    const order = await Order.findOne(query)
      .populate(
        "items.productId",
        "name images category brand regularPrice salePrice productSKU"
      )
      .populate("user", "name email phone avatar");

    if (!order) {
      throw new Error("Order not found");
    }

    // Security check: non-admins can only see their own orders
    if (!isAdmin && userId && order.user.toString() !== userId.toString()) {
      throw new Error("Unauthorized to access this order");
    }

    return order;
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Get all orders for Admin with comprehensive filters & pagination
 */
export async function getAllOrders({
  status,
  paymentStatus,
  search,
  page = 1,
  limit = 10,
  sort = "newest",
} = {}) {
  try {
    const filter = {};

    if (status && status !== "all") {
      if (status === "pending") {
        filter.orderStatus = { $in: ["placed", "processing", "confirmed"] };
      } else if (status === "completed") {
        filter.orderStatus = "delivered";
      } else {
        filter.orderStatus = status;
      }
    }

    if (paymentStatus && paymentStatus !== "all") {
      filter["paymentInfo.status"] = paymentStatus;
    }

    if (search && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { orderNumber: { $regex: q, $options: "i" } },
        { "customer.name": { $regex: q, $options: "i" } },
        { "customer.email": { $regex: q, $options: "i" } },
        { "customer.phone": { $regex: q, $options: "i" } },
        { "items.name": { $regex: q, $options: "i" } },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === "oldest") sortOption = { createdAt: 1 };
    if (sort === "highest") sortOption = { "pricing.totalAmount": -1 };
    if (sort === "lowest") sortOption = { "pricing.totalAmount": 1 };

    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(Number(limit))
        .populate("user", "name email avatar"),
      Order.countDocuments(filter),
    ]);

    return {
      orders,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    };
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Update order status (Admin function)
 */
export async function updateOrderStatus(orderId, {
  status,
  courierInfo,
  location = "",
  description = "",
  paymentStatus,
  notes,
}) {
  try {
    const order = await Order.findById(orderId);
    if (!order) throw new Error("Order not found");

    const previousStatus = order.orderStatus;

    if (status && status !== previousStatus) {
      order.orderStatus = status;

      // Status-specific title mapping
      const statusTitleMap = {
        placed: "Order Placed",
        confirmed: "Order Confirmed",
        processing: "Order Processing & Packed",
        shipped: "Shipped & In Transit",
        out_for_delivery: "Out for Delivery",
        delivered: "Delivered Successfully",
        cancelled: "Order Cancelled",
        returned: "Order Returned",
      };

      const defaultDescMap = {
        confirmed: "Seller has confirmed your order.",
        processing: "Item has been packed and is ready to be dispatched.",
        shipped: `Package handed over to ${courierInfo?.partner || order.courierInfo?.partner || "courier"}.`,
        out_for_delivery: "Courier executive is out for delivery in your area.",
        delivered: "Package has been handed over to customer.",
        cancelled: "Order has been cancelled.",
        returned: "Return request has been processed.",
      };

      order.trackingEvents.push({
        status,
        title: statusTitleMap[status] || `Status updated to ${status}`,
        description: description || defaultDescMap[status] || "",
        location: location || order.shippingAddress?.city || "Central Hub",
        timestamp: new Date(),
      });

      if (status === "delivered") {
        order.deliveredAt = new Date();
        if (order.paymentInfo.method === "cod") {
          order.paymentInfo.status = "paid";
          order.paymentInfo.paidAt = new Date();
        }
      }
    }

    if (courierInfo) {
      order.courierInfo = {
        ...order.courierInfo,
        ...courierInfo,
      };
    }

    if (paymentStatus) {
      order.paymentInfo.status = paymentStatus;
      if (paymentStatus === "paid" && !order.paymentInfo.paidAt) {
        order.paymentInfo.paidAt = new Date();
      }
    }

    if (notes !== undefined) {
      order.notes = notes;
    }

    await order.save();
    return order;
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Cancel an order (User or Admin)
 */
export async function cancelOrder(orderId, userId, { reason = "Customer request", cancelledBy = "user" } = {}) {
  try {
    const order = await Order.findById(orderId);
    if (!order) throw new Error("Order not found");

    if (cancelledBy === "user" && userId && order.user.toString() !== userId.toString()) {
      throw new Error("Unauthorized to cancel this order");
    }

    if (["delivered", "cancelled", "returned"].includes(order.orderStatus)) {
      throw new Error(`Cannot cancel an order that is already ${order.orderStatus}`);
    }

    // If shipped, only admin can cancel
    if (["shipped", "out_for_delivery"].includes(order.orderStatus) && cancelledBy === "user") {
      throw new Error("Order has already been dispatched. Please contact customer support to request cancellation.");
    }

    order.orderStatus = "cancelled";
    order.cancellation = {
      reason,
      cancelledBy,
      cancelledAt: new Date(),
    };

    order.trackingEvents.push({
      status: "cancelled",
      title: "Order Cancelled",
      description: `Cancelled by ${cancelledBy}: ${reason}`,
      location: order.shippingAddress?.city || "Warehouse",
      timestamp: new Date(),
    });

    if (order.paymentInfo.status === "paid") {
      order.paymentInfo.status = "refunded";
    }

    await order.save();

    // Restock product inventory
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { quantity: item.quantity },
      });
    }

    return order;
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Get order statistics & KPIs for Admin Dashboard
 */
export async function getOrderStats() {
  try {
    const [
      totalOrders,
      placedOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      revenueResult,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ orderStatus: { $in: ["placed", "confirmed"] } }),
      Order.countDocuments({ orderStatus: "processing" }),
      Order.countDocuments({ orderStatus: { $in: ["shipped", "out_for_delivery"] } }),
      Order.countDocuments({ orderStatus: "delivered" }),
      Order.countDocuments({ orderStatus: "cancelled" }),
      Order.aggregate([
        { $match: { orderStatus: { $ne: "cancelled" } } },
        { $group: { _id: null, totalRevenue: { $sum: "$pricing.totalAmount" } } },
      ]),
    ]);

    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    return {
      totalOrders,
      pendingOrders: placedOrders + processingOrders,
      inTransitOrders: shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue,
    };
  } catch (error) {
    throw new Error(error.message);
  }
}
