const prisma = require("../config/prisma");
const emailService = require("../services/emailService");

/**
 * Get all job postings
 * Query param: ?all=true returns both active and inactive (for Admin)
 * Default returns only is_active: true (for Careers Page)
 */
exports.getAllJobs = async (req, res) => {
  try {
    const { all } = req.query;
    const where = all === "true" ? {} : { is_active: true };

    const [dbJobs, categories] = await Promise.all([
      prisma.job_postings.findMany({
        where,
        orderBy: { id: "desc" },
      }),
      prisma.job_categories.findMany(),
    ]);

    const catMap = new Map();
    categories.forEach((c) => catMap.set(c.id, c.name));

    const formattedJobs = dbJobs.map((j) => {
      const catName = catMap.get(j.category_id) || "Engineering";
      const loc = j.location || "Hyderabad / Remote";
      const empType = j.employment_type || "Full Time";
      const exp = j.experience || "Entry Level";

      return {
        id: `job-${j.id}`,
        dbId: j.id,
        code: j.job_id,
        jobId: j.job_id,
        title: j.title,
        category: catName,
        categoryId: j.category_id,
        location: loc,
        employmentType: empType,
        experience: exp,
        summary: j.summary || "",
        description: j.description || "",
        requirements: j.requirements || "",
        status: j.is_active ? "Active" : "Inactive",
        isActive: Boolean(j.is_active),
        createdAt: j.created_at,
        meta: `${loc} • ${empType} • ${exp}`,
        badges: [loc, empType, exp].filter(Boolean),
      };
    });

    return res.status(200).json({
      success: true,
      count: formattedJobs.length,
      jobs: formattedJobs,
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch job postings.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get single job posting by ID or job_id
 */
exports.getJobById = async (req, res) => {
  try {
    const rawId = req.params.id;
    const numericId = parseInt(String(rawId).replace("job-", ""), 10);

    let job = null;
    if (!isNaN(numericId)) {
      job = await prisma.job_postings.findUnique({
        where: { id: numericId },
      });
    }

    if (!job) {
      job = await prisma.job_postings.findFirst({
        where: { job_id: rawId },
      });
    }

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job posting not found.",
      });
    }

    const category = await prisma.job_categories.findUnique({
      where: { id: job.category_id },
    });

    return res.status(200).json({
      success: true,
      job: {
        id: `job-${job.id}`,
        dbId: job.id,
        code: job.job_id,
        jobId: job.job_id,
        title: job.title,
        category: category?.name || "Engineering",
        categoryId: job.category_id,
        location: job.location,
        employmentType: job.employment_type,
        experience: job.experience,
        summary: job.summary,
        description: job.description,
        requirements: job.requirements,
        status: job.is_active ? "Active" : "Inactive",
        isActive: Boolean(job.is_active),
        createdAt: job.created_at,
      },
    });
  } catch (error) {
    console.error("Error fetching job:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch job details.",
    });
  }
};

/**
 * Create a new job posting
 */
