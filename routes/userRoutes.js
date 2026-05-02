const router = require("express").Router();
const Task = require("../models/Task");
const Project = require("../models/Project");
const User = require("../models/User");

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

router.get("/", auth, async (req, res) => {
  const users = await User.find().select("name email role");
  res.json(users);
});

module.exports = router;