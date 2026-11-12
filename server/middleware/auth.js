const jwt = require("jsonwebtoken");
const { getSuperAdminConfig } = require("../config/superadmin");

/**
 * Standard JWT Authentication Middleware
 * Validates Bearer token from headers and sets req.user
 */
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    let token = null;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.headers["x-auth-token"]) {
      token = req.headers["x-auth-token"];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Authentication token missing.",
      });
    }

    const secret =
      process.env.SESSION_SECRET || "netopsys_secure_jwt_session_secret_2026";
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token.",
      error: error.message,
    });
  }
};

/**
 * Super Admin Authorization Guard
 * Ensures authenticated user has SUPERADMIN privileges
 */
const requireSuperAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Access denied. Authentication required.",
    });
  }

  const role = String(req.user.role || "").toUpperCase();
  const email = String(req.user.email || "").toLowerCase();
  const { email: superAdminEmail } = getSuperAdminConfig();

  const isSuper =
    role === "SUPERADMIN" ||
    role === "SUPER_ADMIN" ||
    email === superAdminEmail;

  if (!isSuper) {
    return res.status(403).json({
      success: false,
      message: "Access forbidden. Super Administrator privilege required.",
    });
  }

  next();
};

module.exports = authMiddleware;
module.exports.authMiddleware = authMiddleware;
module.exports.requireSuperAdmin = requireSuperAdmin;
