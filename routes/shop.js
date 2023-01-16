const router = require("express").Router();
const { verifyToken } = require("../middlewares/verification");
const User = require("../models/User");

// Get all shops
router.get("/", async (req, res) => {
  try {
    const shops = await User.find({ accountType: 1 });
    res.status(200).json(shops);
  } catch (err) {
    res.status(500).json(err);
  }
});

//Update shop followers
router.put("/follower/:sellerId", verifyToken, async (req, res) => {
  try {
    const seller = await User.findById(req.params.sellerId);
    if (seller.followers.includes(req.user.username)) {
      await User.findByIdAndUpdate(req.params.sellerId, {
        $pull: { followers: req.user.username },
      });
    } else {
      await User.findByIdAndUpdate(req.params.sellerId, {
        $push: { followers: req.user.username },
      });
    }
    res.status(200).json({ message: "Done" });
  } catch (err) {
    return res.status(500).json(err);
  }
});

//Get Shop Orders

module.exports = router;
