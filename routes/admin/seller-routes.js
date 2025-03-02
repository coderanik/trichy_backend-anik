const express = require("express");
const { connectToDatabase } = require("../../lib/db");
const { validateSession } = require("../../lib/auth");

const router = express.Router();

// Middleware for session validation
router.use(async (req, res, next) => {
  try {
    const session = await validateSession(req, res);
    if (!session || session.user.role !== "admin") {
      return res.status(401).json({ message: "Unauthorized access" });
    }
    next();
  } catch (error) {
    return res.status(500).json({ message: "Session validation failed" });
  }
});

// GET: Fetch all sellers
router.get("/", async (req, res) => {
  try {
    const db = await connectToDatabase();
    const sellersCollection = db.collection("sellers");
    const sellers = await sellersCollection.find({}).toArray();
    res.status(200).json({ success: true, sellers });
  } catch (error) {
    console.error("Error fetching sellers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST: Add a new seller
router.post("/", async (req, res) => {
  try {
    const db = await connectToDatabase();
    const sellersCollection = db.collection("sellers");

    const { name, email, phone, address, businessName, taxId, commissionRate, isVerified, joinDate, status } = req.body;

    if (!name || !email || !phone || !businessName) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existingSeller = await sellersCollection.findOne({ email });
    if (existingSeller) {
      return res.status(400).json({ message: "Seller with this email already exists" });
    }

    const newSeller = {
      name,
      email,
      phone,
      address,
      businessName,
      taxId,
      commissionRate: Number(commissionRate),
      isVerified: Boolean(isVerified),
      joinDate: joinDate || new Date().toISOString().split("T")[0],
      status: status || "active",
      createdAt: new Date().toISOString(),
    };

    const result = await sellersCollection.insertOne(newSeller);

    res.status(201).json({
      success: true,
      message: "Seller added successfully",
      sellerId: result.insertedId,
    });
  } catch (error) {
    console.error("Error adding seller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;  // ✅ Export as `router`
