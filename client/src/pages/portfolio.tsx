import { useState, useEffect, useRef, Fragment } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, ArrowRight, Zap, Loader2 } from "lucide-react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import Navbar from "../componenets/navbar.tsx";
import Footer from "../componenets/footer.tsx";
import BackToHeroButton from "../componenets/back-to-hero.tsx";
import { OptimizedPicture } from "../utils/optimized-image.tsx";

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
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const sectionRef = useRef<HTMLElement | null>(null);
  const isTransitioningRef = useRef(false);
  const activeIndexRef = useRef(0);
  const projectsLengthRef = useRef(0);

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
        if (isMounted && json.success && Array.isArray(json.data)) {
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

    let wheelDeltaAccum = 0;
    let wheelResetTimer: ReturnType<typeof setTimeout> | null = null;

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

      // Accumulate small trackpad deltas cleanly so gentle gestures feel responsive
      wheelDeltaAccum += e.deltaY;
      if (wheelResetTimer) clearTimeout(wheelResetTimer);
      wheelResetTimer = setTimeout(() => {
        wheelDeltaAccum = 0;
      }, 160);

      if (Math.abs(wheelDeltaAccum) < 16) {
        e.preventDefault();
        return;
      }

      const directionDelta = wheelDeltaAccum;
      wheelDeltaAccum = 0;

      if (isTransitioningRef.current) {
        e.preventDefault();
        return;
      }

      if (directionDelta > 0) {
        // Scrolling DOWN
        if (activeIndexRef.current < projectsLengthRef.current - 1) {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: "instant" });
          isTransitioningRef.current = true;
          setDirection(1);
          setActiveIndex((prev) => prev + 1);
          setTimeout(() => {
            isTransitioningRef.current = false;
          }, 420);
        } else {
          // On last project, allow scrolling down to footer
        }
      } else if (directionDelta < 0) {
        // Scrolling UP
        if (activeIndexRef.current > 0) {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: "instant" });
          isTransitioningRef.current = true;
          setDirection(-1);
          setActiveIndex((prev) => prev - 1);
          setTimeout(() => {
            isTransitioningRef.current = false;
          }, 420);
        }
      }
    };

    // Touch Swipe support for mobile (vertical & horizontal card swipe)
    let touchStartX = 0;
    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };
    const onTouchEnd = (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const diffX = touchStartX - touchEndX;
      const diffY = touchStartY - touchEndY;

      if (isTransitioningRef.current) return;

      // Horizontal swipe on mobile (< 768px) switches showcase project directly
      if (window.innerWidth < 768 && Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
        if (diffX > 0 && activeIndexRef.current < projectsLengthRef.current - 1) {
          isTransitioningRef.current = true;
          setDirection(1);
          setActiveIndex((prev) => prev + 1);
          setTimeout(() => {
            isTransitioningRef.current = false;
          }, 420);
        } else if (diffX < 0 && activeIndexRef.current > 0) {
          isTransitioningRef.current = true;
          setDirection(-1);
          setActiveIndex((prev) => prev - 1);
          setTimeout(() => {
            isTransitioningRef.current = false;
          }, 420);
        }
        return;
      }

      if (Math.abs(diffY) < 45) return;

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
      if (wheelResetTimer) clearTimeout(wheelResetTimer);
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

  const activeProject = projects[activeIndex] || projects[0];

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
        className="portfolio-page-main relative flex-1 w-full pt-24 sm:pt-20 md:pt-30 pb-6 md:pb-18 select-none overflow-hidden"
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
          <nav aria-label="Breadcrumb" className="portfolio-page-breadcrumb mb-2 md:mb-6">
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

          {/* Empty State if backend returns no projects */}
          {!isLoading && !activeProject && (
            <div className="w-full py-24 text-center text-sm font-medium text-[#554E62]">
              No projects published yet.
            </div>
          )}

          {/* 2-Column Interactive Showcase Layout */}
          {!isLoading && activeProject && (
            <div className="portfolio-page-grid grid grid-cols-1 lg:grid-cols-12 gap-3.5 md:gap-10 lg:gap-12 xl:gap-16 items-start">
              {/* Left Column: Heading, Subtitle & Interactive Project Stepper */}
              <div className="portfolio-page-left-col lg:col-span-5 flex flex-col justify-start text-left pt-0 md:pt-2">

                {/* Main Heading */}
                <h1 className="portfolio-page-title text-[1.75rem] md:text-6xl lg:text-[3.85rem] xl:text-[4.25rem] font-light tracking-[-0.035em] leading-[1.06] md:leading-[1.04] text-[#141010] mb-2 md:mb-5">
                  AI Solutions <br />
                  <span className="text-[#693092]">in Action</span>
                </h1>

                {/* Subtitle */}
                <p className="portfolio-page-desc text-[#554E62] leading-[1.45] md:leading-relaxed font-normal text-[12.5px] md:text-[16px] lg:text-[17px] max-w-lg mb-4 md:mb-12">
                  Explore our transformative AI projects that have revolutionized business operations and delivered measurable results.
                </p>

                {/* Mobile-only Horizontal Stepper & Active Project Header (< 768px) */}
                <div className="flex flex-col w-full md:hidden">
                  {/* Horizontal Number Circles with Connecting Lines */}
                  <div className="flex items-center w-full">
                    {projects.map((project, index) => {
                      const isSelected = index === activeIndex;
                      const itemNumber = String(index + 1).padStart(2, "0");
                      const isLast = index === projects.length - 1;

                      return (
                        <Fragment key={`mobile-step-${project.id}`}>
                          <button
                            type="button"
                            onClick={() => handleSelectProject(index)}
                            aria-label={`Select project ${itemNumber}: ${project.title}`}
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold transition-all duration-300 shrink-0 cursor-pointer ${
                              isSelected
                                ? "bg-[#693092] text-white shadow-md ring-3 ring-[#693092]/20"
                                : "border border-[#E2D5EE] bg-white text-[#554E62]"
                            }`}
                          >
                            {itemNumber}
                          </button>
                          {!isLast && (
                            <div className="flex-1 h-[1.5px] bg-[#E2D5EE] mx-2" />
                          )}
                        </Fragment>
                      );
                    })}
                  </div>

                  {/* Active Project Title Strip with Arrow & Underline */}
                  <div className="mt-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-[13.5px] font-semibold text-[#141010] leading-snug text-left">
                        {activeProject.title}
                      </h3>
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/portfolio/${activeProject.id}`, {
                            state: { project: activeProject },
                          })
                        }
                        aria-label={`View ${activeProject.title}`}
                        className="text-[#693092] shrink-0 p-0.5 cursor-pointer"
                      >
                        <ArrowRight className="w-4 h-4 stroke-[2]" />
                      </button>
                    </div>
                    <div className="h-[1.5px] w-full mt-1.5 bg-gradient-to-r from-[#693092]/60 via-[#8E5BAA]/35 to-[#E2D5EE] rounded-full" />
                  </div>
                </div>

                {/* Desktop & Tablet Stepper List of Projects (md+ only; unchanged) */}
                <div className="portfolio-page-stepper hidden md:flex flex-col w-full max-w-lg">
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
              <div className="portfolio-page-card-wrap lg:col-span-7 w-full flex flex-col relative mt-0 md:mt-12 lg:mt-20 xl:mt-28">
                <div className="relative overflow-hidden rounded-[20px] md:rounded-[36px] lg:rounded-[40px]">
                  <AnimatePresence initial={false} mode="wait" custom={direction}>
                    <motion.div
                      key={activeIndex}
                      custom={direction}
                      variants={cardVariants}
                      initial={false}
                      animate="center"
                      exit="exit"
                      className="portfolio-page-card relative w-full rounded-[20px] md:rounded-[36px] lg:rounded-[40px] bg-gradient-to-br from-[#090514] via-[#0E071F] to-[#180A2E] text-white border border-[#3E255B]/60 shadow-[0_25px_60px_rgba(15,7,30,0.35)] overflow-hidden p-4.5 md:p-11 lg:p-13 h-auto min-h-[210px] md:min-h-[480px] lg:min-h-[540px] flex flex-col justify-between min-w-0 break-words"
                    >
                      {/* Subtle grid texture inside dark card on mobile matching design */}
                      <div
                        className="absolute inset-0 opacity-[0.07] md:hidden pointer-events-none"
                        style={{
                          backgroundImage:
                            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
                          backgroundSize: "28px 28px",
                        }}
                      />

                      {/* Background Photography with enhanced visibility */}
                      {activeProject.image && (
                        <OptimizedPicture
                          src={activeProject.image}
                          alt={activeProject.title}
                          width={1100}
                          height={620}
                          sizes="100vw"
                          loading="lazy"
                          decoding="async"
                          className="absolute inset-0 w-full h-full object-cover object-right md:object-center opacity-20 md:opacity-45 pointer-events-none transition-opacity duration-500"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-r from-[#090514] via-[#090514]/80 to-[#090514]/25 pointer-events-none" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#090514] via-[#090514]/40 to-transparent pointer-events-none" />

                      {/* Ambient Neon Purple / Cyan Backlight Glows */}
                      <div className="absolute top-1/4 -right-16 w-80 h-80 rounded-full bg-[#BE3093]/20 blur-[100px] pointer-events-none" />
                      <div className="absolute -bottom-16 -left-16 w-80 h-80 rounded-full bg-[#693092]/25 blur-[100px] pointer-events-none" />

                      {/* Top Group: Icon Box & Status Pill */}
                      <div className="portfolio-page-card-top relative z-10 flex flex-col items-start mb-3 md:mb-8">
                        {/* Cyan Lightning Bolt in Glass Square */}
                        <div className="portfolio-page-card-icon w-9 h-9 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/[0.07] border border-white/10 backdrop-blur-md flex items-center justify-center text-cyan-400 mb-2.5 md:mb-5 shadow-inner">
                          <Zap className="w-4 h-4 md:w-5 md:h-5 fill-cyan-400/20 text-cyan-400 stroke-[2.2]" />
                        </div>

                        {/* Deployed Status Pill */}
                        <span className="portfolio-page-card-pill inline-flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3.5 py-0.5 md:py-1.5 rounded-full bg-[#032318]/70 border border-emerald-500/40 text-[#34D399] text-[11px] md:text-[13px] font-medium backdrop-blur-md">
                          <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[#34D399]" />
                          <span>{activeProject.status || "Deployed"}</span>
                        </span>
                      </div>

                      {/* Middle Group: Title, Description & Tags */}
                      <div className="portfolio-page-card-mid relative z-10 mb-3 md:mb-10 text-left">
                        <h2 className="portfolio-page-card-title text-[1.15rem] md:text-3xl lg:text-4xl xl:text-[2.65rem] font-bold text-white tracking-tight leading-tight mb-1.5 md:mb-5">
                          {activeProject.title}
                        </h2>

                        <p className="portfolio-page-card-desc text-white/75 text-[12px] md:text-base lg:text-[16px] leading-[1.45] md:leading-relaxed font-normal max-w-xl mb-2 md:mb-8 line-clamp-3 md:line-clamp-none">
                          {activeProject.description}
                        </p>
                      </div>

                      {/* Bottom Action: Explore with Arrow */}
                      <div className="portfolio-page-card-cta relative z-10 pt-1 md:pt-4 text-left">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/portfolio/${activeProject.id}`, {
                              state: { project: activeProject },
                            })
                          }
                          className="inline-flex items-center gap-1.5 md:gap-2 text-white font-medium text-[13px] md:text-base border-b border-white/70 hover:border-white pb-0.5 hover:text-white transition-all cursor-pointer group"
                        >
                          <span>Explore</span>
                          <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4 stroke-[2.2] group-hover:translate-x-1.5 transition-transform" />
                        </button>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Mobile-only Carousel Pagination Dots below Card */}
                {projects.length > 1 && (
                  <div className="flex md:hidden items-center justify-center gap-1.5 mt-2.5">
                    {projects.map((p, idx) => {
                      const isDotActive = idx === activeIndex;
                      return (
                        <button
                          key={`dot-${p.id}`}
                          type="button"
                          onClick={() => handleSelectProject(idx)}
                          aria-label={`View project ${idx + 1}: ${p.title}`}
                          className="p-1 cursor-pointer"
                        >
                          <span
                            className={`block h-1.5 rounded-full transition-all duration-300 ${
                              isDotActive ? "w-6 bg-[#693092]" : "w-1.5 bg-[#693092]/25"
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                )}
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
