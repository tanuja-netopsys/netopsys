import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, ArrowRight, Zap, Loader2 } from "lucide-react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import Navbar from "../componenets/navbar.tsx";
import Footer from "../componenets/footer.tsx";
import BackToHeroButton from "../componenets/back-to-hero.tsx";

export interface Project {
  id: string | number;
  title: string;
  status: string;
  description: string;
  image: string;
  alt?: string;
  category: string;
  technologies?: string[];
  metrics?: { label: string; value: string }[];
  extendedDescription?: string;
}

const DEFAULT_PROJECTS: Project[] = [
  {
    id: 3,
    title: "A Complete AI Secured Candidate Assessment Platform",
    category: "AI & Assessment",
    status: "Deployed",
    technologies: ["Computer Vision", "Facial Biometrics", "AI Proctoring"],
    description:
      "Comprehensive AI-powered platform for secure candidate evaluation with advanced proctoring, skill assessment, and automated scoring systems.",
    image: "/portfolio/portfolio-1.jpg",
  },
  {
    id: 2,
    title: "Skill Bridge",
    category: "Cybersecurity & SOC",
    status: "Deployed",
    technologies: ["Threat Intelligence", "SIEM Monitoring", "Incident Response"],
    description:
      "Comprehensive Security Operations Center (SOC) course offering hands-on cyber defense training, SIEM log analysis, threat intelligence, and live incident response drills.",
    image: "/portfolio/portfolio-3.jpg",
  },
  {
    id: 1,
    title: "BizOne (Intelligent ERP Solutions)",
    category: "Enterprise ERP",
    status: "Deployed",
    technologies: ["AI Automation", "Business Intelligence", "Process Optimization"],
    description:
      "AI-driven Enterprise Resource Planning system that automates business processes, optimizes workflows, and provides intelligent insights.",
    image: "/portfolio/portfolio-2.jpg",
  },
];

const getInitialProjects = (): Project[] => {
  try {
    const cached = sessionStorage.getItem("cached_portfolio_projects");
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback to DEFAULT_PROJECTS
  }
  return DEFAULT_PROJECTS;
};

// Card Animation Variants: Current card moves UP and next card comes from DOWN when scrolling down
const cardVariants: Variants = {
  enter: (dir: number) => ({
    y: dir >= 0 ? 60 : -60,
    opacity: 0,
    scale: 0.98,
  }),
  center: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      y: { type: "spring" as const, stiffness: 300, damping: 28 },
      opacity: { duration: 0.3, ease: "easeOut" },
      scale: { duration: 0.3, ease: "easeOut" },
    },
  },
  exit: (dir: number) => ({
    y: dir >= 0 ? -60 : 60,
    opacity: 0,
    scale: 0.98,
    transition: {
      y: { type: "spring" as const, stiffness: 300, damping: 28 },
      opacity: { duration: 0.22, ease: "easeIn" },
      scale: { duration: 0.22, ease: "easeIn" },
    },
  }),
};

