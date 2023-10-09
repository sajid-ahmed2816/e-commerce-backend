const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

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
