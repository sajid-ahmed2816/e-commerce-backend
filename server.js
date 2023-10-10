const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const UserRoute = require("./routes/UserRoute");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/signin", UserRoute);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log("Database connected successfull and Server running on 8080");
    });
  })
  .catch((err) => {
    console.log("err=>", err);
  });
