const crypto = require("crypto");
const nodemailer = require("nodemailer");
const prisma = require("../config/prisma");

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const EMAIL_FROM = process.env.EMAIL_FROM || "Netopsys AI <helpdesk@netopsys.net>";
const FRONTEND_URL = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/+$/, "");
const BACKEND_URL = (process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`).replace(/\/+$/, "");

// Optional direct SMTP configuration for helpdesk@netopsys.net
const SMTP_HOST = process.env.SMTP_HOST || "";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587", 10);
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const SMTP_SECURE = process.env.SMTP_SECURE === "true" || SMTP_PORT === 465;

let smtpTransporter = null;
if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
  try {
    smtpTransporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
    console.log(`📧 SMTP Transporter initialized for ${SMTP_USER} via ${SMTP_HOST}:${SMTP_PORT}`);
  } catch (err) {
    console.error("Failed to initialize SMTP Transporter:", err.message);
  }
}

/**
 * Send email via SMTP or Resend API
 * If no valid credentials are present, logs safely to console and records in DB.
 */
async function sendRawEmail({ to, subject, html, replyTo }) {
  const replyToAddress = replyTo || "helpdesk@netopsys.net";
  const recipientList = Array.isArray(to) ? to : [to];

  // 1. Prioritize direct SMTP if configured
  if (smtpTransporter) {
    try {
      const info = await smtpTransporter.sendMail({
        from: EMAIL_FROM,
        to: recipientList.join(", "),
        subject,
        html,
        replyTo: replyToAddress,
      });
      console.log(`✅ [LIVE SMTP EMAIL DELIVERED] to ${recipientList.join(", ")} (ID: ${info.messageId})`);
      return { success: true, id: info.messageId };
    } catch (err) {
      console.error(`❌ SMTP dispatch failed to ${recipientList.join(", ")}:`, err.message);
      return { success: false, error: err.message };
    }
  }

  // 2. Check Resend API key
  const hasLiveResendKey = RESEND_API_KEY && !RESEND_API_KEY.includes("placeholder") && !RESEND_API_KEY.includes("demo");

  if (!hasLiveResendKey) {
    console.log("=================================================");
    console.log(`⚠️  [MOCK EMAIL DISPATCH - NO EMAIL DELIVERED]`);
    console.log(`   To:      ${recipientList.join(", ")}`);
    console.log(`   From:    ${EMAIL_FROM}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Reason:  No live email credentials in .env.`);
    console.log(`   👉 Set SMTP (SMTP_HOST, SMTP_USER, SMTP_PASS) OR RESEND_API_KEY in server/.env`);
    console.log("=================================================");
    return {
      success: true,
      id: `mock-email-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      mock: true,
    };
  }

  // 3. Dispatch via Resend API
  try {
    const payload = {
      from: EMAIL_FROM,
      to: recipientList,
      subject,
      html,
      reply_to: replyToAddress,
    };

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      const errMsg = data?.message || `HTTP ${response.status}: Failed to send email`;
      console.error("Resend API error:", errMsg);
      return { success: false, error: errMsg };
    }

    console.log(`✅ [LIVE RESEND EMAIL DELIVERED] to ${recipientList.join(", ")} (ID: ${data.id})`);
    return { success: true, id: data.id };
  } catch (err) {
    console.error("Error communicating with Resend API:", err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Record an email notification attempt into email_notification_logs
 */
async function recordNotificationLog({ type, contentId, contentTitle, recipientEmail, status, errorMessage }) {
  try {
    await prisma.$executeRawUnsafe(
      `INSERT INTO email_notification_logs (type, content_id, content_title, recipient_email, status, error_message, sent_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      type,
      String(contentId),
      contentTitle,
      recipientEmail,
      status,
      errorMessage || null
    );
  } catch (err) {
    console.error("Failed to write to email_notification_logs:", err.message);
  }
}

/**
 * Check if a recipient has already received a notification for specific content
 */
async function hasAlreadyReceivedNotification(type, contentId, recipientEmail) {
  try {
    const rows = await prisma.$queryRawUnsafe(
      `SELECT id FROM email_notification_logs 
       WHERE type = $1 AND content_id = $2 AND recipient_email = $3 AND status = 'sent' 
       LIMIT 1`,
      type,
      String(contentId),
      recipientEmail
    );
    return Array.isArray(rows) && rows.length > 0;
  } catch {
    return false;
  }
}

/**
 * HTML Template: Welcome to Blog Updates
 */
function getBlogWelcomeHtml({ unsubscribeToken }) {
  const unsubUrl = `${BACKEND_URL}/api/subscribers/unsubscribe?type=blog&token=${unsubscribeToken}`;
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #FAF7FC; margin: 0; padding: 24px; color: #141010; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #ECE4F2; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(105, 48, 146, 0.05); }
    .header { background: linear-gradient(135deg, #2D1443 0%, #693092 100%); padding: 36px 32px; text-align: center; }
    .header h1 { margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.02em; }
    .header p { margin: 8px 0 0; color: #EEDBFA; font-size: 14px; }
    .body { padding: 36px 32px; font-size: 15px; line-height: 1.6; color: #4A4458; }
    .body strong { color: #141010; }
    .btn { display: inline-block; background: #693092; color: #ffffff !important; padding: 13px 28px; border-radius: 999px; text-decoration: none; font-weight: 600; font-size: 14px; margin-top: 18px; }
    .footer { padding: 24px 32px; background: #FAF7FC; border-top: 1px solid #ECE4F2; font-size: 12px; color: #8C849B; text-align: center; line-height: 1.5; }
    .footer a { color: #693092; text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to Netopsys AI</h1>
      <p>Stay Connected with our latest engineering and AI publications</p>
    </div>
    <div class="body">
      <p>Hello,</p>
      <p>Thank you for subscribing to <strong>Netopsys</strong> publications. You'll now be the first to receive updates on:</p>
      <ul>
        <li>Practical enterprise AI & Agentic automation patterns</li>
        <li>Production MLOps architectures and telemetry</li>
        <li>Conversational ERP systems & Natural Language Processing</li>
      </ul>
      <p style="text-align: center;">
        <a href="${FRONTEND_URL}/blogs" class="btn">Explore Our Articles</a>
      </p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Netopsys Pte. Ltd. All rights reserved.</p>
      <p>You received this email because you subscribed on our website. <a href="${unsubUrl}">Unsubscribe from blog updates</a></p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * HTML Template: Welcome to Careers Job Alerts
 */
function getJobWelcomeHtml({ unsubscribeToken }) {
  const unsubUrl = `${BACKEND_URL}/api/subscribers/unsubscribe?type=job&token=${unsubscribeToken}`;
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #FAF7FC; margin: 0; padding: 24px; color: #141010; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #ECE4F2; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(105, 48, 146, 0.05); }
    .header { background: linear-gradient(135deg, #1e1136 0%, #5D2381 100%); padding: 36px 32px; text-align: center; }
    .header h1 { margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; }
    .header p { margin: 8px 0 0; color: #EEDBFA; font-size: 14px; }
    .body { padding: 36px 32px; font-size: 15px; line-height: 1.6; color: #4A4458; }
    .btn { display: inline-block; background: #5D2381; color: #ffffff !important; padding: 13px 28px; border-radius: 999px; text-decoration: none; font-weight: 600; font-size: 14px; margin-top: 18px; }
    .footer { padding: 24px 32px; background: #FAF7FC; border-top: 1px solid #ECE4F2; font-size: 12px; color: #8C849B; text-align: center; }
    .footer a { color: #5D2381; text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Netopsys Careers Alert</h1>
      <p>Job Notifications Activated</p>
    </div>
    <div class="body">
      <p>Hello,</p>
      <p>Your subscription to <strong>Netopsys Career Notifications</strong> is active. Whenever our talent team publishes a new role matching your interest, you will receive an immediate notification with direct apply details.</p>
      <p style="text-align: center;">
        <a href="${FRONTEND_URL}/careers" class="btn">View Current Openings</a>
      </p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Netopsys. All rights reserved.</p>
      <p><a href="${unsubUrl}">Unsubscribe from job alerts</a></p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * HTML Template: New Blog Published
 */
function getNewBlogPostHtml({ blog, unsubscribeToken }) {
  const articleUrl = `${FRONTEND_URL}/blogs/${blog.slug || blog.id}`;
  const unsubUrl = `${BACKEND_URL}/api/subscribers/unsubscribe?type=blog&token=${unsubscribeToken}`;
  const excerptText = blog.excerpt || "Read the latest engineering insights from the Netopsys team.";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #FAF7FC; margin: 0; padding: 24px; color: #141010; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #ECE4F2; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 24px rgba(105, 48, 146, 0.06); }
    .header { background: linear-gradient(135deg, #1C0F2B 0%, #532076 100%); padding: 36px 32px; text-align: left; }
    .tag { display: inline-block; background: rgba(255, 255, 255, 0.15); color: #ffffff; padding: 4px 12px; border-radius: 999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; }
    .header h1 { margin: 0; color: #ffffff; font-size: 24px; line-height: 1.3; font-weight: 700; }
    .meta { margin-top: 14px; font-size: 12.5px; color: #E2D3EE; display: flex; align-items: center; gap: 8px; }
    .body { padding: 32px; font-size: 15px; line-height: 1.65; color: #4A4458; }
    .excerpt-box { background: #FAF5FD; border-left: 4px solid #693092; padding: 16px 20px; border-radius: 8px; margin: 20px 0; font-size: 14.5px; color: #322A3C; font-style: italic; }
    .cta-row { text-align: center; margin: 30px 0 10px; }
    .btn { display: inline-block; background: #693092; color: #ffffff !important; padding: 14px 34px; border-radius: 999px; text-decoration: none; font-weight: 600; font-size: 14px; box-shadow: 0 4px 12px rgba(105, 48, 146, 0.25); }
    .footer { padding: 24px 32px; background: #FAF7FC; border-top: 1px solid #ECE4F2; font-size: 12px; color: #8C849B; text-align: center; line-height: 1.6; }
    .footer a { color: #693092; text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="tag">${blog.category || "New Article"}</span>
      <h1>${blog.title}</h1>
      <div class="meta">
        <span>By ${blog.author_name || blog.author?.name || "Netopsys Team"}</span>
        <span>•</span>
        <span>${blog.read_time || "5 min read"}</span>
      </div>
    </div>
    <div class="body">
      <p>Hello,</p>
      <p>We've just published a new article on the <strong>Netopsys Engineering & AI Insights</strong> blog:</p>
      <div class="excerpt-box">
        "${excerptText}"
      </div>
      <div class="cta-row">
        <a href="${articleUrl}" class="btn">Read Full Article &rarr;</a>
      </div>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Netopsys. Transforming businesses with cutting-edge AI.</p>
      <p>Sent to active blog subscribers. <a href="${unsubUrl}">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * HTML Template: New Job Posting Published
 */
function getNewJobPostingHtml({ job, unsubscribeToken, subscriberType = "job" }) {
  const jobUrl = `${FRONTEND_URL}/jobdescription?id=${job.job_id || job.id}`;
  const unsubUrl = `${BACKEND_URL}/api/subscribers/unsubscribe?type=${subscriberType}&token=${unsubscribeToken}`;
  const loc = job.location || "Hyderabad / Remote";
  const emp = job.employment_type || "Full Time";
  const exp = job.experience || "1-3 years";
  const summaryText = job.summary || job.description?.slice(0, 200) || "Explore this exciting new opportunity at Netopsys.";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #FAF7FC; margin: 0; padding: 24px; color: #141010; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #ECE4F2; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 24px rgba(93, 35, 129, 0.06); }
    .header { background: linear-gradient(135deg, #1C0F2B 0%, #5D2381 100%); padding: 36px 32px; text-align: left; }
    .badge { display: inline-block; background: #16A34A; color: #ffffff; padding: 4px 12px; border-radius: 999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; }
    .header h1 { margin: 0; color: #ffffff; font-size: 24px; line-height: 1.3; font-weight: 700; }
    .badges-row { margin-top: 14px; }
    .pill { display: inline-block; background: rgba(255, 255, 255, 0.16); color: #ffffff; font-size: 12px; font-weight: 500; padding: 4px 10px; border-radius: 8px; margin-right: 6px; }
    .body { padding: 32px; font-size: 15px; line-height: 1.65; color: #4A4458; }
    .card { background: #FAF7FC; border: 1px solid #ECE4F2; border-radius: 16px; padding: 20px; margin: 20px 0; }
    .cta-row { text-align: center; margin: 30px 0 10px; }
    .btn { display: inline-block; background: #5D2381; color: #ffffff !important; padding: 14px 34px; border-radius: 999px; text-decoration: none; font-weight: 600; font-size: 14px; box-shadow: 0 4px 12px rgba(93, 35, 129, 0.25); }
    .footer { padding: 24px 32px; background: #FAF7FC; border-top: 1px solid #ECE4F2; font-size: 12px; color: #8C849B; text-align: center; line-height: 1.6; }
    .footer a { color: #5D2381; text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="badge">We're Hiring</span>
      <h1>${job.title}</h1>
      <div class="badges-row">
        <span class="pill">${loc}</span>
        <span class="pill">${emp}</span>
        <span class="pill">${exp}</span>
      </div>
    </div>
    <div class="body">
      <p>Hello,</p>
      <p>A new role has just opened up at Netopsys that might be a great match for you:</p>
      <div class="card">
        <h4 style="margin: 0 0 8px; color: #141010; font-size: 16px;">${job.title}</h4>
        <p style="margin: 0; font-size: 13.5px; color: #554E62;">${summaryText}</p>
      </div>
      <div class="cta-row">
        <a href="${jobUrl}" class="btn">View Job &amp; Apply &rarr;</a>
      </div>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Netopsys AI. All rights reserved.</p>
      <p>Sent to active job alert subscribers. <a href="${unsubUrl}">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Dispatch welcome email to new blog subscriber
 */
async function sendBlogWelcomeEmail(email, unsubscribeToken) {
  try {
    const html = getBlogWelcomeHtml({ unsubscribeToken });
    const result = await sendRawEmail({
      to: email,
      subject: "Welcome to Netopsys Publications",
      html,
    });
    await recordNotificationLog({
      type: "welcome_blog",
      contentId: "welcome",
      contentTitle: "Welcome to Netopsys Blog Updates",
      recipientEmail: email,
      status: result.success ? "sent" : "failed",
      errorMessage: result.error,
    });
    return result;
  } catch (err) {
    console.error("sendBlogWelcomeEmail error:", err.message);
  }
}

/**
 * Dispatch welcome email to new job subscriber
 */
async function sendJobWelcomeEmail(email, unsubscribeToken) {
  try {
    const html = getJobWelcomeHtml({ unsubscribeToken });
    const result = await sendRawEmail({
      to: email,
      subject: "Netopsys Careers Alerts Activated",
      html,
    });
    await recordNotificationLog({
      type: "welcome_job",
      contentId: "welcome",
      contentTitle: "Welcome to Netopsys Job Alerts",
      recipientEmail: email,
      status: result.success ? "sent" : "failed",
      errorMessage: result.error,
    });
    return result;
  } catch (err) {
    console.error("sendJobWelcomeEmail error:", err.message);
  }
}

/**
 * Background Broadcast: New Blog Published
 * Sends to all active & verified blog subscribers in batches
 */
async function sendBlogPublishedNotification(blog) {
  // Run asynchronously without blocking HTTP caller
  setImmediate(async () => {
    try {
      console.log(`📡 Triggering blog notification broadcast for Blog ID ${blog.id}: "${blog.title}"`);

      // 1. Fetch active & verified subscribers
      let subscribers = [];
      try {
        subscribers = await prisma.$queryRawUnsafe(
          `SELECT id, email, unsubscribe_token FROM blog_subscribers WHERE is_active = true AND is_verified = true`
        );
      } catch (err) {
        console.error("Failed to query blog_subscribers for broadcast:", err.message);
        return;
      }

      if (!Array.isArray(subscribers) || subscribers.length === 0) {
        console.log("No active blog subscribers found to notify.");
        return;
      }

      console.log(`Found ${subscribers.length} active blog subscriber(s). Starting dispatch from ${EMAIL_FROM}...`);

      // 2. Process in batches of 50
      const BATCH_SIZE = 50;
      let sentCount = 0;
      let skippedCount = 0;

      for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
        const batch = subscribers.slice(i, i + BATCH_SIZE);

        await Promise.all(
          batch.map(async (sub) => {
            // Duplicate prevention check
            const alreadySent = await hasAlreadyReceivedNotification("blog", blog.id, sub.email);
            if (alreadySent) {
              skippedCount++;
              return;
            }

            const html = getNewBlogPostHtml({
              blog,
              unsubscribeToken: sub.unsubscribe_token || "default",
            });

            const res = await sendRawEmail({
              to: sub.email,
              subject: `New from Netopsys: ${blog.title}`,
              html,
              replyTo: "helpdesk@netopsys.net",
            });

            await recordNotificationLog({
              type: "blog",
              contentId: blog.id,
              contentTitle: blog.title,
              recipientEmail: sub.email,
              status: res.success ? "sent" : "failed",
              errorMessage: res.error,
            });

            if (res.success) sentCount++;
          })
        );

        // Rate-limit pause between batches (100ms)
        if (i + BATCH_SIZE < subscribers.length) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      console.log(
        `✅ Blog notification broadcast complete for ID ${blog.id}: ${sentCount} sent, ${skippedCount} skipped (already notified).`
      );
    } catch (err) {
      console.error("Critical error in sendBlogPublishedNotification background task:", err);
    }
  });
}

/**
 * Background Broadcast: New Job Opening Published
 * Sends automatically to both:
 * 1. "Notify Me" person (job subscribers)
 * 2. "Subscribe" person (blog/newsletter subscribers)
 * Sender: helpdesk@netopsys.net
 */
async function sendJobPublishedNotification(job) {
  // Run asynchronously without blocking HTTP caller
  setImmediate(async () => {
    try {
      console.log(`📡 Triggering job notification broadcast for Job Code ${job.job_id || job.id}: "${job.title}"`);

      // 1. Fetch active & verified subscribers from BOTH job_subscribers ("Notify Me") and blog_subscribers ("Subscribe")
      let jobSubs = [];
      let blogSubs = [];
      try {
        const [jobResults, blogResults] = await Promise.all([
          prisma.$queryRawUnsafe(
            `SELECT id, email, unsubscribe_token FROM job_subscribers WHERE is_active = true AND is_verified = true`
          ),
          prisma.$queryRawUnsafe(
            `SELECT id, email, unsubscribe_token FROM blog_subscribers WHERE is_active = true AND is_verified = true`
          ),
        ]);
        jobSubs = Array.isArray(jobResults) ? jobResults : [];
        blogSubs = Array.isArray(blogResults) ? blogResults : [];
      } catch (err) {
        console.error("Failed to query subscribers for job broadcast:", err.message);
        return;
      }

      // Merge and deduplicate by email (job subscribers take precedence for unsub token)
      const subscriberMap = new Map();
      jobSubs.forEach((sub) => {
        if (sub.email) {
          subscriberMap.set(sub.email.toLowerCase().trim(), {
            ...sub,
            sourceType: "job",
          });
        }
      });
      blogSubs.forEach((sub) => {
        if (sub.email) {
          const key = sub.email.toLowerCase().trim();
          if (!subscriberMap.has(key)) {
            subscriberMap.set(key, {
              ...sub,
              sourceType: "blog",
            });
          }
        }
      });

      const subscribers = Array.from(subscriberMap.values());

      if (subscribers.length === 0) {
        console.log("No active subscribers found to notify for new job opening.");
        return;
      }

      console.log(
        `Found ${subscribers.length} total active subscriber(s) (${jobSubs.length} Notify-Me, ${blogSubs.length} Subscribe). Starting dispatch from ${EMAIL_FROM}...`
      );

      // 2. Process in batches of 50
      const BATCH_SIZE = 50;
      let sentCount = 0;
      let skippedCount = 0;
      const jobKey = String(job.job_id || job.id);

      for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
        const batch = subscribers.slice(i, i + BATCH_SIZE);

        await Promise.all(
          batch.map(async (sub) => {
            // Duplicate prevention check
            const alreadySent = await hasAlreadyReceivedNotification("job", jobKey, sub.email);
            if (alreadySent) {
              skippedCount++;
              return;
            }

            const html = getNewJobPostingHtml({
              job,
              unsubscribeToken: sub.unsubscribe_token || "default",
              subscriberType: sub.sourceType || "job",
            });

            const res = await sendRawEmail({
              to: sub.email,
              subject: `We're Hiring: ${job.title} at Netopsys`,
              html,
              replyTo: "helpdesk@netopsys.net",
            });

            await recordNotificationLog({
              type: "job",
              contentId: jobKey,
              contentTitle: job.title,
              recipientEmail: sub.email,
              status: res.success ? "sent" : "failed",
              errorMessage: res.error,
            });

            if (res.success) sentCount++;
          })
        );

        // Rate-limit pause between batches (100ms)
        if (i + BATCH_SIZE < subscribers.length) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      console.log(
        `✅ Job notification broadcast complete for ${jobKey}: ${sentCount} sent, ${skippedCount} skipped (already notified).`
      );
    } catch (err) {
      console.error("Critical error in sendJobPublishedNotification background task:", err);
    }
  });
}

module.exports = {
  sendRawEmail,
  sendBlogWelcomeEmail,
  sendJobWelcomeEmail,
  sendBlogPublishedNotification,
  sendJobPublishedNotification,
  recordNotificationLog,
  hasAlreadyReceivedNotification,
};

