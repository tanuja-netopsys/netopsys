import { useState, useEffect } from "react";
import { Link, useSearchParams, useParams, useNavigate } from "react-router-dom";
import { ChevronRight, Check, Share2, Loader2, ArrowLeft } from "lucide-react";
import Navbar from "../componenets/navbar.tsx";
import Footer from "../componenets/footer.tsx";
import BackToHeroButton from "../componenets/back-to-hero.tsx";

export interface BlogPostDetail {
  id: string | number;
  slug: string;
  title: string;
  excerpt: string;
  category?: string;
  tag?: string;
  tagBg?: string;
  tagColor?: string;
  graphicVariant?: "featured" | "ml" | "nlp" | "erp";
  image?: string | null;
  date: string;
  readTime: string;
  author?: {
    name?: string;
    initials?: string;
    role?: string;
  };
  isFeatured?: boolean;
  content: string[] | string;
  keyTakeaways?: string[];
}

export interface BlogSection {
  id: string;
  title: string;
  content: string;
}

export interface ParsedBlogData {
  category?: string;
  tagBg: string;
  tagColor: string;
  variant: "featured" | "ml" | "nlp" | "erp";
  titleMain: string;
  titleHighlight: string;
  fullTitle: string;
  excerpt: string;
  authorName: string;
  authorRole: string;
  authorInitials: string;
  date: string;
  readTime: string;
  image?: string | null;
  leadParagraph: string;
  sections: BlogSection[];
  cleanHtml: string;
  quoteText: string;
  quoteAuthor: string;
  keyTakeaways: string[];
  topics: string[];
}

/**
 * Hero Graphic Card matching user screenshot:
 * 3 overlapping vibrant circles (Gold #FBAE42, Magenta #D13B89, Purple #693092),
 * orbital ring and horizontal axis lines inside a soft lavender container.
 */
