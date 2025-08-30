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

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).send(SendResponse(false, null, "User not found"));
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

const Signup = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const obj = { firstName, lastName, email, password };
    let reqArr = ["firstName", "lastName", "email", "password"];
    let errArr = [];

    reqArr.forEach((item) => {
      if (!obj[item]) {
        errArr.push(item)
      };
    });

    if (errArr.length > 0) {
      res.status(400).send(SendResponse(false, null, "Required all data"));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = new UserModel({
      firstName,
      lastName,
      email,
      password: hashedPassword
    });
    await result.save();
    if (result) {
      return res.status(200).send(SendResponse(true, result, "Signup Successfully"));
    }
  } catch (error) {
    return res.status(500).send(SendResponse(false, null, "Internal error"));
  }
}

const Auth = async (req, res) => {
  try {
    const { token } = req.body; // Firebase ID token from frontend

    if (!token) {
      return res.status(400).send(SendResponse(false, null, "Token is required"));
    }

    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(token);
    const { name, email, picture } = decodedToken;

    let firstName = null;
    let lastName = null;
    if (name) {
      const parts = name.split(" ");
      firstName = parts[0];
      lastName = parts.slice(1).join(" ") || null;
    }

    if (!email) {
      return res.status(400).send(SendResponse(false, null, "Invalid token"));
    }

    // Find or create user
    let user = await UserModel.findOne({ email });
    if (!user) {
      user = new UserModel({
        firstName,
        lastName,
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

const Users = async (req, res) => {
  try {
    let result = await UserModel.find();
    if (result) {
      res.send(SendResponse(true, { users: result }, "All users")).status(200);
    }
  } catch (err) {
    res.send(SendResponse(null, null, "Internal server error").status(500));
  }
};

module.exports = { Auth, Login, Signup, Users };
