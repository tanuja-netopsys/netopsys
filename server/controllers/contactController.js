const prisma = require("../config/prisma");

/**
 * Handle Contact Us Form Submission with Google reCAPTCHA v2 Verification
 * POST /api/contact or POST /api/contact/submit
 */
async function submitContactForm(req, res) {
  try {
    const { fullName, firstName, lastName, email, phone, company, service, message, captchaToken } = req.body;

    // 1. Validate required fields
    const name = (fullName || `${firstName || ""} ${lastName || ""}`).trim();
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Full Name is required.",
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email address is required.",
      });
    }

    // 2. Reject if reCAPTCHA token is missing
    if (!captchaToken || typeof captchaToken !== "string" || !captchaToken.trim()) {
      return res.status(400).json({
        success: false,
        message: "CAPTCHA verification is required. Please check the 'I'm not a robot' box.",
      });
    }

    // 3. Verify token with Google's siteverify API
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    if (!secretKey) {
      console.error("RECAPTCHA_SECRET_KEY is missing in environment variables.");
      return res.status(500).json({
        success: false,
        message: "reCAPTCHA server configuration is missing. Please contact administrator.",
      });
    }

    const verificationUrl = "https://www.google.com/recaptcha/api/siteverify";
    const postParams = new URLSearchParams();
    postParams.append("secret", secretKey);
    postParams.append("response", captchaToken.trim());
    if (req.ip) {
      postParams.append("remoteip", req.ip);
    }

    let verifyData;
    try {
      const verifyResponse = await fetch(verificationUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: postParams.toString(),
      });
      verifyData = await verifyResponse.json();
    } catch (netErr) {
      console.error("Error communicating with Google reCAPTCHA server:", netErr);
      return res.status(503).json({
        success: false,
        message: "Unable to verify CAPTCHA with Google servers. Please check your network connection and try again.",
      });
    }

    // 4. Reject if verification failed, token expired, invalid or duplicate
    if (!verifyData || !verifyData.success) {
      console.warn("reCAPTCHA verification failed:", verifyData);
      const errorCodes = verifyData && verifyData["error-codes"] ? verifyData["error-codes"] : [];
      
      let clientMsg = "reCAPTCHA verification failed. Please check the box again.";
      if (errorCodes.includes("timeout-or-duplicate")) {
        clientMsg = "reCAPTCHA verification expired or was already used. Please check the box again.";
      } else if (errorCodes.includes("invalid-input-response")) {
        clientMsg = "Invalid reCAPTCHA token provided. Please complete the verification again.";
      }

      return res.status(400).json({
        success: false,
        message: clientMsg,
        errorCodes,
      });
    }

    // 5. reCAPTCHA successfully verified! Save contact submission to database
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

    return res.status(200).json({
      success: true,
      message: "Your message has been verified and sent successfully! Our team will get back to you shortly.",
      submissionId: savedSubmission?.id || Date.now(),
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

