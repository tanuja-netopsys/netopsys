const express = require("express");
const router = express.Router();
const teamController = require("../controllers/teamController");
const authMiddleware = require("../middleware/auth");

// Public endpoints (for website visitor display)
router.get("/", teamController.getAllTeamMembers);
router.get("/:id", teamController.getTeamMemberById);

// Protected administrative mutation endpoints (Require authentication)
router.post("/", authMiddleware, teamController.createTeamMember);
router.put("/:id", authMiddleware, teamController.updateTeamMember);
router.delete("/:id", authMiddleware, teamController.deleteTeamMember);
router.patch("/:id/status", authMiddleware, teamController.toggleTeamMemberStatus);

module.exports = router;
