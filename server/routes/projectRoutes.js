const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");
const authMiddleware = require("../middleware/auth");

// Public endpoints (for public website visitor showcase)
router.get("/", projectController.getAllProjects);
router.get("/:id", projectController.getProjectById);

// Protected administrative mutation endpoints (Require authentication)
router.post("/", authMiddleware, projectController.createProject);
router.put("/:id", authMiddleware, projectController.updateProject);
router.delete("/:id", authMiddleware, projectController.deleteProject);
router.patch("/:id/status", authMiddleware, projectController.toggleProjectStatus);

module.exports = router;
