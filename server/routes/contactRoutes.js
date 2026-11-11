const express = require("express");
const router = express.Router();
const { submitContactForm, getContactSubmissions } = require("../controllers/contactController");
const { contactRateLimiter } = require("../middleware/rateLimit");

// Public contact submission endpoints with IP rate limiting
router.post("/", contactRateLimiter, submitContactForm);
router.post("/submit", contactRateLimiter, submitContactForm);

// Admin view endpoint
router.get("/", getContactSubmissions);

module.exports = router;

