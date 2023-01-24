const mongoose = require("mongoose");

const WishlistSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    products: [
      {
        title: String,
        img: String,
        price: Number,
        marketPrice: Number,
        hasMerchantReturnPolicy: Boolean,
        seller: String,
        productId: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Wishlist", WishlistSchema);
