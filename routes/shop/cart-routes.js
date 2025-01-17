const express = require("express");

const {
  addToCart,
  fetchCartItems,
  deleteCartItem,
  updateCartItemQty,
  mergeGuestCart,
} = require("../../controllers/shop/cart-controller");

const router = express.Router();

router.post("/add", addToCart);
router.get("/get/:userId", fetchCartItems);
router.put("/update-cart", updateCartItemQty);
router.delete("/:userId/:productId", deleteCartItem);


router.get("/guest/get/:sessionId", fetchCartItems);
router.post("/guest/add", addToCart);
router.put("/guest/update-cart", updateCartItemQty);
router.delete("/guest/:sessionId/:productId", deleteCartItem);


router.post("/merge", mergeGuestCart);

module.exports = router;
