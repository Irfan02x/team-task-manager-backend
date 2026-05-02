const router = require("express").Router();
const Project = require("../models/Project");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

// CREATE PROJECT
router.post("/", auth, role("admin"), async (req, res) => {
  try {
    const { title, description } = req.body;

    const project = await Project.create({
      title,
      description,
      createdBy: req.user._id
    });

    res.status(201).json(project);

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔥 ADD THIS (MISSING PART)
router.get("/", auth, async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;