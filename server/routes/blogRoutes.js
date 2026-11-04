const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blogController");

// Public & Admin Routes for Blogs
router.get("/", blogController.getAllBlogs);
router.get("/:idOrSlug", blogController.getBlogByIdOrSlug);
router.post("/", blogController.createBlog);
router.put("/:id", blogController.updateBlog);
router.delete("/:id", blogController.deleteBlog);
router.patch("/:id/status", blogController.toggleBlogStatus);

module.exports = router;

