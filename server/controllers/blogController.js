const prisma = require("../config/prisma");
const { saveBase64Image } = require("../middleware/upload");
const emailService = require("../services/emailService");

/**
 * Default Seed Blogs matching existing portfolio / frontend data
 */
const DEFAULT_BLOGS = [
  {
    slug: "ai-automation-enterprise-workflows",
    title: "How AI Automation Is Reshaping Enterprise Workflows",
    excerpt:
      "From intelligent document processing to self-healing pipelines, here's how organisations are cutting manual effort and moving faster with practical AI automation.",
    category: "AI Automation",
    tag: "AI Automation",
    tag_bg: "bg-[#F4EBFA]",
    tag_color: "text-[#693092]",
    graphic_variant: "featured",
    date: "Oct 20, 2026",
    read_time: "8 min read",
    author_name: "Netopsys Team",
    author_initials: "NT",
    author_role: "AI Architecture & Engineering",
    is_featured: true,
    status: "Published",
    content: `<p>Modern enterprises are transitioning from static rules-based automation into adaptive, agentic AI systems that reason over unstructured data, learn from feedback, and execute multistep operational tasks.</p>
<p>Traditional robotic process automation (RPA) struggled whenever unexpected inputs arose. With modern large language models, retrieval-augmented generation (RAG), and deterministic fallback policies, businesses can now automate complex invoice parsing, contract review, and incident mitigation with high fault tolerance.</p>
<p>By connecting agentic pipelines directly to operational databases and enterprise ERP backends, teams see up to 70% reduction in turnaround times while preserving human-in-the-loop governance for critical approvals.</p>`,
    key_takeaways: [
      "AI automation shifts systems from rigid scripts to self-correcting semantic workflows.",
      "Human-in-the-loop guardrails ensure mission-critical accuracy and regulatory compliance.",
      "Cross-system integrations allow real-time decision making directly inside existing CRM & ERP tools.",
    ],
    is_active: true,
  },
  {
    slug: "building-reliable-ml-pipelines",
    title: "Building Reliable ML Pipelines for Production",
    excerpt:
      "Lessons from deploying models at scale and the monitoring practices that keep them accurate.",
    category: "Machine Learning",
    tag: "Machine Learning",
    tag_bg: "bg-[#FDF2F8]",
    tag_color: "text-[#BE185D]",
    graphic_variant: "ml",
    date: "Oct 14, 2026",
    read_time: "6 min read",
    author_name: "Netopsys Team",
    author_initials: "NT",
    author_role: "MLOps Engineering",
    is_featured: false,
    status: "Published",
    content: `<p>Deploying machine learning models to production is only 20% of the battle; the remaining 80% is maintaining model consistency, handling concept drift, and managing high-throughput inference latency.</p>
<p>A production-grade pipeline requires automated validation gates: feature store verification, latency benchmarking, canary deployments, and real-time observability of input embeddings.</p>
<p>Implementing semantic telemetry helps detect data drift weeks before downstream business metrics show degradation, allowing automated retraining loops to keep accuracy high.</p>`,
    key_takeaways: [
      "Continuous feature validation prevents silent inference degradation in live environments.",
      "Canary rollouts and instant fallbacks prevent catastrophic failures during model updates.",
      "Observability across latency, drift, and prediction distributions is mandatory for production SLA.",
    ],
    is_active: true,
  },
  {
    slug: "making-sense-of-text-nlp",
    title: "Making Sense of Text: NLP for Business Insights",
    excerpt:
      "A practical guide to turning emails, tickets and reviews into confident business decisions.",
    category: "NLP Solutions",
    tag: "NLP Solutions",
    tag_bg: "bg-[#FEF3C7]",
    tag_color: "text-[#B45309]",
    graphic_variant: "nlp",
    date: "Oct 8, 2026",
    read_time: "5 min read",
    author_name: "Netopsys Team",
    author_initials: "NT",
    author_role: "NLP Research Squad",
    is_featured: false,
    status: "Published",
    content: `<p>Every enterprise sits on top of a goldmine of unstructured textual data: customer support logs, product feedback, RFP documents, and internal correspondence.</p>
<p>Modern Natural Language Processing moves beyond primitive keyword matching to contextual semantic embeddings, aspect-based sentiment categorization, and auto-clustering of customer pain points.</p>
<p>With zero-shot classification and targeted entity extraction, leadership teams gain real-time dashboards mapping changing customer sentiment and emerging market requirements.</p>`,
    key_takeaways: [
      "Semantic embeddings extract nuanced user intent that keyword searches consistently miss.",
      "Aspect-based sentiment analysis pinpoints the exact features customers love or find friction with.",
      "Automated summary loops condense hundreds of daily customer tickets into actionable insights.",
    ],
    is_active: true,
  },
  {
    slug: "intelligent-erp-better-navigation",
    title: "Why Intelligent ERP Starts with Better Navigation",
    excerpt:
      "How assistants and smarter workflows help teams find what they need faster.",
    category: "ERP Solutions",
    tag: "ERP Solutions",
    tag_bg: "bg-[#EFF6FF]",
    tag_color: "text-[#2563EB]",
    graphic_variant: "erp",
    date: "Sep 30, 2026",
    read_time: "4 min read",
    author_name: "Netopsys Team",
    author_initials: "NT",
    author_role: "Enterprise Systems Architecture",
    is_featured: false,
    status: "Published",
    content: `<p>Enterprise Resource Planning (ERP) systems hold critical business intelligence, but their dense navigation hierarchies and complex multi-step screens often slow employees down.</p>
<p>Introducing intelligent conversational layers and semantic command palettes turns complex 10-click administrative workflows into simple, natural language actions.</p>
<p>By letting users type 'Show all pending purchase orders over $50k from Q3', the ERP assistant resolves the query instantly, saving hours of manual filter navigation each week.</p>`,
    key_takeaways: [
      "Conversational interfaces unlock faster adoption of complex enterprise software suites.",
      "Natural language queries eliminate navigation friction across deep nested ERP modules.",
      "Smart action recommendations guide operators through high-stakes compliance steps.",
    ],
    is_active: true,
  },
];

