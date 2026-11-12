const path = require("path");

// ==========================================
// ENVIRONMENT CONFIGURATION
// ==========================================

// Load environment variables from server/.env.
// Existing Plesk environment variables take priority.
require("dotenv").config({
  path: path.join(__dirname, ".env"),
});

const express = require("express");
const cors = require("cors");
const fs = require("fs");

// ==========================================
// ROUTE IMPORTS
// ==========================================

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const jobRoutes = require("./routes/jobRoutes");
const projectRoutes = require("./routes/projectRoutes");
const teamRoutes = require("./routes/teamRoutes");
const blogRoutes = require("./routes/blogRoutes");
const permissionRoutes = require("./routes/permissionRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const contactRoutes = require("./routes/contactRoutes");
const subscriberRoutes = require("./routes/subscriberRoutes");

const authMiddleware = require("./middleware/auth");
const { requireSuperAdmin } = require("./middleware/auth");

const prisma = require("./config/prisma");
const { syncSuperAdminFromConfig } = require("./config/superadmin");

// ==========================================
// APPLICATION INITIALIZATION
// ==========================================

const app = express();

const PORT = process.env.PORT || 5000;

const isProduction = process.env.NODE_ENV === "production";

// Frontend production build
const clientDistPath = path.resolve(
  __dirname,
  "../client/dist"
);

const clientIndexPath = path.join(
  clientDistPath,
  "index.html"
);

// Uploaded files directory
const uploadsDir = path.join(
  __dirname,
  "uploads"
);

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, {
    recursive: true,
  });
}

// Hide Express technology fingerprint
app.disable("x-powered-by");

// ==========================================
// STARTUP CONFIGURATION LOGS
// ==========================================

console.log("==========================================");
console.log("NETOPSYS SERVER INITIALIZATION");
console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
console.log(`Port: ${PORT}`);
console.log(`Backend: ${__dirname}`);

if (isProduction) {
  console.log(`Frontend: ${clientDistPath}`);

  if (!fs.existsSync(clientIndexPath)) {
    console.error(
      "WARNING: Frontend production build not found:",
      clientIndexPath
    );
  }
} else {
  console.log("Frontend: Vite development server");
  console.log("Expected frontend URL: http://localhost:5173");
}

console.log("==========================================");

// ==========================================
// CORS CONFIGURATION
// ==========================================

const allowedOrigins = [
  "https://netopsys.in",
  "https://www.netopsys.in",
];

// Allow local Vite development
if (!isProduction) {
  allowedOrigins.push(
    "http://localhost:5173",
    "http://127.0.0.1:5173"
  );
}

// Additional trusted origins can be configured
// using CORS_ALLOWED_ORIGINS in the environment.
const additionalOrigins = (
  process.env.CORS_ALLOWED_ORIGINS || ""
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

allowedOrigins.push(...additionalOrigins);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server and non-browser requests
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Reject untrusted browser origins
      return callback(null, false);
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

// ==========================================
// BODY PARSER
// ==========================================

app.use(
  express.json({
    limit: "50mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "50mb",
  })
);

// ==========================================
// STATIC UPLOADS
// ==========================================

// Preserve existing public uploaded-file URLs
app.use(
  "/uploads",
  express.static(uploadsDir)
);

// ==========================================
// DATABASE HEALTH CHECK
// ==========================================

app.get("/api/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return res.status(200).json({
      status: "healthy",
      service: "Netopsys Backend API",
      database: "connected",
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error(
      "Health Check Failed:",
      error
    );

    return res.status(500).json({
      status: "degraded",
      service: "Netopsys Backend API",
      database: "disconnected",

      error: isProduction
        ? "Database connection failed"
        : error.message,
    });
  }
});

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

app.use(
  "/api/auth",
  authRoutes
);

// ==========================================
// PROTECTED ADMIN ROUTES
// ==========================================

app.use(
  "/api/admin/users",
  authMiddleware,
  userRoutes
);

app.use(
  "/api/admin/jobs",
  authMiddleware,
  jobRoutes
);

app.use(
  "/api/admin/projects",
  authMiddleware,
  projectRoutes
);

app.use(
  "/api/admin/teams",
  authMiddleware,
  teamRoutes
);

app.use(
  "/api/admin/blogs",
  authMiddleware,
  blogRoutes
);

app.use(
  "/api/admin/subscribers",
  authMiddleware,
  subscriberRoutes
);

app.use(
  "/api/admin/upload",
  authMiddleware,
  uploadRoutes
);

app.use(
  "/api/admin/permissions",
  authMiddleware,
  permissionRoutes
);

