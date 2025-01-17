const Cart = require("../../models/Cart");
const Product = require("../../models/Product");

const addToCart = async (req, res) => {
  try {
    const { userId, sessionId, productId, quantity } = req.body;

    if (!productId || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid product or quantity",
      });
    }

    // Check if the product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    let cart;
    
    // Handle logged-in user
    if (userId) {
      cart = await Cart.findOne({ userId });
    } else if (sessionId) {
      // Handle guest user
      cart = await Cart.findOne({ sessionId });
    } else {
      return res.status(400).json({
        success: false,
        message: "Missing user/session identifier",
      });
    }

    // Create cart if not found
    if (!cart) {
      cart = new Cart({
        userId: userId || null, // For guest user, `userId` will be null
        sessionId: sessionId || null, // For guest user, `sessionId` will be used
        items: [],
      });
    }

    const productIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (productIndex === -1) {
      cart.items.push({ productId, quantity });
    } else {
      // If the product is already in the cart, update the quantity
      cart.items[productIndex].quantity += quantity;
    }

    // Save the cart
    await cart.save();
    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    console.error("Error adding to cart:", error); // Log the error with a better message
    res.status(500).json({
      success: false,
      message: "An error occurred while adding to the cart.",
    });
  }
};

const fetchCartItems = async (req, res) => {
  try {
    const { userId, sessionId } = req.params; // Using both userId and sessionId for logged-in and guest users

    // Check if neither userId nor sessionId is provided
    if (!userId && !sessionId) {
      return res.status(400).json({
        success: false,
        message: "Either user id or session id is mandatory!",
      });
    }

    let cart;
    
    if (userId) {
      // For logged-in users, we look up the cart by userId
      cart = await Cart.findOne({ userId }).populate({
        path: "items.productId",
        select: "image title price salePrice",
      });
    } else {
      // For anonymous users, we look up the cart by sessionId
      cart = await Cart.findOne({ sessionId }).populate({
        path: "items.productId",
        select: "image title price salePrice",
      });
    }

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found!",
      });
    }

    // Filter out invalid items (i.e., those with no productId)
    const validItems = cart.items.filter(
      (productItem) => productItem.productId
    );

    if (validItems.length < cart.items.length) {
      // If there are invalid items, clean them up and save the updated cart
      cart.items = validItems;
      await cart.save();
    }

    // Prepare the cart items data to return
    const populateCartItems = validItems.map((item) => ({
      productId: item.productId._id,
      image: item.productId.image,
      title: item.productId.title,
      price: item.productId.price,
      salePrice: item.productId.salePrice,
      quantity: item.quantity,
    }));

    res.status(200).json({
      success: true,
      data: {
        ...cart._doc,
        items: populateCartItems,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error fetching cart items",
    });
  }
};


const mergeGuestCart = async (req, res) => {
  const { guestSessionId, userId } = req.body;

  try {
    // Find guest cart by sessionId
    const guestCart = await Cart.findOne({ sessionId: guestSessionId });

    if (guestCart) {
      // Find user cart by userId
      let userCart = await Cart.findOne({ userId });

      if (!userCart) {
        userCart = new Cart({ userId, items: [] });
      }

      // Merge items from guest cart to user cart
      guestCart.items.forEach((guestItem) => {
        const existingItemIndex = userCart.items.findIndex((item) => item.productId.toString() === guestItem.productId.toString());

        if (existingItemIndex >= 0) {
          userCart.items[existingItemIndex].quantity += guestItem.quantity;
        } else {
          userCart.items.push(guestItem);
        }
      });

      // Save merged user cart and delete guest cart
      await userCart.save();
      await guestCart.deleteOne();

      res.status(200).json({ message: "Cart merged successfully", data: userCart });
    } else {
      res.status(404).json({ message: "Guest cart not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error merging cart" });
  }
};











const updateCartItemQty = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    if (!userId || !productId || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid data provided!",
      });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found!",
      });
    }

    const findCurrentProductIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (findCurrentProductIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Cart item not present !",
      });
    }

    cart.items[findCurrentProductIndex].quantity = quantity;
    await cart.save();

    await cart.populate({
      path: "items.productId",
      select: "image title price salePrice",
    });

    const populateCartItems = cart.items.map((item) => ({
      productId: item.productId ? item.productId._id : null,
      image: item.productId ? item.productId.image : null,
      title: item.productId ? item.productId.title : "Product not found",
      price: item.productId ? item.productId.price : null,
      salePrice: item.productId ? item.productId.salePrice : null,
      quantity: item.quantity,
    }));

    res.status(200).json({
      success: true,
      data: {
        ...cart._doc,
        items: populateCartItems,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

const deleteCartItem = async (req, res) => {
  try {
    const { userId, productId } = req.params;
    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: "Invalid data provided!",
      });
    }

    const cart = await Cart.findOne({ userId }).populate({
      path: "items.productId",
      select: "image title price salePrice",
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found!",
      });
    }

    cart.items = cart.items.filter(
      (item) => item.productId._id.toString() !== productId
    );

    await cart.save();

    await cart.populate({
      path: "items.productId",
      select: "image title price salePrice",
    });

    const populateCartItems = cart.items.map((item) => ({
      productId: item.productId ? item.productId._id : null,
      image: item.productId ? item.productId.image : null,
      title: item.productId ? item.productId.title : "Product not found",
      price: item.productId ? item.productId.price : null,
      salePrice: item.productId ? item.productId.salePrice : null,
      quantity: item.quantity,
    }));

    res.status(200).json({
      success: true,
      data: {
        ...cart._doc,
        items: populateCartItems,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

module.exports = {
  addToCart,
  updateCartItemQty,
  deleteCartItem,
  fetchCartItems,
  mergeGuestCart
};