/**
 * Initial Auto-Seeding function
 */
async function seedDefaultBlogsIfEmpty() {
  try {
    const count = await prisma.blogs.count();
    if (count === 0) {
      console.log("Seeding default blogs into database...");
      for (const blog of DEFAULT_BLOGS) {
        await prisma.blogs.create({ data: blog });
      }
      console.log("Default blogs seeded successfully.");
    }
  } catch (err) {
    console.error("Error seeding default blogs:", err.message);
  }
}

// Seed on startup
seedDefaultBlogsIfEmpty();

/**
 * Helpers
 */
function slugify(text) {
  return (text || "")
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function stripHtml(html) {
  return (html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function calculateReadTime(textOrHtml) {
  const plain = stripHtml(textOrHtml);
  const words = plain.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

function getCategoryColor(category) {
  const cat = (category || "").toLowerCase();
  if (cat.includes("ml") || cat.includes("machine learning")) {
    return { tagBg: "bg-[#FDF2F8]", tagColor: "text-[#BE185D]", graphicVariant: "ml" };
  }
  if (cat.includes("nlp") || cat.includes("language") || cat.includes("text")) {
    return { tagBg: "bg-[#FEF3C7]", tagColor: "text-[#B45309]", graphicVariant: "nlp" };
  }
  if (cat.includes("erp") || cat.includes("enterprise")) {
    return { tagBg: "bg-[#EFF6FF]", tagColor: "text-[#2563EB]", graphicVariant: "erp" };
  }
  return { tagBg: "bg-[#F4EBFA]", tagColor: "text-[#693092]", graphicVariant: "featured" };
}

function formatBlog(b) {
  if (!b) return null;
  const colors = getCategoryColor(b.category);
  return {
    id: b.id,
    slug: b.slug,
    title: b.title,
    excerpt: b.excerpt || stripHtml(b.content).slice(0, 160) + "...",
    category: b.category || "",
    tag: b.tag || b.category || "",
    tagBg: b.tag_bg || colors.tagBg,
    tagColor: b.tag_color || colors.tagColor,
    graphicVariant: b.graphic_variant || colors.graphicVariant,
    image: b.image || null,
    date:
      b.date ||
      new Date(b.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    readTime: b.read_time || calculateReadTime(b.content),
    author: {
      name: b.author_name || "",
      initials:
        b.author_initials ||
        (b.author_name
          ? b.author_name
              .split(/\s+/)
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)
          : ""),
      role: b.author_role || "",
    },
    isFeatured: Boolean(b.is_featured),
    status: b.status || "Published",
    content: b.content,
    keyTakeaways: Array.isArray(b.key_takeaways) ? b.key_takeaways : [],
    isActive: b.is_active,
    createdAt: b.created_at,
    updatedAt: b.updated_at,
  };
}

/**
 * GET /api/blogs & /api/admin/blogs
 * Query: ?all=true returns all (including drafts); otherwise active published only
 */
exports.getAllBlogs = async (req, res) => {
  try {
    const { all, category, search } = req.query;

    const where = {};
    if (all !== "true") {
      where.is_active = true;
      where.status = "Published";
    }

    if (category && category !== "All") {
      where.category = { equals: category, mode: "insensitive" };
    }

    if (search && search.trim()) {
      where.OR = [
        { title: { contains: search.trim(), mode: "insensitive" } },
        { excerpt: { contains: search.trim(), mode: "insensitive" } },
        { category: { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    const blogs = await prisma.blogs.findMany({
      where,
      orderBy: [{ is_featured: "desc" }, { id: "desc" }],
    });

    return res.status(200).json({
      success: true,
      count: blogs.length,
      data: blogs.map(formatBlog),
    });
  } catch (error) {
    console.error("Error in getAllBlogs:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch blogs.",
      error: error.message,
    });
  }
};

/**
 * GET /api/blogs/:idOrSlug
 */
exports.getBlogByIdOrSlug = async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const numericId = parseInt(idOrSlug, 10);

    let blog = null;
    if (!isNaN(numericId)) {
      blog = await prisma.blogs.findUnique({ where: { id: numericId } });
    }
    if (!blog) {
      blog = await prisma.blogs.findUnique({ where: { slug: idOrSlug } });
    }

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: formatBlog(blog),
    });
  } catch (error) {
    console.error("Error in getBlogByIdOrSlug:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve blog.",
      error: error.message,
    });
  }
};

/**
 * Helper to auto-extract metadata labels embedded in content and clean the reading body
 */
function extractMetadataAndCleanContent(rawContent, body = {}) {
  let content = rawContent || "";

  let extractedCategory = body.category?.trim() || "";
  let extractedAuthor = body.authorName?.trim() || "";
  let extractedDate = body.date?.trim() || "";
  let extractedExcerpt = body.excerpt?.trim() || "";
  let extractedFeatured = body.isFeatured !== undefined ? Boolean(body.isFeatured) : undefined;
  let extractedStatus = body.status || undefined;

  // Extract from content text/html
  const catMatch = content.match(/(?:<strong>|<b>)?\s*Category\s*:\s*(?:<\/strong>|<\/b>)?\s*([^<\n\r]+)/i);
  if (catMatch && catMatch[1]?.trim()) {
    extractedCategory = catMatch[1].trim();
  }

  const authorMatch = content.match(/(?:<strong>|<b>)?\s*Author\s*:\s*(?:<\/strong>|<\/b>)?\s*([^<\n\r]+)/i);
  if (authorMatch && authorMatch[1]?.trim()) {
    extractedAuthor = authorMatch[1].trim();
  }

  const dateMatch = content.match(/(?:<strong>|<b>)?\s*(?:Publish\s*Date|Date)\s*:\s*(?:<\/strong>|<\/b>)?\s*([^<\n\r]+)/i);
  if (dateMatch && dateMatch[1]?.trim()) {
    extractedDate = dateMatch[1].trim();
  }

  const featMatch = content.match(/(?:<strong>|<b>)?\s*Featured\s*:\s*(?:<\/strong>|<\/b>)?\s*(yes|true)/i);
  if (featMatch) {
    extractedFeatured = true;
  }

  const statMatch = content.match(/(?:<strong>|<b>)?\s*Status\s*:\s*(?:<\/strong>|<\/b>)?\s*([^<\n\r]+)/i);
  if (statMatch && statMatch[1]?.trim()) {
    extractedStatus = statMatch[1].trim();
  }

  const descMatch = content.match(/(?:<strong>|<b>)?\s*(?:Short\s*Description|Description|Summary|Excerpt)\s*:\s*(?:<\/strong>|<\/b>)?\s*<\/?p>?\s*([^<]+)/i);
  if (descMatch && descMatch[1]?.trim()) {
    extractedExcerpt = descMatch[1].trim();
  }

  // Clean out all metadata tags and lines from the content so they don't pollute the body
  let cleanContent = content
    .replace(/<p[^>]*>\s*(?:<strong>|<b>)?\s*(?:Category|Status|Featured|Author|Publish\s*Date|Date)\s*:\s*(?:<\/strong>|<\/b>)?.*?<\/p>/gi, "")
    .replace(/<p[^>]*>\s*(?:<strong>|<b>)?\s*(?:Short\s*Description|Description|Summary|Excerpt)\s*:\s*(?:<\/strong>|<\/b>)?\s*<\/p>/gi, "")
    .replace(/(?:Category|Status|Featured|Author|Publish\s*Date|Date)\s*:\s*[^\n\r<]+/gi, "")
    .replace(/(?:Short\s*Description|Description|Summary|Excerpt)\s*:\s*/gi, "")
    .trim();

  cleanContent = cleanContent.replace(/<p[^>]*>\s*<\/p>/gi, "").trim();

  return {
    cleanContent: cleanContent || content,
    category: extractedCategory || "Artificial Intelligence",
    authorName: extractedAuthor || "Netopsys Team",
    date: extractedDate,
    excerpt: extractedExcerpt,
    isFeatured: extractedFeatured,
    status: extractedStatus,
  };
}

/**
 * POST /api/admin/blogs & /api/blogs
 */
exports.createBlog = async (req, res) => {
  try {
    const {
      title,
      content,
      category,
      tag,
      excerpt,
      graphicVariant,
      image,
      authorName,
      authorRole,
      authorInitials,
      isFeatured,
      status,
      keyTakeaways,
      date,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Blog title is required.",
      });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Blog content is required.",
      });
    }

    // Auto-extract metadata lines embedded in content and clean the body
    const parsed = extractMetadataAndCleanContent(content, {
      category,
      authorName,
      date,
      excerpt,
      isFeatured,
      status,
    });

    const bodyContent = parsed.cleanContent;

    // Generate unique slug
    let baseSlug = slugify(title);
    if (!baseSlug) baseSlug = `blog-${Date.now()}`;
    let uniqueSlug = baseSlug;
    let counter = 1;
    while (await prisma.blogs.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${baseSlug}-${counter++}`;
    }

    const cleanCategory = parsed.category || (category && category.trim()) || "Artificial Intelligence";
    const colors = getCategoryColor(cleanCategory);
    const plainExcerpt =
      parsed.excerpt ||
      (excerpt && excerpt.trim()) ||
      stripHtml(bodyContent).slice(0, 160) + "...";

    const cleanAuthorName = parsed.authorName || (authorName && authorName.trim()) || "Netopsys Team";
    const cleanRole = (authorRole && authorRole.trim()) || "Enterprise Systems Architecture";
    const cleanInitials =
      (authorInitials && authorInitials.trim()) ||
      cleanAuthorName
        .split(/\s+/)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) ||
      "NT";

    const formattedDate =
      (date && date.trim()) ||
      new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

    // Parse key takeaways
    let takeawaysArray = [];
    if (Array.isArray(keyTakeaways)) {
      takeawaysArray = keyTakeaways.map((t) => String(t).trim()).filter(Boolean);
    } else if (typeof keyTakeaways === "string") {
      takeawaysArray = keyTakeaways
        .split("\n")
        .map((t) => t.replace(/^[•\-\*]\s*/, "").trim())
        .filter(Boolean);
    }

    // Auto-extract takeaways if none were supplied
    if (takeawaysArray.length === 0) {
      const liMatches = content.match(/<li[^>]*>(.*?)<\/li>/gi);
      if (liMatches && liMatches.length >= 2) {
        takeawaysArray = liMatches
          .map((li) => stripHtml(li))
          .filter((t) => t.length > 10 && t.length < 220)
          .slice(0, 3);
      }
    }
    if (takeawaysArray.length === 0) {
      const lines = content.split(/\r?\n|<br\s*\/?>|<\/p>/i);
      const bullets = lines
        .map((l) => stripHtml(l))
        .filter((l) => /^[•\-\*]\s+|^\d+[\.\)]\s+/.test(l))
        .map((l) => l.replace(/^[•\-\*]\s+|^\d+[\.\)]\s+/, "").trim())
        .filter((l) => l.length > 12 && l.length < 220);
      if (bullets.length >= 2) {
        takeawaysArray = bullets.slice(0, 3);
      }
    }
    if (takeawaysArray.length === 0) {
      const plain = stripHtml(content);
      const sentences = plain
        .split(/(?<=[.?!])\s+/)
        .map((s) => s.trim())
        .filter((s) => s.length >= 25 && s.length <= 180);
      if (sentences.length >= 3) {
        takeawaysArray = [sentences[0], sentences[1], sentences[2]];
      } else {
        takeawaysArray = [
          "Conversational interfaces unlock faster adoption of complex enterprise software suites.",
          "Natural language queries eliminate navigation friction across deep nested ERP modules.",
          "Smart action recommendations guide operators through high-stakes compliance steps.",
        ];
      }
    }

    const created = await prisma.blogs.create({
      data: {
        slug: uniqueSlug,
        title: title.trim(),
        content: bodyContent.trim(),
        category: cleanCategory,
        tag: (tag && tag.trim()) || cleanCategory,
        tag_bg: colors.tagBg,
        tag_color: colors.tagColor,
        excerpt: plainExcerpt,
        graphic_variant: graphicVariant || colors.graphicVariant,
        image: image ? saveBase64Image(image.trim(), "blog") : null,
        date: formattedDate,
        read_time: calculateReadTime(bodyContent),
        author_name: cleanAuthorName,
        author_initials: cleanInitials,
        author_role: cleanRole,
        is_featured: parsed.isFeatured !== undefined ? parsed.isFeatured : Boolean(isFeatured),
        status: parsed.status || (status === "Draft" ? "Draft" : "Published"),
        key_takeaways: takeawaysArray,
        is_active: true,
      },
    });

    // Automatically trigger notification to active blog subscribers if published
    if (created.status === "Published" && created.is_active) {
      emailService.sendBlogPublishedNotification(created);
    }

    return res.status(201).json({
      success: true,
      message: `Blog post ${created.status === "Draft" ? "saved as draft" : "published"} successfully.`,
      data: formatBlog(created),
    });
  } catch (error) {
    console.error("Error in createBlog:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create blog post.",
      error: error.message,
    });
  }
};

/**
 * PUT /api/admin/blogs/:id
 */
exports.updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const numericId = parseInt(id, 10);

    if (isNaN(numericId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid blog ID.",
      });
    }

    const existing = await prisma.blogs.findUnique({
      where: { id: numericId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found.",
      });
    }

    const {
      title,
      content,
      category,
      tag,
      excerpt,
      graphicVariant,
      image,
      authorName,
      authorRole,
      authorInitials,
      isFeatured,
      status,
      keyTakeaways,
      date,
      isActive,
    } = req.body;

    const dataToUpdate = {};
    if (title !== undefined) dataToUpdate.title = title.trim();
    if (content !== undefined) {
      const parsed = extractMetadataAndCleanContent(content, {
        category,
        authorName,
        date,
        excerpt,
        isFeatured,
        status,
      });

      dataToUpdate.content = parsed.cleanContent.trim();
      dataToUpdate.read_time = calculateReadTime(parsed.cleanContent);

      if (parsed.category && category === undefined) {
        dataToUpdate.category = parsed.category;
        const colors = getCategoryColor(parsed.category);
        dataToUpdate.tag_bg = colors.tagBg;
        dataToUpdate.tag_color = colors.tagColor;
      }
      if (parsed.excerpt && excerpt === undefined) dataToUpdate.excerpt = parsed.excerpt;
      if (parsed.authorName && authorName === undefined) dataToUpdate.author_name = parsed.authorName;
      if (parsed.date && date === undefined) dataToUpdate.date = parsed.date;
      if (parsed.isFeatured !== undefined && isFeatured === undefined) dataToUpdate.is_featured = parsed.isFeatured;
      if (parsed.status !== undefined && status === undefined) dataToUpdate.status = parsed.status;
    }
    if (category !== undefined) {
      dataToUpdate.category = category.trim();
      const colors = getCategoryColor(category);
      dataToUpdate.tag_bg = colors.tagBg;
      dataToUpdate.tag_color = colors.tagColor;
    }
    if (tag !== undefined) dataToUpdate.tag = tag.trim();
    if (excerpt !== undefined) dataToUpdate.excerpt = excerpt.trim();
    if (graphicVariant !== undefined) dataToUpdate.graphic_variant = graphicVariant;
    if (image !== undefined) dataToUpdate.image = image ? saveBase64Image(image.trim(), "blog") : null;
    if (authorName !== undefined) dataToUpdate.author_name = authorName.trim();
    if (authorRole !== undefined) dataToUpdate.author_role = authorRole.trim();
    if (authorInitials !== undefined) dataToUpdate.author_initials = authorInitials.trim();
    if (isFeatured !== undefined) dataToUpdate.is_featured = Boolean(isFeatured);
    if (status !== undefined) dataToUpdate.status = status;
    if (date !== undefined) dataToUpdate.date = date.trim();
    if (isActive !== undefined) dataToUpdate.is_active = Boolean(isActive);

    if (keyTakeaways !== undefined) {
      if (Array.isArray(keyTakeaways)) {
        dataToUpdate.key_takeaways = keyTakeaways.map((t) => String(t).trim()).filter(Boolean);
      } else if (typeof keyTakeaways === "string") {
        dataToUpdate.key_takeaways = keyTakeaways
          .split("\n")
          .map((t) => t.replace(/^[•\-\*]\s*/, "").trim())
          .filter(Boolean);
      }
    }

    const updated = await prisma.blogs.update({
      where: { id: numericId },
      data: dataToUpdate,
    });

    // Trigger notification ONLY if previously not published and now transitioned to Published
    if (existing.status !== "Published" && updated.status === "Published" && updated.is_active) {
      emailService.sendBlogPublishedNotification(updated);
    }

    return res.status(200).json({
      success: true,
      message: "Blog post updated successfully.",
      data: formatBlog(updated),
    });
  } catch (error) {
    console.error("Error in updateBlog:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update blog post.",
      error: error.message,
    });
  }
};

/**
 * DELETE /api/admin/blogs/:id
 */
exports.deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const numericId = parseInt(id, 10);

    if (isNaN(numericId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid blog ID.",
      });
    }

    await prisma.blogs.delete({
      where: { id: numericId },
    });

    return res.status(200).json({
      success: true,
      message: "Blog post deleted successfully.",
    });
  } catch (error) {
    console.error("Error in deleteBlog:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete blog post.",
      error: error.message,
    });
  }
};

/**
 * PATCH /api/admin/blogs/:id/status
 */
exports.toggleBlogStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const numericId = parseInt(id, 10);

    if (isNaN(numericId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid blog ID.",
      });
    }

    const blog = await prisma.blogs.findUnique({
      where: { id: numericId },
    });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found.",
      });
    }

    const newStatus = blog.status === "Published" ? "Draft" : "Published";
    const updated = await prisma.blogs.update({
      where: { id: numericId },
      data: { status: newStatus },
    });

    // If toggled from Draft to Published, trigger subscriber notification
    if (newStatus === "Published" && updated.is_active) {
      emailService.sendBlogPublishedNotification(updated);
    }

    return res.status(200).json({
      success: true,
      message: `Blog status updated to ${newStatus}.`,
      data: formatBlog(updated),
    });
  } catch (error) {
    console.error("Error in toggleBlogStatus:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to toggle blog status.",
      error: error.message,
    });
  }
};

