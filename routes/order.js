const router = require("express").Router();
const Order = require("../models/Order");
const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
  verifyTokenAndSeller,
} = require("../middlewares/verification");
const SellerOrder = require("../models/SellerOrder");

//CREATE ORDER
router.post("/", verifyToken, async (req, res) => {
  const newOrder = new Order(req.body);

  try {
    //save order for customer use case
    const savedOrder = await newOrder.save();
    // now save it for seller purpose
    const products = newOrder.products;
    for (const store in products) {
      if (products.hasOwnProperty(store)) {
        const sellerOrder = {
          user: newOrder.user,
          paymentMethod: newOrder.paymentMethod,
          shippingInfo: newOrder.shippingInfo,
          billingInfo: newOrder.billingInfo,
          orderId: savedOrder._id,
          products: products[store]["products"],
          totalAmount: products[store]["totalAmount"],
          totalMarketPrice: products[store]["totalMarketPrice"],
          orderStatus: products[store]["orderStatus"],
          orderComment: products[store]["orderComment"],
          seller: store,
        };
        const newSellerOrder = new SellerOrder(sellerOrder);
        await newSellerOrder.save();
      }
    }
    res.status(200).json(savedOrder);
  } catch (err) {
    res.status(500).json(err);
  }
});

//UPDATE ORDER Status
router.put("/:id", verifyToken, async (req, res) => {
  const orderStatus = req.body.orderStatus;
  const orderId = req.params.id;
  try {
    let updatedOrder;
    //update seller part
    if (orderStatus === "approved") {
      updatedOrder = await SellerOrder.findByIdAndUpdate(
        orderId,
        {
          $set: { orderStatus: "approved" },
        },
        { new: true }
      );
      const os = `products.${updatedOrder.seller}.orderStatus`;
      // update customer part
      await Order.findByIdAndUpdate(updatedOrder.orderId, {
        $set: { [os]: "approved" },
      });
    }
    if (orderStatus === "cancelled") {
      //update seller part
      updatedOrder = await SellerOrder.findByIdAndUpdate(
        orderId,
        {
          $set: {
            orderStatus: "cancelled",
            orderComment: req.body.orderComment,
          },
        },
        { new: true }
      );
      const os = `products.${updatedOrder.seller}.orderStatus`;
      const oc = `products.${updatedOrder.seller}.orderComment`;
      // update customer part
      await Order.findByIdAndUpdate(updatedOrder.orderId, {
        $set: { [os]: "cancelled", [oc]: req.body.orderComment },
      });
    }

    res.status(200).json(updatedOrder);
  } catch (err) {
    // res.status(500).json(err);
  }
});

//DELETE ORDER
router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.status(200).json({ msg: "Order has been deleted." });
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET USER ORDERS
router.get("/find/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    const orders = await Order.find({ "user._id": req.params.id }).sort({
      createdAt: -1,
    });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET single order
router.get("/findOrder/:orderId", verifyToken, async (req, res) => {
  console.log(1);
  console.log(req.params.orderId);
  try {
    const order = await Order.findById(req.params.orderId);
    res.status(200).json(order);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//GET ALL ORDERS
router.get("/", verifyTokenAndSeller, async (req, res) => {
  try {
    const orders = await SellerOrder.find({ seller: req.user.username })
      .sort({ createdAt: -1 })
      .limit(50);
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET order STATS
router.get("/stats", verifyTokenAndSeller, async (req, res) => {
  const date = new Date();
  const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));

  try {
    const data = await SellerOrder.aggregate([
      { $match: { createdAt: { $gte: lastYear }, seller: req.user.username } },
      {
        $project: {
          month: { $month: "$createdAt" },
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json(data);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
});

// GET MONTHLY INCOME
router.get("/income", verifyTokenAndAdmin, async (req, res) => {
  const productId = req.query.pid;
  const date = new Date();
  const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
  const previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));

  try {
    const income = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: previousMonth },
          ...(productId && {
            products: { $elementMatch: { productId } },
          }),
        },
      },
      {
        $project: {
          month: { $month: "$createdAt" },
          sales: "$amount",
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: "$sales" },
        },
      },
    ]);
    res.status(200).json(income);
  } catch (err) {
    res.status(500).json(err);
  }
});

// count Seller Order
router.get("/countSellerOrder", verifyTokenAndSeller, async (req, res) => {
  try {
    const c = await SellerOrder.countDocuments({ seller: req.user.username });
    res.status(200).json(c);
  } catch (err) {
    return res.status(500).json(err);
  }
});

module.exports = router;
