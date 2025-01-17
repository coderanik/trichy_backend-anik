const express = require("express");

const {
  createOrder,
  getAllOrdersByUser,
  getOrderDetails,
  confirmCODOrder,
} = require("../../controllers/shop/order-controller");

const router = express.Router();

router.post("/create", createOrder);
router.post("/capture", confirmCODOrder);
router.get("/list/:userId", getAllOrdersByUser);
router.get("/details/:id", getOrderDetails);

module.exports = router;
