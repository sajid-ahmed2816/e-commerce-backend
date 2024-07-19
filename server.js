const express = require("express");
const mongoose = require("mongoose");
const UserRoute = require("./routes/UserRoute");
const CategoryRoute = require("./routes/CategoryRoute");
const cors = require("cors");
const app = express();
const ImageRoute = require("./routes/ImageRoute");
require("dotenv").config();

app.use(cors());
app.use(express.json());
app.use("/api/auth", UserRoute);
app.use("/api/categories", CategoryRoute);
app.use("/api", ImageRoute);

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
