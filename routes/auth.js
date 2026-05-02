const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ================= SIGNUP =================
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, adminCode } = req.body;

    // 🔹 validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 🔹 check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // 🔹 hash password
    const hashed = await bcrypt.hash(password, 10);

    // 🔹 default role
    let role = "member";

    // 🔥 SAFE ADMIN CHECK (NO CRASH)
    if (
      adminCode &&
      process.env.ADMIN_SECRET &&
      adminCode.trim() === process.env.ADMIN_SECRET.trim()
    ) {
      role = "admin";
    }

    // 🔹 create user
    const user = await User.create({
      name,
      email,
      password: hashed,
      role
    });

    // 🔹 remove password
    const { password: _, ...userData } = user._doc;

    res.status(201).json(userData);

  } catch (err) {
    console.error("SIGNUP ERROR:", err); // 🔥 debug
    res.status(500).json({ message: err.message });
  }
});


// ================= LOGIN =================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🔹 validation
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 🔹 find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // 🔹 compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 🔹 generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // 🔹 remove password
    const { password: _, ...userData } = user._doc;

    res.json({ token, user: userData });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
