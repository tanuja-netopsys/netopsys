const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/auth");

// Get all registered users from PostgreSQL database
router.get("/", userController.getAllUsers);

// Candidate Profile Endpoints (PostgreSQL)
router.get("/profile", userController.getUserProfile);
router.post("/profile", userController.saveUserProfile);
router.put("/profile", userController.saveUserProfile);

// Toggle Block/Active status for a user
router.patch("/:id/status", userController.toggleUserStatus);

// Delete registered user (Admin / Super Admin only)
router.delete("/:id", authMiddleware, userController.deleteUser);

module.exports = router;

