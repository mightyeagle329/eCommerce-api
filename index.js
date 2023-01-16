require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const cors = require("cors");
const userRoute = require("./routes/user");
const authRoute = require("./routes/auth");
const productRoute = require("./routes/product");
const cartRoute = require("./routes/cart");
const wishlistRoute = require("./routes/wishlist");
const orderRoute = require("./routes/order");
const notificationRoute = require("./routes/notification");
const categoryRoute = require("./routes/category");
const reviewRoute = require("./routes/review");
const questionRoute = require("./routes/question");
const shopRoute = require("./routes/shop");

//connect to db
mongoose
  .connect(process.env.DB_CONNECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MONGOOSE IS SUCCESSFULLY CONNECTED!");
  })
  .catch((err) => {
    console.log(err);
  });
//middlewares
//we should use them before routes
app.use(
  cors({
    origin: ["http://localhost:5000", "https://bestmart.vercel.app"],
    credentials: true, //access-control-allow-credentials:true
  })
);
app.use(express.json());

//routes
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/products", productRoute);
app.use("/api/carts", cartRoute);
app.use("/api/wishlist", wishlistRoute);
app.use("/api/orders", orderRoute);
app.use("/api/notifications", notificationRoute);
app.use("/api/categories", categoryRoute);
app.use("/api/reviews", reviewRoute);
app.use("/api/questions", questionRoute);
app.use("/api/shops", shopRoute);

app.get("/", (req, res) => {
  res.send("Api is working..");
});
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`BACKEND SERVER IS RUNNING ON ${PORT}`);
});
