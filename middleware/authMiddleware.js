const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  try {
    let token;

    // 1. Get token
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // 2. No token
    if (!token) {
      return res.status(401).json({ message: "No token, access denied" });
    }

    // 3. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Find user
    const user = await User.findById(decoded.id).select("-password");

    // 🔥 FIX HERE
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;

    next();

  } catch (err) {
    console.error("AUTH ERROR:", err.message);
    res.status(401).json({ message: "Token is not valid" });
  }
};

module.exports = authMiddleware;
