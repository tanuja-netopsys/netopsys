import { useEffect, useState, useRef } from "react";
import { Link, useSearchParams, useParams } from "react-router-dom";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import {
  ArrowLeft,
  TrendingUp,
  Database,
  Code2,
  ShieldCheck,
  Layers,
  DollarSign,
  Box,
  Users,
  MessageSquare,
  Cpu,
} from "lucide-react";
import Navbar from "../componenets/navbar.tsx";
import Footer from "../componenets/footer.tsx";
import BackToHeroButton from "../componenets/back-to-hero.tsx";

// Portfolio projects data with rich details
const PORTFOLIO_PROJECTS = {
  "01": {
    id: "01",
    name: "BizOne",
    taglinePart1: "Intelligent ERP",
    taglinePart2: "Solutions",
    statusBadge: "DEPLOYED & ACTIVE",
    description:
      "AI-driven Enterprise Resource Planning system that automates business processes, optimizes workflows, and provides intelligent insights.",
    tags: ["AI Automation", "Business Intelligence", "Process Optimization"],
    image: "/portfolio/portfolio-2.jpg",
    benefits: [
      {
        value: "40%",
        label: "Efficiency Gain",
        icon: TrendingUp,
        iconBg: "bg-[#FBAE42]",
        iconColor: "text-[#141010]",
        barColor: "#FBAE42",
      },
      {
        value: "85%",
        label: "Data Reduction",
        icon: Database,
        iconBg: "bg-[#BE3093]",
        iconColor: "text-white",
        barColor: "#BE3093",
      },
      {
        value: "200+",
        label: "API Endpoints",
        icon: Code2,
        iconBg: "bg-[#8B5CF6]",
        iconColor: "text-white",
        barColor: "#8B5CF6",
      },
      {
        value: "SOX/GDPR",
        label: "Compliance",
        icon: ShieldCheck,
        iconBg: "bg-white/95",
        iconColor: "text-[#475569]",
        barColor: "#FBAE42",
      },
    ],
    overview:
      "Transform your business operations with our AI-driven Enterprise Resource Planning system that seamlessly integrates all business processes while providing intelligent automation and predictive insights.",
    featuresTop: [
      {
        num: "01",
        title: "Financial Management",
        desc: "AI-powered accounting, budgeting, and financial forecasting with real-time insights.",
        icon: DollarSign,
      },
      {
        num: "02",
        title: "Supply Chain Optimization",
        desc: "Intelligent inventory management and demand prediction.",
        icon: Box,
      },
      {
        num: "03",
        title: "Human Resources",
        desc: "Automated payroll, performance tracking, and talent management.",
        icon: Users,
      },
    ],
    featuresBottom: [
      {
        num: "04",
        title: "Customer Relationship Management",
        desc: "AI-enhanced customer insights and automated support.",
        icon: MessageSquare,
      },
      {
        num: "05",
        title: "Manufacturing Intelligence",
        desc: "Production optimization and quality control automation.",
        icon: Cpu,
      },
    ],
  },
  "02": {
    id: "02",
    name: "Skill Bridge",
    taglinePart1: "Security Operations",
    taglinePart2: "Center (SOC)",
    statusBadge: "DEPLOYED & ACTIVE",
    description:
      "Comprehensive Security Operations Center training platform with real-world threat hunting, live incident triage, and hands-on cyber defense labs.",
    tags: ["SIEM & Threat Hunting", "Incident Response", "Network Defense"],
    image: "/portfolio/portfolio-3.jpg",
    benefits: [
      {
        value: "120+ hrs",
        label: "Hands-on Lab Hours",
        icon: TrendingUp,
        iconBg: "bg-[#FBAE42]",
        iconColor: "text-[#141010]",
        barColor: "#FBAE42",
      },
      {
        value: "85+",
        label: "Threat Scenarios",
        icon: Database,
        iconBg: "bg-[#BE3093]",
        iconColor: "text-white",
        barColor: "#BE3093",
      },
      {
        value: "96%",
        label: "Certification Rate",
        icon: Code2,
        iconBg: "bg-[#8B5CF6]",
        iconColor: "text-white",
        barColor: "#8B5CF6",
      },
      {
        value: "ISO 27001",
        label: "Framework Compliant",
        icon: ShieldCheck,
        iconBg: "bg-white/95",
        iconColor: "text-[#475569]",
        barColor: "#FBAE42",
      },
    ],
    overview:
      "Skill Bridge is an intensive Security Operations Center training program designed to equip cybersecurity professionals with real-world defensive skills across SIEM monitoring, threat detection, and live incident triage.",
    featuresTop: [
      {
        num: "01",
        title: "SIEM Log Forensics",
        desc: "Deep-dive analysis with Splunk and ELK for anomaly correlation and threat alerts.",
        icon: DollarSign,
      },
      {
        num: "02",
        title: "Threat Intelligence",
        desc: "Automated ingestion of global threat feeds and zero-day attack indicators.",
        icon: Box,
      },
      {
        num: "03",
        title: "Incident Response Drills",
        desc: "Real-time simulated cyber attack tabletop exercises and response automation.",
        icon: Users,
      },
    ],
    featuresBottom: [
      {
        num: "04",
        title: "Network Defense Architecture",
        desc: "Deep packet inspection, intrusion detection, and perimeter lockdown techniques.",
        icon: MessageSquare,
      },
      {
        num: "05",
        title: "EDR & XDR Tooling",
        desc: "Hands-on endpoint detection, memory forensics, and containment workflows.",
        icon: Cpu,
      },
    ],
  },
  "03": {
    id: "03",
    name: "AI Candidate Assessment",
    taglinePart1: "Secure Evaluation &",
    taglinePart2: "Proctoring",
    statusBadge: "DEPLOYED & ACTIVE",
    description:
      "Comprehensive AI-powered platform for secure candidate evaluation with advanced proctoring, skill assessment, and automated scoring systems.",
    tags: ["Computer Vision", "Facial Biometrics", "Automated Proctoring"],
    image: "/portfolio/portfolio-1.jpg",
    benefits: [
      {
        value: "99.4%",
        label: "Proctoring Accuracy",
        icon: TrendingUp,
        iconBg: "bg-[#FBAE42]",
        iconColor: "text-[#141010]",
        barColor: "#FBAE42",
      },
      {
        value: "250K+",
        label: "Candidates Evaluated",
        icon: Database,
        iconBg: "bg-[#BE3093]",
        iconColor: "text-white",
        barColor: "#BE3093",
      },
      {
        value: "65%",
        label: "Time Saved",
        icon: Code2,
        iconBg: "bg-[#8B5CF6]",
        iconColor: "text-white",
        barColor: "#8B5CF6",
      },
      {
        value: "SOC-2",
        label: "Data Privacy Certified",
        icon: ShieldCheck,
        iconBg: "bg-white/95",
        iconColor: "text-[#475569]",
        barColor: "#FBAE42",
      },
    ],
    overview:
      "Engineered an enterprise-grade proctoring and assessment platform utilizing computer vision, audio anomaly detection, and automated keystroke biometric scoring to safeguard exam integrity at massive global scale.",
    featuresTop: [
      {
        num: "01",
        title: "Facial Verification & Eye Tracking",
        desc: "Continuous face verification and gaze tracking to detect unauthorized assistance.",
        icon: DollarSign,
      },
      {
        num: "02",
        title: "Audio Anomaly Detection",
        desc: "Real-time background voice isolation and multi-speaker detection algorithms.",
        icon: Box,
      },
      {
        num: "03",
        title: "Secure Browser Lockdown",
        desc: "Prevents screen sharing, tab switching, and unauthorized external monitors.",
        icon: Users,
      },
    ],
    featuresBottom: [
      {
        num: "04",
        title: "Automated Code Analysis",
        desc: "Syntax validation, cyclomatic complexity scoring, and plagiarism checks.",
        icon: MessageSquare,
      },
      {
        num: "05",
        title: "Instant Verification Reports",
        desc: "AI-generated candidate scorecards with timestamped audit trails and video replays.",
        icon: Cpu,
      },
    ],
  },
};

