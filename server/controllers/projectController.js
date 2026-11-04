const prisma = require("../config/prisma");
const { saveBase64Image } = require("../middleware/upload");

/**
 * Seed initial portfolio projects if database has fewer than 3 projects
 */
async function seedDefaultProjectsIfEmpty() {
  try {
    const count = await prisma.projects.count();
    if (count < 4) {
      console.log("Seeding initial portfolio projects in database...");

      const initialProjectsToSeed = [
        {
          title: "BizOne (Intelligent ERP Solutions)",
          status: "Deployed",
          technologies: [".NET 8", "C#", "Azure Cloud", "Docker", "Microservices", "PowerBI"],
          description:
            "AI-driven Enterprise Resource Planning system that automates business processes, optimizes workflows, and provides intelligent insights.",
          image: "/portfolio/portfolio-2.jpg",
          completion_date: "Oct 2026",
          metrics: [
            { label: "Operational Speed", value: "+40%" },
            { label: "Cost Reduction", value: "32%" },
            { label: "System Uptime", value: "99.98%" },
          ],
          extended_description:
            "Modernized legacy ERP workflows into an intelligent cloud-native ecosystem featuring real-time supply chain forecasting, automated ledger reconciliation, and unified executive performance dashboards.",
          is_active: true,
        },
        {
          title: "Skill Bridge",
          status: "Deployed",
          technologies: [
            "SIEM (Splunk & ELK)",
            "Threat Hunting",
            "Incident Response",
            "Network Defense",
            "Wireshark",
            "EDR / XDR",
          ],
          description:
            "Comprehensive Security Operations Center (SOC) course offering hands-on cyber defense training, SIEM log analysis, threat intelligence, and live incident response drills.",
          image: "/portfolio/portfolio-3.jpg",
          completion_date: "Sep 2026",
          metrics: [
            { label: "Hands-on Lab Hours", value: "120+ hrs" },
            { label: "Threat Scenarios", value: "85+" },
            { label: "Certification Rate", value: "96%" },
          ],
          extended_description:
            "Skill Bridge is an intensive Security Operations Center (SOC) training program designed to equip cybersecurity professionals with real-world defensive skills across enterprise SIEM monitoring, threat detection, incident triage, log forensics, and hands-on defense.",
          is_active: true,
        },
        {
          title: "A Complete AI Secured Candidate Assessment Platform",
          status: "Deployed",
          technologies: ["Computer Vision", "Facial Biometrics", "TensorFlow", "FastAPI", "React", "PostgreSQL"],
          description:
            "Comprehensive AI-powered platform for secure candidate evaluation with advanced proctoring, skill assessment, and automated scoring systems.",
          image: "/portfolio/portfolio-1.jpg",
          completion_date: "Aug 2026",
          metrics: [
            { label: "Proctoring Accuracy", value: "99.4%" },
            { label: "Candidates Evaluated", value: "250K+" },
            { label: "Time Saved", value: "65%" },
          ],
          extended_description:
            "Engineered an enterprise-grade proctoring and assessment platform utilizing computer vision, audio anomaly detection, and automated keystroke biometric scoring to safeguard exam integrity at massive global scale.",
          is_active: true,
        },
      ];

      for (const p of initialProjectsToSeed) {
        const existing = await prisma.projects.findFirst({
          where: { title: p.title },
        });
        if (!existing) {
          await prisma.projects.create({ data: p });
        }
      }
      console.log("Initial portfolio projects seeding complete.");
    }
  } catch (err) {
    console.error("Error seeding default projects:", err.message);
  }
}

// Seed on startup
seedDefaultProjectsIfEmpty();

/**
 * Format project object for API consumers
 */
function formatProject(p) {
  if (!p) return null;
  return {
    id: p.id,
    title: p.title,
    titleLine1: p.title,
    status: p.status || "Deployed",
    technologies: Array.isArray(p.technologies) ? p.technologies : [],
    description: p.description || "",
    image: p.image || "/portfolio/portfolio-1.jpg",
    alt: p.title,
    completionDate: p.completion_date || "Recent",
    metrics: Array.isArray(p.metrics)
      ? p.metrics
      : [
          { label: "Efficiency Gain", value: "+40%" },
          { label: "Accuracy", value: "99%" },
          { label: "Uptime", value: "99.9%" },
        ],
    extendedDescription: p.extended_description || p.description || "",
    is_active: p.is_active,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  };
}

/**
 * GET /api/projects & /api/admin/projects
 * Query: ?all=true returns all projects; otherwise active only
 */
exports.getAllProjects = async (req, res) => {
  try {
    const { all, limit } = req.query;
    const where = all === "true" ? {} : { is_active: true };
    const take = limit ? parseInt(limit, 10) : undefined;

    const dbProjects = await prisma.projects.findMany({
      where,
      orderBy: { id: "desc" },
      ...(take && !isNaN(take) ? { take } : {}),
    });

    const formatted = dbProjects.map(formatProject);

    return res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (error) {
    console.error("Error in getAllProjects:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch projects.",
      error: error.message,
    });
  }
};

