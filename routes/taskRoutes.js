const router = require("express").Router();
const Task = require("../models/Task");
const Project = require("../models/Project");
const User = require("../models/User");

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");


// 🔥 CREATE TASK (ADMIN ONLY)
router.post("/", auth, role("admin"), async (req, res) => {
  try {
    const { title, description, assignedTo, projectId, dueDate } = req.body;

    if (!title || !assignedTo || !projectId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(400).json({ message: "Project not found" });
    }

    const user = await User.findById(assignedTo);
    if (!user) {
      return res.status(400).json({ message: "Assigned user not found" });
    }

    const task = await Task.create({
      title,
      description,
      assignedTo,
      projectId,
      dueDate
    });

    res.status(201).json(task);

  } catch (err) {
    console.log("CREATE TASK ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
});


// 📌 GET TASKS (SAFE VERSION)
// 📌 GET TASKS
router.get("/", auth, async (req, res) => {
  try {
    let tasks;

    // admin sees all tasks
    if (req.user.role === "admin") {
      tasks = await Task.find()
        .populate("assignedTo", "name email role")
        .populate("projectId", "title description");
    } else {
      // member sees only assigned tasks
      tasks = await Task.find({
        assignedTo: req.user._id
      })
        .populate("assignedTo", "name email role")
        .populate("projectId", "title description");
    }

    res.json(tasks);
  } catch (err) {
    console.log("GET TASK ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// 🔄 UPDATE TASK STATUS
router.put("/:id", auth, async (req, res) => {
  try {
    const { status } = req.body;

    const validStatus = ["todo", "inprogress", "done"];
    if (!validStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // ✅ SAFE COMPARISON
    if (!req.user || task.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    task.status = status;
    await task.save();

    res.json(task);

  } catch (err) {
    console.log("UPDATE TASK ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
});


// ❌ DELETE TASK (ADMIN ONLY)
router.delete("/:id", auth, role("admin"), async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    await task.deleteOne();

    res.json({ message: "Task deleted successfully" });

  } catch (err) {
    console.log("DELETE TASK ERROR:", err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
