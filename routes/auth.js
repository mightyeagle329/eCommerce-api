// This route controls login registration and logout

const router = require("express").Router();
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const {
  addUserValidation,
  loginValidation,
} = require("../middlewares/validation");

//REGISTER
router.post("/register", async (req, res) => {
  //console.log(req.body);
  const { error } = addUserValidation(req.body);

  if (error) return res.status(400).json(error.details[0]);

  try {
    //encrypting the password
    req.body.password = CryptoJS.AES.encrypt(
      req.body.password,
      process.env.pass_secret
    ).toString();

    //creating new user model
    const newUser = new User(req.body);
    //saving user and send response without the password
    const user = await newUser.save();
    const { password, ...others } = user._doc;
    res.status(201).json({
      message: "New account creation is successful.",
      data: others,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Username or email already exists.",
      err: err,
    });
  }
});

//LOGIN
router.post("/login", async (req, res) => {
  const { error } = loginValidation(req.body);

  if (error) return res.status(400).json(error.details[0]);

  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) return res.status(401).json({ message: "User not found!" });

    const validPassword = CryptoJS.AES.decrypt(
      user.password,
      process.env.pass_secret
    ).toString(CryptoJS.enc.Utf8);
    if (validPassword !== req.body.password)
      return res.status(401).json({ message: "Wrong credentials!" });

    const accessToken = jwt.sign(
      {
        id: user._id,
        username: user.username,
        isAdmin: user.isAdmin,
        isSeller: user.accountType,
      },
      process.env.jwt_secret,
      { expiresIn: "30d" }
    );

    const { password, ...others } = user._doc;

    res
      .status(200)
      .cookie("jwt", accessToken, {
        httpOnly: true,
        expires: new Date(Date.now() + 2592000000), //2592000000 miliseconds = 30 days
        sameSite: "None",
        secure: true,
      })
      .json(others); // no need to send message and type of message, client will take user automatically to the homepage
  } catch (err) {
    res.status(500).json({
      message: "Something went wrong.",
      err: err,
    });
  }
});

//FORGOT PASSWORD LINK GENERATE
router.post("/forgot-pass", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json("No user found!");
    }
    const secret = process.env.jwt_secret + user.password;
    const payload = {
      email: user.email,
      id: user._id,
    };
    const token = jwt.sign(payload, secret, {
      expiresIn: "1h",
    });
    const link = `https://bestmart.vercel.app/reset_pass/${user.id}/${token}`;

    //Email process begins here
    let transporter = nodemailer.createTransport({
      host: "smtp.sendgrid.net",
      port: 465,
      secure: true,
      auth: {
        user: "apikey",
        pass: process.env.SENDGRID_API_KEY,
      },
    });

    let mailOption = {
      from: "irakibm@gmail.com",
      to: user.email,
      subject: `Bestmart - Reset Password`,
      text: `Dear ${user.username},\nDid you just request to reset your password? If you did not, simply ignore this email.\nFollow this link to reset your password. This Link will be invalid after one hour and can only be used one time. \nLink: ${link}\nThank you for using mess meal tracker.\nIf you have any query regarding the site, please reply to this mail.`,
    };

    transporter.sendMail(mailOption, function (err, data) {
      if (err) {
        return res.json(
          "There has been some error while sending the mail from our side."
        );
      } else {
        return res
          .status(200)
          .json(
            "An email has been sent to the provided email id with further instructions. Please make sure to check spam folders also."
          );
      }
    });
  } catch (err) {
    return res.status(500).json(err);
  }
});

//RESET PASSWORD UPDATE
router.post("/reset-pass/:id/:token", async (req, res) => {
  const { id, token } = req.params;
  const { newPw } = req.body;

  //Check if this id exist
  const user = await User.findById(id);
  if (!user) return res.status(404).json("No user found!");
  if (user) {
    const secret = process.env.jwt_secret + user.password;
    jwt.verify(token, secret, async (err, decoded) => {
      if (err) res.status(500).json("Invalid Token!");
      if (decoded) {
        let hash = CryptoJS.AES.encrypt(
          newPw,
          process.env.pass_secret
        ).toString();

        await User.findByIdAndUpdate(user._id, {
          password: hash,
        });
        res.status(200).json("Password Reset Successful!");
      }
    });
  }
});


//LOGOUT
router.get("/logout", (req, res) => {
  res.status(200).clearCookie("jwt").json({ logout: true });
});



module.exports = router;