/**
 * GET /api/projects/:id
 */
exports.getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const numericId = parseInt(id, 10);

    let project = null;
    if (!isNaN(numericId)) {
      project = await prisma.projects.findUnique({
        where: { id: numericId },
      });
    }

    if (!project) {
      // Try search by title containing search term
      project = await prisma.projects.findFirst({
        where: {
          title: { contains: id, mode: "insensitive" },
        },
      });
    }

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: formatProject(project),
    });
  } catch (error) {
    console.error("Error in getProjectById:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch project details.",
      error: error.message,
    });
  }
};

/**
 * POST /api/admin/projects & /api/projects
 */
exports.createProject = async (req, res) => {
  try {
    const {
      title,
      status,
      technologies,
      description,
      image,
      completionDate,
      completion_date,
      metrics,
      extendedDescription,
      extended_description,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Project title is required.",
      });
    }

    if (!image || !image.trim()) {
      return res.status(400).json({
        success: false,
        message: "Project image is required.",
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: "Project description is required.",
      });
    }

    // Parse technologies
    let techArray = [];
    if (Array.isArray(technologies)) {
      techArray = technologies.map((t) => String(t).trim()).filter(Boolean);
    } else if (typeof technologies === "string") {
      techArray = technologies
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    }
    if (techArray.length === 0) {
      techArray = ["AI & ML", "Cloud", "Full Stack"];
    }

    const savedImage = saveBase64Image(image.trim(), "project");

    const createdProject = await prisma.projects.create({
      data: {
        title: title.trim(),
        status: status?.trim() || "Deployed",
        technologies: techArray,
        description: description.trim(),
        image: savedImage,
        completion_date: (completionDate || completion_date || "Recent").trim(),
        metrics: Array.isArray(metrics) ? metrics : null,
        extended_description: (extendedDescription || extended_description || description).trim(),
        is_active: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Project created successfully.",
      data: formatProject(createdProject),
    });
  } catch (error) {
    console.error("Error in createProject:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create project.",
      error: error.message,
    });
  }
};

/**
 * PUT /api/admin/projects/:id & /api/projects/:id
 */
exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const numericId = parseInt(id, 10);

    if (isNaN(numericId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID.",
      });
    }

    const existing = await prisma.projects.findUnique({
      where: { id: numericId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    const {
      title,
      status,
      technologies,
      description,
      image,
      completionDate,
      completion_date,
      metrics,
      extendedDescription,
      extended_description,
      is_active,
    } = req.body;

    let techArray = undefined;
    if (technologies !== undefined) {
      if (Array.isArray(technologies)) {
        techArray = technologies.map((t) => String(t).trim()).filter(Boolean);
      } else if (typeof technologies === "string") {
        techArray = technologies
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
      }
    }

    const updated = await prisma.projects.update({
      where: { id: numericId },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(status !== undefined && { status: status.trim() }),
        ...(techArray !== undefined && { technologies: techArray }),
        ...(description !== undefined && { description: description.trim() }),
        ...(image !== undefined && { image: saveBase64Image(image.trim(), "project") }),
        ...(completionDate !== undefined && { completion_date: completionDate.trim() }),
        ...(completion_date !== undefined && { completion_date: completion_date.trim() }),
        ...(metrics !== undefined && { metrics }),
        ...(extendedDescription !== undefined && { extended_description: extendedDescription.trim() }),
        ...(extended_description !== undefined && { extended_description: extended_description.trim() }),
        ...(is_active !== undefined && { is_active: Boolean(is_active) }),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Project updated successfully.",
      data: formatProject(updated),
    });
  } catch (error) {
    console.error("Error in updateProject:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update project.",
      error: error.message,
    });
  }
};

/**
 * DELETE /api/admin/projects/:id & /api/projects/:id
 */
exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const numericId = parseInt(id, 10);

    if (isNaN(numericId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID.",
      });
    }

    const existing = await prisma.projects.findUnique({
      where: { id: numericId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    await prisma.projects.delete({
      where: { id: numericId },
    });

    return res.status(200).json({
      success: true,
      message: "Project deleted successfully.",
    });
  } catch (error) {
    console.error("Error in deleteProject:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete project.",
      error: error.message,
    });
  }
};

/**
 * PATCH /api/admin/projects/:id/status
 */
exports.toggleProjectStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const numericId = parseInt(id, 10);

    if (isNaN(numericId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID.",
      });
    }

    const existing = await prisma.projects.findUnique({
      where: { id: numericId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    const updated = await prisma.projects.update({
      where: { id: numericId },
      data: {
        is_active: !existing.is_active,
      },
    });

    return res.status(200).json({
      success: true,
      message: `Project ${updated.is_active ? "activated" : "deactivated"} successfully.`,
      data: formatProject(updated),
    });
  } catch (error) {
    console.error("Error in toggleProjectStatus:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update project status.",
      error: error.message,
    });
  }
};

