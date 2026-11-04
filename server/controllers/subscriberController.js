const subscriberService = require("../services/subscriberService");
const emailService = require("../services/emailService");

/**
 * Public: Subscribe to Blog Updates
 * POST /api/subscribers/blog
 */
exports.subscribeBlog = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email address is required.",
      });
    }

    const result = await subscriberService.subscribeBlog(email);
    return res.status(200).json({
      success: true,
      alreadySubscribed: result.alreadySubscribed,
      reactivated: result.reactivated,
      message: result.message,
      data: { email: result.subscriber.email },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to process subscription.",
    });
  }
};

/**
 * Public: Subscribe to Job Alerts
 * POST /api/subscribers/job
 */
exports.subscribeJob = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email address is required.",
      });
    }

    const result = await subscriberService.subscribeJob(email);
    return res.status(200).json({
      success: true,
      alreadySubscribed: result.alreadySubscribed,
      reactivated: result.reactivated,
      message: result.message,
      data: { email: result.subscriber.email },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to process subscription.",
    });
  }
};

/**
 * Public: 1-Click Unsubscribe link handler
 * GET /api/subscribers/unsubscribe?type=blog|job&token=...
 */
exports.unsubscribe = async (req, res) => {
  try {
    const { type, token } = req.query;
    if (!token) {
      return res.status(400).send(`
        <div style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h2>Invalid Request</h2>
          <p>Unsubscribe token is missing.</p>
        </div>
      `);
    }

    const result = await subscriberService.unsubscribe(type || "blog", token);

    return res.status(200).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Unsubscribed - Netopsys</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #FAF7FC; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
          .card { background: white; border: 1px solid #ECE4F2; border-radius: 24px; padding: 40px 32px; max-width: 480px; width: 100%; text-align: center; box-shadow: 0 10px 30px rgba(105, 48, 146, 0.06); }
          .icon { width: 64px; height: 64px; background: #F4EBF9; color: #693092; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 28px; margin: 0 auto 20px; }
          h2 { margin: 0 0 10px; color: #141010; font-size: 22px; }
          p { color: #6C667A; font-size: 14.5px; line-height: 1.6; margin: 0 0 24px; }
          .email { font-weight: 600; color: #141010; }
          .btn { display: inline-block; background: #693092; color: white; text-decoration: none; padding: 12px 28px; border-radius: 999px; font-size: 13.5px; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon">&#10003;</div>
          <h2>Successfully Unsubscribed</h2>
          <p><span class="email">${result.email}</span> has been removed from our ${result.type} list. You will no longer receive updates.</p>
          <a href="/" class="btn">Return to Netopsys Homepage</a>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    return res.status(400).send(`
      <div style="font-family: sans-serif; text-align: center; padding: 50px;">
        <h2>Unsubscribe Link Expired or Invalid</h2>
        <p>${error.message}</p>
        <p><a href="/" style="color: #693092;">Go to Netopsys Homepage</a></p>
      </div>
    `);
  }
};

/**
 * Public: Verify Email handler
 * GET /api/subscribers/verify?type=blog|job&token=...
 */
exports.verifyEmail = async (req, res) => {
  try {
    const { type, token } = req.query;
    const result = await subscriberService.verifyEmail(type || "blog", token);
    return res.status(200).send(`
      <div style="font-family: sans-serif; text-align: center; padding: 50px;">
        <h2>Email Verified Successfully!</h2>
        <p>${result.email} is confirmed. Thank you!</p>
        <p><a href="/" style="color: #693092;">Return to Netopsys</a></p>
      </div>
    `);
  } catch (error) {
    return res.status(400).send(`
      <div style="font-family: sans-serif; text-align: center; padding: 50px;">
        <h2>Verification Failed</h2>
        <p>${error.message}</p>
      </div>
    `);
  }
};

/**
 * Admin: Get subscribers list (Blog or Job) with pagination and search
 * GET /api/admin/subscribers?type=blog|job&search=...&page=1&limit=50
 */
exports.getSubscribers = async (req, res) => {
  try {
    const { type = "blog", search = "", page = 1, limit = 50 } = req.query;
    const data = await subscriberService.getSubscribersList({ type, search, page, limit });
    return res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error("Error in getSubscribers:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch subscribers list.",
      error: error.message,
    });
  }
};

/**
 * Admin: Toggle subscriber active/inactive status
 * PATCH /api/admin/subscribers/:type/:id/toggle
 */
exports.toggleSubscriber = async (req, res) => {
  try {
    const { type, id } = req.params;
    const { isActive } = req.body;
    const updated = await subscriberService.toggleSubscriberStatus(type, id, isActive);
    return res.status(200).json({
      success: true,
      message: `Subscriber status updated to ${updated.is_active ? "Active" : "Unsubscribed"}.`,
      data: updated,
    });
  } catch (error) {
    console.error("Error in toggleSubscriber:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to toggle subscriber status.",
      error: error.message,
    });
  }
};

/**
 * Admin: Delete subscriber
 * DELETE /api/admin/subscribers/:type/:id
 */
exports.deleteSubscriber = async (req, res) => {
  try {
    const { type, id } = req.params;
    await subscriberService.deleteSubscriber(type, id);
    return res.status(200).json({
      success: true,
      message: "Subscriber removed successfully.",
    });
  } catch (error) {
    console.error("Error in deleteSubscriber:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete subscriber.",
      error: error.message,
    });
  }
};

/**
 * Admin: Get aggregated statistics
 * GET /api/admin/subscribers/stats
 */
exports.getStats = async (req, res) => {
  try {
    const stats = await subscriberService.getSubscriberStats();
    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error in getStats:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve subscriber statistics.",
    });
  }
};

/**
 * Admin: Get email notification logs
 * GET /api/admin/subscribers/logs?page=1&limit=30&search=...&type=...
 */
exports.getNotificationLogs = async (req, res) => {
  try {
    const { page = 1, limit = 30, search = "", type = "" } = req.query;
    const data = await subscriberService.getNotificationLogs({ page, limit, search, type });
    return res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error) {
    console.error("Error in getNotificationLogs:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve notification logs.",
    });
  }
};

/**
 * Admin: Export subscribers list as CSV file
 * GET /api/admin/subscribers/export?type=blog|job
 */
exports.exportSubscribersCsv = async (req, res) => {
  try {
    const { type = "blog" } = req.query;
    const csvContent = await subscriberService.exportSubscribersCsv(type);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="netopsys-${type}-subscribers-${Date.now()}.csv"`
    );
    return res.status(200).send(csvContent);
  } catch (error) {
    console.error("Error exporting subscribers:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to export subscribers CSV.",
    });
  }
};

/**
 * Admin: Send a test notification to an admin-specified email address
 * POST /api/admin/subscribers/test-send
 */
exports.sendTestNotification = async (req, res) => {
  try {
    const { email, type = "blog" } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Recipient email is required for test send.",
      });
    }

    let result;
    if (type === "job") {
      result = await emailService.sendJobWelcomeEmail(email, "test-token");
    } else {
      result = await emailService.sendBlogWelcomeEmail(email, "test-token");
    }

    return res.status(200).json({
      success: true,
      message: `Test email dispatched to ${email}.`,
      result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to dispatch test notification.",
    });
  }
};