exports.createJob = async (req, res) => {
  try {
    const {
      jobId,
      title,
      category,
      location,
      employmentType,
      experience,
      summary,
      description,
      requirements,
      isActive,
    } = req.body;

    if (!title || !String(title).trim()) {
      return res.status(400).json({
        success: false,
        message: "Job title is required.",
      });
    }

    // 1. Resolve or create category
    let categoryId = 1;
    const catName = String(category || "Engineering").trim();
    const existingCat = await prisma.job_categories.findFirst({
      where: { name: { equals: catName, mode: "insensitive" } },
    });

    if (existingCat) {
      categoryId = existingCat.id;
    } else {
      const newCat = await prisma.job_categories.create({
        data: { name: catName },
      });
      categoryId = newCat.id;
    }

    // 2. Resolve unique job code
    let finalCode = String(jobId || "").trim();
    if (!finalCode) {
      const randNum = Math.floor(100 + Math.random() * 900);
      finalCode = `NET-JB-${randNum}`;
    }

    // Check if code already taken
    const existingCode = await prisma.job_postings.findFirst({
      where: { job_id: finalCode },
    });
    if (existingCode) {
      finalCode = `${finalCode}-${Math.floor(10 + Math.random() * 90)}`;
    }

    // 3. Create job posting
    const newJob = await prisma.job_postings.create({
      data: {
        job_id: finalCode,
        title: String(title).trim(),
        category_id: categoryId,
        location: location ? String(location).trim() : "Hyderabad / Remote",
        employment_type: employmentType ? String(employmentType).trim() : "Full Time",
        experience: experience ? String(experience).trim() : "1-3 years",
        summary: summary ? String(summary).trim() : "",
        description: description ? String(description).trim() : "",
        requirements: requirements ? String(requirements).trim() : "",
        is_active: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    // Automatically trigger notification to active job subscribers if published
    if (newJob.is_active) {
      emailService.sendJobPublishedNotification(newJob);
    }

    return res.status(201).json({
      success: true,
      message: "Job posting created successfully in database.",
      job: {
        id: `job-${newJob.id}`,
        dbId: newJob.id,
        code: newJob.job_id,
        jobId: newJob.job_id,
        title: newJob.title,
        category: catName,
        categoryId: newJob.category_id,
        location: newJob.location,
        employmentType: newJob.employment_type,
        experience: newJob.experience,
        summary: newJob.summary,
        description: newJob.description,
        requirements: newJob.requirements,
        status: newJob.is_active ? "Active" : "Inactive",
        isActive: Boolean(newJob.is_active),
        createdAt: newJob.created_at,
        meta: `${newJob.location} • ${newJob.employment_type} • ${newJob.experience}`,
        badges: [newJob.location, newJob.employment_type, newJob.experience].filter(Boolean),
      },
    });
  } catch (error) {
    console.error("Error creating job posting:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create job posting in database.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Update an existing job posting
 */
exports.updateJob = async (req, res) => {
  try {
    const rawId = req.params.id;
    const numericId = parseInt(String(rawId).replace("job-", ""), 10);

    let existingJob = null;
    if (!isNaN(numericId)) {
      existingJob = await prisma.job_postings.findUnique({
        where: { id: numericId },
      });
    }

    if (!existingJob) {
      existingJob = await prisma.job_postings.findFirst({
        where: { job_id: rawId },
      });
    }

    if (!existingJob) {
      return res.status(404).json({
        success: false,
        message: "Job posting not found.",
      });
    }

    const {
      jobId,
      title,
      category,
      location,
      employmentType,
      experience,
      summary,
      description,
      requirements,
      isActive,
    } = req.body;

    let categoryId = existingJob.category_id;
    let catName = "";

    if (category) {
      catName = String(category).trim();
      const cat = await prisma.job_categories.findFirst({
        where: { name: { equals: catName, mode: "insensitive" } },
      });
      if (cat) {
        categoryId = cat.id;
      } else {
        const newCat = await prisma.job_categories.create({
          data: { name: catName },
        });
        categoryId = newCat.id;
      }
    } else {
      const cat = await prisma.job_categories.findUnique({
        where: { id: categoryId },
      });
      catName = cat?.name || "Engineering";
    }

    const updateData = {};
    if (jobId !== undefined) updateData.job_id = String(jobId).trim();
    if (title !== undefined) updateData.title = String(title).trim();
    if (location !== undefined) updateData.location = String(location).trim();
    if (employmentType !== undefined) updateData.employment_type = String(employmentType).trim();
    if (experience !== undefined) updateData.experience = String(experience).trim();
    if (summary !== undefined) updateData.summary = String(summary).trim();
    if (description !== undefined) updateData.description = String(description).trim();
    if (requirements !== undefined) updateData.requirements = String(requirements).trim();
    if (isActive !== undefined) updateData.is_active = Boolean(isActive);
    updateData.category_id = categoryId;

    const updatedJob = await prisma.job_postings.update({
      where: { id: existingJob.id },
      data: updateData,
    });

    // Automatically trigger notification ONLY if transitioning from inactive to active
    if (!existingJob.is_active && updatedJob.is_active) {
      emailService.sendJobPublishedNotification(updatedJob);
    }

    return res.status(200).json({
      success: true,
      message: "Job posting updated successfully.",
      job: {
        id: `job-${updatedJob.id}`,
        dbId: updatedJob.id,
        code: updatedJob.job_id,
        jobId: updatedJob.job_id,
        title: updatedJob.title,
        category: catName,
        categoryId: updatedJob.category_id,
        location: updatedJob.location,
        employmentType: updatedJob.employment_type,
        experience: updatedJob.experience,
        summary: updatedJob.summary,
        description: updatedJob.description,
        requirements: updatedJob.requirements,
        status: updatedJob.is_active ? "Active" : "Inactive",
        isActive: Boolean(updatedJob.is_active),
        createdAt: updatedJob.created_at,
        meta: `${updatedJob.location} • ${updatedJob.employment_type} • ${updatedJob.experience}`,
        badges: [updatedJob.location, updatedJob.employment_type, updatedJob.experience].filter(Boolean),
      },
    });
  } catch (error) {
    console.error("Error updating job posting:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update job posting.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Delete a job posting
 */
exports.deleteJob = async (req, res) => {
  try {
    const rawId = req.params.id;
    const numericId = parseInt(String(rawId).replace("job-", ""), 10);

    let existingJob = null;
    if (!isNaN(numericId)) {
      existingJob = await prisma.job_postings.findUnique({
        where: { id: numericId },
      });
    }

    if (!existingJob) {
      existingJob = await prisma.job_postings.findFirst({
        where: { job_id: rawId },
      });
    }

    if (!existingJob) {
      return res.status(404).json({
        success: false,
        message: "Job posting not found.",
      });
    }

    await prisma.job_postings.delete({
      where: { id: existingJob.id },
    });

    return res.status(200).json({
      success: true,
      message: "Job posting deleted successfully from database.",
      id: existingJob.id,
    });
  } catch (error) {
    console.error("Error deleting job posting:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete job posting.",
    });
  }
};

/**
 * Toggle job status (Active / Inactive)
 */
exports.toggleJobStatus = async (req, res) => {
  try {
    const rawId = req.params.id;
    const numericId = parseInt(String(rawId).replace("job-", ""), 10);

    let existingJob = null;
    if (!isNaN(numericId)) {
      existingJob = await prisma.job_postings.findUnique({
        where: { id: numericId },
      });
    }

    if (!existingJob) {
      existingJob = await prisma.job_postings.findFirst({
        where: { job_id: rawId },
      });
    }

    if (!existingJob) {
      return res.status(404).json({
        success: false,
        message: "Job posting not found.",
      });
    }

    const updatedJob = await prisma.job_postings.update({
      where: { id: existingJob.id },
      data: { is_active: !existingJob.is_active },
    });

    // If activated, trigger notification (dedup will ensure it is only sent if never sent before)
    if (updatedJob.is_active) {
      emailService.sendJobPublishedNotification(updatedJob);
    }

    return res.status(200).json({
      success: true,
      message: `Job status updated to ${updatedJob.is_active ? "Active" : "Inactive"}.`,
      isActive: updatedJob.is_active,
      status: updatedJob.is_active ? "Active" : "Inactive",
    });
  } catch (error) {
    console.error("Error toggling job status:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update job status.",
    });
  }
};

