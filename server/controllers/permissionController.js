const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");

// System-defined admin portal pages / modules
const ADMIN_PORTAL_PAGES = [
  {
    id: "dashboard",
    name: "Dashboard",
    path: "/admin/dashboard",
    category: "Overview & Analytics",
    description: "Executive recruitment statistics, applicant flow charts, interview round metrics, and high-level KPIs.",
    defaultAccess: {
      SUPERADMIN: true,
      ADMIN: true,
      HR_ADMIN: true,
      CONTENT_MANAGER: true,
      INTERVIEWER: true,
      SUB_ADMIN: true,
    },
    actions: ["view"],
  },
  {
    id: "job-postings",
    name: "Job Postings",
    path: "/admin/job-postings",
    category: "Careers & Hiring",
    description: "Manage career opportunities, job requisitions, requirements, and active/inactive employment listings.",
    defaultAccess: {
      SUPERADMIN: true,
      ADMIN: true,
      HR_ADMIN: true,
      CONTENT_MANAGER: false,
      INTERVIEWER: false,
      SUB_ADMIN: true,
    },
    actions: ["view", "create", "edit", "delete"],
  },
  {
    id: "categories",
    name: "Job Categories",
    path: "/admin/category",
    category: "Careers & Hiring",
    description: "Manage recruitment departments, technical domains, and employment classification tags.",
    defaultAccess: {
      SUPERADMIN: true,
      ADMIN: true,
      HR_ADMIN: true,
      CONTENT_MANAGER: false,
      INTERVIEWER: false,
      SUB_ADMIN: false,
    },
    actions: ["view", "create", "edit", "delete"],
  },
  {
    id: "applications",
    name: "Candidate Applications",
    path: "/admin/applications",
    category: "Recruitment Pipeline",
    description: "Review applicant profiles, screening statuses, resumes, and candidate evaluations.",
    defaultAccess: {
      SUPERADMIN: true,
      ADMIN: true,
      HR_ADMIN: true,
      CONTENT_MANAGER: false,
      INTERVIEWER: true,
      SUB_ADMIN: true,
    },
    actions: ["view", "create", "edit", "delete"],
  },
  {
    id: "users",
    name: "Users Management",
    path: "/admin/users",
    category: "Recruitment Pipeline",
    description: "Manage registered candidates, user verification statuses, profiles, and candidate accounts.",
    defaultAccess: {
      SUPERADMIN: true,
      ADMIN: true,
      HR_ADMIN: true,
      CONTENT_MANAGER: false,
      INTERVIEWER: false,
      SUB_ADMIN: false,
    },
    actions: ["view", "edit", "delete"],
  },
  {
    id: "interview-slots",
    name: "Interview Slots",
    path: "/admin/interview-slots",
    category: "Scheduling & Evaluation",
    description: "Configure interview time slots, booking calendars, and interviewer availability.",
    defaultAccess: {
      SUPERADMIN: true,
      ADMIN: true,
      HR_ADMIN: true,
      CONTENT_MANAGER: false,
      INTERVIEWER: true,
      SUB_ADMIN: false,
    },
    actions: ["view", "create", "edit", "delete"],
  },
  {
    id: "blogs",
    name: "Blogs",
    path: "/admin/blogs",
    category: "Content & Editorial",
    description: "Publish, edit, and manage thought leadership articles and engineering publications.",
    defaultAccess: {
      SUPERADMIN: true,
      ADMIN: true,
      HR_ADMIN: false,
      CONTENT_MANAGER: true,
      INTERVIEWER: false,
      SUB_ADMIN: false,
    },
    actions: ["view", "create", "edit", "delete"],
  },
  {
    id: "portfolio",
    name: "Portfolio Projects",
    path: "/admin/portfolio",
    category: "Content & Editorial",
    description: "Curate deployed enterprise solutions, case studies, and engineering showcase items.",
    defaultAccess: {
      SUPERADMIN: true,
      ADMIN: true,
      HR_ADMIN: false,
      CONTENT_MANAGER: true,
      INTERVIEWER: false,
      SUB_ADMIN: false,
    },
    actions: ["view", "create", "edit", "delete"],
  },
  {
    id: "team",
    name: "Team",
    path: "/admin/team",
    category: "Content & Editorial",
    description: "Showcase leadership, executives, advisory board, and key engineering staff on public site.",
    defaultAccess: {
      SUPERADMIN: true,
      ADMIN: true,
      HR_ADMIN: true,
      CONTENT_MANAGER: true,
      INTERVIEWER: false,
      SUB_ADMIN: false,
    },
    actions: ["view", "create", "edit", "delete"],
  },
  {
    id: "contact-leads",
    name: "Contact Inquiries",
    path: "/admin/contact-leads",
    category: "Client Engagement",
    description: "Review incoming partnership requests, prospective client project briefs, and inquiries.",
    defaultAccess: {
      SUPERADMIN: true,
      ADMIN: true,
      HR_ADMIN: false,
      CONTENT_MANAGER: true,
      INTERVIEWER: false,
      SUB_ADMIN: false,
    },
    actions: ["view", "delete"],
  },
  {
    id: "settings",
    name: "System Settings",
    path: "/admin/settings",
    category: "Administration",
    description: "Configure system policies, application parameters, security credentials, and platform logs.",
    defaultAccess: {
      SUPERADMIN: true,
      ADMIN: false,
      HR_ADMIN: false,
      CONTENT_MANAGER: false,
      INTERVIEWER: false,
      SUB_ADMIN: false,
    },
    actions: ["view", "edit"],
  },
];

