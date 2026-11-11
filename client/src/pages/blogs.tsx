import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, Loader2 } from "lucide-react";
import Navbar from "../componenets/navbar.tsx";
import Footer from "../componenets/footer.tsx";
import BackToHeroButton from "../componenets/back-to-hero.tsx";

// ============================================================================
// TYPES & DATA
// ============================================================================

export interface BlogPost {
  id: string | number;
  slug: string;
  title: string;
  excerpt: string;
  category?: string;
  tag?: string;
  tagBg?: string;
  tagColor?: string;
  graphicVariant: "featured" | "ml" | "nlp" | "erp";
  image?: string | null;
  date: string;
  readTime: string;
  author: {
    name: string;
    initials: string;
    role: string;
  };
  isFeatured?: boolean;
  content: string[] | string;
  keyTakeaways: string[];
}

// ============================================================================
// VECTOR GRAPHIC COMPONENT (Matching screenshot circles & lines)
// ============================================================================

function BlogGraphic({
  variant = "featured",
  className = "",
}: {
  variant?: "featured" | "ml" | "nlp" | "erp";
  className?: string;
}) {
  // Color combinations matching the screenshot
  const configs = {
    featured: {
      bg: "bg-[#EAE0F5]",
      c1: "#FBAE42", // amber/gold
      c2: "#D13B89", // magenta
      c3: "#693092", // deep purple
    },
    ml: {
      bg: "bg-[#F6EEFA]",
      c1: "#693092", // purple
      c2: "#FBAE42", // amber
      c3: "#D13B89", // magenta
    },
    nlp: {
      bg: "bg-[#FEF7EE]",
      c1: "#FBAE42", // amber
      c2: "#D13B89", // magenta
      c3: "#693092", // purple
    },
    erp: {
      bg: "bg-[#F0F4FC]",
      c1: "#693092", // purple
      c2: "#FBAE42", // amber
      c3: "#D13B89", // magenta
    },
  };

  const { bg, c1, c2, c3 } = configs[variant] || configs.featured;

  return (
    <div
      className={`blogs-graphic-wrap relative w-full h-full min-h-[170px] sm:min-h-[190px] rounded-[20px] ${bg} flex items-center justify-center overflow-hidden select-none ${className}`}
    >
      <svg
        viewBox="0 0 400 230"
        className="w-full h-full object-contain p-2"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id={`glow-${variant}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ambient background soft radial aura */}
        <circle cx="200" cy="115" r="110" fill="white" fillOpacity="0.18" />

        {/* Outer orbital geometric ring */}
        <circle
          cx="200"
          cy="115"
          r="86"
          stroke="white"
          strokeWidth="1.25"
          strokeOpacity="0.75"
        />

        {/* Horizontal axis line */}
        <line
          x1="35"
          y1="115"
          x2="365"
          y2="115"
          stroke="white"
          strokeWidth="1.4"
          strokeOpacity="0.75"
        />

        {/* Group with blend mode for rich color overlays */}
        <g style={{ mixBlendMode: "multiply" }} opacity="0.88">
          {/* Circle 1 (Left) */}
          <circle cx="140" cy="115" r="58" fill={c1} />

          {/* Circle 2 (Center) */}
          <circle cx="200" cy="115" r="58" fill={c2} />

          {/* Circle 3 (Right) */}
          <circle cx="260" cy="115" r="58" fill={c3} />
        </g>

        {/* Subtle white foreground accent ring */}
        <circle
          cx="200"
          cy="115"
          r="58"
          stroke="white"
          strokeWidth="1.2"
          strokeOpacity="0.5"
        />

        {/* Orbit coordinate pin dots */}
        <circle cx="114" cy="115" r="2.5" fill="white" fillOpacity="0.9" />
        <circle cx="286" cy="115" r="2.5" fill="white" fillOpacity="0.9" />
      </svg>
    </div>
  );
}

// ============================================================================
// MAIN BLOGS PAGE COMPONENT
// ============================================================================

export default function BlogsPage() {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch blogs dynamically from backend API
  useEffect(() => {
    let isMounted = true;
    const fetchBlogs = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/blogs");
        if (!res.ok) throw new Error("Failed to fetch blogs");
        const json = await res.json();
        if (isMounted && json.success && Array.isArray(json.data)) {
          setBlogs(json.data);
        }
      } catch (err) {
        console.error("Error loading blogs:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchBlogs();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div
      className="min-h-screen w-full bg-[#F5EEF8] text-[#141010] flex flex-col overflow-x-clip selection:bg-[#693092] selection:text-white"
      style={{ fontFamily: "'Onest', sans-serif" }}
    >
      {/* Global Navbar with Blogs link active */}
      <Navbar activeTab="Blogs" />

      {/* Main Interactive Blogs Section matching style and width of remaining pages */}
      <main className="blogs-page-main relative flex-1 w-full pt-24 sm:pt-28 md:pt-30 pb-16 sm:pb-20 lg:pb-24 select-none overflow-hidden">
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

        {/* Main Container - Expanded width matching all remaining pages (max-w-[2100px]) */}
        <div className="relative w-full max-w-[2100px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-14 2xl:px-18">
          {/* ===================================================================
              HEADER: Breadcrumb, Eyebrow, Main Title, Subtitle, View All Button
          =================================================================== */}
          <div className="blogs-page-header w-full mb-8 sm:mb-10">
            {/* Breadcrumb Navigation: Home > Blogs */}
            <nav aria-label="Breadcrumb" className="blogs-page-breadcrumb mb-4 sm:mb-5">
              <ol className="inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-[13.5px] font-medium">
                <li>
                  <Link
                    to="/"
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    className="text-[#6C6377] hover:text-[#693092] transition-colors cursor-pointer"
                  >
                    Home
                  </Link>
                </li>
                <li className="text-[#9C94A8] flex items-center" aria-hidden="true">
                  <ChevronRight className="w-3.5 h-3.5 stroke-[2.2]" />
                </li>
                <li>
                  <span className="text-[#693092] font-semibold">Blogs</span>
                </li>
              </ol>
            </nav>

            {/* Main Title - Matches exact text style, font-light, tracking, and responsive sizes from remaining pages */}
            <h1 className="blogs-page-title text-4xl sm:text-5xl md:text-6xl lg:text-[4.75rem] font-light tracking-[-0.035em] leading-[1.04] text-[#141010] mb-4 sm:mb-5 lg:mb-6">
              Insights from the <br />
              <span className="text-[#693092]">Netopsys team</span>
            </h1>

            {/* Subtitle & View All Articles Button - Matches text-[#554E62] and size scale from remaining pages */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-2">
              <p className="blogs-page-desc text-[#554E62] text-sm sm:text-base md:text-[16px] lg:text-[17px] leading-relaxed font-normal max-w-2xl">
                Ideas, guides and stories on AI, machine learning and enterprise technology,
                written by the people who build it.
              </p>

            </div>
          </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="py-24 flex flex-col items-center justify-center gap-3 bg-white/60 backdrop-blur-xs rounded-[26px] border border-[#ECE4F2] mb-12">
            <Loader2 className="w-8 h-8 text-[#5D2381] animate-spin" />
            <p className="text-sm font-medium text-[#716A7E]">Loading articles from database...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && blogs.length === 0 && (
          <div className="py-20 text-center bg-white/70 rounded-[26px] border border-[#ECE4F2] mb-12">
            <p className="text-base font-semibold text-[#141010] mb-1">No blog articles found</p>
            <p className="text-xs text-[#716A7E]">Check back soon for new articles.</p>
          </div>
        )}

        {/* ===================================================================
            3-COLUMN ARTICLES GRID
        =================================================================== */}
        {!isLoading && blogs.length > 0 && (
          <div className="blogs-page-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 items-stretch">
            {blogs.map((post) => (
              <div
                key={post.id}
                onClick={() => navigate(`/blogs-detail?id=${post.id}`)}
                className="blogs-page-card group bg-white rounded-[24px] p-5 sm:p-5.5 border border-[#ECE4F2] shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_28px_rgba(93,35,129,0.07)] hover:-translate-y-1 transition-all flex flex-col justify-between cursor-pointer h-auto min-w-0 break-words"
              >
                <div>
                  {/* Visual Graphic Box or Custom Cover Image */}
                  <div className="blogs-page-card-media mb-4">
                    {post.image ? (
                      <div className="aspect-[16/10] rounded-[20px] overflow-hidden bg-gray-100 border border-black/5">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <BlogGraphic variant={post.graphicVariant} className="aspect-[16/10]" />
                    )}
                  </div>

                  {/* Article Title */}
                  <h3 className="blogs-page-card-title text-lg sm:text-xl md:text-[21px] font-light tracking-[-0.025em] text-[#141010] leading-snug mb-2 group-hover:text-[#693092] transition-colors">
                    {post.title}
                  </h3>

                  {/* Excerpt - Matches description sizes and text color */}
                  <p className="blogs-page-card-excerpt text-[#554E62] text-xs sm:text-sm md:text-[14px] leading-relaxed font-normal mb-5">
                    {post.excerpt}
                  </p>
                </div>

                {/* Card Footer: Date & Read more */}
                <div className="blogs-page-card-footer flex items-center justify-between pt-3 border-t border-[#F5EEF8] text-xs mt-auto">
                  <span className="text-[#8E869B]">
                    {post.date} · {post.readTime}
                  </span>
                  <span className="text-[#693092] font-semibold group-hover:text-[#BE3093] group-hover:underline">
                    Read article
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ===================================================================
            BOTTOM CTA BANNER: "Ready to get started? Let's build something great together."
            (Matching exact height, padding, rounded corners, bg color, and hover-brand-gradient from remaining pages)
        =================================================================== */}
        <div className="mt-8 sm:mt-10 lg:mt-14 mb-8 w-full">
          <div className="w-full bg-[#2A1450] rounded-2xl sm:rounded-3xl px-6 sm:px-10 lg:px-14 py-10 sm:py-14 lg:py-16 shadow-xl shadow-[#2A1450]/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 cta-banner-card">
            {/* Left Texts: Heading and subtitle */}
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2.5 sm:gap-4 md:gap-6">
              <h3 className="text-2xl sm:text-3xl md:text-[2rem] font-light tracking-[-0.035em] text-white whitespace-nowrap cta-banner-title">
                Ready to get started?
              </h3>
              <span className="text-white/85 text-xs sm:text-sm md:text-[15px] font-normal cta-banner-subtitle">
                Let&apos;s build something great together
              </span>
            </div>

            {/* Right Button */}
            <div className="flex-shrink-0">
              <Link
                to="/#contact"
                className="cta-banner-btn hover-brand-gradient inline-flex items-center justify-center bg-[#FBAE42] text-black hover:text-white font-medium text-xs sm:text-sm md:text-[15px] px-7 sm:px-8 py-3 sm:py-3.5 rounded-full shadow-md whitespace-nowrap cursor-pointer transition-colors"
              >
                Let&apos;s Connect
              </Link>
            </div>
          </div>
        </div>
      </div>
      </main>

      {/* Website Footer & Back to Hero */}
      <Footer />
      <BackToHeroButton />
    </div>
  );
}

export { BlogsPage };
