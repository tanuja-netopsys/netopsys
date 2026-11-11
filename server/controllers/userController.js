const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");

function getInitials(name, email) {
  const clean = String(name || "").trim();
  if (clean) {
    const parts = clean.split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return clean.slice(0, 2).toUpperCase();
  }
  return String(email || "US").slice(0, 2).toUpperCase();
}

function formatDate(date) {
  if (!date) return "N/A";
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Get all registered users from database (strictly unique by email)
 */
exports.getAllUsers = async (req, res) => {
  try {
    const dbUsers = await prisma.user.findMany({
      orderBy: { id: "asc" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        mobileNumber: true,
        emailVerified: true,
        isBlocked: true,
        createdAt: true,
      },
    });

    // Deduplicate by email (case-insensitive & trimmed)
    const seenEmails = new Set();
    const uniqueUsers = [];

    for (const user of dbUsers) {
      const emailKey = String(user.email || "").trim().toLowerCase();
      if (!emailKey) continue;

      if (!seenEmails.has(emailKey)) {
        seenEmails.add(emailKey);
        uniqueUsers.push({
          ...user,
          email: emailKey,
        });
      }
    }

    // Load associated profiles for enriched display (phone, city, title)
    let profileMap = new Map();
    try {
      const profiles = await prisma.user_profiles.findMany();
      for (const p of profiles) {
        profileMap.set(p.user_id, p);
      }
    } catch {
      // ignore if profiles query fails
    }

    const formattedUsers = uniqueUsers.map((user, idx) => {
      const profile = profileMap.get(user.id);
      const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email.split("@")[0];
      return {
        id: `usr-${user.id}`,
        dbId: user.id,
        sNo: idx + 1,
        name: fullName,
        email: user.email,
        initials: getInitials(fullName, user.email),
        registeredDate: formatDate(user.createdAt),
        verificationStatus: user.emailVerified ? "verified" : "Unverified",
        accountStatus: user.isBlocked ? "Blocked" : "Active",
        phone: user.mobileNumber || "N/A",
        city: profile?.city || "",
        address: profile?.address || "",
        role: profile?.current_job_title || "Candidate",
      };
    });

    return res.status(200).json({
      success: true,
      total: formattedUsers.length,
      users: formattedUsers,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch registered users from database.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Toggle block / unblock account status in database
 */
exports.toggleUserStatus = async (req, res) => {
  try {
    const rawId = req.params.id;
    const numericId = parseInt(String(rawId).replace("usr-", ""), 10);

    if (isNaN(numericId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID provided.",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: numericId },
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found in database.",
      });
    }

    const newBlockedState = !existingUser.isBlocked;

    const updatedUser = await prisma.user.update({
      where: { id: numericId },
      data: { isBlocked: newBlockedState },
    });

    return res.status(200).json({
      success: true,
      message: `User successfully ${newBlockedState ? "Blocked" : "Activated"}.`,
      accountStatus: newBlockedState ? "Blocked" : "Active",
      isBlocked: newBlockedState,
      userId: updatedUser.id,
    });
  } catch (error) {
    console.error("Error toggling user status:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update user status.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get profile data for a specific user by email
 */
exports.getUserProfile = async (req, res) => {
  try {
    const rawEmail = req.query.email;
    const rawId = req.query.id;
    let user = null;

    if (rawId) {
      const numericId = parseInt(String(rawId).replace("usr-", ""), 10);
      if (!isNaN(numericId)) {
        user = await prisma.user.findUnique({
          where: { id: numericId },
        });
      }
    }

    if (!user && rawEmail) {
      let normalizedEmail = String(rawEmail).trim().toLowerCase();
      if (normalizedEmail === "xxxxx@gmail.com") {
        normalizedEmail = "indrani@netopsys.in";
      }
      user = await prisma.user.findFirst({
        where: {
          email: {
            equals: normalizedEmail,
            mode: "insensitive",
          },
        },
      });
    }

    if (!user) {
      // Fallback: load default candidate if query was for xxxxx@gmail.com or empty
      user = await prisma.user.findFirst({
        where: { email: "indrani@netopsys.in" },
      });
    }

    if (!user) {
      return res.status(200).json({
        success: true,
        profile: null,
      });
    }

    const profile = await prisma.user_profiles.findUnique({
      where: { user_id: user.id },
    });

    const workExperiences = await prisma.user_work_experience.findMany({
      where: { user_id: user.id },
      orderBy: { id: "asc" },
    });

    const certs = await prisma.user_certifications.findMany({
      where: { user_id: user.id },
      orderBy: { id: "asc" },
    });

    let eduObj = {
      degree: profile?.highest_education || "",
      field: "",
      institution: "",
      year: "",
      grade: "",
    };

    if (profile?.education_details) {
      try {
        if (profile.education_details.startsWith("{")) {
          const parsedEdu = JSON.parse(profile.education_details);
          eduObj = { ...eduObj, ...parsedEdu };
        } else {
          const parts = profile.education_details.split(" | ");
          if (parts[0]) eduObj.field = parts[0];
          if (parts[1]) eduObj.institution = parts[1];
          parts.forEach((p) => {
            if (p.startsWith("Graduated: ")) eduObj.year = p.replace("Graduated: ", "").trim();
            if (p.startsWith("Score: ")) eduObj.grade = p.replace("Score: ", "").trim();
          });
        }
      } catch {
        eduObj.field = profile.education_details;
      }
    }

    const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email.split("@")[0];

    return res.status(200).json({
      success: true,
      profile: {
        id: `usr-${user.id}`,
        dbId: user.id,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        name: fullName,
        email: user.email,
        initials: getInitials(fullName, user.email),
        registeredDate: formatDate(user.createdAt),
        mobileNumber: user.mobileNumber || "",
        phone: user.mobileNumber || "",
        isEmailVerified: Boolean(user.emailVerified),
        verificationStatus: user.emailVerified ? "verified" : "Unverified",
        accountStatus: user.isBlocked ? "Blocked" : "Active",
        isBlocked: Boolean(user.isBlocked),
        dob: profile?.date_of_birth || "",
        gender: profile?.gender || "",
        address: profile?.address || "",
        city: profile?.city || "",
        state: profile?.state || "",
        country: profile?.country || "",
        pincode: profile?.pincode || "",
        jobTitle: profile?.current_job_title || "",
        currentCompany: profile?.current_company || "",
        experienceYears: profile?.total_experience || "",
        skills: profile?.skills || "",
        linkedinUrl: profile?.linkedin_url || "",
        githubUrl: profile?.github_url || "",
        portfolioUrl: profile?.portfolio_url || "",
        highestDegree: eduObj.degree || profile?.highest_education || "",
        fieldOfStudy: eduObj.field || "",
        institution: eduObj.institution || "",
        graduationYear: eduObj.year || "",
        gradeScore: eduObj.grade || "",
        workExperiences: workExperiences.map((w) => ({
          id: String(w.id),
          jobTitle: w.job_title,
          companyName: w.company_name,
          location: w.location || "",
          startDate: w.start_date,
          endDate: w.end_date || "",
          description: w.description || "",
        })),
        savedCerts: certs.map((c) => ({
          id: String(c.id),
          name: c.certificate_name,
          org: c.issuing_organization,
          date: c.issue_date || "",
          url: c.certificate_url || "",
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile.",
    });
  }
};

/**
 * Save / Update candidate profile in PostgreSQL database
 */
exports.saveUserProfile = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      mobileNumber,
      dob,
      gender,
      address,
      city,
      state,
      country,
      pincode,
      isEmailVerified,
      jobTitle,
      currentCompany,
      experienceYears,
      skills,
      linkedinUrl,
      githubUrl,
      portfolioUrl,
      highestDegree,
      fieldOfStudy,
      institution,
      graduationYear,
      gradeScore,
      workExperiences,
      savedCerts,
    } = req.body;

    let normalizedEmail = String(email || "").trim().toLowerCase();
    if (!normalizedEmail || normalizedEmail === "xxxxx@gmail.com") {
      normalizedEmail = "indrani@netopsys.in";
    }

    // 1. Find or create user in users table
    let user = await prisma.user.findFirst({
      where: {
        email: {
          equals: normalizedEmail,
          mode: "insensitive",
        },
      },
    });

    if (user) {
      // Update existing user
      const updateData = {};
      if (firstName !== undefined && String(firstName).trim()) {
        updateData.firstName = String(firstName).trim();
      }
      if (lastName !== undefined) {
        updateData.lastName = String(lastName).trim();
      }
      if (mobileNumber !== undefined) {
        updateData.mobileNumber = mobileNumber ? String(mobileNumber).trim() : null;
      }
      // Note: emailVerified cannot be modified via general profile save.
      // It must be verified via OTP through /api/auth/verify-email-otp.

      if (Object.keys(updateData).length > 0) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: updateData,
        });
      }
    } else {
      // Create user if not existing
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("Netopsys@2026", salt);

      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          firstName: (firstName || "Candidate").trim(),
          lastName: (lastName || "").trim(),
          mobileNumber: mobileNumber ? String(mobileNumber).trim() : null,
          password: hashedPassword,
          emailVerified: false,
          isBlocked: false,
        },
      });
    }

    // 2. Upsert user profile
    const eduObj = {
      degree: highestDegree ? String(highestDegree).trim() : "",
      field: fieldOfStudy ? String(fieldOfStudy).trim() : "",
      institution: institution ? String(institution).trim() : "",
      year: graduationYear ? String(graduationYear).trim() : "",
      grade: gradeScore ? String(gradeScore).trim() : "",
    };
    const educationDetailsStr = JSON.stringify(eduObj);

    const profileData = {
      date_of_birth: dob ? String(dob).trim() : null,
      gender: gender ? String(gender).trim() : null,
      address: address ? String(address).trim() : null,
      city: city ? String(city).trim() : null,
      state: state ? String(state).trim() : null,
      country: country ? String(country).trim() : null,
      pincode: pincode ? String(pincode).trim() : null,
      current_job_title: jobTitle ? String(jobTitle).trim() : null,
      current_company: currentCompany ? String(currentCompany).trim() : null,
      total_experience: experienceYears ? String(experienceYears).trim() : null,
      skills: skills ? String(skills).trim() : null,
      linkedin_url: linkedinUrl ? String(linkedinUrl).trim() : null,
      github_url: githubUrl ? String(githubUrl).trim() : null,
      portfolio_url: portfolioUrl ? String(portfolioUrl).trim() : null,
      highest_education: highestDegree ? String(highestDegree).trim() : null,
      education_details: educationDetailsStr || null,
      updated_at: new Date(),
    };

    await prisma.user_profiles.upsert({
      where: { user_id: user.id },
      update: profileData,
      create: {
        user_id: user.id,
        ...profileData,
      },
    });

    // 3. Work experiences
    if (Array.isArray(workExperiences)) {
      await prisma.user_work_experience.deleteMany({
        where: { user_id: user.id },
      });

      const validExps = workExperiences
        .filter((w) => w && (w.companyName || w.jobTitle))
        .map((w) => ({
          user_id: user.id,
          company_name: String(w.companyName || "").trim() || "N/A",
          job_title: String(w.jobTitle || "").trim() || "N/A",
          location: w.location ? String(w.location).trim() : null,
          start_date: w.startDate ? String(w.startDate).trim() : "N/A",
          end_date: w.endDate ? String(w.endDate).trim() : null,
          is_current: false,
          description: w.description ? String(w.description).trim() : null,
        }));

      if (validExps.length > 0) {
        await prisma.user_work_experience.createMany({
          data: validExps,
        });
      }
    }

    // 4. Certifications
    if (Array.isArray(savedCerts)) {
      await prisma.user_certifications.deleteMany({
        where: { user_id: user.id },
      });

      const validCerts = savedCerts
        .filter((c) => c && c.name)
        .map((c) => ({
          user_id: user.id,
          certificate_name: String(c.name).trim(),
          issuing_organization: c.org ? String(c.org).trim() : "Provider",
          issue_date: c.date ? String(c.date).trim() : null,
          certificate_url: c.url ? String(c.url).trim() : null,
        }));

      if (validCerts.length > 0) {
        await prisma.user_certifications.createMany({
          data: validCerts,
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Profile saved successfully to database.",
      user: {
        id: user.id,
        email: user.email,
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        phone: user.mobileNumber,
        initials: getInitials(`${user.firstName} ${user.lastName}`, user.email),
      },
    });
  } catch (error) {
    console.error("Error saving user profile:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save profile to database.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Permanently delete a registered user and their associated candidate records
 */
exports.deleteUser = async (req, res) => {
  try {
    if (!req.user || String(req.user.role || "").trim().toLowerCase() === "candidate") {
      return res.status(403).json({
        success: false,
        message: "Access forbidden. Administrator privilege required.",
      });
    }

    const rawId = req.params.id;
    const numericId = parseInt(String(rawId).replace("usr-", ""), 10);

    if (isNaN(numericId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID provided.",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: numericId },
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found in database.",
      });
    }

    await prisma.$transaction(async (tx) => {
      const applications = await tx.job_applications.findMany({
        where: { user_id: numericId },
        select: { id: true },
      });
      const applicationIds = applications.map((a) => a.id);

      const sessions = await tx.mcq_sessions.findMany({
        where: { user_id: numericId },
        select: { id: true },
      });
      const sessionIds = sessions.map((s) => s.id);

      if (sessionIds.length > 0) {
        await tx.mcq_answers.deleteMany({ where: { session_id: { in: sessionIds } } });
        await tx.mcq_questions.deleteMany({ where: { session_id: { in: sessionIds } } });
        await tx.mcq_warning_events.deleteMany({ where: { session_id: { in: sessionIds } } });
      }

      if (applicationIds.length > 0) {
        await tx.application_answers.deleteMany({
          where: { application_id: { in: applicationIds } },
        });
        await tx.application_questions.deleteMany({
          where: { application_id: { in: applicationIds } },
        });
        await tx.admin_notifications.deleteMany({
          where: { application_id: { in: applicationIds } },
        });
      }

      await tx.interview_bookings.deleteMany({ where: { user_id: numericId } });
      await tx.mcq_sessions.deleteMany({ where: { user_id: numericId } });
      await tx.job_applications.deleteMany({ where: { user_id: numericId } });
      await tx.user_certifications.deleteMany({ where: { user_id: numericId } });
      await tx.user_work_experience.deleteMany({ where: { user_id: numericId } });
      await tx.user_profiles.deleteMany({ where: { user_id: numericId } });
      await tx.user.delete({ where: { id: numericId } });
    });

    return res.status(200).json({
      success: true,
      message: "User deleted successfully.",
      deletedUserId: existingUser.id,
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete user from database.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

