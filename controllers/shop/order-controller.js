const Order = require("../../models/Order");
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");

const createOrder = async (req, res) => {
  try {
    const {
      userId,
      cartItems,
      addressInfo,
      paymentMethod,
      totalAmount,
      orderDate,
      cartId,
      quantity
    } = req.body;
   
    if (paymentMethod !== "COD") {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method. Only 'COD' is supported."
      });
    }

    // Create new order
    const newOrder = new Order({
      userId,
      cartId,
      cartItems,
      addressInfo,
      orderStatus: "pending",
      paymentMethod,
      paymentStatus: "unpaid",
      totalAmount,
      orderDate,
      quantity,
      orderUpdateDate: new Date(),
    });

    for (const item of cartItems) {
      const { productId, quantity } = item;

      // Find the product
      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${productId} not found.`,
        });
      }

      // Check stock availability
      if (product.totalStock < quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product: ${productId}. Available: ${product.totalStock}, Requested: ${quantity}`,
        });
      }

      // Update product stock
      product.totalStock -= quantity;
      await product.save();
    }

    
    await newOrder.save();
    console.log("new order",newOrder);
    res.status(201).json({
      success: true,
      message: "Order created successfully.",
      orderId: newOrder._id,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "An error occurred while creating the order.",
    });
  }
};

const confirmCODOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    let order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    if (order.paymentMethod !== "COD") {
      return res.status(400).json({
        success: false,
        message: "Order payment method is not 'COD'.",
      });
    }

    // Update stock for each product in the order
    for (let item of order.cartItems) {
      let product = await Product.findById(item.productId);

      if (!product || product.totalStock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product: ${item.name}`,
        });
      }

      product.totalStock -= item.quantity;
      await product.save();
    }

    // Mark order as confirmed
    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";
    order.orderUpdateDate = new Date();

    await order.save();

    // Delete cart
    await Cart.findByIdAndDelete(order.cartId);

    res.status(200).json({
      success: true,
      message: "Order confirmed successfully.",
      data: order,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "An error occurred while confirming the order.",
    });
  }
};

const getAllOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ userId });

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "No orders found!",
      });
    }

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching orders.",
    });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching order details.",
    });
  }
};

module.exports = {
  createOrder,
  confirmCODOrder,
  getAllOrdersByUser,
  getOrderDetails,
};