// Default Roles
const DEFAULT_ROLES = [
  {
    id: "SUPERADMIN",
    name: "Super Admin",
    description: "Unrestricted master access across all admin pages, permissions, and system settings.",
    isImmutable: true,
  },
  {
    id: "ADMIN",
    name: "Admin",
    description: "Standard administrator portal account. Super Admin controls which modules are visible.",
    isImmutable: false,
  },
  {
    id: "HR_ADMIN",
    name: "HR & Recruitment Admin",
    description: "Full access to hiring workflows: Job Postings, Categories, Candidate Applications, Users, and Interview Slots.",
    isImmutable: false,
  },
  {
    id: "CONTENT_MANAGER",
    name: "Content & Marketing Manager",
    description: "Access to client-facing editorial portals: Blogs, Portfolio Projects, and Team showcases.",
    isImmutable: false,
  },
  {
    id: "INTERVIEWER",
    name: "Technical Interviewer",
    description: "Access to candidate evaluations: Dashboard metrics, Applications review, and Interview Slot management.",
    isImmutable: false,
  },
  {
    id: "SUB_ADMIN",
    name: "Custom Sub-Admin",
    description: "Custom role with granular per-page permissions assigned by the Super Admin.",
    isImmutable: false,
  },
];

// GET /api/admin/permissions (Fetch dynamic roles, pages, and module permissions from PostgreSQL)
exports.getPermissions = async (req, res) => {
  try {
    // 1. Fetch roles from PostgreSQL
    let roles = [];
    try {
      const roleRows = await prisma.$queryRawUnsafe(
        `SELECT id, name, description, is_immutable AS "isImmutable" FROM roles ORDER BY id ASC;`
      );
      if (roleRows.length > 0) {
        roles = roleRows;
      }
    } catch (e) {
      console.warn("Could not load roles table:", e.message);
    }
    if (roles.length === 0) roles = DEFAULT_ROLES;

    // 2. Fetch role_permissions from PostgreSQL
    const permissionsByRole = {};
    roles.forEach((r) => {
      permissionsByRole[r.id] = {};
      ADMIN_PORTAL_PAGES.forEach((page) => {
        const hasAccess = r.id === "SUPERADMIN" ? true : Boolean(page.defaultAccess[r.id]);
        permissionsByRole[r.id][page.id] = {
          enabled: hasAccess,
          actions: page.actions.reduce((acc, act) => {
            acc[act] = hasAccess;
            return acc;
          }, {}),
        };
      });
    });

    try {
      const rpRows = await prisma.$queryRawUnsafe(
        `SELECT role_id, module_id, can_view, can_create, can_edit, can_delete, enabled FROM role_permissions;`
      );
      rpRows.forEach((rp) => {
        if (!permissionsByRole[rp.role_id]) permissionsByRole[rp.role_id] = {};
        permissionsByRole[rp.role_id][rp.module_id] = {
          enabled: rp.enabled,
          actions: {
            view: rp.can_view,
            create: rp.can_create,
            edit: rp.can_edit,
            delete: rp.can_delete,
          },
        };
      });
    } catch (e) {
      console.warn("Could not load role_permissions:", e.message);
    }

    // 3. Fetch user (admin) dynamic module permissions from PostgreSQL permissions table
    const permissionsByUser = {};
    try {
      const permRows = await prisma.$queryRawUnsafe(
        `SELECT admin_email, module_id, can_view, can_create, can_edit, can_delete, enabled FROM permissions;`
      );
      permRows.forEach((p) => {
        const email = p.admin_email.toLowerCase();
        if (!permissionsByUser[email]) permissionsByUser[email] = {};
        permissionsByUser[email][p.module_id] = {
          enabled: p.enabled,
          actions: {
            view: p.can_view,
            create: p.can_create,
            edit: p.can_edit,
            delete: p.can_delete,
          },
        };
      });
    } catch (e) {
      console.warn("Could not load dynamic admin permissions:", e.message);
    }

    return res.status(200).json({
      success: true,
      roles,
      pages: ADMIN_PORTAL_PAGES,
      permissionsByRole,
      permissionsByUser,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error loading permissions:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load permissions.",
      error: error.message,
    });
  }
};

