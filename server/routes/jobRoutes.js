const express = require("express");
const router = express.Router();
const jobController = require("../controllers/jobController");

// Public & Admin Routes for Jobs
router.get("/", jobController.getAllJobs);
router.get("/:id", jobController.getJobById);
router.post("/", jobController.createJob);
router.put("/:id", jobController.updateJob);
router.delete("/:id", jobController.deleteJob);
router.patch("/:id/status", jobController.toggleJobStatus);

module.exports = router;

