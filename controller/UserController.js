const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { SendResponse } = require("../helper/SendResponse");
const UserModel = require("../models/UserModel");
const admin = require("../firebaseAdmin");

const JWT_SECRET = process.env.JWT_SECRET

const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send(SendResponse(false, null, "Email and password are required"));
    }

    const user = await UserModel.findOne({ email, role: "admin" });
    if (!user) {
      return res.status(404).send(SendResponse(false, null, "Admin not found"));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send(SendResponse(false, null, "Invalid credentials"));
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    res.status(200).send(SendResponse(true, { user: userWithoutPassword, token }, "Logged in successfully"));
  } catch (err) {
    console.error(err);
    res.status(500).send(SendResponse(false, null, "Internal server error"));
  }
};

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
}

module.exports = { Auth, Login };
