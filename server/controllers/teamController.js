const prisma = require("../config/prisma");
const { saveBase64Image } = require("../middleware/upload");

/**
 * Seed initial team members if database has fewer than 4 members
 */
async function seedDefaultTeamIfEmpty() {
  try {
    const count = await prisma.team_members.count();
    if (count < 4) {
      console.log("Seeding initial team members in database...");

      const initialTeamToSeed = [
        {
          name: "Karthik Reddy",
          role: "Network Engineer",
          image: "/teams/member-1.jpg",
          bio: "Specializes in high-availability enterprise cloud networks, zero-trust perimeter security, and resilient hybrid topologies.",
          is_active: true,
        },
        {
          name: "Sara Johnson",
          role: "Project Manager",
          image: "/teams/member-2.jpg",
          bio: "Oversees cross-functional enterprise agile delivery, sprint orchestration, and client relationship alignment.",
          is_active: true,
        },
        {
          name: "Aarav Mehta",
          role: "AI Engineer",
          image: "/teams/member-3.jpg",
          bio: "Builds deep learning models, LLM retrieval pipelines, and high-throughput real-time inference microservices.",
          is_active: true,
        },
        {
          name: "Priya Nair",
          role: "Machine Learning Lead",
          image: "/teams/member-4.jpg",
          bio: "Leads algorithmic research in computer vision, automated biometric verification, and predictive cognitive systems.",
          is_active: true,
        },
        {
          name: "Daniel Tan",
          role: "Cloud Architect",
          image: "/teams/member-5.jpg",
          bio: "Architects scalable multi-region AWS and Azure microservice backbones with automated disaster recovery.",
          is_active: true,
        },
        {
          name: "Ananya Rao",
          role: "Product Designer",
          image: "/teams/member-6.jpg",
          bio: "Crafts intuitive human-centric digital experiences, enterprise design systems, and fluid motion interactions.",
          is_active: true,
        },
        {
          name: "Rohan Sharma",
          role: "Full-Stack Developer",
          image: "/teams/member-7.jpg",
          bio: "Specializes in high-performance React frontends, robust Node/.NET microservices, and reactive distributed systems.",
          is_active: true,
        },
      ];

      for (const m of initialTeamToSeed) {
        const existing = await prisma.team_members.findFirst({
          where: { name: m.name },
        });
        if (!existing) {
          await prisma.team_members.create({ data: m });
        }
      }
      console.log("Team members seeding complete.");
    }
  } catch (err) {
    console.error("Error seeding default team members:", err.message);
  }
}

// Run check on startup
seedDefaultTeamIfEmpty();

/**
 * Format team member for API consumers
 */
function formatTeamMember(m) {
  if (!m) return null;
  const nameParts = (m.name || "").trim().split(/\s+/);
  const initials =
    nameParts.length >= 2
      ? (nameParts[0][0] + nameParts[1][0]).toUpperCase()
      : (m.name || "TM").slice(0, 2).toUpperCase();

  return {
    id: m.id,
    name: m.name,
    role: m.role,
    image: m.image || "/teams/member-1.jpg",
    bio:
      m.bio ||
      `${m.name} is a dedicated ${m.role} delivering scalable technology solutions.`,
    initials,
    is_active: m.is_active,
    createdAt: m.created_at,
    updatedAt: m.updated_at,
  };
}

/**
 * GET /api/teams & /api/admin/teams
 * Query param: ?all=true returns both active and inactive members
 */
exports.getAllTeamMembers = async (req, res) => {
  try {
    const { all } = req.query;
    const where = all === "true" ? {} : { is_active: true };

    const members = await prisma.team_members.findMany({
      where,
      orderBy: { id: "asc" },
    });

    const formatted = members.map(formatTeamMember);

    return res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (error) {
    console.error("Error in getAllTeamMembers:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch team members.",
      error: error.message,
    });
  }
};

/**
 * GET /api/teams/:id
 */
exports.getTeamMemberById = async (req, res) => {
  try {
    const { id } = req.params;
    const numericId = parseInt(id, 10);

    if (isNaN(numericId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid team member ID.",
      });
    }

    const member = await prisma.team_members.findUnique({
      where: { id: numericId },
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Team member not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: formatTeamMember(member),
    });
  } catch (error) {
    console.error("Error in getTeamMemberById:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch team member.",
      error: error.message,
    });
  }
};

/**
 * POST /api/admin/teams & /api/teams
 */
exports.createTeamMember = async (req, res) => {
  try {
    const { name, role, image, bio } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Member name is required.",
      });
    }

    if (!role || !role.trim()) {
      return res.status(400).json({
        success: false,
        message: "Role is required.",
      });
    }

    if (!image || !image.trim()) {
      return res.status(400).json({
        success: false,
        message: "Profile photo is required.",
      });
    }

    const memberBio =
      bio?.trim() ||
      `${name.trim()} is an experienced ${role.trim()} delivering robust solutions for enterprise clients.`;

    const created = await prisma.team_members.create({
      data: {
        name: name.trim(),
        role: role.trim(),
        image: saveBase64Image(image.trim(), "team"),
        bio: memberBio,
        is_active: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Team member added successfully.",
      data: formatTeamMember(created),
    });
  } catch (error) {
    console.error("Error in createTeamMember:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create team member.",
      error: error.message,
    });
  }
};

/**
 * PUT /api/admin/teams/:id & /api/teams/:id
 */
exports.updateTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    const numericId = parseInt(id, 10);

    if (isNaN(numericId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid team member ID.",
      });
    }

    const existing = await prisma.team_members.findUnique({
      where: { id: numericId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Team member not found.",
      });
    }

    const { name, role, image, bio, is_active } = req.body;

    const updated = await prisma.team_members.update({
      where: { id: numericId },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(role !== undefined && { role: role.trim() }),
        ...(image !== undefined && { image: saveBase64Image(image.trim(), "team") }),
        ...(bio !== undefined && { bio: bio.trim() }),
        ...(is_active !== undefined && { is_active: Boolean(is_active) }),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Team member updated successfully.",
      data: formatTeamMember(updated),
    });
  } catch (error) {
    console.error("Error in updateTeamMember:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update team member.",
      error: error.message,
    });
  }
};

/**
 * DELETE /api/admin/teams/:id & /api/teams/:id
 */
exports.deleteTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    const numericId = parseInt(id, 10);

    if (isNaN(numericId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid team member ID.",
      });
    }

    const existing = await prisma.team_members.findUnique({
      where: { id: numericId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Team member not found.",
      });
    }

    await prisma.team_members.delete({
      where: { id: numericId },
    });

    return res.status(200).json({
      success: true,
      message: "Team member removed successfully.",
    });
  } catch (error) {
    console.error("Error in deleteTeamMember:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete team member.",
      error: error.message,
    });
  }
};

/**
 * PATCH /api/admin/teams/:id/status
 */
exports.toggleTeamMemberStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const numericId = parseInt(id, 10);

    if (isNaN(numericId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid team member ID.",
      });
    }

    const existing = await prisma.team_members.findUnique({
      where: { id: numericId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Team member not found.",
      });
    }

    const updated = await prisma.team_members.update({
      where: { id: numericId },
      data: {
        is_active: !existing.is_active,
      },
    });

    return res.status(200).json({
      success: true,
      message: `Team member ${updated.is_active ? "activated" : "deactivated"} successfully.`,
      data: formatTeamMember(updated),
    });
  } catch (error) {
    console.error("Error in toggleTeamMemberStatus:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update team member status.",
      error: error.message,
    });
  }
};

