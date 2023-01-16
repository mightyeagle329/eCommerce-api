const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: Object,
      required: true,
    },
    products: { type: Object, required: true },
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      default: "Cash on delivery",
    },
    shippingInfo: {
      type: Object,
      default: {
        fullName: "",
        phoneNumber: "",
        email: "",
        gender: "male",
        division: "",
        distrcit: "",
        upazila: "",
        street: "",
      },
    },
    billingInfo: {
      type: Object,
      default: {
        fullName: "",
        phoneNumber: "",
        email: "",
        gender: "male",
        division: "",
        distrcit: "",
        upazila: "",
        street: "",
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
