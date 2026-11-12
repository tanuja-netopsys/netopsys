const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma");

const DEFAULT_SUPERADMIN_EMAIL = "superadmin@netopsys.in";
const DEFAULT_SUPERADMIN_PASSWORD = "SuperAdmin@2026";
const DEFAULT_SUPERADMIN_NAME = "Netopsys Super Admin";

/**
 * Returns the configured SuperAdmin credentials from environment variables
 * with fallback defaults.
 */
function getSuperAdminConfig() {
  const email = String(process.env.SUPERADMIN_EMAIL || DEFAULT_SUPERADMIN_EMAIL)
    .trim()
    .toLowerCase();
  const password = String(
    process.env.SUPERADMIN_PASSWORD || DEFAULT_SUPERADMIN_PASSWORD
  );
  const name = String(
    process.env.SUPERADMIN_NAME || DEFAULT_SUPERADMIN_NAME
  ).trim();

  return { email, password, name };
}

/**
 * Ensures the super_admins table matches the configured SUPERADMIN_EMAIL and
 * SUPERADMIN_PASSWORD on server startup so changing either in .env/code
 * updates the database automatically.
 */
async function syncSuperAdminFromConfig() {
  const { email, password, name } = getSuperAdminConfig();
  if (!email || !password) return;

  try {
    let existing = await prisma.superAdmin.findUnique({
      where: { email },
    });

    if (!existing) {
      existing = await prisma.superAdmin.findFirst({
        where: { role: "SUPERADMIN" },
        orderBy: { id: "asc" },
      });
    }

    if (!existing) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      await prisma.superAdmin.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: "SUPERADMIN",
          isActive: true,
        },
      });
      console.log(`SuperAdmin account created for ${email}`);
      return;
    }

    const emailMatches = existing.email.toLowerCase() === email;
    const passwordMatches = await bcrypt.compare(password, existing.password);

    if (emailMatches && passwordMatches && existing.isActive) {
      return;
    }

    const updateData = {
      email,
      isActive: true,
    };

    if (!passwordMatches) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    await prisma.superAdmin.update({
      where: { id: existing.id },
      data: updateData,
    });
    console.log(`SuperAdmin credentials synced for ${email}`);
  } catch (err) {
    console.warn("SuperAdmin config sync skipped:", err.message);
  }
}

module.exports = {
  getSuperAdminConfig,
  syncSuperAdminFromConfig,
};

