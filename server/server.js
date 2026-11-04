require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
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

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads directory exists on server startup
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Enable CORS for client applications
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// Serve static uploaded files so any image in uploads/ is publicly accessible via /uploads/...
app.use("/uploads", express.static(uploadsDir));

// Body Parser Middleware - increase limit for base64 project image uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Health Check Endpoints
app.get("/api/health", async (req, res) => {
  try {
    // Quick DB ping
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: "healthy",
      service: "Netopsys Backend API",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: "degraded",
      service: "Netopsys Backend API",
      database: "disconnected",
      error: error.message,
    });
  }
});

app.get("/", (req, res) => {
  res.json({
    name: "Netopsys Backend Server",
    status: "running",
    version: "1.0.0",
    docs: "/api/health",
  });
});

// Mount Routes
app.use("/api/auth", authRoutes);

// Protected Admin & Super Admin Endpoints (Require valid JWT session token)
app.use("/api/admin/users", authMiddleware, userRoutes);
app.use("/api/admin/jobs", authMiddleware, jobRoutes);
app.use("/api/admin/projects", authMiddleware, projectRoutes);
app.use("/api/admin/teams", authMiddleware, teamRoutes);
app.use("/api/admin/blogs", authMiddleware, blogRoutes);
app.use("/api/admin/subscribers", authMiddleware, subscriberRoutes);
app.use("/api/admin/upload", authMiddleware, uploadRoutes);
app.use("/api/admin/permissions", authMiddleware, permissionRoutes);
app.use("/api/superadmin/permissions", authMiddleware, requireSuperAdmin, permissionRoutes);

// Public / General Endpoints
app.use("/api/users", userRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/subscribers", subscriberRoutes);
app.use("/api/upload", authMiddleware, uploadRoutes);
app.use("/api/permissions", authMiddleware, permissionRoutes);
app.use("/api/contact", contactRoutes);

// Fallback 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.url}`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled Server Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error occurred.",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`==========================================`);
  console.log(`🌐 Netopsys Server running on port ${PORT}`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🔐 SuperAdmin Login API: http://localhost:${PORT}/api/auth/superadmin/login`);
  console.log(`⚡ Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`==========================================`);
});

// Handle graceful shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  console.log("Disconnected Prisma and exiting.");
  process.exit(0);
});

