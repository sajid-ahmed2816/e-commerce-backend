const jwt = require("jsonwebtoken");
const { SendResponse } = require("../helper/SendResponse");
const UserModel = require("../models/UserModel");
const admin = require("../firebaseAdmin");

const JWT_SECRET = process.env.JWT_SECRET

const Auth = async (req, res) => {
  try {
    const { token } = req.body; // Firebase ID token from frontend

    if (!token) {
      return res.status(400).send(SendResponse(false, null, "Token is required"));
    }

    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(token);
    const { name, email, picture } = decodedToken;

    if (!email) {
      return res.status(400).send(SendResponse(false, null, "Invalid token"));
    }

    // Find or create user
    let user = await UserModel.findOne({ email });
    if (!user) {
      user = new UserModel({
        name: name || "Unnamed User",
        email,
        image: picture || null,
        role: "user"
      });
      await user.save();
    }

    // Generate JWT (valid for 7 days)
    const ourToken = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).send(SendResponse(true, { user, token: ourToken }, "User authenticated successfully"));
  } catch (err) {
    console.error(err);
    res.status(401).send(SendResponse(false, null, "Unauthorized"));
  }
};

module.exports = { Auth };
