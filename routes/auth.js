const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// SIGNUP
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, adminCode } = req.body;

    // 1. Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 2. Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // 3. Hash password
    const hashed = await bcrypt.hash(password, 10);

    // 4. Decide role
    let role = "member";

    if (adminCode && adminCode === process.env.ADMIN_SECRET) {
      role = "admin";
    }

    // 5. Create user
    const user = await User.create({
      name,
      email,
      password: hashed,
      role
    });

    // 6. Remove password
    const { password: _, ...userData } = user._doc;

    res.status(201).json(userData);

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validation
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 2. Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // 3. Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 4. Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // 5. Remove password
    const { password: _, ...userData } = user._doc;

    res.json({ token, user: userData });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;