// POST /api/admin/permissions (Save dynamic module permissions directly into PostgreSQL)
exports.updatePermissions = async (req, res) => {
  try {
    const { email, roleId, permissions, permissionsByRole, permissionsByUser } = req.body;

    // A. Single Admin dynamic module permissions update
    if (email && permissions) {
      const normalizedEmail = String(email).trim().toLowerCase();
      if (normalizedEmail === "superadmin@netopsys.in") {
        return res.status(400).json({
          success: false,
          message: "Super Admin permissions are master protected and cannot be revoked.",
        });
      }

      // Find admin id
      const adminRows = await prisma.$queryRawUnsafe(`SELECT id FROM admins WHERE LOWER(email) = $1 LIMIT 1;`, normalizedEmail);
      const adminId = adminRows.length > 0 ? adminRows[0].id : null;

      for (const [moduleId, perm] of Object.entries(permissions)) {
        const isEnabled = typeof perm === "object" ? Boolean(perm.enabled) : Boolean(perm);
        const canView = isEnabled;
        const canCreate = perm?.actions?.create ?? isEnabled;
        const canEdit = perm?.actions?.edit ?? isEnabled;
        const canDelete = perm?.actions?.delete ?? isEnabled;

        await prisma.$executeRawUnsafe(
          `INSERT INTO permissions (admin_id, admin_email, module_id, can_view, can_create, can_edit, can_delete, enabled, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
           ON CONFLICT (admin_email, module_id) DO UPDATE SET
             can_view = EXCLUDED.can_view,
             can_create = EXCLUDED.can_create,
             can_edit = EXCLUDED.can_edit,
             can_delete = EXCLUDED.can_delete,
             enabled = EXCLUDED.enabled,
             updated_at = NOW();`,
          adminId,
          normalizedEmail,
          moduleId,
          canView,
          canCreate,
          canEdit,
          canDelete,
          isEnabled
        );
      }

      return res.status(200).json({
        success: true,
        message: `Dynamic permissions for administrator "${normalizedEmail}" updated in PostgreSQL!`,
      });
    }

    // B. Role template update
    if (roleId && permissions) {
      if (roleId === "SUPERADMIN") {
        return res.status(400).json({
          success: false,
          message: "Super Admin role permissions are protected.",
        });
      }

      for (const [moduleId, perm] of Object.entries(permissions)) {
        const isEnabled = typeof perm === "object" ? Boolean(perm.enabled) : Boolean(perm);
        await prisma.$executeRawUnsafe(
          `INSERT INTO role_permissions (role_id, module_id, can_view, can_create, can_edit, can_delete, enabled)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (role_id, module_id) DO UPDATE SET
             can_view = EXCLUDED.can_view,
             can_create = EXCLUDED.can_create,
             can_edit = EXCLUDED.can_edit,
             can_delete = EXCLUDED.can_delete,
             enabled = EXCLUDED.enabled;`,
          roleId,
          moduleId,
          isEnabled,
          Boolean(perm?.actions?.create),
          Boolean(perm?.actions?.edit),
          Boolean(perm?.actions?.delete),
          isEnabled
        );
      }

      return res.status(200).json({
        success: true,
        message: `Role "${roleId}" template permissions updated in PostgreSQL!`,
      });
    }

    // C. Batch user permissions
    if (permissionsByUser) {
      for (const [userEmail, perms] of Object.entries(permissionsByUser)) {
        const lower = userEmail.toLowerCase();
        if (lower === "superadmin@netopsys.in") continue;

        const adminRows = await prisma.$queryRawUnsafe(`SELECT id FROM admins WHERE LOWER(email) = $1 LIMIT 1;`, lower);
        const adminId = adminRows.length > 0 ? adminRows[0].id : null;

        for (const [moduleId, perm] of Object.entries(perms)) {
          const isEnabled = typeof perm === "object" ? Boolean(perm.enabled) : Boolean(perm);
          await prisma.$executeRawUnsafe(
            `INSERT INTO permissions (admin_id, admin_email, module_id, can_view, can_create, can_edit, can_delete, enabled, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
             ON CONFLICT (admin_email, module_id) DO UPDATE SET
               can_view = EXCLUDED.can_view,
               can_create = EXCLUDED.can_create,
               can_edit = EXCLUDED.can_edit,
               can_delete = EXCLUDED.can_delete,
               enabled = EXCLUDED.enabled,
               updated_at = NOW();`,
            adminId,
            lower,
            moduleId,
            isEnabled,
            Boolean(perm?.actions?.create),
            Boolean(perm?.actions?.edit),
            Boolean(perm?.actions?.delete),
            isEnabled
          );
        }
      }

      return res.status(200).json({
        success: true,
        message: "All dynamic user permissions persisted successfully to PostgreSQL.",
      });
    }

    return res.status(400).json({
      success: false,
      message: "Invalid permissions payload provided.",
    });
  } catch (error) {
    console.error("Error updating permissions:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update permissions in database.",
      error: error.message,
    });
  }
};

