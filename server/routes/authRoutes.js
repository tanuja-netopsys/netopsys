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

// Email Verification OTP Endpoints
router.post("/send-verification-otp", authController.sendVerificationOtp);
router.post("/verify-email-otp", authController.verifyEmailOtp);

// Forgot Password & Reset Endpoints
router.post("/forgot-password", authController.forgotPassword);
router.post("/send-reset-otp", authController.forgotPassword);
router.post("/verify-reset-otp", authController.verifyResetOtp);
router.post("/reset-password", authController.resetPassword);

// Protected SuperAdmin Routes
router.get("/superadmin/me", authMiddleware, authController.getSuperAdminProfile);
router.get("/me", authMiddleware, authController.getSuperAdminProfile);
router.post("/logout", authController.logout);

module.exports = router;

