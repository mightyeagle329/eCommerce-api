const mongoose = require("mongoose");

const SellerOrderSchema = new mongoose.Schema(
  {
    user: {
      type: Object,
      required: true,
    },
    products: { type: Array, required: true },
    totalAmount: {
      type: Number,
      required: true,
    },
    totalMarketPrice: {
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
    orderId: {
      type: String,
      required: true,
    },
    orderStatus: {
      type: String,
      default: "pending", // pending -> approved -> shipped -> outForDelivery -> delivered || cancelled
    },
    orderComment: {
      // if order is cancelled this will contain the reason
      type: String,
      default: "",
    },
    seller: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SellerOrder", SellerOrderSchema);