function HeroGraphicCard({
  image,
}: {
  image?: string | null;
}) {
  if (image) {
    return (
      <div className="w-full h-[220px] sm:h-[260px] md:h-[280px] rounded-[20px] overflow-hidden border border-[#ECE4F2] shadow-xs bg-[#EAE0F5] blogdetail-graphic-wrap">
        <img src={image} alt="Article visual" className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-[220px] sm:h-[260px] md:h-[280px] rounded-[20px] bg-[#EAE0F5] flex items-center justify-center overflow-hidden select-none border border-[#E2D5EF]/70 shadow-xs blogdetail-graphic-wrap">
      <svg
        viewBox="0 0 460 270"
        className="w-full h-full object-contain p-4"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="hero-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ambient background soft radial aura */}
        <circle cx="230" cy="135" r="115" fill="white" fillOpacity="0.32" />

        {/* Outer orbital geometric ring */}
        <circle
          cx="230"
          cy="135"
          r="92"
          stroke="white"
          strokeWidth="1.25"
          strokeOpacity="0.85"
        />

        {/* Horizontal axis guidelines */}
        <line
          x1="35"
          y1="50"
          x2="425"
          y2="50"
          stroke="white"
          strokeWidth="1"
          strokeOpacity="0.55"
        />
        <line
          x1="35"
          y1="220"
          x2="425"
          y2="220"
          stroke="white"
          strokeWidth="1"
          strokeOpacity="0.55"
        />

        {/* 3 Overlapping Spheres matching screenshot */}
        {/* Left Circle: Golden Amber */}
        <circle
          cx="175"
          cy="135"
          r="62"
          fill="#FBAE42"
          fillOpacity="0.95"
        />

        {/* Center Circle: Vibrant Magenta */}
        <circle
          cx="230"
          cy="130"
          r="62"
          fill="#D13B89"
          fillOpacity="0.88"
          style={{ mixBlendMode: "multiply" }}
        />

        {/* Right Circle: Deep Purple */}
        <circle
          cx="285"
          cy="135"
          r="62"
          fill="#693092"
          fillOpacity="0.92"
          style={{ mixBlendMode: "multiply" }}
        />
      </svg>
    </div>
  );
}

/**
 * Universal content parser:
 * Irrespective of whether content is uploaded as plain text, Markdown, rich HTML,
 * or raw paragraphs, this normalizes it strictly into:
 * 1. A highlighted lead callout (with golden left border)
 * 2. Numbered sections (01, 02, 03, ...) with badges and headings
 * 3. An impactful quote card
 * 4. 4 key takeaway bullets
 * 5. Relevant explore topics
 */
function parseUniversalBlogData(blog: BlogPostDetail | null): ParsedBlogData | null {
  if (!blog) {
    return null;
  }

  // 1. Raw text extraction
  const raw = Array.isArray(blog.content)
    ? blog.content.join("\n\n")
    : typeof blog.content === "string"
    ? blog.content
    : "";

  // 2. Metadata extraction
  let category = blog.category?.trim() || blog.tag?.trim() || "";
  const catMatch = raw.match(
    /(?:<strong>|<b>)?\s*Category\s*:\s*(?:<\/strong>|<\/b>)?\s*([^<\n\r]+)/i
  );
  if (catMatch && catMatch[1]?.trim()) {
    category = catMatch[1].trim();
  }

  let author = blog.author?.name?.trim() || "";
  const authorMatch = raw.match(
    /(?:<strong>|<b>)?\s*Author\s*:\s*(?:<\/strong>|<\/b>)?\s*([^<\n\r]+)/i
  );
  if (authorMatch && authorMatch[1]?.trim()) {
    author = authorMatch[1].trim();
  }

  let date = blog.date?.trim() || "";
  const dateMatch = raw.match(
    /(?:<strong>|<b>)?\s*(?:Publish\s*Date|Date)\s*:\s*(?:<\/strong>|<\/b>)?\s*([^<\n\r]+)/i
  );
  if (dateMatch && dateMatch[1]?.trim()) {
    date = dateMatch[1].trim();
  }

  let excerpt = blog.excerpt?.trim() || "";
  const descMatch = raw.match(
    /(?:<strong>|<b>)?\s*(?:Short\s*Description|Description|Summary|Excerpt)\s*:\s*(?:<\/strong>|<\/b>)?\s*<\/?p>?\s*([^<]+)/i
  );
  if (descMatch && descMatch[1]?.trim()) {
    excerpt = descMatch[1].trim();
  }

  const authorRole = blog.author?.role?.trim() || "";
  const authorInitials =
    blog.author?.initials?.trim() ||
    (author
      ? author
          .split(/\s+/)
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : "");

  // Clean out metadata from body content
  let cleanHtml = raw
    .replace(
      /<p[^>]*>\s*(?:<strong>|<b>)?\s*(?:Category|Status|Featured|Author|Publish\s*Date|Date)\s*:\s*(?:<\/strong>|<\/b>)?.*?<\/p>/gi,
      ""
    )
    .replace(
      /<p[^>]*>\s*(?:<strong>|<b>)?\s*(?:Short\s*Description|Description|Summary|Excerpt)\s*:\s*(?:<\/strong>|<\/b>)?\s*<\/p>/gi,
      ""
    )
    .replace(/(?:Category|Status|Featured|Author|Publish\s*Date|Date)\s*:\s*[^\n\r<]+/gi, "")
    .replace(/(?:Short\s*Description|Description|Summary|Excerpt)\s*:\s*/gi, "")
    .trim();

  cleanHtml = cleanHtml.replace(/<p[^>]*>\s*<\/p>/gi, "").trim();

  // Extract explicit blockquote if present
  let quoteText = "";
  const bqMatch = cleanHtml.match(/<blockquote[^>]*>(.*?)<\/blockquote>/is);
  if (bqMatch && bqMatch[1]) {
    quoteText = bqMatch[1].replace(/<[^>]+>/g, "").trim();
    cleanHtml = cleanHtml.replace(bqMatch[0], "");
  }

  // Extract explicit bullet points if present
  let extractedBullets: string[] = [];
  const liMatches = cleanHtml.match(/<li[^>]*>(.*?)<\/li>/gis);
  if (liMatches && liMatches.length >= 2) {
    extractedBullets = liMatches
      .map((li) => li.replace(/<[^>]+>/g, "").trim())
      .filter((t) => t.length > 5);
  }

  // Check for explicit headings (h2, h3, or markdown ##)
  const sections: BlogSection[] = [];
  let leadParagraph = "";

  // Split by headings
  const headingTokens = cleanHtml.split(
    /(?:<h[2-4][^>]*>(.*?)<\/h[2-4]>|^#{2,4}\s*(.+?)$)/im
  );

  if (headingTokens.length > 2) {
    // Lead paragraph is content before first heading
    const leadText = headingTokens[0].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (leadText && leadText.length > 20) {
      leadParagraph = leadText;
    }

    let i = 1;
    let sIdx = 0;
    while (i < headingTokens.length) {
      const hTitle = (headingTokens[i] || headingTokens[i + 1] || "").replace(/<[^>]+>/g, "").trim();
      const hContent = (headingTokens[i + 2] || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      if (hTitle && hContent && hContent.length > 5) {
        sections.push({
          id: `section-${sIdx++}`,
          title: hTitle,
          content: hContent,
        });
      }
      i += 3;
    }
  }

  // If no explicit headings, parse paragraphs into lead + sections if there are multiple paragraphs
  if (sections.length === 0) {
    const pMatches = cleanHtml
      .split(/(?:<\/p>|\n\n+)/i)
      .map((p) => p.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim())
      .filter((p) => p.length > 20);

    if (pMatches.length > 1) {
      leadParagraph = pMatches[0];
      pMatches.slice(1).forEach((p, idx) => {
        sections.push({
          id: `section-${idx}`,
          title: `Section ${idx + 1}`,
          content: p,
        });
      });
    } else if (pMatches.length === 1) {
      leadParagraph = pMatches[0];
    }
  }

  // Ensure lead paragraph is set from excerpt if empty
  if (!leadParagraph && excerpt) {
    leadParagraph = excerpt;
  }

  // Key takeaways
  let keyTakeaways = Array.isArray(blog.keyTakeaways)
    ? blog.keyTakeaways.map((t) => String(t).trim()).filter(Boolean)
    : [];

  if (keyTakeaways.length === 0 && extractedBullets.length > 0) {
    keyTakeaways = extractedBullets.slice(0, 4);
  }

  // Title split into main and highlight (last word in purple #693092)
  const fullTitle = blog.title?.trim() || "";
  const words = fullTitle.split(/\s+/);
  let titleMain = fullTitle;
  let titleHighlight = "";
  if (words.length > 1) {
    titleHighlight = words[words.length - 1];
    titleMain = words.slice(0, -1).join(" ");
  }

  const topics = category ? [category] : [];

  return {
    category,
    tagBg: blog.tagBg || "bg-[#F6EEFA]",
    tagColor: blog.tagColor || "text-[#693092]",
    variant: blog.graphicVariant || "featured",
    titleMain,
    titleHighlight,
    fullTitle,
    excerpt: excerpt || leadParagraph,
    authorName: author,
    authorRole,
    authorInitials,
    date,
    readTime: blog.readTime || "",
    image: blog.image || null,
    leadParagraph,
    sections,
    cleanHtml,
    quoteText,
    quoteAuthor: author,
    keyTakeaways,
    topics,
  };
}

export default function BlogsDetailPage() {
  const { idOrSlug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const queryId = searchParams.get("id");
  const querySlug = searchParams.get("slug");
  const targetIdentifier = idOrSlug || queryId || querySlug || "";

  const [blog, setBlog] = useState<BlogPostDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [targetIdentifier]);

  // Fetch blog data from API
  useEffect(() => {
    let isMounted = true;

    const fetchDetail = async () => {
      try {
        setIsLoading(true);
        setError("");

        const res = await fetch(`/api/blogs/${encodeURIComponent(targetIdentifier)}`);
        const json = await res.json();

        if (!res.ok || !json.success || !json.data) {
          throw new Error(json.message || "Article not found");
        }

        if (isMounted) {
          setBlog(json.data);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error("Error loading blog detail:", err);
          setError(err.message || "Failed to load blog article");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchDetail();

    return () => {
      isMounted = false;
    };
  }, [targetIdentifier]);

  const parsed = blog ? parseUniversalBlogData(blog) : null;

  // Set document title
  useEffect(() => {
    if (parsed?.fullTitle) {
      document.title = `${parsed.fullTitle} | Netopsys Blog`;
    }
  }, [parsed?.fullTitle]);

  const handleShare = () => {
    navigator.clipboard?.writeText?.(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2400);
  };

  const scrollToSection = (idx: number) => {
    setActiveSection(idx);
    const element = document.getElementById(`section-${idx}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div
      className="min-h-screen w-full bg-[#F5EEF8] text-[#141010] flex flex-col overflow-x-clip selection:bg-[#693092] selection:text-white"
      style={{ fontFamily: "'Onest', sans-serif" }}
    >
      {/* Global Floating Navbar with Blogs active */}
      <Navbar activeTab="Blogs" />

      {/* Main Container */}
      <main className="relative flex-1 w-full pt-24 sm:pt-28 md:pt-30 pb-16 sm:pb-20 lg:pb-24 overflow-hidden blogdetail-page-main">
        {/* Subtle background tech grid */}
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(#693092 1px, transparent 1px), linear-gradient(90deg, #693092 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Ambient background glows */}
        <div className="absolute top-1/4 -right-48 w-96 h-96 rounded-full bg-[#BE3093]/10 blur-[140px] pointer-events-none" />
        <div className="absolute bottom-1/3 -left-48 w-96 h-96 rounded-full bg-[#693092]/10 blur-[140px] pointer-events-none" />

        <div className="relative w-full max-w-[2100px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-14 2xl:px-18">
          {/* Back to blogs link button */}
          <div className="mb-5 sm:mb-6 blogdetail-back-wrap">
            <button
              type="button"
              onClick={() => navigate("/blogs")}
              className="inline-flex items-center gap-2 text-xs sm:text-[13px] font-semibold text-[#6C6377] hover:text-[#693092] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>Back to all articles</span>
            </button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="py-28 flex flex-col items-center justify-center gap-4 bg-white/70 backdrop-blur-xs rounded-[28px] border border-[#ECE4F2]">
              <Loader2 className="w-9 h-9 text-[#693092] animate-spin" />
              <p className="text-sm font-medium text-[#716A7E]">Loading article...</p>
            </div>
          )}

          {/* Error State */}
          {!isLoading && (error || !blog) && (
            <div className="py-20 text-center bg-white rounded-[28px] border border-[#ECE4F2] px-6">
              <p className="text-lg font-bold text-[#141010] mb-2">{error || "Article not found"}</p>
              <p className="text-xs sm:text-sm text-[#716A7E] mb-6">
                The article you are looking for might have been moved or unpublished.
              </p>
              <button
                type="button"
                onClick={() => navigate("/blogs")}
                className="hover-brand-gradient bg-[#693092] text-white px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold cursor-pointer"
              >
                Browse All Articles
              </button>
            </div>
          )}

          {/* Full Article Content View */}
          {!isLoading && !error && blog && parsed && (
            <article className="space-y-6 sm:space-y-7">
              {/* ===================================================================
                  CARD 1: TOP HERO CARD (Single white card with title + graphic)
                  Matches Image 1 exactly
              =================================================================== */}
              <header className="bg-white rounded-[24px] sm:rounded-[28px] p-6 sm:p-8 md:p-10 border border-[#ECE4F2] shadow-[0_4px_24px_rgba(0,0,0,0.03)] blogdetail-hero-card">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center blogdetail-hero-grid">
                  {/* Left Column: Breadcrumb, Pill, Display Title, Excerpt, Author */}
                  <div className="lg:col-span-7 flex flex-col justify-start">
                    {/* Breadcrumb Navigation */}
                    <nav aria-label="Breadcrumb" className="mb-3.5 blogdetail-breadcrumb">
                      <ol className="inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-[13px] font-medium text-[#716A7E]">
                        <li>
                          <Link
                            to="/"
                            className="hover:text-[#693092] transition-colors cursor-pointer"
                          >
                            Home
                          </Link>
                        </li>
                        <li className="text-[#9C94A8]">/</li>
                        <li>
                          <Link
                            to="/blogs"
                            className="hover:text-[#693092] transition-colors cursor-pointer"
                          >
                            Blog
                          </Link>
                        </li>
                        <li className="text-[#9C94A8] flex items-center" aria-hidden="true">
                          <ChevronRight className="w-3 h-3 stroke-[2.2]" />
                        </li>
                        <li className="truncate max-w-[200px] sm:max-w-xs">
                          <span className="text-[#693092] font-semibold">
                            {parsed.fullTitle}
                          </span>
                        </li>
                      </ol>
                    </nav>

                    {/* Main Article Title: Standard Netopsys heading size and font-light style */}
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-light tracking-[-0.035em] text-[#141010] leading-[1.08] mb-4 sm:mb-5 blogdetail-hero-title">
                      {parsed.titleMain}{" "}
                      {parsed.titleHighlight && (
                        <span className="text-[#693092]">{parsed.titleHighlight}</span>
                      )}
                    </h1>

                    {/* Excerpt subtitle: Standard Netopsys description style and size */}
                    <p className="text-[#554E62] text-sm sm:text-base md:text-[16.5px] leading-relaxed font-normal mb-6 max-w-3xl blogdetail-hero-desc">
                      {parsed.excerpt}
                    </p>

                    {/* Author Meta Row: Avatar, Name, Date, Read Time */}
                    <div className="flex items-center gap-3 pt-2 blogdetail-hero-author">
                      <div className="w-9 h-9 rounded-full bg-[#EADBFA] text-[#693092] font-bold text-xs flex items-center justify-center shrink-0 select-none">
                        {parsed.authorInitials}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs sm:text-sm font-bold text-[#141010] leading-snug">
                          {parsed.authorName}
                        </span>
                        <span className="text-[11px] sm:text-xs text-[#716A7E]">
                          {parsed.date} · {parsed.readTime}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Hero Graphic Card with 3 overlapping circles */}
                  <div className="lg:col-span-5 w-full">
                    <HeroGraphicCard image={parsed.image} />
                  </div>
                </div>
              </header>

              {/* ===================================================================
                  MAIN BODY: 2-COLUMN LAYOUT
                  Left: Content Card + Magenta Quote Card
                  Right: 4 Sidebar Widgets (On this page, Key takeaways, Explore, Share)
              =================================================================== */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-7 items-start blogdetail-body-grid">
                {/* ---------------------------------------------------------------
                    LEFT COLUMN: Content Card + Magenta Quote Callout
                ---------------------------------------------------------------- */}
                <div className="lg:col-span-8 space-y-6">
                  {/* Card A: Numbered Article Content Canvas */}
                  <div className="bg-white rounded-[24px] sm:rounded-[28px] p-6 sm:p-8 md:p-10 border border-[#ECE4F2] shadow-[0_4px_24px_rgba(0,0,0,0.03)] blogdetail-content-card">
                    {/* Lead Paragraph with Amber/Gold Left Accent Border - Standard description size */}
                    {parsed.leadParagraph && (
                      <div className="border-l-2 border-[#FBAE42] pl-4 sm:pl-5 py-1 mb-8 sm:mb-9 blogdetail-lead">
                        <p className="text-[#554E62] text-sm sm:text-base md:text-[16.5px] leading-relaxed font-normal">
                          {parsed.leadParagraph}
                        </p>
                      </div>
                    )}

                    {/* Numbered Sections or Full Content */}
                    {parsed.sections.length > 0 ? (
                      <div className="space-y-8 sm:space-y-9 blogdetail-sections-wrap">
                        {parsed.sections.map((section, idx) => (
                          <section
                            key={section.id || idx}
                            id={`section-${idx}`}
                            className="scroll-mt-32"
                          >
                            {/* Heading with 01/02/03 Badge: Unified section heading size & style */}
                            <div className="flex items-center gap-3 mb-3">
                              <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs sm:text-[13px] font-bold bg-[#F6EEFA] text-[#693092] select-none shrink-0">
                                {String(idx + 1).padStart(2, "0")}
                              </span>
                              <h2 className="text-xl sm:text-2xl lg:text-[1.65rem] font-bold tracking-tight leading-snug text-[#141010] blogdetail-section-title">
                                {section.title}
                              </h2>
                            </div>

                            {/* Body text: Unified description size matching remaining pages */}
                            <p className="text-[#554E62] text-sm sm:text-base md:text-[16.5px] leading-relaxed font-normal pl-0 sm:pl-0.5 blogdetail-section-body">
                              {section.content}
                            </p>
                          </section>
                        ))}
                      </div>
                    ) : parsed.cleanHtml ? (
                      <div
                        className="text-[#554E62] text-sm sm:text-base md:text-[16.5px] leading-relaxed font-normal space-y-4"
                        dangerouslySetInnerHTML={{ __html: parsed.cleanHtml }}
                      />
                    ) : null}
                  </div>

                  {/* Card B: Quote Callout Card (Only shown if quote exists) */}
                  {parsed.quoteText && (
                    <div className="bg-[#A12F91] text-white rounded-[24px] sm:rounded-[28px] p-7 sm:p-9 relative overflow-hidden shadow-sm blogdetail-quote-card">
                      {/* Ambient subtle circles in bottom right */}
                      <div className="absolute -right-8 -bottom-8 w-36 h-36 rounded-full bg-white/10 pointer-events-none" />
                      <div className="absolute right-12 bottom-3 w-14 h-14 rounded-full bg-[#FBAE42]/40 pointer-events-none" />

                      <div className="relative z-10 max-w-xl">
                        <p className="text-lg sm:text-xl md:text-[22px] font-bold leading-snug tracking-[-0.02em] mb-4">
                          &ldquo;{parsed.quoteText}&rdquo;
                        </p>
                        {parsed.quoteAuthor && (
                          <p className="text-xs sm:text-sm font-medium text-white/90">
                            — {parsed.quoteAuthor}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* ---------------------------------------------------------------
                    RIGHT COLUMN: 4 Sidebar Cards
                ---------------------------------------------------------------- */}
                <div className="lg:col-span-4 space-y-6 blogdetail-sidebar">
                  {/* Widget 1: On this page (Only shown if sections exist) */}
                  {parsed.sections.length > 0 && (
                    <div className="bg-white rounded-[20px] p-6 sm:p-7 border border-[#ECE4F2] shadow-sm blogdetail-sidebar-card">
                      <h3 className="text-sm sm:text-[15px] font-bold tracking-wider uppercase text-[#141010] mb-4 select-none">
                        On this page
                      </h3>
                      <nav className="space-y-3.5">
                        {parsed.sections.map((section, idx) => {
                          const isActive = activeSection === idx;
                          return (
                            <button
                              key={section.id || idx}
                              type="button"
                              onClick={() => scrollToSection(idx)}
                              className={`w-full text-left text-sm sm:text-base md:text-[16px] leading-snug transition-colors flex items-start gap-3 cursor-pointer ${
                                isActive
                                  ? "text-[#693092] font-semibold"
                                  : "text-[#716A7E] hover:text-[#141010]"
                              }`}
                            >
                              <span
                                className={`w-1 h-5 rounded-full shrink-0 mt-0.5 transition-colors ${
                                  isActive ? "bg-[#FBAE42]" : "bg-transparent"
                                }`}
                              />
                              <span className="truncate">{section.title}</span>
                            </button>
                          );
                        })}
                      </nav>
                    </div>
                  )}

                  {/* Widget 2: Key takeaways (Only shown if key takeaways exist) */}
                  {parsed.keyTakeaways && parsed.keyTakeaways.length > 0 && (
                    <div className="bg-[#2A124E] text-white rounded-[22px] p-6 sm:p-7 relative overflow-hidden shadow-md blogdetail-sidebar-card">
                      {/* Decorative corner aura */}
                      <div className="absolute top-2 right-2 w-16 h-16 rounded-full bg-white/5 pointer-events-none" />
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-4 select-none">
                        Key takeaways
                      </h3>
                      <ul className="space-y-4 text-sm sm:text-base md:text-[16px] text-white/90 leading-relaxed font-normal">
                        {parsed.keyTakeaways.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <span className="w-2 h-2 rounded-full bg-[#FBAE42] mt-2 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Widget 3: Share this article */}
                  <div className="bg-white rounded-[20px] p-6 sm:p-7 border border-[#ECE4F2] shadow-sm blogdetail-sidebar-card">
                    <h3 className="text-sm sm:text-[15px] font-bold tracking-wider uppercase text-[#141010] mb-4 select-none">
                      Share this article
                    </h3>
                    <div className="flex items-center gap-3">
                      {/* LinkedIn */}
                      <a
                        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                          shareUrl
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full border border-[#E2DBEA] bg-white hover:bg-[#F6EEFA] hover:text-[#693092] text-[#554E62] flex items-center justify-center text-sm font-bold transition-all shadow-2xs"
                        title="Share on LinkedIn"
                      >
                        in
                      </a>
                      {/* Twitter / X */}
                      <a
                        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                          shareUrl
                        )}&text=${encodeURIComponent(parsed.fullTitle)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full border border-[#E2DBEA] bg-white hover:bg-[#F6EEFA] hover:text-[#693092] text-[#554E62] flex items-center justify-center text-sm font-bold transition-all shadow-2xs"
                        title="Share on X"
                      >
                        x
                      </a>
                      {/* Copy Link */}
                      <button
                        type="button"
                        onClick={handleShare}
                        className="w-10 h-10 rounded-full border border-[#E2DBEA] bg-white hover:bg-[#F6EEFA] hover:text-[#693092] text-[#554E62] flex items-center justify-center text-sm transition-all shadow-2xs cursor-pointer"
                        title="Copy Link"
                      >
                        {copiedLink ? (
                          <Check className="w-4 h-4 text-[#16A34A]" />
                        ) : (
                          <Share2 className="w-4 h-4" />
                        )}
                      </button>
                      {copiedLink && (
                        <span className="text-xs sm:text-[13px] font-semibold text-[#16A34A]">
                          Copied!
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ===================================================================
                  CARD 5: BOTTOM CTA BANNER
              =================================================================== */}
              <div className="mt-8 sm:mt-12 w-full">
                <div className="w-full bg-[#2A1450] rounded-2xl sm:rounded-3xl px-6 sm:px-10 lg:px-14 py-10 sm:py-14 lg:py-16 shadow-xl shadow-[#2A1450]/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 cta-banner-card">
                  <div>
                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-light tracking-[-0.035em] leading-[1.1] text-white mb-2 cta-banner-title">
                      Ready to transform your enterprise workflows?
                    </h3>
                    <p className="text-white/80 text-sm sm:text-base md:text-[16.5px] leading-relaxed font-normal cta-banner-subtitle">
                      Let&apos;s build intelligent solutions together
                    </p>
                  </div>
                  <Link
                    to="/contact"
                    className="hover-brand-gradient inline-flex items-center justify-center bg-[#FBAE42] text-black hover:text-white font-medium text-xs sm:text-sm px-7 py-3 rounded-full shadow-md whitespace-nowrap cursor-pointer transition-colors cta-banner-btn"
                  >
                    Let&apos;s Connect
                  </Link>
                </div>
              </div>
            </article>
          )}
        </div>
      </main>

      {/* Website Footer & Back to Hero */}
      <Footer />
      <BackToHeroButton />
    </div>
  );
}