// POST /api/admin/permissions/reset (Reset role permissions to system defaults)
exports.resetPermissions = async (req, res) => {
  try {
    const { roleId } = req.body;
    const targetRoles = roleId && roleId !== "SUPERADMIN" ? [roleId] : DEFAULT_ROLES.map((r) => r.id);

    for (const rId of targetRoles) {
      if (rId === "SUPERADMIN") continue;
      for (const page of ADMIN_PORTAL_PAGES) {
        const hasAccess = Boolean(page.defaultAccess[rId]);
        await prisma.$executeRawUnsafe(
          `INSERT INTO role_permissions (role_id, module_id, can_view, can_create, can_edit, can_delete, enabled)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (role_id, module_id) DO UPDATE SET
             can_view = EXCLUDED.can_view,
             can_create = EXCLUDED.can_create,
             can_edit = EXCLUDED.can_edit,
             can_delete = EXCLUDED.can_delete,
             enabled = EXCLUDED.enabled;`,
          rId,
          page.id,
          hasAccess,
          hasAccess,
          hasAccess,
          hasAccess,
          hasAccess
        );
      }
    }

    return res.status(200).json({
      success: true,
      message: "Role template permissions reset to system defaults in PostgreSQL.",
    });
  } catch (error) {
    console.error("Error resetting permissions:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to reset permissions.",
      error: error.message,
    });
  }
};

// GET /api/admin/permissions/users (List all created administrators from separate `admins` table)
exports.getUsers = async (req, res) => {
  try {
    // Strictly query separate `admins` table. Super Admin is in `super_admins` and NEVER appears here!
    const admins = await prisma.$queryRawUnsafe(
      `SELECT id, name, email, role, is_active AS "isActive", last_login AS "lastLogin", created_at AS "createdAt"
       FROM admins
       ORDER BY id DESC;`
    );

    return res.status(200).json({
      success: true,
      users: admins.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        isActive: Boolean(u.isActive),
        lastLogin: u.lastLogin,
        createdAt: u.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching admin users from database:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load admin users from database.",
      error: error.message,
    });
  }
};

