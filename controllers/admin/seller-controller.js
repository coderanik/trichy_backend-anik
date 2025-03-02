const { imageUploadUtil } = require("../../helpers/cloudinary");
const Registration = require("../../models/Seller");

const handleFileUpload = async (req, res) => {
  try {
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const url = "data:" + req.file.mimetype + ";base64," + b64;
    const result = await imageUploadUtil(url);

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Error occurred",
    });
  }
};

// Register a new seller
const registerSeller = async (req, res) => {
  try {
    const {
      name,
      displayName,
      email,
      password,
      confirmPassword,
      company,
      addressLine1,
      addressLine2,
      landmark,
      city,
      state,
      country,
      zip,
      mobileNumber,
      gstNumber,
      bankName,
      accountName,
      branchName,
      accountNumber,
      ifscCode,
      panFile,
      chequeFile,
    } = req.body;

    // Check if password and confirm password match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    // Check if email already exists
    const existingSeller = await Registration.findOne({ email });
    if (existingSeller) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    const newSeller = new Registration({
      name,
      displayName,
      email,
      password, // Note: In a real application, this should be hashed
      confirmPassword,
      company,
      addressLine1,
      addressLine2,
      landmark,
      city,
      state,
      country,
      zip,
      mobileNumber,
      gstNumber,
      bankName,
      accountName,
      branchName,
      accountNumber,
      ifscCode,
      panFile,
      chequeFile,
    });

    await newSeller.save();
    res.status(201).json({
      success: true,
      data: newSeller,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occurred",
    });
  }
};

// Fetch all sellers
const fetchAllSellers = async (req, res) => {
  try {
    const listOfSellers = await Registration.find({}).select("-password -confirmPassword");
    res.status(200).json({
      success: true,
      data: listOfSellers,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occurred",
    });
  }
};

// Fetch a single seller by ID
const fetchSellerById = async (req, res) => {
  try {
    const { id } = req.params;
    const seller = await Registration.findById(id).select("-password -confirmPassword");
    
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    res.status(200).json({
      success: true,
      data: seller,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occurred",
    });
  }
};

// Update seller information
const updateSeller = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      displayName,
      email,
      company,
      addressLine1,
      addressLine2,
      landmark,
      city,
      state,
      country,
      zip,
      mobileNumber,
      gstNumber,
      bankName,
      accountName,
      branchName,
      accountNumber,
      ifscCode,
      panFile,
      chequeFile,
    } = req.body;

    let seller = await Registration.findById(id);
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    seller.name = name || seller.name;
    seller.displayName = displayName || seller.displayName;
    seller.email = email || seller.email;
    seller.company = company || seller.company;
    seller.addressLine1 = addressLine1 || seller.addressLine1;
    seller.addressLine2 = addressLine2 || seller.addressLine2;
    seller.landmark = landmark || seller.landmark;
    seller.city = city || seller.city;
    seller.state = state || seller.state;
    seller.country = country || seller.country;
    seller.zip = zip || seller.zip;
    seller.mobileNumber = mobileNumber || seller.mobileNumber;
    seller.gstNumber = gstNumber || seller.gstNumber;
    seller.bankName = bankName || seller.bankName;
    seller.accountName = accountName || seller.accountName;
    seller.branchName = branchName || seller.branchName;
    seller.accountNumber = accountNumber || seller.accountNumber;
    seller.ifscCode = ifscCode || seller.ifscCode;
    seller.panFile = panFile || seller.panFile;
    seller.chequeFile = chequeFile || seller.chequeFile;

    await seller.save();
    res.status(200).json({
      success: true,
      data: seller,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occurred",
    });
  }
};

// Delete a seller
const deleteSeller = async (req, res) => {
  try {
    const { id } = req.params;
    const seller = await Registration.findByIdAndDelete(id);

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Seller deleted successfully",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occurred",
    });
  }
};

// Change seller password
const changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    // Check if new password and confirm password match
    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: "New passwords do not match",
      });
    }

    const seller = await Registration.findById(id);
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    // Check if current password matches
    // Note: In a real application, you would compare hashed passwords
    if (seller.password !== currentPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    seller.password = newPassword;
    seller.confirmPassword = confirmNewPassword;
    await seller.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occurred",
    });
  }
};

module.exports = {
  handleFileUpload,
  registerSeller,
  fetchAllSellers,
  fetchSellerById,
  updateSeller,
  deleteSeller,
  changePassword,
};