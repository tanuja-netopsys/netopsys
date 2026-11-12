require("dotenv").config();
const bcrypt = require("bcryptjs");
const prisma = require("./config/prisma");
const { getSuperAdminConfig } = require("./config/superadmin");

async function seedSuperAdmins() {
  console.log("==========================================");
  console.log("🚀 Starting Netopsys Database Seeding...");
  console.log("==========================================");

  // Default credentials from config/.env or CLI arguments
  const superAdminConfig = getSuperAdminConfig();
  const customEmail = process.argv[2];
  const customPassword = process.argv[3];

  const adminsToSeed = [
    {
      email: customEmail || superAdminConfig.email,
      password: customPassword || superAdminConfig.password,
      name: superAdminConfig.name,
      role: "SUPERADMIN",
    },
    {
      email: "admin@netopsys.in",
      password: "Admin@2026",
      name: "Admin User",
      role: "ADMIN",
    },
  ];

  try {
    for (const admin of adminsToSeed) {
      const normalizedEmail = admin.email.trim().toLowerCase();
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(admin.password, salt);

      const record = await prisma.superAdmin.upsert({
        where: { email: normalizedEmail },
        update: {
          password: hashedPassword,
          name: admin.name,
          role: admin.role,
          isActive: true,
        },
        create: {
          email: normalizedEmail,
          password: hashedPassword,
          name: admin.name,
          role: admin.role,
          isActive: true,
        },
      });

      console.log(`✅ Seeded SuperAdmin Account:`);
      console.log(`   - ID:       ${record.id}`);
      console.log(`   - Name:     ${record.name}`);
      console.log(`   - Email:    ${record.email}`);
      console.log(`   - Password: ${admin.password}`);
      console.log(`   - Role:     ${record.role}`);
      console.log("------------------------------------------");
    }

    console.log("✨ Seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error while seeding database:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedSuperAdmins();