app.use(
  "/api/superadmin/permissions",
  authMiddleware,
  requireSuperAdmin,
  permissionRoutes
);

// ==========================================
// PUBLIC / GENERAL API ROUTES
// ==========================================

app.use("/api/users", userRoutes);

app.use("/api/jobs", jobRoutes);

app.use("/api/projects", projectRoutes);

app.use("/api/teams", teamRoutes);

app.use("/api/blogs", blogRoutes);

app.use("/api/subscribers", subscriberRoutes);

app.use(
  "/api/upload",
  authMiddleware,
  uploadRoutes
);

app.use(
  "/api/permissions",
  authMiddleware,
  permissionRoutes
);

app.use(
  "/api/contact",
  contactRoutes
);

// ==========================================
// API 404 HANDLER
// ==========================================

// Unknown API routes must never return React index.html
app.use("/api", (req, res) => {
  return res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// ==========================================
// LOCAL DEVELOPMENT ROOT
// ==========================================

// In development, Vite serves the frontend separately.
// This root route is only for checking the local backend.

if (!isProduction) {
  app.get("/", (req, res) => {
    return res.status(200).json({
      name: "Netopsys Backend Server",
      status: "running",
      environment: "development",
      frontend: "http://localhost:5173",
      health: "/api/health",
    });
  });
}

// ==========================================
// PRODUCTION FRONTEND SERVING
// ==========================================

// In production, Express serves the Vite build.
// In development, Vite handles all frontend requests.

if (isProduction) {

  const frontendBuildExists = fs.existsSync(
    clientIndexPath
  );

  if (frontendBuildExists) {

    // Serve production frontend assets
    app.use(
      express.static(clientDistPath, {
        index: false,
      })
    );

    // React Router fallback
    // Supports direct access and page refreshes
    app.get("*", (req, res, next) => {

      if (
        req.path === "/uploads" ||
        req.path.startsWith("/uploads/")
      ) {
        return next();
      }

      // Do not return index.html for missing files
      // such as JS, CSS, images and other assets.
      if (path.extname(req.path)) {
        return next();
      }

      return res.sendFile(
        clientIndexPath,
        (error) => {
          if (error) {
            console.error(
              "Frontend delivery error:",
              error
            );

            if (!res.headersSent) {
              return res.status(500).send(
                "Unable to load the frontend application."
              );
            }
          }
        }
      );
    });

  } else {

    // Keep backend APIs available even if frontend
    // production build is temporarily unavailable.
    app.get("*", (req, res, next) => {

      if (
        req.path === "/uploads" ||
        req.path.startsWith("/uploads/") ||
        path.extname(req.path)
      ) {
        return next();
      }

      return res.status(503).send(
        "Frontend production build is unavailable. Please deploy the latest frontend build."
      );
    });
  }
}

// ==========================================
// GENERAL 404 HANDLER
// ==========================================

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.url}`,
  });
});

// ==========================================
// GLOBAL ERROR HANDLER
// ==========================================

app.use((err, req, res, next) => {

  console.error(
    "Unhandled Server Error:",
    err
  );

  if (res.headersSent) {
    return next(err);
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error occurred.",

    error: isProduction
      ? undefined
      : err.message,
  });
});

// ==========================================
// START SERVER
// ==========================================

const server = app.listen(PORT, () => {
  syncSuperAdminFromConfig();

  console.log("==========================================");

  console.log(
    "NETOPSYS APPLICATION STARTED SUCCESSFULLY"
  );

  console.log(`Port: ${PORT}`);

  console.log(
    `Environment: ${process.env.NODE_ENV || "development"}`
  );

  console.log(
    `Backend: ${__dirname}`
  );

  console.log(
    `Frontend Mode: ${isProduction ? "Production Build" : "Vite Development Server"}`
  );

  console.log(
    "API Health: /api/health"
  );

  console.log("==========================================");

});

// ==========================================
// GRACEFUL SHUTDOWN
// ==========================================

let shuttingDown = false;

async function gracefulShutdown(signal) {

  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  console.log(
    `${signal} received. Shutting down application...`
  );

  server.close(async (error) => {

    try {

      if (error) {
        console.error(
          "HTTP server shutdown error:",
          error
        );
      }

      await prisma.$disconnect();

      console.log(
        "Prisma disconnected successfully."
      );

      console.log(
        "Netopsys application stopped."
      );

      process.exit(error ? 1 : 0);

    } catch (shutdownError) {

      console.error(
        "Shutdown error:",
        shutdownError
      );

      process.exit(1);
    }
  });
}

process.on("SIGINT", () => {
  gracefulShutdown("SIGINT");
});

process.on("SIGTERM", () => {
  gracefulShutdown("SIGTERM");
});