const express = require("express");
const router = express.Router();
const { submitContactForm, getContactSubmissions } = require("../controllers/contactController");

// Public contact submission endpoints
router.post("/", submitContactForm);
router.post("/submit", submitContactForm);

// Admin view endpoint
router.get("/", getContactSubmissions);

module.exports = router;

