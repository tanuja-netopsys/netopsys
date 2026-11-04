const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// Get all registered users from PostgreSQL database
router.get("/", userController.getAllUsers);

// Candidate Profile Endpoints (PostgreSQL)
router.get("/profile", userController.getUserProfile);
router.post("/profile", userController.saveUserProfile);
router.put("/profile", userController.saveUserProfile);

// Toggle Block/Active status for a user
router.patch("/:id/status", userController.toggleUserStatus);

module.exports = router;