export default function PortfolioPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>(getInitialProjects);
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const sectionRef = useRef<HTMLElement | null>(null);
  const isTransitioningRef = useRef(false);
  const activeIndexRef = useRef(0);
  const projectsLengthRef = useRef(DEFAULT_PROJECTS.length);

  // Keep refs in sync with state for event listeners
  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    projectsLengthRef.current = projects.length;
  }, [projects.length]);

  useEffect(() => {
    document.title = "Portfolio | AI Solutions in Action - Netopsys";

    let isMounted = true;
    const fetchProjects = async () => {
      try {
        const res = await fetch("/api/projects");
        if (!res.ok) throw new Error("Failed to load projects");
        const json = await res.json();
        if (isMounted && json.success && Array.isArray(json.data) && json.data.length > 0) {
          try {
            sessionStorage.setItem("cached_portfolio_projects", JSON.stringify(json.data));
          } catch {
            // ignore storage errors
          }

          // Compare with previous projects to prevent unnecessary state update and re-render blink
          setProjects((prev) => {
            if (
              prev.length === json.data.length &&
              prev.every((p, idx) => p.id === json.data[idx].id && p.title === json.data[idx].title)
            ) {
              return prev;
            }
            return json.data;
          });
          projectsLengthRef.current = json.data.length;
        }
      } catch (err) {
        console.error("Error fetching portfolio projects:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchProjects();

    return () => {
      isMounted = false;
    };
  }, []);

  // Scroll & Wheel event handler:
  // When scrolling down: active card moves UP and next card enters from DOWN
  // When scrolling up: active card moves DOWN and previous card enters from UP
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      // If the window is scrolled down towards the footer:
      if (window.scrollY > 20) {
        if (e.deltaY < 0) {
          // User is scrolling UP to get back to the portfolio:
          // Smooth scroll to top without changing project cards so layout never overlaps header!
          window.scrollTo({ top: 0, behavior: "smooth" });
          e.preventDefault();
        }
        // Allow native scroll down towards footer
        return;
      }

      // When at the top of the page (window.scrollY <= 20):
      // Prevent accidental micro-scrolls from scrolling window
      if (Math.abs(e.deltaY) < 18) {
        e.preventDefault();
        return;
      }

      if (isTransitioningRef.current) {
        e.preventDefault();
        return;
      }

      if (e.deltaY > 0) {
        // Scrolling DOWN
        if (activeIndexRef.current < projectsLengthRef.current - 1) {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: "instant" });
          isTransitioningRef.current = true;
          setDirection(1);
          setActiveIndex((prev) => prev + 1);
          setTimeout(() => {
            isTransitioningRef.current = false;
          }, 550);
        } else {
          // On last project, allow scrolling down to footer
        }
      } else if (e.deltaY < 0) {
        // Scrolling UP
        if (activeIndexRef.current > 0) {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: "instant" });
          isTransitioningRef.current = true;
          setDirection(-1);
          setActiveIndex((prev) => prev - 1);
          setTimeout(() => {
            isTransitioningRef.current = false;
          }, 550);
        }
      }
    };

    // Touch Swipe support for mobile
    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    const onTouchEnd = (e: TouchEvent) => {
      const touchEndY = e.changedTouches[0].clientY;
      const diffY = touchStartY - touchEndY;
      if (Math.abs(diffY) < 45) return;
      if (isTransitioningRef.current) return;

      if (window.scrollY > 20) {
        if (diffY < 0) {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
        return;
      }

      if (diffY > 0) {
        // Swiped UP -> Show next project
        if (activeIndexRef.current < projectsLengthRef.current - 1) {
          window.scrollTo({ top: 0, behavior: "instant" });
          isTransitioningRef.current = true;
          setDirection(1);
          setActiveIndex((prev) => prev + 1);
          setTimeout(() => {
            isTransitioningRef.current = false;
          }, 550);
        }
      } else {
        // Swiped DOWN -> Show previous project
        if (activeIndexRef.current > 0) {
          window.scrollTo({ top: 0, behavior: "instant" });
          isTransitioningRef.current = true;
          setDirection(-1);
          setActiveIndex((prev) => prev - 1);
          setTimeout(() => {
            isTransitioningRef.current = false;
          }, 550);
        }
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  const handleSelectProject = (index: number) => {
    if (index === activeIndex || isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    setDirection(index > activeIndex ? 1 : -1);
    setActiveIndex(index);
    setTimeout(() => {
      isTransitioningRef.current = false;
    }, 600);
  };

  const activeProject = projects[activeIndex] || projects[0] || DEFAULT_PROJECTS[0];

  return (
    <div
      className="min-h-screen w-full bg-[#F5EEF8] text-[#141010] flex flex-col overflow-x-clip selection:bg-[#693092] selection:text-white"
      style={{ fontFamily: "'Onest', sans-serif" }}
    >
      {/* Floating Navbar with Portfolio active */}
      <Navbar activeTab="Portfolio" />

      {/* Main Interactive Portfolio Section with Scroll Interactivity */}
      <main
        ref={sectionRef}
        className="portfolio-page-main relative flex-1 w-full pt-24 sm:pt-28 md:pt-30 pb-14 sm:pb-18 select-none overflow-hidden"
      >
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

        {/* Main Full-Width Container matching other pages */}
        <div className="relative w-full max-w-[2100px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-14 2xl:px-18">
          {/* Breadcrumb Navigation: Home > Portfolio */}
          <nav aria-label="Breadcrumb" className="portfolio-page-breadcrumb mb-4 sm:mb-6">
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
                <span className="text-[#693092] font-semibold">Portfolio</span>
              </li>
            </ol>
          </nav>

          {/* Loading Indicator if any */}
          {isLoading && (
            <div className="w-full py-24 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-[#693092] animate-spin" />
            </div>
          )}

          {/* 2-Column Interactive Showcase Layout */}
          {!isLoading && (
            <div className="portfolio-page-grid grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 xl:gap-16 items-start">
              {/* Left Column: Heading, Subtitle & Interactive Project Stepper */}
              <div className="portfolio-page-left-col lg:col-span-5 flex flex-col justify-start text-left pt-2">

                {/* Main Heading */}
                <h1 className="portfolio-page-title text-4xl sm:text-5xl md:text-6xl lg:text-[3.85rem] xl:text-[4.25rem] font-light tracking-[-0.035em] leading-[1.04] text-[#141010] mb-4 sm:mb-5">
                  AI Solutions <br />
                  <span className="text-[#693092]">in Action</span>
                </h1>

                {/* Subtitle */}
                <p className="portfolio-page-desc text-[#554E62] leading-relaxed font-normal text-sm sm:text-base md:text-[16px] lg:text-[17px] max-w-lg mb-8 sm:mb-12">
                  Explore our transformative AI projects that have revolutionized business operations and delivered measurable results.
                </p>

                {/* Stepper List of Projects */}
                <div className="portfolio-page-stepper flex flex-col w-full max-w-lg">
                  {projects.map((project, index) => {
                    const isSelected = index === activeIndex;
                    const itemNumber = String(index + 1).padStart(2, "0");
                    const isLast = index === projects.length - 1;

                    return (
                      <div key={project.id} className="portfolio-page-step flex items-start gap-4 sm:gap-5 relative">
                        {/* Column 1: Number Circle & Connecting Vertical Line */}
                        <div className="flex flex-col items-center shrink-0 pt-0.5">
                          <button
                            type="button"
                            onClick={() => handleSelectProject(index)}
                            className={`portfolio-page-step-btn w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 cursor-pointer ${
                              isSelected
                                ? "bg-[#693092] text-white shadow-md ring-4 ring-[#693092]/15 scale-105"
                                : "border border-[#D6C5E5] bg-white/70 text-[#716A7E] hover:border-[#693092] hover:text-[#693092]"
                            }`}
                          >
                            {itemNumber}
                          </button>

                          {/* Connecting Line to next step */}
                          {!isLast && (
                            <div className="portfolio-page-step-line w-[1.5px] bg-[#E2D5EE] min-h-[44px] sm:min-h-[50px] my-1.5" />
                          )}
                        </div>

                        {/* Column 2: Title, Underline & Arrow */}
                        <div
                          onClick={() => handleSelectProject(index)}
                          className="portfolio-page-step-content flex-1 pb-7 sm:pb-9 cursor-pointer group"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <h3
                              className={`portfolio-page-step-title text-base sm:text-lg md:text-[19px] leading-snug transition-colors duration-200 ${
                                isSelected
                                  ? "font-semibold text-[#141010]"
                                  : "font-medium text-[#554E62] group-hover:text-[#141010]"
                              }`}
                            >
                              {project.title}
                            </h3>

                            {/* Arrow indicator on the active row */}
                            {isSelected && (
                              <ArrowRight className="w-5 h-5 text-[#693092] shrink-0 animate-in fade-in slide-in-from-left-1 duration-200" />
                            )}
                          </div>

                          {/* Purple Underline beneath the active item */}
                          {isSelected && (
                            <motion.div
                              layoutId="active-underline"
                              className="h-[2px] bg-gradient-to-r from-[#693092] via-[#8E5BAA] to-transparent w-full mt-2.5 rounded-full"
                              transition={{ type: "spring", stiffness: 350, damping: 30 }}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Featured Dark Showcase Card with Up/Down Slide Transition */}
              <div className="portfolio-page-card-wrap lg:col-span-7 w-full flex flex-col relative overflow-hidden rounded-[30px] sm:rounded-[36px] lg:rounded-[40px] mt-8 sm:mt-12 lg:mt-20 xl:mt-28">
                <AnimatePresence initial={false} mode="wait" custom={direction}>
                  <motion.div
                    key={activeIndex}
                    custom={direction}
                    variants={cardVariants}
                    initial={false}
                    animate="center"
                    exit="exit"
                    className="portfolio-page-card relative w-full rounded-[30px] sm:rounded-[36px] lg:rounded-[40px] bg-gradient-to-br from-[#090514] via-[#0E071F] to-[#180A2E] text-white border border-[#3E255B]/60 shadow-[0_25px_60px_rgba(15,7,30,0.35)] overflow-hidden p-7 sm:p-9 md:p-11 lg:p-13 h-auto min-h-[480px] lg:min-h-[540px] flex flex-col justify-between min-w-0 break-words"
                  >
                    {/* Background Photography with enhanced visibility */}
                    {activeProject.image && (
                      <img
                        src={activeProject.image}
                        alt={activeProject.title}
                        className="absolute inset-0 w-full h-full object-cover object-right sm:object-center opacity-45 pointer-events-none transition-opacity duration-500"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#090514] via-[#090514]/80 to-[#090514]/25 pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#090514] via-[#090514]/40 to-transparent pointer-events-none" />

                    {/* Ambient Neon Purple / Cyan Backlight Glows */}
                    <div className="absolute top-1/4 -right-16 w-80 h-80 rounded-full bg-[#BE3093]/20 blur-[100px] pointer-events-none" />
                    <div className="absolute -bottom-16 -left-16 w-80 h-80 rounded-full bg-[#693092]/25 blur-[100px] pointer-events-none" />

                    {/* Top Group: Icon Box & Status Pill */}
                    <div className="portfolio-page-card-top relative z-10 flex flex-col items-start mb-6 sm:mb-8">
                      {/* Cyan Lightning Bolt in Glass Square */}
                      <div className="portfolio-page-card-icon w-12 h-12 rounded-2xl bg-white/[0.07] border border-white/10 backdrop-blur-md flex items-center justify-center text-cyan-400 mb-4 sm:mb-5 shadow-inner">
                        <Zap className="w-5 h-5 fill-cyan-400/20 text-cyan-400 stroke-[2.2]" />
                      </div>

                      {/* Deployed Status Pill */}
                      <span className="portfolio-page-card-pill inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#032318]/70 border border-emerald-500/40 text-[#34D399] text-xs sm:text-[13px] font-medium backdrop-blur-md">
                        <span className="w-2 h-2 rounded-full bg-[#34D399]" />
                        <span>{activeProject.status || "Deployed"}</span>
                      </span>
                    </div>

                    {/* Middle Group: Title, Description & Tags */}
                    <div className="portfolio-page-card-mid relative z-10 mb-8 sm:mb-10 text-left">
                      <h2 className="portfolio-page-card-title text-2xl sm:text-3xl lg:text-4xl xl:text-[2.65rem] font-bold text-white tracking-tight leading-tight mb-4 sm:mb-5">
                        {activeProject.title}
                      </h2>

                      <p className="portfolio-page-card-desc text-white/75 text-sm sm:text-base lg:text-[16px] leading-relaxed font-normal max-w-xl mb-6 sm:mb-8">
                        {activeProject.description}
                      </p>
                    </div>

                    {/* Bottom Action: Learn more with Arrow */}
                    <div className="portfolio-page-card-cta relative z-10 pt-4 text-left">
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/portfolio/${activeProject.id}`, {
                            state: { project: activeProject },
                          })
                        }
                        className="inline-flex items-center gap-2 text-white font-medium text-sm sm:text-base border-b border-white/70 hover:border-white pb-0.5 hover:text-white transition-all cursor-pointer group"
                      >
                        <span>Learn more</span>
                        <ArrowRight className="w-4 h-4 stroke-[2.2] group-hover:translate-x-1.5 transition-transform" />
                      </button>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Global Footer */}
      <Footer />
      <BackToHeroButton />
    </div>
  );
}
