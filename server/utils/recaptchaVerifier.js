/**
 * Google reCAPTCHA v3 Server-Side Verification Utility
 *
 * Supports:
 * 1. Google Cloud CreateAssessment API (when RECAPTCHA_PROJECT_ID and RECAPTCHA_API_KEY are configured)
 * 2. Google reCAPTCHA v3 SiteVerify API (when RECAPTCHA_SECRET_KEY is configured)
 *
 * Validates:
 * - Token presence & validity / success status
 * - Risk score >= RECAPTCHA_SCORE_THRESHOLD (default 0.5)
 * - Action === RECAPTCHA_EXPECTED_ACTION (default "contact_form_submit")
 * - Hostname against allowlist (localhost + configured production domains)
 */

const DEFAULT_SCORE_THRESHOLD = 0.5;
const DEFAULT_EXPECTED_ACTION = "contact_form_submit";

/**
 * Parse allowed hostnames from environment configuration.
 * Supports localhost/127.0.0.1 in development and production domains via env vars.
 */
function getAllowedHostnames() {
  const hostnames = new Set([
    "localhost",
    "127.0.0.1",
    "netopsys.ai",
    "www.netopsys.ai",
    "netopsys.in",
    "www.netopsys.in",
  ]);

  const envList = process.env.RECAPTCHA_ALLOWED_HOSTNAMES;
  if (envList && typeof envList === "string") {
    envList
      .split(",")
      .map((h) => h.trim().toLowerCase())
      .filter(Boolean)
      .forEach((h) => hostnames.add(h));
  }

  if (process.env.FRONTEND_URL) {
    try {
      const parsed = new URL(process.env.FRONTEND_URL);
      if (parsed.hostname) {
        hostnames.add(parsed.hostname.toLowerCase());
      }
    } catch {
      // Ignore malformed FRONTEND_URL
    }
  }

  return hostnames;
}

/**
 * Resolve configurable score threshold (0.0 - 1.0), defaulting to 0.5.
 */
function getScoreThreshold() {
  const raw = parseFloat(process.env.RECAPTCHA_SCORE_THRESHOLD);
  if (Number.isFinite(raw) && raw >= 0 && raw <= 1) {
    return raw;
  }
  return DEFAULT_SCORE_THRESHOLD;
}

/**
 * Resolve expected action name, defaulting to "contact_form_submit".
 */
function getExpectedAction() {
  return (process.env.RECAPTCHA_EXPECTED_ACTION || DEFAULT_EXPECTED_ACTION).trim();
}

/**
 * Verify a reCAPTCHA v3 token via Google Cloud CreateAssessment API.
 * Requires: RECAPTCHA_PROJECT_ID, RECAPTCHA_API_KEY, and RECAPTCHA_SITE_KEY
 */
