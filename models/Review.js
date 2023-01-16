const { string } = require("joi");
const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Types.ObjectId,
      ref: "Product",
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    seller: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "",
    },
    rating: {
      type: Number,
      default: 5,
    },
    message: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: Boolean,
      default: false, // false = not approved
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", ReviewSchema);
