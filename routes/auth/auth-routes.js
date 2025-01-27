const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  authMiddleware,
  sellerRegistion,
  forgetPassword,
  resetPassword,
} = require("../../controllers/auth/auth-controller");

const router = express.Router();
router.post("/sellerRegister",sellerRegistion)
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password",forgetPassword);
router.post("/reset-password", resetPassword);
router.post("/logout", logoutUser);
router.get("/check-auth", authMiddleware, (req, res) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    message: "Authenticated user!",
    user,
  });
});

module.exports = router;
