const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Types.ObjectId,
      ref: "Product",
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    question: {
      type: String,
      trim: true,
      maxlength: 500,
      required: true,
    },
    answer: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: Boolean,
      default: false, // false = not answered
    },
    seller: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Question", QuestionSchema);
