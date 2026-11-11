/**
 * Lightweight In-Memory IP Rate Limiting Middleware
 * Protects public contact submission endpoints against automated spam floods.
 */

function createRateLimiter({
  windowMs = 15 * 60 * 1000, // 15 minutes
  maxRequests = 15,
  message = "Too many requests from this IP. Please try again later.",
} = {}) {
  const hits = new Map();

  // Periodic cleanup of expired entries every 10 minutes
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits.entries()) {
      if (now > entry.resetAt) {
        hits.delete(key);
      }
    }
  }, 10 * 60 * 1000);
  if (cleanupTimer.unref) {
    cleanupTimer.unref();
  }

  return function rateLimiter(req, res, next) {
    const forwarded = req.headers["x-forwarded-for"];
    const clientIp =
      (typeof forwarded === "string" && forwarded.split(",")[0].trim()) ||
      req.ip ||
      req.socket?.remoteAddress ||
      "unknown";

    const now = Date.now();
    let entry = hits.get(clientIp);

    if (!entry || now > entry.resetAt) {
      entry = { count: 1, resetAt: now + windowMs };
      hits.set(clientIp, entry);
      return next();
    }

    entry.count += 1;
    if (entry.count > maxRequests) {
      const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);
      res.set("Retry-After", String(retryAfterSeconds));
      return res.status(429).json({
        success: false,
        message,
        retryAfterSeconds,
      });
    }

    return next();
  };
}

const contactRateLimitMax = parseInt(process.env.CONTACT_RATE_LIMIT_MAX || "15", 10);
const contactRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: Number.isFinite(contactRateLimitMax) && contactRateLimitMax > 0 ? contactRateLimitMax : 15,
  message: "Too many contact submissions from this IP. Please wait a few minutes and try again.",
});

module.exports = {
  createRateLimiter,
  contactRateLimiter,
};