async function verifyViaCreateAssessment({ token, siteKey, expectedAction, remoteIp }) {
  const projectId = process.env.RECAPTCHA_PROJECT_ID;
  const apiKey = process.env.RECAPTCHA_API_KEY;

  const url = `https://recaptchaenterprise.googleapis.com/v1/projects/${encodeURIComponent(
    projectId
  )}/assessments?key=${encodeURIComponent(apiKey)}`;

  const eventPayload = {
    token,
    siteKey,
    expectedAction,
  };
  if (remoteIp) {
    eventPayload.userIpAddress = remoteIp;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event: eventPayload }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(`CreateAssessment API HTTP ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const tokenProps = data.tokenProperties || {};
  const riskAnalysis = data.riskAnalysis || {};

  return {
    provider: "createAssessment",
    success: Boolean(tokenProps.valid),
    score: typeof riskAnalysis.score === "number" ? riskAnalysis.score : null,
    action: tokenProps.action || null,
    hostname: tokenProps.hostname || null,
    reasons: riskAnalysis.reasons || [],
    errorCodes: tokenProps.invalidReason ? [tokenProps.invalidReason] : [],
  };
}

/**
 * Verify a reCAPTCHA v3 token via Google SiteVerify REST API.
 * Requires: RECAPTCHA_SECRET_KEY
 */
async function verifyViaSiteVerify({ token, remoteIp }) {
  const secretKey =
    process.env.RECAPTCHA_SECRET_KEY || "6Lc2OxkuAAAAALIk4-SeJ89dUb0BKpwVX1Jig1H-";
  const verificationUrl = "https://www.google.com/recaptcha/api/siteverify";

  const postParams = new URLSearchParams();
  postParams.append("secret", secretKey);
  postParams.append("response", token);
  if (remoteIp) {
    postParams.append("remoteip", remoteIp);
  }

  const response = await fetch(verificationUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: postParams.toString(),
  });

  if (!response.ok) {
    throw new Error(`SiteVerify API HTTP ${response.status}`);
  }

  const data = await response.json();

  return {
    provider: "siteverify",
    success: Boolean(data && data.success),
    score: typeof data?.score === "number" ? data.score : null,
    action: data?.action || null,
    hostname: data?.hostname || null,
    reasons: [],
    errorCodes: Array.isArray(data?.["error-codes"]) ? data["error-codes"] : [],
  };
}

/**
 * Verify token and enforce success, action, score threshold, and allowed hostname checks.
 */
async function verifyRecaptchaV3Token({ token, remoteIp, expectedAction: overrideAction }) {
  if (!token || typeof token !== "string" || !token.trim()) {
    return {
      ok: false,
      status: 400,
      message: "reCAPTCHA verification token is missing. Please try submitting again.",
      errorCodes: ["missing-input-response"],
    };
  }

  const cleanToken = token.trim();
  const expectedAction = (overrideAction || getExpectedAction()).trim();
  const scoreThreshold = getScoreThreshold();
  const allowedHostnames = getAllowedHostnames();

  // Allow development/test bypass when dev-token is supplied in non-production
  if (
    process.env.NODE_ENV !== "production" &&
    (cleanToken === "dev-token" || cleanToken === "test-recaptcha-token")
  ) {
    return {
      ok: true,
      status: 200,
      score: 1.0,
      action: expectedAction,
      hostname: "localhost",
      provider: "dev-bypass",
    };
  }

  const useCreateAssessment = Boolean(
    process.env.RECAPTCHA_PROJECT_ID &&
      process.env.RECAPTCHA_API_KEY &&
      process.env.RECAPTCHA_SITE_KEY
  );
  const useSiteVerify = Boolean(
    process.env.RECAPTCHA_SECRET_KEY || "6Lc2OxkuAAAAALIk4-SeJ89dUb0BKpwVX1Jig1H-"
  );

  if (!useCreateAssessment && !useSiteVerify) {
    console.error("reCAPTCHA server credentials are missing in environment variables.");
    return {
      ok: false,
      status: 500,
      message: "reCAPTCHA server configuration is missing. Please contact administrator.",
      errorCodes: ["missing-server-config"],
    };
  }

  let result;
  try {
    if (useCreateAssessment) {
      result = await verifyViaCreateAssessment({
        token: cleanToken,
        siteKey: process.env.RECAPTCHA_SITE_KEY,
        expectedAction,
        remoteIp,
      });
    } else {
      result = await verifyViaSiteVerify({
        token: cleanToken,
        remoteIp,
      });
    }
  } catch (netErr) {
    console.error("Error communicating with Google reCAPTCHA verification API:", netErr);
    if (process.env.NODE_ENV !== "production") {
      console.warn("[reCAPTCHA] Non-production network fallback allowed.");
      return {
        ok: true,
        status: 200,
        score: 0.9,
        action: expectedAction,
        hostname: "localhost",
        provider: "dev-network-fallback",
      };
    }
    return {
      ok: false,
      status: 503,
      message: "Unable to verify security check with Google servers. Please try again.",
      errorCodes: ["network-error"],
    };
  }

  // 1. Validate token success / validity
  if (!result.success) {
    console.warn("reCAPTCHA v3 token verification failed:", {
      provider: result.provider,
      errorCodes: result.errorCodes,
    });

    let clientMsg = "Security verification failed. Please refresh the page and try again.";
    if (
      result.errorCodes.includes("timeout-or-duplicate") ||
      result.errorCodes.includes("EXPIRED") ||
      result.errorCodes.includes("DUPE")
    ) {
      clientMsg = "Verification token expired or was already used. Please submit the form again.";
    } else if (
      result.errorCodes.includes("invalid-input-response") ||
      result.errorCodes.includes("MALFORMED") ||
      result.errorCodes.includes("INVALID_FORMAT")
    ) {
      clientMsg = "Invalid security token received. Please try submitting again.";
    }

    return {
      ok: false,
      status: 400,
      message: clientMsg,
      errorCodes: result.errorCodes,
    };
  }

  // 2. Validate expected action
  if (!result.action || result.action !== expectedAction) {
    console.warn("reCAPTCHA v3 action mismatch:", {
      expected: expectedAction,
      received: result.action,
    });
    return {
      ok: false,
      status: 403,
      message: "Security action verification failed. Please submit the form directly from our page.",
      errorCodes: ["action-mismatch"],
    };
  }

  // 3. Validate expected hostname (localhost or configured production domains)
  const receivedHostname = result.hostname ? result.hostname.toLowerCase() : "";
  const isAllowedHost =
    (process.env.NODE_ENV !== "production" && !receivedHostname) ||
    allowedHostnames.has(receivedHostname) ||
    receivedHostname.endsWith(".netopsys.ai") ||
    receivedHostname.endsWith(".netopsys.in") ||
    receivedHostname.endsWith(".vercel.app");

  if (!isAllowedHost) {
    console.warn("reCAPTCHA v3 hostname mismatch:", {
      received: receivedHostname,
      allowed: Array.from(allowedHostnames),
    });
    return {
      ok: false,
      status: 403,
      message: "Request origin hostname is not authorized for this form.",
      errorCodes: ["hostname-mismatch"],
    };
  }

  // 4. Validate risk score against configurable threshold (default 0.5)
  if (typeof result.score !== "number" || result.score < scoreThreshold) {
    console.warn("reCAPTCHA v3 score below threshold:", {
      score: result.score,
      threshold: scoreThreshold,
      reasons: result.reasons,
    });
    return {
      ok: false,
      status: 403,
      message: "Your submission could not pass automated spam protection. Please try again shortly.",
      errorCodes: ["low-score"],
      score: result.score,
    };
  }

  return {
    ok: true,
    status: 200,
    score: result.score,
    action: result.action,
    hostname: result.hostname,
    provider: result.provider,
  };
}

module.exports = {
  verifyRecaptchaV3Token,
  getAllowedHostnames,
  getScoreThreshold,
  getExpectedAction,
};

