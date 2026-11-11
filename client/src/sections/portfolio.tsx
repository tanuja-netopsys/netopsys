import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Loader2, ChevronLeft, ChevronRight } from "lucide-react";

export interface Project {
  id: string | number;
  title: string;
  titleLine1?: string;
  titleLine2?: string;
  status: string;
  description: string;
  image: string;
  alt?: string;
  category: string;
  technologies?: string[];
  metrics?: { label: string; value: string }[];
  extendedDescription?: string;
}

export default function Portfolio() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeCardId, setActiveCardId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  // Scroll Container Ref & State
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollability = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const fetchProjects = async () => {
      try {
        const res = await fetch("/api/projects?limit=3");
        if (!res.ok) throw new Error("Failed to load projects");
        const json = await res.json();
        if (isMounted && json.success && Array.isArray(json.data)) {
          // Display only the 3 most recently added projects in the section
          const recentThree = json.data.slice(0, 3);
          setProjects(recentThree);
          if (recentThree.length > 0) {
            setActiveCardId(String(recentThree[0].id));
          }
        }
      } catch (err) {
        console.error("Error fetching projects for portfolio section:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchProjects();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    checkScrollability();
    const handleResize = () => checkScrollability();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [projects]);

  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      // Scroll by one card's width plus gap
      const cardWidth =
        window.innerWidth >= 1024
          ? container.clientWidth / 3
          : window.innerWidth >= 768
          ? container.clientWidth / 2
          : container.clientWidth * 0.85;

      const delta = direction === "left" ? -cardWidth : cardWidth;
      container.scrollBy({ left: delta, behavior: "smooth" });
      setTimeout(checkScrollability, 350);
    }
  };

  return (
    <section
      id="portfolio"
      className="portfolio-section-wrap relative w-full min-h-[100dvh] flex flex-col justify-center bg-[#FBAE42] px-4 sm:px-6 md:px-8 lg:px-10 xl:px-14 2xl:px-18 select-none overflow-x-clip scroll-mt-0"
    >
      {/* Main Container - Expanded width matching Hero, About, and Services */}
      <div className="portfolio-content-wrap relative w-full max-w-[2100px] mx-auto flex flex-col justify-center my-auto w-full">
        {/* Header Section with Navigation Arrows */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2.5 sm:gap-3 mb-2 sm:mb-2.5 lg:mb-2 xl:mb-2.5">
          <div className="portfolio-header max-w-3xl">
            {/* Eyebrow Badge: Button Design matching remaining sections */}
            <div className="portfolio-eyebrow-wrap mb-3 sm:mb-4 lg:mb-3 xl:mb-3.5">
              <div className="portfolio-eyebrow-text inline-flex items-center gap-2 sm:gap-2.5 px-3.5 sm:px-4 py-0.5 sm:py-1 rounded-full bg-white border border-[#693092]/20 text-[#693092] text-xs sm:text-[13px] font-semibold tracking-wide shadow-xs select-none cursor-default">
                <span>Portfolio</span>
                <div className="w-3.5 sm:w-4 h-3.5 sm:h-4 rounded-full bg-[#693092] text-white flex items-center justify-center">
                  <ArrowRight className="w-2 sm:w-2.5 h-2 sm:h-2.5 stroke-[2.5]" />
                </div>
              </div>
            </div>

            {/* Large Display Title: Identical font style and scale to remaining sections */}
            <h2 className="portfolio-title text-4xl sm:text-5xl md:text-6xl lg:text-[4.75rem] font-light tracking-[-0.035em] leading-[1.04] text-[#141010] mb-2 sm:mb-2.5 lg:mb-2 xl:mb-2.5">
              AI Solutions in Action
            </h2>

            {/* Subtitle */}
            <p className="portfolio-desc text-[#141010]/85 text-xs sm:text-[13px] md:text-sm lg:text-[13.5px] xl:text-[14px] leading-relaxed font-normal mt-1 sm:mt-1.5 max-w-xl">
              Explore our transformative AI projects that have revolutionized business operations and delivered measurable results.
            </p>
          </div>

          {/* Horizontal Scroll Navigation Arrows (visible on mobile/tablet when multiple cards exist, and desktop when > 3) */}
          {projects.length > 1 && (
            <div className={`items-center gap-2 self-start sm:self-end shrink-0 pb-1 ${projects.length > 3 ? "flex" : "flex lg:hidden"}`}>
              <button
                type="button"
                onClick={() => handleScroll("left")}
                disabled={!canScrollLeft}
                className="w-10 h-10 sm:w-9 sm:h-9 rounded-full bg-[#141010] text-white flex items-center justify-center hover:bg-[#693092] transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer shadow-md"
                aria-label="Previous projects"
                title="Scroll left"
              >
                <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
              </button>
              <button
                type="button"
                onClick={() => handleScroll("right")}
                disabled={!canScrollRight}
                className="w-10 h-10 sm:w-9 sm:h-9 rounded-full bg-[#141010] text-white flex items-center justify-center hover:bg-[#693092] transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer shadow-md"
                aria-label="Next projects"
                title="Scroll right"
              >
                <ChevronRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="w-full py-16 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-[#141010]/60 animate-spin" />
          </div>
        )}

        {/* Horizontal Scrollable Project Cards Container */}
        {!isLoading && (
          <div
            ref={scrollContainerRef}
            onScroll={checkScrollability}
            className="portfolio-scroll-container flex items-stretch gap-4 lg:gap-5 xl:gap-6 w-full overflow-x-auto pb-2 pt-1 scroll-smooth snap-x snap-mandatory [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-black/10 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#141010]/30 hover:[&::-webkit-scrollbar-thumb]:bg-[#141010]/60 [&::-webkit-scrollbar-thumb]:rounded-full"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(20, 16, 16, 0.3) transparent",
            }}
          >
            {projects.map((project, index) => {
              const projId = String(project.id);
              const isActive = activeCardId === projId;
              const formattedIndex = String(index + 1).padStart(2, "0");

              return (
                <motion.div
                  key={project.id}
                  onMouseEnter={() => setActiveCardId(projId)}
                  onClick={() => navigate(`/portfolio-detail?id=${project.id}`)}
                  className="portfolio-card group relative bg-[#F5EEF8] rounded-[16px] sm:rounded-[18px] p-3.5 sm:p-4 lg:p-4 xl:p-5 flex flex-col justify-between h-auto min-h-full border border-black/[0.06] shadow-lg shadow-black/[0.06] hover:shadow-xl hover:shadow-black/15 lg:hover:-translate-y-1 transition-all duration-300 w-[85%] sm:w-[calc(50%-12px)] lg:w-[calc((100%-2*1.25rem)/3)] xl:w-[calc((100%-2*1.5rem)/3)] shrink-0 cursor-pointer snap-start min-w-0 break-words"
                >
                  {/* Image Container with active green border state */}
                  <div
                    className={`portfolio-card-img-wrap relative w-full aspect-[16/9.8] sm:aspect-[16/9.8] rounded-[10px] sm:rounded-[12px] overflow-hidden bg-black/5 transition-all duration-300 ${
                      isActive
                        ? "border-2 border-[#10B981] shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                        : "border border-black/[0.08] group-hover:border-[#10B981]/60"
                    }`}
                  >
                    <img
                      src={project.image || "/portfolio/portfolio-1.jpg"}
                      alt={project.alt || project.title}
                      className="w-full h-full object-cover select-none transition-transform duration-500 group-hover:scale-105 pointer-events-none"
                      loading="lazy"
                    />
                    {/* Subtle vignette overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                  </div>

                  {/* Status Badge */}
                  <div className="portfolio-card-badge-row mt-2.5 sm:mt-3 mb-1.5 sm:mb-2 flex items-center justify-between">
                    <span className="portfolio-card-badge-pill inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-0.5 rounded-full bg-[#10B981]/15 text-[#047857] text-[11px] sm:text-xs font-semibold tracking-wide border border-[#10B981]/25">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                      {project.status || "Deployed"}
                    </span>
                    <span className="portfolio-card-id text-[#693092]/40 text-[11px] sm:text-xs font-mono font-medium">
                      {formattedIndex}
                    </span>
                  </div>

                  {/* Card Content & CTA */}
                  <div className="flex flex-col flex-1 justify-between">
                    <div>
                      {/* Card Title */}
                      <h3 className="portfolio-card-title text-[#141010] font-semibold text-[15px] sm:text-base lg:text-[1.125rem] xl:text-[1.2rem] leading-snug mb-1.5 group-hover:text-[#693092] transition-colors">
                        <span className="block">{project.titleLine1 || project.title}</span>
                        {project.titleLine2 && <span className="block">{project.titleLine2}</span>}
                      </h3>

                      {/* Card Description */}
                      <p className="portfolio-card-desc text-[#554E62] text-xs sm:text-[12.5px] lg:text-[13px] xl:text-[13.5px] leading-relaxed mb-3 font-normal line-clamp-2">
                        {project.description}
                      </p>
                    </div>

                    {/* CTA Link - Opens Portfolio Detail Page */}
                    <div className="portfolio-card-cta mt-auto pt-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/portfolio-detail?id=${project.id}`);
                        }}
                        className="portfolio-card-link inline-flex items-center gap-1.5 text-[#2563EB] hover:text-[#1D4ED8] text-xs sm:text-[13.5px] font-semibold transition-colors cursor-pointer group/link"
                      >
                        <span>Explore</span>
                        <span className="relative overflow-hidden w-4 h-4 inline-flex items-center justify-center">
                          <ArrowUpRight className="w-3.5 h-3.5 transition-all duration-300 ease-out transform group-hover/link:translate-x-3.5 group-hover/link:-translate-y-3.5 group-hover/link:opacity-0" />
                          <ArrowUpRight className="w-3.5 h-3.5 absolute transition-all duration-300 ease-out transform -translate-x-3.5 translate-y-3.5 opacity-0 group-hover/link:translate-x-0 group-hover/link:translate-y-0 group-hover/link:opacity-100" />
                        </span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {projects.length === 0 && (
              <div className="col-span-full w-full py-12 text-center text-sm font-medium text-[#141010]/70 bg-white/40 rounded-2xl border border-black/5">
                No projects published yet.
              </div>
            )}
          </div>
        )}

        {/* Know More Button - Comfortably visible above the bottom edge */}
        <div className="portfolio-know-more-wrap flex items-center justify-center mt-5 sm:mt-6 lg:mt-7 xl:mt-8">
          <Link
            to="/portfolio"
            className="portfolio-cta-btn hover-brand-gradient inline-flex items-center justify-center bg-[#0B0716] text-white font-semibold text-xs sm:text-sm px-8 sm:px-9 py-2.5 sm:py-3 rounded-full shadow-md whitespace-nowrap cursor-pointer transition-all duration-200 active:scale-95"
            style={{ fontFamily: "'Onest', sans-serif" }}
          >
            View All
          </Link>
        </div>
      </div>
    </section>
  );
}
