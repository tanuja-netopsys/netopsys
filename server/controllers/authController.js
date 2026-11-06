const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");
const emailService = require("../services/emailService");

/**
 * SuperAdmin & Admin Login Handler
 * - SuperAdmin authenticates strictly against super_admins table
 * - Administrators & Sub-Admins authenticate strictly against separate admins table
 * - Module permissions dynamically fetched from permissions table
 */
exports.superAdminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate Input Fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    let account = null;
    let accountType = "ADMIN"; // "SUPERADMIN" | "ADMIN"

    // 2. Check if SuperAdmin in super_admins table
    try {
      const superRows = await prisma.$queryRawUnsafe(
        `SELECT id, name, email, password, role, is_active AS "isActive" FROM super_admins WHERE LOWER(email) = $1 LIMIT 1;`,
        normalizedEmail
      );
      if (superRows.length > 0) {
        account = superRows[0];
        accountType = "SUPERADMIN";
      }
    } catch (e) {
      console.warn("super_admins lookup fallback:", e.message);
    }

    // 3. If not in super_admins, check separate admins table
    if (!account) {
      try {
        const adminRows = await prisma.$queryRawUnsafe(
          `SELECT id, name, email, password, role, is_active AS "isActive" FROM admins WHERE LOWER(email) = $1 LIMIT 1;`,
          normalizedEmail
        );
        if (adminRows.length > 0) {
          account = adminRows[0];
          accountType = "ADMIN";
        }
      } catch (e) {
        console.warn("admins lookup fallback:", e.message);
      }
    }

    // 4. Fallback check in users table
    if (!account) {
      try {
        const userRows = await prisma.$queryRawUnsafe(
          `SELECT id, first_name, last_name, email, password, is_blocked FROM users WHERE LOWER(email) = $1 LIMIT 1;`,
          normalizedEmail
        );
        if (userRows.length > 0 && !userRows[0].is_blocked) {
          account = {
            id: userRows[0].id,
            email: userRows[0].email,
            password: userRows[0].password,
            name: `${userRows[0].first_name || ""} ${userRows[0].last_name || ""}`.trim() || "Admin User",
            role: "ADMIN",
            isActive: true,
          };
          accountType = "ADMIN";
        }
      } catch (e) {
        console.warn("users lookup fallback:", e.message);
      }
    }

    if (!account) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password. Please verify your credentials.",
      });
    }

    // 5. Verify Password Hash using bcrypt
    const isPasswordMatch = await bcrypt.compare(password, account.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password. Please verify your credentials.",
      });
    }

    // 6. Verify Account Status
    if (account.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "This account has been deactivated. Contact administration.",
      });
    }

    // 7. Update Last Login timestamp
    try {
      if (accountType === "SUPERADMIN") {
        await prisma.$executeRawUnsafe(
          `UPDATE super_admins SET last_login = NOW() WHERE id = $1;`,
          account.id
        );
      } else {
        await prisma.$executeRawUnsafe(
          `UPDATE admins SET last_login = NOW() WHERE LOWER(email) = $1;`,
          normalizedEmail
        );
      }
    } catch {}

    // 8. Dynamically Fetch Permissions for this Admin from permissions table
    let permissions = {};
    if (accountType === "ADMIN") {
      try {
        const permRows = await prisma.$queryRawUnsafe(
          `SELECT module_id, can_view, can_create, can_edit, can_delete, enabled 
           FROM permissions 
           WHERE LOWER(admin_email) = $1;`,
          normalizedEmail
        );
        permRows.forEach((p) => {
          permissions[p.module_id] = {
            view: p.can_view,
            create: p.can_create,
            edit: p.can_edit,
            delete: p.can_delete,
            enabled: p.enabled,
          };
        });
      } catch (permErr) {
        console.warn("Could not load dynamic admin permissions:", permErr.message);
      }
    }

    // 9. Generate JWT Session Token
    const resolvedRole = account.role || (accountType === "SUPERADMIN" ? "SUPERADMIN" : "ADMIN");
    const resolvedName = account.name || (accountType === "SUPERADMIN" ? "Netopsys Super Admin" : "Admin User");

    const secret =
      process.env.SESSION_SECRET || "netopsys_secure_jwt_session_secret_2026";
    const token = jwt.sign(
      {
        id: account.id,
        email: account.email,
        name: resolvedName,
        role: resolvedRole,
        accountType,
      },
      secret,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      message: `${resolvedRole === "SUPERADMIN" ? "SuperAdmin" : "Admin"} login successful! Welcome back.`,
      token,
      user: {
        id: account.id,
        email: account.email,
        name: resolvedName,
        role: resolvedRole,
        accountType,
      },
      permissions,
    });
  } catch (error) {
    console.error("Authentication Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "An internal server error occurred during login.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get Authenticated SuperAdmin or Admin Profile
 */
exports.getSuperAdminProfile = async (req, res) => {
  try {
    const userEmail = (req.user && req.user.email ? req.user.email : "").toLowerCase();
    let admin = null;

    // Check super_admins
    try {
      const superRows = await prisma.$queryRawUnsafe(
        `SELECT id, email, name, role, is_active AS "isActive", last_login AS "lastLogin", created_at AS "createdAt" FROM super_admins WHERE LOWER(email) = $1 LIMIT 1;`,
        userEmail
      );
      if (superRows.length > 0) admin = superRows[0];
    } catch {}

    // Check admins
    if (!admin) {
      try {
        const adminRows = await prisma.$queryRawUnsafe(
          `SELECT id, email, name, role, is_active AS "isActive", last_login AS "lastLogin", created_at AS "createdAt" FROM admins WHERE LOWER(email) = $1 LIMIT 1;`,
          userEmail
        );
        if (adminRows.length > 0) admin = adminRows[0];
      } catch {}
    }

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin profile not found.",
      });
    }

    return res.status(200).json({
      success: true,
      user: admin,
    });
  } catch (error) {
    console.error("Profile Fetch Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch admin profile.",
    });
  }
};

