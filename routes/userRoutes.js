const router = require("express").Router();
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");

// GET ALL USERS
router.get("/", auth, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    console.error("USER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
