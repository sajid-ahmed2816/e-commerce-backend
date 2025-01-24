const CategoryRoute = require("./routes/CategoryRoute");
const ProductRoute = require("./routes/ProductRoute");
const ImageRoute = require("./routes/ImageRoute");
const UserRoute = require("./routes/UserRoute");
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", ImageRoute);
app.use("/api/auth", UserRoute);
app.use("/api/categories", CategoryRoute);
app.use("/api/products", ProductRoute);

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