// POST /api/admin/permissions/users (Create New Admin Account into separate `admins` table & dynamic `permissions` table)
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, permissions } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required to create an administrator.",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const cleanRole = String(role || "ADMIN").trim().toUpperCase();
    const cleanName = String(name || "").trim() || "Admin User";

    // Hash password securely with bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(String(password).trim(), salt);

    // Save strictly into separate `admins` table
    const result = await prisma.$queryRawUnsafe(
      `INSERT INTO admins (name, email, password, role, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, true, NOW(), NOW())
       ON CONFLICT (email) DO UPDATE SET
         name = EXCLUDED.name,
         password = EXCLUDED.password,
         role = EXCLUDED.role,
         is_active = true,
         updated_at = NOW()
       RETURNING id, name, email, role, is_active AS "isActive", created_at AS "createdAt";`,
      cleanName,
      normalizedEmail,
      hashedPassword,
      cleanRole
    );

    const newAdmin = result[0];

    // Save dynamic module permissions into `permissions` table
    if (permissions && typeof permissions === "object") {
      for (const [moduleId, perm] of Object.entries(permissions)) {
        const isEnabled = typeof perm === "object" ? Boolean(perm.enabled) : Boolean(perm);
        await prisma.$executeRawUnsafe(
          `INSERT INTO permissions (admin_id, admin_email, module_id, can_view, can_create, can_edit, can_delete, enabled, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
           ON CONFLICT (admin_email, module_id) DO UPDATE SET
             can_view = EXCLUDED.can_view,
             can_create = EXCLUDED.can_create,
             can_edit = EXCLUDED.can_edit,
             can_delete = EXCLUDED.can_delete,
             enabled = EXCLUDED.enabled,
             updated_at = NOW();`,
          newAdmin.id,
          normalizedEmail,
          moduleId,
          isEnabled,
          Boolean(perm?.actions?.create),
          Boolean(perm?.actions?.edit),
          Boolean(perm?.actions?.delete),
          isEnabled
        );
      }
    }

    return res.status(201).json({
      success: true,
      message: `Administrator "${cleanName}" created successfully in admins table!`,
      user: {
        id: newAdmin.id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role,
        isActive: Boolean(newAdmin.isActive),
        createdAt: newAdmin.createdAt,
      },
    });
  } catch (error) {
    console.error("Error creating admin credentials in database:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create administrator account.",
      error: error.message,
    });
  }
};

// PUT /api/admin/permissions/users/:id (Update Admin Account & dynamic `permissions` in PostgreSQL)
exports.updateUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.id || req.body.id, 10);
    const { name, email, password, role, permissions } = req.body;

    let existing = null;
    if (userId) {
      const rows = await prisma.$queryRawUnsafe(`SELECT id, name, email, role, is_active FROM admins WHERE id = $1 LIMIT 1;`, userId);
      if (rows.length > 0) existing = rows[0];
    }
    if (!existing && email) {
      const rows = await prisma.$queryRawUnsafe(`SELECT id, name, email, role, is_active FROM admins WHERE LOWER(email) = $1 LIMIT 1;`, String(email).trim().toLowerCase());
      if (rows.length > 0) existing = rows[0];
    }

    const cleanName = name ? String(name).trim() : (existing ? existing.name : "Administrator");
    const cleanRole = role ? String(role).trim().toUpperCase() : (existing ? existing.role : "ADMIN");
    const userEmail = (existing ? existing.email : (email || "")).trim().toLowerCase();

    if (!userEmail) {
      return res.status(400).json({ success: false, message: "Valid administrator email is required." });
    }

    // Update separate `admins` table
    if (password && String(password).trim().length > 0) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(String(password).trim(), salt);

      await prisma.$executeRawUnsafe(
        `UPDATE admins SET name = $1, role = $2, password = $3, updated_at = NOW() WHERE LOWER(email) = $4;`,
        cleanName,
        cleanRole,
        hashedPassword,
        userEmail
      );
    } else {
      await prisma.$executeRawUnsafe(
        `UPDATE admins SET name = $1, role = $2, updated_at = NOW() WHERE LOWER(email) = $3;`,
        cleanName,
        cleanRole,
        userEmail
      );
    }

    // Update dynamic module permissions in `permissions` table
    if (permissions && typeof permissions === "object") {
      const adminId = existing ? existing.id : null;
      for (const [moduleId, perm] of Object.entries(permissions)) {
        const isEnabled = typeof perm === "object" ? Boolean(perm.enabled) : Boolean(perm);
        await prisma.$executeRawUnsafe(
          `INSERT INTO permissions (admin_id, admin_email, module_id, can_view, can_create, can_edit, can_delete, enabled, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
           ON CONFLICT (admin_email, module_id) DO UPDATE SET
             can_view = EXCLUDED.can_view,
             can_create = EXCLUDED.can_create,
             can_edit = EXCLUDED.can_edit,
             can_delete = EXCLUDED.can_delete,
             enabled = EXCLUDED.enabled,
             updated_at = NOW();`,
          adminId,
          userEmail,
          moduleId,
          isEnabled,
          Boolean(perm?.actions?.create),
          Boolean(perm?.actions?.edit),
          Boolean(perm?.actions?.delete),
          isEnabled
        );
      }
    }

    return res.status(200).json({
      success: true,
      message: `Administrator "${cleanName}" updated successfully in PostgreSQL!`,
      user: {
        id: existing ? existing.id : userId,
        name: cleanName,
        email: userEmail,
        role: cleanRole,
        isActive: existing ? Boolean(existing.is_active) : true,
      },
    });
  } catch (error) {
    console.error("Error updating admin credentials in database:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update administrator account.",
      error: error.message,
    });
  }
};

