const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const OrderRoute = require("./routes/OrderRoute");
const BannerRoute = require("./routes/BannerRoute");
const AboutRoute = require("./routes/AboutRoute");
const BlogRoute = require("./routes/BlogRoute");
const CategoryRoute = require("./routes/CategoryRoute");
const ProductRoute = require("./routes/ProductRoute");
const ImageRoute = require("./routes/ImageRoute");
const AuthRoute = require("./routes/AuthRoute");
const UserRoute = require("./routes/UserRoute");
const SizeRoute = require("./routes/SizeRoute");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", ImageRoute);
app.use("/api/auth", AuthRoute);
app.use("/api/users", UserRoute);
app.use("/api/categories", CategoryRoute);
app.use("/api/products", ProductRoute);
app.use("/api/blogs", BlogRoute);
app.use("/api/abouts", AboutRoute);
app.use("/api/banners", BannerRoute);
app.use("/api/orders", OrderRoute);
app.use("/api/sizes", SizeRoute);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Database connected successfull and Server running on ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("err=>", err);
  });
