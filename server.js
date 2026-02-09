const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
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
const OfferRoute = require("./routes/OfferRoute");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", () => {});

app.set("io", io);

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
app.use("/api/offers", OfferRoute);

mongoose.connect(process.env.MONGO_URI).then(() => {
  server.listen(process.env.PORT, () => {
    console.log(`Database connected successfull and Server running on ${process.env.PORT}`);
  });
}).catch((err) => {
  console.log("err=>", err);
});
