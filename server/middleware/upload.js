const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Disk Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const baseName = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, "_");
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${baseName || "upload"}-${uniqueSuffix}${ext}`);
  },
});

// Allowed file types: Images & standard attachments
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/svg+xml",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (allowedMimes.includes(file.mimetype) || file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not supported.`), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB max limit
  },
  fileFilter,
});

/**
 * Utility: Convert a base64 Data URL to a physical file saved into the uploads directory
 * @param {string} base64Str - The data URL (e.g. data:image/png;base64,...)
 * @param {string} prefix - Optional filename prefix (e.g. "project", "team", "blog")
 * @returns {string} - The public relative URL to the saved file (e.g. /uploads/project-12345.png) or original string if not base64
 */
function saveBase64Image(base64Str, prefix = "img") {
  if (!base64Str || typeof base64Str !== "string") {
    return base64Str;
  }

  const matches = base64Str.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    return base64Str; // Return as-is if it's already a URL or standard path
  }

  try {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const mimeType = matches[1];
    const dataBuffer = Buffer.from(matches[2], "base64");

    // Determine extension from mime type
    let ext = ".png";
    if (mimeType.includes("jpeg") || mimeType.includes("jpg")) ext = ".jpg";
    else if (mimeType.includes("webp")) ext = ".webp";
    else if (mimeType.includes("svg")) ext = ".svg";
    else if (mimeType.includes("gif")) ext = ".gif";

    const uniqueName = `${prefix}-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    const filePath = path.join(uploadDir, uniqueName);

    fs.writeFileSync(filePath, dataBuffer);
    return `/uploads/${uniqueName}`;
  } catch (err) {
    console.error("Error saving base64 image to uploads:", err);
    return base64Str;
  }
}

module.exports = {
  upload,
  uploadDir,
  saveBase64Image,
};

