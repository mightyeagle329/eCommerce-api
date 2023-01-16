const router = require("express").Router();
const Review = require("../models/Review");
const {
  verifyToken,
  verifyTokenAndAdmin,
  verifyTokenAndSeller,
} = require("../middlewares/verification");


//Customer

// CREATE A Review
router.post("/", verifyToken, async (req, res) => {
  const newReview = new Review(req.body);
  try {
    const savedReview = await newReview.save();
    res.status(201).json({
      message: "Review added successfully.",
      data: savedReview,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

// UPDATE A Review
router.post("/:reviewId", verifyToken, async (req, res) => {
  try {
    const updatedReview = await Review.findByIdAndUpdate(
      req.params.reviewId,
      req.body
    )
      .populate("user", "-password -isAdmin -accountType")
      .populate("product");
    res.status(201).json({
      message: "Review updated successfully.",
      data: updatedReview,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET all reviews by product id
router.get("/find/:id", async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.id })
      .populate("user", "-password -isAdmin -accountType")
      .populate("product");
    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json(err);
  }
});


//Seller

// count Seller Review
router.get("/countSellerReview", verifyTokenAndSeller, async (req, res) => {
  try {
    const c = await Review.countDocuments({ seller: req.user.username });
    res.status(200).json(c);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//GET all reviews by seller
router.get("/", verifyTokenAndSeller, async (req, res) => {
  try {
    const reviews = await Review.find({ seller: req.user.username })
      .populate("user", "-password -isAdmin -accountType")
      .populate("product");
    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET all reviews by seller
router.get("/", verifyTokenAndSeller, async (req, res) => {
  try {
    const reviews = await Review.find({ seller: req.user.username })
      .populate("user", "-password -isAdmin -accountType")
      .populate("product");
    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json(err);
  }
});

//Admin


//GET all reviews by admin
router.get("/all", verifyTokenAndAdmin, async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("user", "-password -isAdmin -accountType")
      .populate("product");
    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json(err);
  }
});

//DELETE A Review only admin can do that
router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const Review = await Review.findByIdAndDelete(req.params.id);
    res.status(200).json("The review has been deleted.");
  } catch (err) {
    res.status(500).json(err);
  }
});

//Approve A Review only admin can do that
router.post("/approve/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    await Review.findByIdAndUpdate(req.params.id, {
      status: true,
    });
    res.status(200).json("The review has been published.");
  } catch (err) {
    res.status(500).json(err);
  }
});

//Disapprove A Review only admin can do that
router.post("/disapprove/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    await Review.findByIdAndUpdate(req.params.id, {
      status: false,
    });
    res.status(200).json("The review has been unpublished.");
  } catch (err) {
    res.status(500).json(err);
  }
});

// count Review by admin
router.get("/countReview", verifyTokenAndAdmin, async (req, res) => {
  try {
    const c = await Review.countDocuments();
    res.status(200).json(c);
  } catch (err) {
    return res.status(500).json(err);
  }
});

module.exports = router;