/**
 * Candidate / User Register
 */
exports.candidateRegister = async (req, res) => {
  try {
    const { firstName, lastName, email, mobileNumber, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "First name, last name, email, and password are required.",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // Check if user already exists (case-insensitive check)
    const existingUser = await prisma.user.findFirst({
      where: {
        email: {
          equals: normalizedEmail,
          mode: "insensitive",
        },
      },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists. Please sign in.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: normalizedEmail,
        mobileNumber: mobileNumber ? String(mobileNumber).trim() : null,
        password: hashedPassword,
        emailVerified: false,
        isBlocked: false,
      },
    });

    const secret =
      process.env.SESSION_SECRET || "netopsys_secure_jwt_session_secret_2026";
    const token = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
        role: "Candidate",
        name: `${newUser.firstName} ${newUser.lastName}`.trim(),
      },
      secret,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      success: true,
      message: "Account created successfully! Please verify your email before applying for jobs.",
      token,
      user: {
        id: newUser.id,
        name: `${newUser.firstName} ${newUser.lastName}`.trim(),
        email: newUser.email,
        phone: newUser.mobileNumber,
        role: "Candidate",
        registeredDate: new Date().toLocaleDateString("en-GB"),
        verificationStatus: "Unverified",
        isEmailVerified: false,
        accountStatus: "Active",
      },
    });
  } catch (error) {
    console.error("Candidate Registration Error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred during account creation.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Candidate / User Login
 */
exports.candidateLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated. Please contact support.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const secret =
      process.env.SESSION_SECRET || "netopsys_secure_jwt_session_secret_2026";
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: "Candidate",
        name: `${user.firstName} ${user.lastName}`.trim(),
      },
      secret,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "Signed in successfully!",
      token,
      user: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`.trim(),
        email: user.email,
        phone: user.mobileNumber,
        role: "Candidate",
        registeredDate: new Date(user.createdAt).toLocaleDateString("en-GB"),
        verificationStatus: user.emailVerified ? "verified" : "Unverified",
        accountStatus: user.isBlocked ? "Blocked" : "Active",
      },
    });
  } catch (error) {
    console.error("Candidate Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred during sign in.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * SuperAdmin Logout
 */
exports.logout = (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
};

/**
 * Forgot Password - Send OTP to email
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !String(email).trim()) {
      return res.status(400).json({
        success: false,
        isRegistered: false,
        message: "Please enter your email address.",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // 1. Check if email exists in `users` table
    let user = await prisma.user.findFirst({
      where: {
        email: {
          equals: normalizedEmail,
          mode: "insensitive",
        },
      },
    });

    let accountType = "user";

    // 2. Also check `admins` table if applicable
    if (!user) {
      const admin = await prisma.admin.findFirst({
        where: {
          email: {
            equals: normalizedEmail,
            mode: "insensitive",
          },
        },
      });
      if (admin) {
        user = { id: admin.id, email: admin.email, firstName: admin.name };
        accountType = "admin";
      }
    }

    // 3. Also check `super_admins` table if applicable
    if (!user) {
      const superAdmin = await prisma.superAdmin.findFirst({
        where: {
          email: {
            equals: normalizedEmail,
            mode: "insensitive",
          },
        },
      });
      if (superAdmin) {
        user = { id: superAdmin.id, email: superAdmin.email, firstName: superAdmin.name };
        accountType = "superadmin";
      }
    }

    // 4. CRITICAL CHECK: If the email is NOT registered in any account table,
    // immediately halt, DO NOT send any OTP email, and inform the user to register first.
    if (!user) {
      return res.status(404).json({
        success: false,
        isRegistered: false,
        message: "This email is not registered. Please register first.",
      });
    }

    // 5. Email IS registered -> Generate 6-digit OTP code with 15-minute expiration
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 15 * 60 * 1000);

    // Save OTP to database or session cache
    if (accountType === "user") {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetOtp: otp,
          passwordResetOtpExpiry: expiry,
        },
      });
    } else {
      global.__superAdminResetOtps = global.__superAdminResetOtps || {};
      global.__superAdminResetOtps[normalizedEmail] = {
        otp,
        expiry,
        accountType,
        id: user.id,
      };
    }

    // 6. Send OTP email via emailService only for registered users
    await emailService.sendPasswordResetOtpEmail({
      email: normalizedEmail,
      name: user.firstName || "User",
      otp,
    });

    return res.status(200).json({
      success: true,
      isRegistered: true,
      message: `A 6-digit verification code has been sent to ${normalizedEmail}.`,
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send verification code. Please try again later.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Verify Password Reset OTP
 */
exports.verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and verification code are required.",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const cleanOtp = String(otp).trim();

    // Check super admin cache
    if (global.__superAdminResetOtps && global.__superAdminResetOtps[normalizedEmail]) {
      const cached = global.__superAdminResetOtps[normalizedEmail];
      if (cached.otp === cleanOtp && new Date() < cached.expiry) {
        return res.status(200).json({
          success: true,
          message: "Verification code confirmed successfully.",
        });
      }
    }

    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: normalizedEmail,
          mode: "insensitive",
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email address.",
      });
    }

    if (!user.passwordResetOtp || user.passwordResetOtp !== cleanOtp) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code. Please check your email and try again.",
      });
    }

    if (!user.passwordResetOtpExpiry || new Date() > new Date(user.passwordResetOtpExpiry)) {
      return res.status(400).json({
        success: false,
        message: "Verification code has expired. Please request a new one.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Verification code confirmed successfully.",
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify code. Please try again.",
    });
  }
};

/**
 * Reset Password with OTP
 */
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, verification code, and new password are required.",
      });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const cleanOtp = String(otp).trim();

    // 1. Check SuperAdmin in-memory
    let isSuperAdminReset = false;
    if (global.__superAdminResetOtps && global.__superAdminResetOtps[normalizedEmail]) {
      const cached = global.__superAdminResetOtps[normalizedEmail];
      if (cached.otp === cleanOtp && new Date() < cached.expiry) {
        isSuperAdminReset = true;
        delete global.__superAdminResetOtps[normalizedEmail];
      }
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    if (isSuperAdminReset) {
      await prisma.$executeRawUnsafe(
        `UPDATE super_admins SET password = $1, updated_at = NOW() WHERE LOWER(email) = $2`,
        hashedPassword,
        normalizedEmail
      );
      return res.status(200).json({
        success: true,
        message: "Password reset successfully. You can now sign in with your new password.",
      });
    }

    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: normalizedEmail,
          mode: "insensitive",
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email address.",
      });
    }

    if (!user.passwordResetOtp || user.passwordResetOtp !== cleanOtp) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code. Please check your email and try again.",
      });
    }

    if (!user.passwordResetOtpExpiry || new Date() > new Date(user.passwordResetOtpExpiry)) {
      return res.status(400).json({
        success: false,
        message: "Verification code has expired. Please request a new one.",
      });
    }

    // Update password in users table and clear reset OTP
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetOtp: null,
        passwordResetOtpExpiry: null,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Password reset successfully! You can now sign in with your new password.",
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to reset password. Please try again later.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Send Email Verification OTP to Candidate
 */
exports.sendVerificationOtp = async (req, res) => {
  try {
    const email = req.body?.email || req.user?.email;

    if (!email || !String(email).trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: normalizedEmail,
          mode: "insensitive",
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Account not found for this email address.",
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        alreadyVerified: true,
        message: "Your email is already verified.",
      });
    }

    // Generate 6-digit OTP code with 15-minute expiration
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailOtp: otp,
        emailOtpExpiry: expiry,
      },
    });

    // Send email with OTP via emailService
    await emailService.sendEmailVerificationOtpEmail({
      email: normalizedEmail,
      name: user.firstName || "Candidate",
      otp,
    });

    return res.status(200).json({
      success: true,
      message: `A 6-digit verification code has been sent to ${normalizedEmail}.`,
    });
  } catch (error) {
    console.error("Send Verification OTP Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send verification code. Please try again later.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Verify Candidate Email with OTP
 */
exports.verifyEmailOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and verification code are required.",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const cleanOtp = String(otp).trim();

    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: normalizedEmail,
          mode: "insensitive",
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email address.",
      });
    }

    if (user.emailVerified) {
      return res.status(200).json({
        success: true,
        alreadyVerified: true,
        isEmailVerified: true,
        verificationStatus: "verified",
        message: "Your email is already verified.",
      });
    }

    if (!user.emailOtp || user.emailOtp !== cleanOtp) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code. Please check your email and try again.",
      });
    }

    if (!user.emailOtpExpiry || new Date() > new Date(user.emailOtpExpiry)) {
      return res.status(400).json({
        success: false,
        message: "Verification code has expired. Please request a new one.",
      });
    }

    // Successfully verify user in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailOtp: null,
        emailOtpExpiry: null,
      },
    });

    return res.status(200).json({
      success: true,
      isEmailVerified: true,
      verificationStatus: "verified",
      message: "Email successfully verified! You can now apply for open positions.",
    });
  } catch (error) {
    console.error("Verify Email OTP Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify email. Please try again.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

