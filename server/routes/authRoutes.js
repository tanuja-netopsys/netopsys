const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/auth");

// SuperAdmin Login Endpoints
router.post("/superadmin/login", authController.superAdminLogin);
router.post("/admin/login", authController.superAdminLogin);

// Candidate / User Auth Endpoints
router.post("/candidate/register", authController.candidateRegister);
router.post("/register", authController.candidateRegister);
router.post("/candidate/login", authController.candidateLogin);
router.post("/login", authController.candidateLogin);

// Protected SuperAdmin Routes
router.get("/superadmin/me", authMiddleware, authController.getSuperAdminProfile);
router.get("/me", authMiddleware, authController.getSuperAdminProfile);
router.post("/logout", authController.logout);

module.exports = router;