export default function PortfolioDetailPage() {
  const { projectId: paramId } = useParams();
  const [searchParams] = useSearchParams();

  const rawId = (paramId || searchParams.get("id") || "01").toLowerCase();
  const [dbProject, setDbProject] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;
    if (rawId) {
      fetch(`/api/projects/${rawId}`)
        .then((r) => r.json())
        .then((json) => {
          if (isMounted && json.success && json.data) {
            setDbProject(json.data);
          }
        })
        .catch(() => {});
    }
    return () => {
      isMounted = false;
    };
  }, [rawId]);

  let key: "01" | "02" | "03" = "01";
  if (rawId === "02" || rawId === "2" || rawId.includes("skill")) key = "02";
  else if (rawId === "03" || rawId === "3" || rawId.includes("assessment")) key = "03";

  const baseProject = PORTFOLIO_PROJECTS[key] || PORTFOLIO_PROJECTS["01"];
  const project = dbProject
    ? {
        ...baseProject,
        name: dbProject.title,
        taglinePart1: "",
        taglinePart2: "",
        statusBadge: (dbProject.status || "DEPLOYED & ACTIVE").toUpperCase(),
        description: dbProject.description || baseProject.description,
        tags: Array.isArray(dbProject.technologies) && dbProject.technologies.length > 0 ? (dbProject.technologies as string[]) : baseProject.tags,
        image: dbProject.image || baseProject.image,
        overview: dbProject.extendedDescription || dbProject.description || baseProject.overview,
      }
    : baseProject;

  // Track responsive screen size for horizontal calculation
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 1024 : true
  );
  const [isSmallMobile, setIsSmallMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 640 : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
      setIsSmallMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Scroll animation driven smoothly by actual scroll distance
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const smoothScrollY = useSpring(scrollY, {
    stiffness: 140,
    damping: 26,
    mass: 0.35,
  });

  const imageWidth = useTransform(
    smoothScrollY,
    [0, 280],
    [isDesktop ? "100%" : "100%", isDesktop ? "54%" : "100%"]
  );

  const imageHeight = useTransform(
    smoothScrollY,
    [0, 280],
    [
      isDesktop ? "660px" : isSmallMobile ? "220px" : "320px",
      isDesktop ? "480px" : isSmallMobile ? "220px" : "300px",
    ]
  );

  const textOpacity = useTransform(
    smoothScrollY,
    [50, 250],
    [isDesktop ? 0 : 1, 1]
  );

  const textX = useTransform(
    smoothScrollY,
    [50, 250],
    [isDesktop ? -30 : 0, 0]
  );

  const textPointerEvents = useTransform(smoothScrollY, (v) =>
    !isDesktop || v > 100 ? "auto" : "none"
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    document.title = `${project.name} | ${project.taglinePart1} ${project.taglinePart2} - Netopsys Portfolio`;
  }, [project]);

  return (
    <div
      className="min-h-screen w-full bg-[#F5EEF8] text-[#141010] flex flex-col selection:bg-[#693092] selection:text-white"
      style={{ fontFamily: "'Onest', sans-serif" }}
    >
      {/* Floating Pill Navbar */}
      <Navbar activeTab="Portfolio" />

      {/* Main Content Area - Full width matching remaining pages */}
      <main className="relative w-full z-10 flex-1 pb-20 sm:pb-28 select-none portfoliodetail-page-main">
        {/* Subtle background tech grid and ambient glows clipped in their own container */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                "linear-gradient(#693092 1px, transparent 1px), linear-gradient(90deg, #693092 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
          <div className="absolute top-1/4 -right-48 w-96 h-96 rounded-full bg-[#BE3093]/10 blur-[140px]" />
          <div className="absolute bottom-1/3 -left-48 w-96 h-96 rounded-full bg-[#693092]/10 blur-[140px]" />
        </div>

        {/* =========================================================================
            PINNED HERO ANIMATION SECTION
            - On load: Full-width large hero image placed strictly below navbar without text.
            - On scroll: Contracts ONLY horizontally to the side (54% width) & smoothly adjusts height to 480px.
            - Stays pinned at top-28 until reveal is complete, then bottom content scrolls up directly.
        ========================================================================= */}
        <div ref={heroRef} className="relative w-full min-h-[360px] sm:min-h-[460px] h-auto lg:h-[930px] pt-20 sm:pt-24 lg:pt-26 portfoliodetail-hero-wrap">
          <div
            className="relative lg:sticky top-0 lg:top-24 xl:top-28 w-full flex flex-col justify-start overflow-visible pt-1 portfoliodetail-pinned-wrap"
            style={{
              top: isDesktop ? "6rem" : undefined,
            }}
          >
            <div className="relative w-full max-w-[2100px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-14 2xl:px-18">
              {/* Back to Projects link */}
              <div className="mb-3.5 sm:mb-4 lg:mb-5 portfoliodetail-back-wrap">
                <Link
                  to="/portfolio"
                  className="inline-flex items-center gap-2 text-xs sm:text-[13px] font-semibold text-[#6C6377] hover:text-[#693092] transition-colors cursor-pointer select-none w-fit"
                  aria-label="Back to Projects"
                >
                  <ArrowLeft className="w-3.5 h-3.5 stroke-[2.2]" />
                  <span>Back to Portfolio</span>
                </Link>
              </div>

              <div className="relative w-full flex flex-col lg:flex-row items-start justify-between min-h-[360px] lg:min-h-[480px] portfoliodetail-hero-row">
                {/* Left Column: Badge, Titles, Description, Tags (Reveals on scroll) */}
                <motion.div
                  style={{
                    opacity: textOpacity,
                    x: textX,
                    pointerEvents: textPointerEvents,
                  }}
                  className="order-2 lg:order-1 w-full lg:w-[42%] text-left z-10 pt-1 lg:pt-2 portfoliodetail-hero-text"
                >
                  {/* Status Badge */}
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#10B981]/30 shadow-xs mb-3.5 sm:mb-4">
                    <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                    <span className="text-[11px] font-bold tracking-wider text-[#059669] uppercase">
                      {project.statusBadge}
                    </span>
                  </div>

                  {/* Main Heading matching services detail page heading style */}
                  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] xl:text-[4.75rem] font-light tracking-[-0.035em] leading-[1.04] text-[#141010] portfoliodetail-hero-title">
                    <span className="block">{project.name}</span>
                    <span className="block text-[#693092] mt-0.5">{project.taglinePart1}</span>
                    <span className="block text-[#693092]">{project.taglinePart2}</span>
                  </h1>

                  {/* Description matching services detail page subtitle */}
                  <p className="text-[#554E62] text-sm sm:text-base md:text-[16px] font-normal leading-relaxed mt-4 sm:mt-5 mb-5 sm:mb-6 max-w-xl portfoliodetail-hero-desc">
                    {project.description}
                  </p>

                  {/* Tags / Pills */}
                  <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap portfoliodetail-tags">
                    {project.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-4 sm:px-5 py-1.5 sm:py-2 rounded-full bg-[#EBDFF1] text-[#693092] text-xs sm:text-[13px] font-semibold border border-[#BE3093]/10 shadow-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </motion.div>

                {/* Right-anchored Featured Image:
                    Starts 100% full width of the container & 660px tall.
                    On scroll, contracts ONLY horizontally into the right column (54% width, 480px height).
                    Does NOT move up vertically. */}
                <div className="order-1 lg:order-2 lg:absolute lg:right-0 lg:top-0 w-full flex justify-end z-20 pointer-events-none mb-6 lg:mb-0">
                  <motion.div
                    style={{
                      width: imageWidth,
                      height: imageHeight,
                      pointerEvents: "auto",
                    }}
                    className="rounded-2xl sm:rounded-3xl overflow-hidden border border-black/[0.08] shadow-2xl shadow-purple-950/15 bg-[#120727] origin-right portfoliodetail-hero-img"
                  >
                    <img
                      src={project.image}
                      alt={`${project.name} preview`}
                      className="w-full h-full object-cover object-center"
                    />
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Container for Following Sections */}
        <div className="relative w-full max-w-[2100px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-14 2xl:px-18">
          {/* ================================================================ */}
          {/* SECTION 2: BENEFITS CARD (Rich Purple Container)                 */}
          {/* ================================================================ */}
          <section className="mt-4 sm:mt-6 lg:mt-6 w-full bg-[#521C74] rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-11 shadow-2xl shadow-[#521C74]/25 text-white mb-10 sm:mb-14 portfoliodetail-benefits-section">
            <h2 className="text-3xl sm:text-4xl md:text-[2.65rem] lg:text-[3rem] font-light tracking-[-0.035em] leading-[1.08] text-white mb-6 sm:mb-7 portfoliodetail-section-title">
              Benefits
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 portfoliodetail-benefits-grid">
              {project.benefits.map((benefit, idx) => {
                const IconComponent = benefit.icon;
                return (
                  <div
                    key={idx}
                    className="bg-[#3B1156]/70 backdrop-blur-md rounded-2xl p-5 sm:p-6 border border-white/10 flex flex-col justify-between hover:bg-[#3B1156]/90 transition-all duration-200 portfoliodetail-benefit-card"
                  >
                    {/* Top Row: Icon badge */}
                    <div className="flex items-center">
                      <div
                        className={`w-10 h-10 rounded-xl ${benefit.iconBg} ${benefit.iconColor} flex items-center justify-center shadow-md`}
                      >
                        <IconComponent className="w-5 h-5 stroke-[2.2]" />
                      </div>
                    </div>

                    {/* Metric Value & Label */}
                    <div className="mt-6 sm:mt-7">
                      <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-1 portfoliodetail-metric-val">
                        {benefit.value}
                      </div>
                      <div className="text-xs sm:text-[13px] text-white/80 font-normal">
                        {benefit.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ================================================================ */}
          {/* SECTION 3: OVERVIEW WINDOW CARD (Mockup Window with 3 Dots)       */}
          {/* ================================================================ */}
          <section className="w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-[#693092]/10 shadow-sm bg-white mb-12 sm:mb-16 portfoliodetail-overview-section">

            {/* Window Content */}
            <div className="p-7 sm:p-10 lg:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 sm:gap-10 lg:gap-12 portfoliodetail-overview-content">
              {/* Left Column: Icon + "Overview" Title (Side by Side) */}
              <div className="flex items-center gap-3.5 sm:gap-4 shrink-0">
                <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-[#BE3093] text-white flex items-center justify-center shadow-md shadow-[#BE3093]/30 shrink-0">
                  <Layers className="w-6 h-6 stroke-[2.2]" />
                </div>
                <h3 className="text-2xl sm:text-3xl md:text-[2.65rem] lg:text-[3rem] font-light tracking-[-0.035em] leading-[1.08] text-[#141010] portfoliodetail-section-title">
                  Overview
                </h3>
              </div>

              {/* Vertical divider on desktop */}
              <div className="hidden md:block w-px self-stretch bg-black/[0.08]" />

              {/* Right Column: Paragraph moved across right side */}
              <p className="text-[#554E62] text-sm sm:text-base md:text-[17px] font-normal leading-relaxed flex-1 portfoliodetail-overview-desc">
                {project.overview}
              </p>
            </div>
          </section>

          {/* ================================================================ */}
          {/* SECTION 4: KEY FEATURES (3 cards top row, 2 cards bottom row)    */}
          {/* ================================================================ */}
          <section className="w-full mb-14 sm:mb-18 portfoliodetail-features-section">
            <h2 className="text-3xl sm:text-4xl md:text-[2.65rem] lg:text-[3rem] font-light tracking-[-0.035em] leading-[1.08] text-[#141010] mb-6 sm:mb-8 portfoliodetail-section-title">
              Key Features
            </h2>

            {/* Top Row: 3 equal cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 mb-5 sm:mb-6 portfoliodetail-features-grid">
              {project.featuresTop.map((feature, idx) => {
                const FeatIcon = feature.icon;
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-7 border border-[#693092]/10 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between min-h-[175px] portfoliodetail-feat-card"
                  >
                    {/* Header: Number left, Squircle icon right */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[#BE3093] font-semibold text-xs sm:text-[13px] tracking-wider">
                        {feature.num}
                      </span>
                      <div className="w-10 h-10 rounded-xl bg-[#F5EEF8] text-[#BE3093] flex items-center justify-center">
                        <FeatIcon className="w-5 h-5 stroke-[2.2]" />
                      </div>
                    </div>

                    {/* Title & Description matching services detail page */}
                    <div>
                      <h3 className="text-xl sm:text-2xl lg:text-[1.65rem] font-bold tracking-tight leading-snug text-[#141010] mb-2 sm:mb-2.5 portfoliodetail-feat-title">
                        {feature.title}
                      </h3>
                      <p className="text-[#554E62] text-sm sm:text-[15px] md:text-[16px] leading-relaxed font-normal portfoliodetail-feat-desc">
                        {feature.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Row: 2 wider cards spanning full width matching screenshot */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 portfoliodetail-features-grid">
              {project.featuresBottom.map((feature, idx) => {
                const FeatIcon = feature.icon;
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-7 border border-[#693092]/10 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between min-h-[175px] portfoliodetail-feat-card"
                  >
                    {/* Header: Number left, Squircle icon right */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[#BE3093] font-semibold text-xs sm:text-[13px] tracking-wider">
                        {feature.num}
                      </span>
                      <div className="w-10 h-10 rounded-xl bg-[#F5EEF8] text-[#BE3093] flex items-center justify-center">
                        <FeatIcon className="w-5 h-5 stroke-[2.2]" />
                      </div>
                    </div>

                    {/* Title & Description matching services detail page */}
                    <div>
                      <h3 className="text-xl sm:text-2xl lg:text-[1.65rem] font-bold tracking-tight leading-snug text-[#141010] mb-2 sm:mb-2.5 portfoliodetail-feat-title">
                        {feature.title}
                      </h3>
                      <p className="text-[#554E62] text-sm sm:text-[15px] md:text-[16px] leading-relaxed font-normal portfoliodetail-feat-desc">
                        {feature.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ================================================================ */}
          {/* SECTION 5: READY TO GET STARTED CTA BANNER                       */}
          {/* ================================================================ */}
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
                className="hover-brand-gradient inline-flex items-center justify-center bg-[#FBAE42] text-black hover:text-white font-medium text-xs sm:text-sm md:text-[15px] px-7 sm:px-8 py-3 sm:py-3.5 rounded-full shadow-md whitespace-nowrap cursor-pointer transition-colors cta-banner-btn"
              >
                Let&apos;s Connect
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer & Back to Hero */}
      <Footer />
      <BackToHeroButton />
    </div>
  );
}

export { PortfolioDetailPage };
