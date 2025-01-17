const Order = require("../../models/Order");

const getAllOrdersOfAllUsers = async (req, res) => {
  try {
    const orders = await Order.find({});

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
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const getOrderDetailsForAdmin = async (req, res) => {
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
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;
    console.log("Order Status:", orderStatus);
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    // Update the order status and payment status
    order.orderStatus = orderStatus;

    if (orderStatus === "delivered") {
      order.paymentStatus = "paid";
    }

    // Save changes to the database
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order status and payment status updated successfully!",
      updatedOrder: order, // Optional: Include updated order in the response
    });
  } catch (e) {
    console.error("Error updating order status:", e);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating the order status.",
    });
  }
};


module.exports = {
  getAllOrdersOfAllUsers,
  getOrderDetailsForAdmin,
  updateOrderStatus,
};
