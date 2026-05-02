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

    // 1. Validation
    if (!title || !assignedTo || !projectId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // 2. Check project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(400).json({ message: "Project not found" });
    }

    // 3. Check user exists
    const user = await User.findById(assignedTo);
    if (!user) {
      return res.status(400).json({ message: "Assigned user not found" });
    }

    // 4. Create task
    const task = await Task.create({
      title,
      description,
      assignedTo,
      projectId,
      dueDate
    });

    res.status(201).json(task);

  } catch (err) {
    console.log("CREATE TASK ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// 📌 GET TASKS (USER SEES THEIR TASKS)
router.get("/", auth, async (req, res) => {
  try {
    const tasks = await Task.find({
      assignedTo: req.user._id
    })
      .populate("assignedTo", "name email")
      .populate("projectId", "title description");

    res.json(tasks);

  } catch (err) {
    console.log("GET TASK ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// 🔄 UPDATE TASK STATUS (ONLY ASSIGNED USER)
router.put("/:id", auth, async (req, res) => {
  try {
    const { status } = req.body;

    // 1. Validate status
    const validStatus = ["todo", "inprogress", "done"];
    if (!validStatus.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    // 2. Find task
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // 3. Check ownership
    if (task.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    // 4. Update status
    task.status = status;
    await task.save();

    res.json(task);

  } catch (err) {
    console.log("UPDATE TASK ERROR:", err);
    res.status(500).json({ message: "Server error" });
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
    console.log("DELETE TASK ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;