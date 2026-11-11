const path = require("path");
const fs = require("fs");

// ==========================================
// ENVIRONMENT CONFIGURATION
// ==========================================

require("dotenv").config({
  path: path.join(__dirname, ".env"),
});

const express = require("express");
const cors = require("cors");

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

// ==========================================
// APPLICATION INITIALIZATION
// ==========================================

const app = express();

const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === "production";

// Frontend production build path
const clientDistPath = path.resolve(
  __dirname,
  "../client/dist"
);

const clientIndexPath = path.join(
  clientDistPath,
  "index.html"
);

// Upload directory
const uploadsDir = path.join(
  __dirname,
  "uploads"
);

// Hide Express fingerprint
app.disable("x-powered-by");

// Create uploads directory if missing
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ==========================================
// CORS CONFIGURATION
// ==========================================

const allowedOrigins = [
  "https://netopsys.in",
  "https://www.netopsys.in",
];

// Allow local frontend development
if (!isProduction) {
  allowedOrigins.push(
    "http://localhost:5173",
    "http://127.0.0.1:5173"
  );
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without browser Origin headers
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Do not grant CORS access to unknown origins
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
// UPLOADED FILES
// ==========================================

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

app.use(
  "/api/users",
  userRoutes
);

app.use(
  "/api/jobs",
  jobRoutes
);

app.use(
  "/api/projects",
  projectRoutes
);

app.use(
  "/api/teams",
  teamRoutes
);

app.use(
  "/api/blogs",
  blogRoutes
);

app.use(
  "/api/subscribers",
  subscriberRoutes
);

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

app.use("/api", (req, res) => {
  return res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// ==========================================
// PRODUCTION FRONTEND CONFIGURATION
// ==========================================

// Only serve the React production build in production.
// During local development, Vite runs separately on port 5173.

if (isProduction) {

  if (fs.existsSync(clientIndexPath)) {

    console.log(
      "Frontend production build detected:",
      clientDistPath
    );

    // Serve Vite production assets
    app.use(
      express.static(clientDistPath, {
        index: false,
      })
    );

    // React Router fallback
    app.get("*", (req, res, next) => {

      // Do not route uploads or file requests to React
      if (
        req.path === "/uploads" ||
        req.path.startsWith("/uploads/") ||
        path.extname(req.path)
      ) {
        return next();
      }

      res.sendFile(
        clientIndexPath,
        (error) => {
          if (error) {
            return next(error);
          }
        }
      );
    });

  } else {

    console.error(
      "ERROR: Frontend production build not found:",
      clientDistPath
    );

    // Prevent silently serving a broken production homepage
    app.get("*", (req, res, next) => {

      if (
        req.path === "/uploads" ||
        req.path.startsWith("/uploads/") ||
        path.extname(req.path)
      ) {
        return next();
      }

      return res.status(503).send(
        "Frontend production build is unavailable."
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

  console.log("==========================================");

  console.log(
    "Netopsys Application Started Successfully"
  );

  console.log(
    `Port: ${PORT}`
  );

  console.log(
    `Environment: ${process.env.NODE_ENV || "development"}`
  );

  console.log(
    `Backend: ${__dirname}`
  );

  if (isProduction) {
    console.log(
      `Frontend: ${clientDistPath}`
    );
  } else {
    console.log(
      "Frontend: Running separately through Vite"
    );
  }

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