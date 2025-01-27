const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const sellRegistration = require("../../models/Seller")
const nodemailer = require("nodemailer");
//register

const registerUser = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    password,
    addressLine1,
    addressLine2,
    landmark,
    city,
    state,
    country,
    zip,
    terms,
  } = req.body;

  try {
    // Validate required fields
    if (!firstName || !lastName || !email || !password || !terms) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Check if user already exists
    const checkUser = await User.findOne({ email });
    if (checkUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with the same email! Please try again",
      });
    }

    // Hash the password
    const hashPassword = await bcrypt.hash(password, 12);

    // Create a new user instance
    const newUser = new User({
      firstName,
      lastName,
      email,
      phone,
      password: hashPassword,
      address: {
        addressLine1,
        addressLine2,
        landmark,
        city,
        state,
        country,
        zip,
      },
    });

    // Save the user to the database
    await newUser.save();

    res.status(200).json({
      success: true,
      message: "Registration successful",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An error occurred while processing your request",
    });
  }
};




//login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const checkUser = await User.findOne({ email });
    if (!checkUser)
      return res.json({
        success: false,
        message: "User doesn't exists! Please register first",
      });

    const checkPasswordMatch = await bcrypt.compare(
      password,
      checkUser.password
    );
    if (!checkPasswordMatch)
      return res.json({
        success: false,
        message: "Incorrect password! Please try again",
      });

    const token = jwt.sign(
      {
        id: checkUser._id,
        role: checkUser.role,
        email: checkUser.email,
        userName: checkUser.firstName,
      },
      "CLIENT_SECRET_KEY",
      { expiresIn: "60m" }
    );

    res.cookie("token", token, { httpOnly: true, 
      secure: true,
      sameSite:"None",
      maxAge: 7* 24* 60 * 60 * 1000,
     }).json({
      success: true,
      message: "Logged in successfully",
      user: {
        email: checkUser.email,
        role: checkUser.role,
        id: checkUser._id,
        userName: checkUser.userName,
      },
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured",
    });
  }
};

// forget password
const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.json({
        success: false,
        message: "User  not found!",
      });
    }

    // Create a token for password reset
    const token = jwt.sign(
      { id: user._id },
      "CLIENT_SECRET_KEY", // Use a more secure key in production
      { expiresIn: "10m" }
    );

    // Create a transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // Use SSL
      auth: {
        user: "tradeap25@gmail.com",
        pass: "udbw cktf dnkc tatw", // App Password
      },
    });
    

    // Email options
    const mailOptions = {
      from: "gangeswaran375@gmail.com",
      to: email,
      subject: "Password Reset Request",
      text: `You requested a password reset. Click the link below to reset your password:\n\nhttp://tradeap.in/auth/reset-password/?token=${token}\n\nIf you did not request this, please ignore this email.`,
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({
          success: false,
          message: "Failed to send email.",
        });
      }
      res.json({
        success: true,
        message: "Reset password link sent to your registered email",
        token,
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An error occurred while processing your request",
    });
  }
};

// reset password 
//  Adjust the import path as necessary

const resetPassword = async (req, res) => {
  const { password, token } = req.body;

  try {
    // Verify the token
    const decoded = jwt.verify(token, "CLIENT_SECRET_KEY"); // Use the same secret used to sign the token
    const userId = decoded.id; // Get the user ID from the token

    // Hash the new password
    const hashPassword = await bcrypt.hash(password, 12);

    // Update the user's password and clear the reset token
    await User.findByIdAndUpdate(
      userId,
      { password: hashPassword, resetToken: "" }, // Only update the password and resetToken
      { new: true } // Return the updated document
    );

    res.json({
      success: true,
      message: "Password reset successful!",
    });
    
  } catch (error) {
    console.error(error);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token.",
      });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired.",
      });
    }
    res.status(500).json({
      success: false,
      message: "An error occurred while processing your request",
    });
  }
};



//logout

const logoutUser = (req, res) => {
  res.clearCookie("token").json({
    success: true,
    message: "Logged out successfully!",
  });
};

//auth middleware
const authMiddleware = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token)
    return res.status(401).json({
      success: false,
      message: "Unauthorised user!",
    });

  try {
    const decoded = jwt.verify(token, "CLIENT_SECRET_KEY");
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Unauthorised user!",
    });
  }
};


const sellerRegistion = async (req, res) => {
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
      chequeFile
    } = req.body;


    // Check if user already exists
    const checkUser = await sellRegistration.findOne({ email });
    if (checkUser) {
      return res.json({
        success: false,
        message: "User already exists with the same email! Please try again.",
      });
    }

    // Validate password and confirmPassword
    if (password !== confirmPassword) {
      return res.json({
        success: false,
        message: "Password and Confirm Password do not match.",
      });
    }

    // Hash the password
    const hashPassword = await bcrypt.hash(password, 10);

    // Create the payload
    const payload = {
      name,
      displayName,
      email,
      password: hashPassword,
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
      panFile: panFile || null,
      chequeFile: chequeFile || null,
    };

    // Save the new seller
    const newUser = new sellRegistration(payload);
    await newUser.save();

    res.status(201).json({
      success: true,
      message: "Seller registered successfully.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

module.exports = { registerUser, loginUser, logoutUser, authMiddleware, sellerRegistion ,forgetPassword, resetPassword};
