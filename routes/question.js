const router = require("express").Router();
const Question = require("../models/Question");
const {
  verifyToken,
  verifyTokenAndAdmin,
  verifyTokenAndSeller,
} = require("../middlewares/verification");

//GET all questions by seller
router.get("/", verifyTokenAndSeller, async (req, res) => {
  try {
    const questions = await Question.find({ seller: req.user.username })
      .populate("user", "-password -isAdmin -accountType")
      .populate("product");
    res.status(200).json(questions);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

//GET all Questions by product id
router.get("/find/:id", async (req, res) => {
  try {
    const questions = await Question.find({ product: req.params.id })
      .populate("user", "-password -isAdmin -accountType")
      .populate("product");
    console.log(questions);
    res.status(200).json(questions);
  } catch (err) {
    res.status(500).json(err);
  }
});

// UPDATE A Question Answer
router.post("/:questionId", verifyToken, async (req, res) => {
  try {
    const updatedQuestion = await Question.findByIdAndUpdate(
      req.params.questionId,
      {
        answer: req.body.answer,
        status: req.body.status,
      },
      { new: true }
    );

    res.status(201).json({
      message: "Answer updated successfully.",
      data: updatedQuestion,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

// CREATE A Question
router.post("/", verifyToken, async (req, res) => {
  const newQuestion = new Question(req.body);
  try {
    const savedQuestion = await newQuestion.save();
    res.status(201).json({
      message:
        "Question added successfully. We will notify you once seller answer it.",
      data: savedQuestion,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

//DELETE A Question only admin can do that
router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const Question = await Question.findByIdAndDelete(req.params.id);
    res.status(200).json("The Question has been deleted.");
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET all Questions that is already answered by product id
router.get("/findAnswers/:id", async (req, res) => {
  try {
    const questions = await Question.find({
      product: req.params.id,
      status: 1,
    })
      .populate("product")
      .populate("user");
    res.status(200).json(questions);
  } catch (err) {
    res.status(500).json(err);
  }
});

// count Seller Question
router.get("/countSellerQuestion", verifyTokenAndSeller, async (req, res) => {
  try {
    const c = await Question.countDocuments({ seller: req.user.username });
    res.status(200).json(c);
  } catch (err) {
    return res.status(500).json(err);
  }
});

module.exports = router;
