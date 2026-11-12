const prisma = require("../config/prisma");

/**
 * Format DB category row to match frontend CategoryItem shape
 */
function formatCategory(cat) {
  return {
    id: String(cat.id),
    name: cat.name,
    description: cat.description || "No description",
  };
}

/**
 * GET /api/categories & /api/admin/categories
 */
exports.getAllCategories = async (_req, res) => {
  try {
    const categories = await prisma.job_categories.findMany({
      orderBy: { id: "asc" },
    });

    return res.status(200).json({
      success: true,
      data: categories.map(formatCategory),
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories.",
    });
  }
};

/**
 * POST /api/categories & /api/admin/categories
 */
exports.createCategory = async (req, res) => {
  try {
    const trimmedName = typeof req.body?.name === "string" ? req.body.name.trim() : "";
    const description =
      typeof req.body?.description === "string" && req.body.description.trim()
        ? req.body.description.trim()
        : "No description";

    if (!trimmedName) {
      return res.status(400).json({
        success: false,
        message: "Category name is required.",
      });
    }

    const existing = await prisma.job_categories.findFirst({
      where: { name: { equals: trimmedName } },
    });

    if (existing) {
      return res.status(200).json({
        success: true,
        data: formatCategory(existing),
      });
    }

    const created = await prisma.job_categories.create({
      data: {
        name: trimmedName,
        description,
      },
    });

    return res.status(201).json({
      success: true,
      data: formatCategory(created),
    });
  } catch (error) {
    console.error("Error creating category:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create category.",
    });
  }
};

/**
 * DELETE /api/categories/:id & /api/admin/categories/:id
 */
exports.deleteCategory = async (req, res) => {
  try {
    const numericId = Number(req.params.id);
    if (!Number.isInteger(numericId) || numericId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID.",
      });
    }

    await prisma.job_categories.delete({
      where: { id: numericId },
    });

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully.",
    });
  } catch (error) {
    if (error && error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }
    console.error("Error deleting category:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete category.",
    });
  }
};

