const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const { upload, uploadDir, saveBase64Image } = require("../middleware/upload");

/**
 * POST /api/upload & /api/admin/upload
 * Supports:
 * 1. Multipart form-data with any field name (file, image, upload, etc.)
 * 2. JSON with { base64: "data:image/...", name: "..." } or { image: "..." }
 */
router.post("/", (req, res) => {
  // If request is json and has base64 data
  if (req.is("application/json") && (req.body?.base64 || req.body?.image)) {
    try {
      const rawData = req.body.base64 || req.body.image;
      const prefix = req.body.prefix || "upload";
      const fileUrl = saveBase64Image(rawData, prefix);

      if (fileUrl && fileUrl.startsWith("/uploads/")) {
        const filename = path.basename(fileUrl);
        return res.status(200).json({
          success: true,
          message: "Base64 image saved successfully to uploads.",
          url: fileUrl,
          imageUrl: fileUrl,
          filename: filename,
        });
      }

      return res.status(400).json({
        success: false,
        message: "Invalid image data format provided.",
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Failed to save base64 image.",
        error: err.message,
      });
    }
  }

  // Handle multipart/form-data via multer
  upload.any()(req, res, (err) => {
    if (err) {
      console.error("Multer upload error:", err);
      return res.status(400).json({
        success: false,
        message: err.message || "Failed to upload file.",
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No file was uploaded in request.",
      });
    }

    const firstFile = req.files[0];
    const fileUrl = `/uploads/${firstFile.filename}`;

    return res.status(200).json({
      success: true,
      message: "File uploaded successfully to uploads folder.",
      url: fileUrl,
      imageUrl: fileUrl,
      filename: firstFile.filename,
      originalName: firstFile.originalname,
      size: firstFile.size,
      mimetype: firstFile.mimetype,
      files: req.files.map((f) => ({
        url: `/uploads/${f.filename}`,
        imageUrl: `/uploads/${f.filename}`,
        filename: f.filename,
        originalName: f.originalname,
        size: f.size,
        mimetype: f.mimetype,
      })),
    });
  });
});

/**
 * GET /api/upload & /api/admin/upload
 * Lists all uploaded files currently residing in the uploads directory
 */
router.get("/", (req, res) => {
  try {
    if (!fs.existsSync(uploadDir)) {
      return res.status(200).json({ success: true, count: 0, files: [] });
    }

    const files = fs.readdirSync(uploadDir).map((filename) => {
      const filePath = path.join(uploadDir, filename);
      const stat = fs.statSync(filePath);
      return {
        filename,
        url: `/uploads/${filename}`,
        imageUrl: `/uploads/${filename}`,
        size: stat.size,
        createdAt: stat.birthtime,
      };
    });

    return res.status(200).json({
      success: true,
      count: files.length,
      files,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to list uploads.",
      error: err.message,
    });
  }
});

/**
 * DELETE /api/upload/:filename & /api/admin/upload/:filename
 * Removes a file from the uploads directory
 */
router.delete("/:filename", (req, res) => {
  try {
    const filename = path.basename(req.params.filename);
    const filePath = path.join(uploadDir, filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return res.status(200).json({
        success: true,
        message: `File ${filename} deleted successfully from uploads.`,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "File not found in uploads directory.",
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete file from uploads.",
      error: err.message,
    });
  }
});

module.exports = router;

