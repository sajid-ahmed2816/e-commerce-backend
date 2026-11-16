process.env.TZ = 'Asia/Karachi';
const express = require("express");
const cors = require("cors");
const http = require("http");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
require("dotenv").config();

const OrderRoute = require("./routes/OrderRoute");
const BannerRoute = require("./routes/BannerRoute");
const BlogRoute = require("./routes/BlogRoute");
const SearchRoute = require("./routes/SearchRoute");
const CategoryRoute = require("./routes/CategoryRoute");
const AttributeRoute = require("./routes/AttributeRoute");
const AttributeValueRoute = require("./routes/AttributeValueRoute");
const ProductRoute = require("./routes/ProductRoute");
const ProductVariantRoute = require("./routes/ProductVariantRoute");
const ImageRoute = require("./routes/ImageRoute");
const AuthRoute = require("./routes/AuthRoute");
const UserRoute = require("./routes/UserRoute");
const OfferRoute = require("./routes/OfferRoute");
const DashboardRoute = require("./routes/DashboardRoute");
const StripeRoute = require("./routes/Stripe");
const SubscriptionRoute = require('./routes/SubscriptionRoute');
const NotificationRoute = require("./routes/NotificationRoute");
const processOffers = require("./utils/cron");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", () => { });

app.set("io", io);

const allowedOrigins = new Set([
  "https://e-commerce-react-js-web.netlify.app",
  ...(process.env.CORS_ORIGINS || "").split(",").map((origin) => origin.trim()).filter(Boolean),
]);

const isAllowedOrigin = (origin) =>
  !origin ||
  allowedOrigins.has(origin) ||
  /^https:\/\/e-commerce-dashboard(?:-[a-z0-9-]+)?\.vercel\.app$/i.test(origin);

app.use(cors({
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) return callback(null, true);
    return callback(new Error("Origin is not allowed by CORS"));
  },
}));

let connectionPromise;
app.use(async (req, res, next) => {
  if (mongoose.connection.readyState === 1) return next();

  try {
    connectionPromise ||= mongoose.connect(process.env.MONGO_URI).catch((error) => {
      connectionPromise = undefined;
      throw error;
    });
    await connectionPromise;
    return next();
  } catch (error) {
    console.error("MongoDB connection failed", error);
    return res.status(503).json({ success: false, message: "Database unavailable" });
  }
});

app.use(express.json());
app.use("/api", ImageRoute);
app.use("/api/auth", AuthRoute);
app.use("/api/users", UserRoute);
app.use("/api/categories", CategoryRoute);
app.use("/api/attributes", AttributeRoute);
app.use("/api/attribute-values", AttributeValueRoute);
app.use("/api/products", ProductRoute);
app.use("/api/product-variants", ProductVariantRoute);
app.use("/api/blogs", BlogRoute);
app.use("/api/banners", BannerRoute);
app.use("/api/orders", OrderRoute);
app.use("/api/offers", OfferRoute);
app.use("/api/dashboard", DashboardRoute);
app.use("/api/stripe", StripeRoute);
app.use('/api/push', SubscriptionRoute);
app.use('/api/notifications', NotificationRoute);
app.use("/api", SearchRoute);

app.get("/api/cron", async (req, res) => {
  if (!process.env.CRON_SECRET || req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    await processOffers();
    return res.status(200).json({ success: true, message: "Offers processed" });
  } catch (error) {
    console.error("Vercel cron failed", error);
    return res.status(500).json({ success: false, message: "Offer processing failed" });
  }
});

if (!process.env.VERCEL && require.main === module) {
  mongoose.connect(process.env.MONGO_URI).then(() => {
    server.listen(process.env.PORT || 3030, () => {
      console.log(`Database connected successfully and server running on ${process.env.PORT || 3030}`);
    });
    require('./utils/cron');
  }).catch((err) => console.error("Database connection failed", err));
}

module.exports = app;
