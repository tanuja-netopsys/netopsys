const express = require("express");
const router = express.Router();
const subscriberController = require("../controllers/subscriberController");

// Public subscription routes
router.post("/blog", subscriberController.subscribeBlog);
router.post("/job", subscriberController.subscribeJob);
router.get("/unsubscribe", subscriberController.unsubscribe);
router.get("/verify", subscriberController.verifyEmail);

// Admin-specific routes (when mounted under /api/admin/subscribers with authMiddleware)
router.get("/", subscriberController.getSubscribers);
router.get("/stats", subscriberController.getStats);
router.get("/logs", subscriberController.getNotificationLogs);
router.get("/export", subscriberController.exportSubscribersCsv);
router.patch("/:type/:id/toggle", subscriberController.toggleSubscriber);
router.delete("/:type/:id", subscriberController.deleteSubscriber);
router.post("/test-send", subscriberController.sendTestNotification);

module.exports = router;

