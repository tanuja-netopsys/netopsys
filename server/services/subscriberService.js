const crypto = require("crypto");
const prisma = require("../config/prisma");
const emailService = require("./emailService");

/**
 * Auto-initialize subscriber tables on PostgreSQL startup if not present
 */
async function initSubscriberTables() {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS blog_subscribers (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        is_verified BOOLEAN DEFAULT TRUE,
        verification_token VARCHAR(255) UNIQUE,
        unsubscribe_token VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS job_subscribers (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        is_verified BOOLEAN DEFAULT TRUE,
        verification_token VARCHAR(255) UNIQUE,
        unsubscribe_token VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS email_notification_logs (
        id SERIAL PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        content_id VARCHAR(100) NOT NULL,
        content_title VARCHAR(500) NOT NULL,
        recipient_email VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'sent',
        error_message TEXT,
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Indexes for fast lookup
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_email_logs_type_content ON email_notification_logs(type, content_id);
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON email_notification_logs(recipient_email);
    `);

    console.log("✅ Subscriber tables verified/initialized successfully.");
  } catch (err) {
    console.error("Warning initializing subscriber tables:", err.message);
  }
}

// Run on require
initSubscriberTables();

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function generateSecureToken() {
  return crypto.randomBytes(24).toString("hex");
}

/**
 * Subscribe email to Blog Updates
 */
async function subscribeBlog(rawEmail) {
  const email = normalizeEmail(rawEmail);
  if (!email || !isValidEmail(email)) {
    throw new Error("Please enter a valid email address.");
  }

  // 1. Check existing
  const existingRows = await prisma.$queryRawUnsafe(
    `SELECT id, email, is_active, is_verified, unsubscribe_token FROM blog_subscribers WHERE email = $1 LIMIT 1`,
    email
  );

  if (Array.isArray(existingRows) && existingRows.length > 0) {
    const existing = existingRows[0];
    if (existing.is_active) {
      return {
        alreadySubscribed: true,
        message: "You are already subscribed to Netopsys updates!",
        subscriber: existing,
      };
    }

    // Reactivate unsubscribed record
    await prisma.$executeRawUnsafe(
      `UPDATE blog_subscribers SET is_active = true, updated_at = NOW() WHERE id = $1`,
      existing.id
    );

    return {
      reactivated: true,
      message: "Welcome back! Your subscription has been reactivated.",
      subscriber: { ...existing, is_active: true },
    };
  }

  // 2. Create new subscriber
  const verificationToken = generateSecureToken();
  const unsubscribeToken = generateSecureToken();

  const insertResult = await prisma.$queryRawUnsafe(
    `INSERT INTO blog_subscribers (email, is_active, is_verified, verification_token, unsubscribe_token, created_at, updated_at)
     VALUES ($1, true, true, $2, $3, NOW(), NOW())
     RETURNING id, email, is_active, is_verified, unsubscribe_token, created_at`,
    email,
    verificationToken,
    unsubscribeToken
  );

  const subscriber = insertResult[0];

  // 3. Dispatch welcome email in background
  emailService.sendBlogWelcomeEmail(email, unsubscribeToken);

  return {
    alreadySubscribed: false,
    message: "Thank you for subscribing to Netopsys updates!",
    subscriber,
  };
}

/**
 * Subscribe email to Job Alerts
 */
async function subscribeJob(rawEmail) {
  const email = normalizeEmail(rawEmail);
  if (!email || !isValidEmail(email)) {
    throw new Error("Please enter a valid email address.");
  }

  // 1. Check existing
  const existingRows = await prisma.$queryRawUnsafe(
    `SELECT id, email, is_active, is_verified, unsubscribe_token FROM job_subscribers WHERE email = $1 LIMIT 1`,
    email
  );

  if (Array.isArray(existingRows) && existingRows.length > 0) {
    const existing = existingRows[0];
    if (existing.is_active) {
      return {
        alreadySubscribed: true,
        message: "You're already registered for job alerts! We'll notify you when a role opens.",
        subscriber: existing,
      };
    }

    // Reactivate unsubscribed record
    await prisma.$executeRawUnsafe(
      `UPDATE job_subscribers SET is_active = true, updated_at = NOW() WHERE id = $1`,
      existing.id
    );

    return {
      reactivated: true,
      message: "Your job alert subscription has been reactivated successfully.",
      subscriber: { ...existing, is_active: true },
    };
  }

  // 2. Create new subscriber
  const verificationToken = generateSecureToken();
  const unsubscribeToken = generateSecureToken();

  const insertResult = await prisma.$queryRawUnsafe(
    `INSERT INTO job_subscribers (email, is_active, is_verified, verification_token, unsubscribe_token, created_at, updated_at)
     VALUES ($1, true, true, $2, $3, NOW(), NOW())
     RETURNING id, email, is_active, is_verified, unsubscribe_token, created_at`,
    email,
    verificationToken,
    unsubscribeToken
  );

  const subscriber = insertResult[0];

  // 3. Dispatch welcome email in background
  emailService.sendJobWelcomeEmail(email, unsubscribeToken);

  return {
    alreadySubscribed: false,
    message: "Thank you! We'll notify you when a role opens up.",
    subscriber,
  };
}

/**
 * Unsubscribe using 1-click token
 */
async function unsubscribe(type, token) {
  const cleanToken = String(token || "").trim();
  if (!cleanToken || cleanToken === "default") {
    throw new Error("Invalid or missing unsubscribe token.");
  }

  const primaryTable = type === "job" ? "job_subscribers" : "blog_subscribers";
  const secondaryTable = type === "job" ? "blog_subscribers" : "job_subscribers";

  let resolvedTable = primaryTable;
  let rows = await prisma.$queryRawUnsafe(
    `UPDATE ${primaryTable} SET is_active = false, updated_at = NOW() 
     WHERE unsubscribe_token = $1 
     RETURNING id, email, is_active`,
    cleanToken
  );

  if (!Array.isArray(rows) || rows.length === 0) {
    rows = await prisma.$queryRawUnsafe(
      `UPDATE ${secondaryTable} SET is_active = false, updated_at = NOW() 
       WHERE unsubscribe_token = $1 
       RETURNING id, email, is_active`,
      cleanToken
    );
    resolvedTable = secondaryTable;
  }

  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error("Subscriber token not found or invalid.");
  }

  return {
    success: true,
    email: rows[0].email,
    type: resolvedTable === "job_subscribers" ? "Job Alerts" : "Blog Newsletter",
  };
}

/**
 * Verify email using verification token
 */
async function verifyEmail(type, token) {
  if (!token) throw new Error("Invalid or missing verification token.");

  const targetTable = type === "job" ? "job_subscribers" : "blog_subscribers";

  const rows = await prisma.$queryRawUnsafe(
    `UPDATE ${targetTable} SET is_verified = true, updated_at = NOW() 
     WHERE verification_token = $1 
     RETURNING id, email, is_verified`,
    token
  );

  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error("Invalid verification link.");
  }

  return {
    success: true,
    email: rows[0].email,
  };
}

/**
 * Get subscriber list for Admin Portal (supports Blog or Job, search, pagination)
 */
async function getSubscribersList({ type = "blog", search = "", page = 1, limit = 50 }) {
  const targetTable = type === "job" ? "job_subscribers" : "blog_subscribers";
  const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
  const safeLimit = Math.max(1, parseInt(limit, 10));

  let whereClause = "";
  let params = [];

  if (search && search.trim()) {
    whereClause = "WHERE email ILIKE $1";
    params.push(`%${search.trim()}%`);
  }

  const countQuery = `SELECT COUNT(*)::int as total FROM ${targetTable} ${whereClause}`;
  const countRows = await prisma.$queryRawUnsafe(countQuery, ...params);
  const total = countRows[0]?.total || 0;

  const dataQuery = `
    SELECT id, email, is_active, is_verified, created_at, updated_at
    FROM ${targetTable}
    ${whereClause}
    ORDER BY id DESC
    LIMIT ${safeLimit} OFFSET ${offset}
  `;
  const items = await prisma.$queryRawUnsafe(dataQuery, ...params);

  return {
    items: items.map((i) => ({
      id: i.id,
      email: i.email,
      isActive: Boolean(i.is_active),
      isVerified: Boolean(i.is_verified),
      createdAt: i.created_at,
      updatedAt: i.updated_at,
    })),
    total,
    page: parseInt(page, 10),
    limit: safeLimit,
    totalPages: Math.ceil(total / safeLimit) || 1,
  };
}

/**
 * Toggle subscriber active status (for Admin Portal)
 */
async function toggleSubscriberStatus(type, id, newStatus) {
  const targetTable = type === "job" ? "job_subscribers" : "blog_subscribers";
  const numericId = parseInt(id, 10);

  if (newStatus !== undefined) {
    await prisma.$executeRawUnsafe(
      `UPDATE ${targetTable} SET is_active = $1, updated_at = NOW() WHERE id = $2`,
      Boolean(newStatus),
      numericId
    );
  } else {
    await prisma.$executeRawUnsafe(
      `UPDATE ${targetTable} SET is_active = NOT is_active, updated_at = NOW() WHERE id = $1`,
      numericId
    );
  }

  const rows = await prisma.$queryRawUnsafe(
    `SELECT id, email, is_active, is_verified, created_at FROM ${targetTable} WHERE id = $1`,
    numericId
  );
  return rows[0];
}

/**
 * Delete subscriber (for Admin Portal)
 */
async function deleteSubscriber(type, id) {
  const targetTable = type === "job" ? "job_subscribers" : "blog_subscribers";
  const numericId = parseInt(id, 10);
  await prisma.$executeRawUnsafe(`DELETE FROM ${targetTable} WHERE id = $1`, numericId);
  return { success: true };
}

/**
 * Get notification dispatch logs (for Admin Portal)
 */
async function getNotificationLogs({ page = 1, limit = 30, search = "", type = "" }) {
  const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
  const safeLimit = Math.max(1, parseInt(limit, 10));

  const conditions = [];
  const params = [];

  if (type && type !== "all") {
    params.push(type);
    conditions.push(`type = $${params.length}`);
  }

  if (search && search.trim()) {
    params.push(`%${search.trim()}%`);
    conditions.push(`(recipient_email ILIKE $${params.length} OR content_title ILIKE $${params.length})`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const countRows = await prisma.$queryRawUnsafe(
    `SELECT COUNT(*)::int as total FROM email_notification_logs ${whereClause}`,
    ...params
  );
  const total = countRows[0]?.total || 0;

  const logs = await prisma.$queryRawUnsafe(
    `SELECT id, type, content_id, content_title, recipient_email, status, error_message, sent_at
     FROM email_notification_logs
     ${whereClause}
     ORDER BY id DESC
     LIMIT ${safeLimit} OFFSET ${offset}`,
    ...params
  );

  return {
    items: logs.map((l) => ({
      id: l.id,
      type: l.type,
      contentId: l.content_id,
      contentTitle: l.content_title,
      recipientEmail: l.recipient_email,
      status: l.status,
      errorMessage: l.error_message,
      sentAt: l.sent_at,
    })),
    total,
    page: parseInt(page, 10),
    limit: safeLimit,
    totalPages: Math.ceil(total / safeLimit) || 1,
  };
}

/**
 * Get aggregated subscriber statistics for Admin Dashboard
 */
async function getSubscriberStats() {
  try {
    const [blogTotal, blogActive, jobTotal, jobActive, totalLogs] = await Promise.all([
      prisma.$queryRawUnsafe(`SELECT COUNT(*)::int as count FROM blog_subscribers`),
      prisma.$queryRawUnsafe(`SELECT COUNT(*)::int as count FROM blog_subscribers WHERE is_active = true`),
      prisma.$queryRawUnsafe(`SELECT COUNT(*)::int as count FROM job_subscribers`),
      prisma.$queryRawUnsafe(`SELECT COUNT(*)::int as count FROM job_subscribers WHERE is_active = true`),
      prisma.$queryRawUnsafe(`SELECT COUNT(*)::int as count FROM email_notification_logs WHERE status = 'sent'`),
    ]);

    return {
      blogSubscribers: {
        total: blogTotal[0]?.count || 0,
        active: blogActive[0]?.count || 0,
      },
      jobSubscribers: {
        total: jobTotal[0]?.count || 0,
        active: jobActive[0]?.count || 0,
      },
      totalSubscribers: (blogTotal[0]?.count || 0) + (jobTotal[0]?.count || 0),
      totalActiveSubscribers: (blogActive[0]?.count || 0) + (jobActive[0]?.count || 0),
      totalEmailsSent: totalLogs[0]?.count || 0,
    };
  } catch (err) {
    console.error("getSubscriberStats error:", err.message);
    return {
      blogSubscribers: { total: 0, active: 0 },
      jobSubscribers: { total: 0, active: 0 },
      totalSubscribers: 0,
      totalActiveSubscribers: 0,
      totalEmailsSent: 0,
    };
  }
}

/**
 * Export subscribers as CSV string
 */
async function exportSubscribersCsv(type = "blog") {
  const targetTable = type === "job" ? "job_subscribers" : "blog_subscribers";
  const rows = await prisma.$queryRawUnsafe(
    `SELECT id, email, is_active, is_verified, created_at, updated_at
     FROM ${targetTable}
     ORDER BY id ASC`
  );

  const headers = ["ID", "Email", "Status", "Verified", "Subscribed Date", "Last Updated"];
  const lines = [headers.join(",")];

  rows.forEach((r) => {
    const line = [
      r.id,
      `"${r.email}"`,
      r.is_active ? "Active" : "Unsubscribed",
      r.is_verified ? "Verified" : "Pending",
      `"${new Date(r.created_at).toISOString()}"`,
      `"${new Date(r.updated_at).toISOString()}"`,
    ];
    lines.push(line.join(","));
  });

  return lines.join("\n");
}

module.exports = {
  initSubscriberTables,
  subscribeBlog,
  subscribeJob,
  unsubscribe,
  verifyEmail,
  getSubscribersList,
  toggleSubscriberStatus,
  deleteSubscriber,
  getNotificationLogs,
  getSubscriberStats,
  exportSubscribersCsv,
};

