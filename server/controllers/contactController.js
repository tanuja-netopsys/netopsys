const prisma = require("../config/prisma");
const { verifyRecaptchaV3Token } = require("../utils/recaptchaVerifier");
const { sendContactEnquiryEmail } = require("../services/emailService");

/**
 * Handle Contact Us Form Submission with Google reCAPTCHA v3 Verification
 * POST /api/contact or POST /api/contact/submit
 */
async function submitContactForm(req, res) {
  try {
    const { fullName, firstName, lastName, email, phone, company, service, message, captchaToken, website } = req.body;

    // 0. Honeypot spam protection check (must stay empty for real users)
    if (website && typeof website === "string" && website.trim().length > 0) {
      return res.status(400).json({
        success: false,
        message: "Spam submission detected.",
      });
    }

    // 1. Validate required fields
    const name = (fullName || `${firstName || ""} ${lastName || ""}`).trim();
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Full Name is required.",
      });
    }

    if (!email || !email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: "Valid email address is required.",
      });
    }

    // 2. Verify reCAPTCHA v3 token (success, action, score >= threshold, hostname)
    const forwardedIp = req.headers["x-forwarded-for"];
    const clientIp =
      (typeof forwardedIp === "string" && forwardedIp.split(",")[0].trim()) ||
      req.ip ||
      req.socket?.remoteAddress;

    const verification = await verifyRecaptchaV3Token({
      token: captchaToken,
      remoteIp: clientIp,
      expectedAction: "contact_form_submit",
    });

    if (!verification.ok) {
      return res.status(verification.status).json({
        success: false,
        message: verification.message,
        errorCodes: verification.errorCodes,
      });
    }

    // 3. reCAPTCHA v3 successfully verified! Save contact submission to database
    let savedSubmission = null;
    const nameParts = name.split(" ");
    const parsedFirstName = nameParts[0] || name;
    const parsedLastName = nameParts.slice(1).join(" ") || "-";

    const projectDetails = [
      service ? `Service Requested: ${service}` : null,
      phone ? `Phone: ${phone}` : null,
      message ? `Message: ${message}` : null,
    ]
      .filter(Boolean)
      .join("\n\n");

    try {
      savedSubmission = await prisma.contact_submissions.create({
        data: {
          first_name: parsedFirstName,
          last_name: parsedLastName,
          email: email.trim(),
          company: company ? company.trim() : null,
          project_details: projectDetails || "No additional project details provided.",
        },
      });

      // Optionally record an admin notification
      await prisma.admin_notifications.create({
        data: {
          type: "NEW_CONTACT_INQUIRY",
          title: "New Contact Inquiry",
          message: `${name} submitted an inquiry for ${service || "General Services"}.`,
        },
      }).catch(() => {
        // notification table optional, ignore error
      });
    } catch (dbErr) {
      console.error("Database save warning for contact inquiry:", dbErr.message);
      // Fallback: If DB had transient issue, submission is still verified and acknowledged
    }

    // 4. Send enquiry notification email from noreply@netopsys.in to connectme@netopsys.in
    const emailResult = await sendContactEnquiryEmail({
      name,
      email: email.trim(),
      phone: phone ? String(phone).trim() : "",
      company: company ? String(company).trim() : "",
      service: service ? String(service).trim() : "",
      message: message ? String(message).trim() : "",
      submissionId: savedSubmission?.id || Date.now(),
    });

    if (!emailResult?.success) {
      console.error("Contact enquiry email dispatch failed:", emailResult?.error);
    }

    return res.status(200).json({
      success: true,
      message: "Your message has been verified and sent successfully! Our team will get back to you shortly.",
      submissionId: savedSubmission?.id || Date.now(),
      emailDelivered: Boolean(emailResult?.success),
    });
  } catch (err) {
    console.error("Contact Form Submission Error:", err);
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred while processing your request. Please try again.",
    });
  }
}

/**
 * Get all contact submissions (for admin view if needed)
 * GET /api/contact
 */
async function getContactSubmissions(req, res) {
  try {
    const submissions = await prisma.contact_submissions.findMany({
      orderBy: { created_at: "desc" },
    });
    return res.json({ success: true, data: submissions });
  } catch (err) {
    console.error("Error fetching contact submissions:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch contact submissions." });
  }
}

module.exports = {
  submitContactForm,
  getContactSubmissions,
};

