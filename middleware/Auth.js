const jwt = require("jsonwebtoken");
const { SendResponse } = require("../helper/SendResponse");

const JWT_SECRET = process.env.JWT_SECRET

const verifyToken = (roles = []) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).send(SendResponse(false, null, "No token provided"));
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).send(SendResponse(false, null, "Forbidden: Insufficient role"));
      }
      req.user = decoded;
      next();
    } catch (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
  }
};

module.exports = verifyToken;