// DELETE /api/admin/permissions/users/:id (Delete Admin User from `admins` and dynamic `permissions` tables)
exports.deleteUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    if (!userId) {
      return res.status(400).json({ success: false, message: "Invalid administrator ID." });
    }

    const rows = await prisma.$queryRawUnsafe(`SELECT id, email, role FROM admins WHERE id = $1 LIMIT 1;`, userId);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Administrator account not found." });
    }

    const existing = rows[0];

    // Delete dynamic permissions
    await prisma.$executeRawUnsafe(`DELETE FROM permissions WHERE LOWER(admin_email) = $1 OR admin_id = $2;`, existing.email.toLowerCase(), userId);

    // Delete from admins table
    await prisma.$executeRawUnsafe(`DELETE FROM admins WHERE id = $1;`, userId);

    return res.status(200).json({
      success: true,
      message: `Administrator "${existing.email}" deleted successfully.`,
    });
  } catch (error) {
    console.error("Error deleting admin from database:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete administrator account.",
      error: error.message,
    });
  }
};

// POST /api/admin/permissions/roles (Create New Custom Role in PostgreSQL)
exports.createRole = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Role name is required.",
      });
    }

    const cleanName = name.trim();
    const roleId = cleanName.toUpperCase().replace(/[^A-Z0-9]/g, "_");

    await prisma.$executeRawUnsafe(
      `INSERT INTO roles (id, name, description, is_immutable, created_at, updated_at)
       VALUES ($1, $2, $3, false, NOW(), NOW())
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         description = EXCLUDED.description,
         updated_at = NOW();`,
      roleId,
      cleanName,
      description ? description.trim() : `Custom role: ${cleanName}`
    );

    // Seed default role_permissions
    for (const page of ADMIN_PORTAL_PAGES) {
      const hasAccess = Boolean(page.defaultAccess[roleId]);
      await prisma.$executeRawUnsafe(
        `INSERT INTO role_permissions (role_id, module_id, can_view, can_create, can_edit, can_delete, enabled)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (role_id, module_id) DO NOTHING;`,
        roleId,
        page.id,
        hasAccess,
        hasAccess,
        hasAccess,
        hasAccess,
        hasAccess
      );
    }

    return res.status(201).json({
      success: true,
      message: `Role "${cleanName}" created successfully in PostgreSQL!`,
      role: {
        id: roleId,
        name: cleanName,
        description: description ? description.trim() : `Custom role: ${cleanName}`,
        isImmutable: false,
      },
    });
  } catch (error) {
    console.error("Error creating role in database:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create role in database.",
      error: error.message,
    });
  }
};
