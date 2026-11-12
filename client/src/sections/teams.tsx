import { useState, useRef, useEffect, useMemo } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { OptimizedPicture } from "../utils/optimized-image.tsx";

export interface TeamMember {
  id: string | number;
  name: string;
  role: string;
  image: string;
  department?: string;
  bio?: string;
  status?: string;
  uniqueKey?: string;
}

export default function Teams() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Fetch real team members from backend API
  useEffect(() => {
    let isMounted = true;
    const fetchTeam = async () => {
      try {
        const res = await fetch("/api/teams");
        if (!res.ok) throw new Error("Failed to load team members");
        const json = await res.json();
        if (isMounted && json.success && Array.isArray(json.data)) {
          setTeamMembers(json.data);
        }
      } catch (err) {
        console.error("Error fetching team members:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchTeam();
    return () => {
      isMounted = false;
    };
  }, []);

  // Triplicated members for seamless infinite horizontal loop
  const displayMembers = useMemo(() => {
    if (teamMembers.length === 0) return [];
    const repeatCount = teamMembers.length < 5 ? 4 : 3;
    const result: TeamMember[] = [];

    for (let r = 0; r < repeatCount; r++) {
      teamMembers.forEach((m, i) => {
        result.push({
          ...m,
          uniqueKey: `${m.id}-set${r}-${i}`,
        });
      });
    }

    return result;
  }, [teamMembers]);

  // Smooth continuous auto-scroll that pauses on hover, offscreen, or reduced-motion
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || displayMembers.length === 0) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const repeatCount = teamMembers.length < 5 ? 4 : 3;
    let cachedSingleSetWidth = container.scrollWidth / repeatCount;
    let scrollAccum = container.scrollLeft;
    let animId: number | null = null;
    let isInView = false;
    let lastTime = performance.now();

    const updateWidthCache = () => {
      if (container) {
        cachedSingleSetWidth = container.scrollWidth / repeatCount;
      }
    };

    const loop = (now: number) => {
      if (!isInView) {
        animId = null;
        return;
      }
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      if (!isHovered && container) {
        scrollAccum += 42 * dt;
        if (cachedSingleSetWidth > 0) {
          if (scrollAccum >= cachedSingleSetWidth * 2) {
            scrollAccum -= cachedSingleSetWidth;
          } else if (scrollAccum <= 0) {
            scrollAccum += cachedSingleSetWidth;
          }
        }
        container.scrollLeft = scrollAccum;
      } else if (container) {
        scrollAccum = container.scrollLeft;
      }

      animId = requestAnimationFrame(loop);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isInView = entry.isIntersecting;
        if (isInView && animId === null) {
          updateWidthCache();
          scrollAccum = container.scrollLeft;
          lastTime = performance.now();
          animId = requestAnimationFrame(loop);
        } else if (!isInView && animId !== null) {
          cancelAnimationFrame(animId);
          animId = null;
        }
      },
      { threshold: 0.05 }
    );

    observer.observe(container);
    window.addEventListener("resize", updateWidthCache);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateWidthCache);
      if (animId !== null) cancelAnimationFrame(animId);
    };
  }, [isHovered, displayMembers, teamMembers]);

  return (
    <section
      id="team"
      className="teams-section-wrap relative w-full min-h-[100dvh] flex flex-col justify-between bg-[#08050E] text-white px-4 sm:px-6 md:px-8 lg:px-10 xl:px-14 2xl:px-18 pt-16 sm:pt-20 lg:pt-0 pb-12 sm:pb-16 lg:pb-0 select-none overflow-x-clip scroll-mt-0"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 -left-48 w-96 h-96 rounded-full bg-[#693092]/15 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 rounded-full bg-[#BE3093]/10 blur-[150px] pointer-events-none" />

      {/* Main Container - Expanded width matching Hero, About, Services, and Portfolio */}
      <div className="teams-content-wrap relative w-full max-w-[2100px] mx-auto flex-1 flex flex-col justify-center my-auto w-full">
        {/* Header Layout */}
        <div className="teams-header max-w-3xl text-left mb-6 sm:mb-8 lg:mb-6 xl:mb-8">
          {/* Eyebrow Badge: Button Design */}
          <div className="teams-eyebrow-wrap mb-2.5 sm:mb-3.5 lg:mb-2 xl:mb-3">
            <div className="teams-eyebrow-text inline-flex items-center gap-2 sm:gap-2.5 px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full bg-white/[0.08] border border-white/20 text-xs sm:text-[13px] text-white/90 font-medium shadow-sm select-none cursor-default">
              <span>Our Team</span>
              <div className="w-3.5 sm:w-4 h-3.5 sm:h-4 rounded-full bg-white text-[#0B0716] flex items-center justify-center">
                <ArrowRight className="w-2 sm:w-2.5 h-2 sm:h-2.5 stroke-[2.5]" />
              </div>
            </div>
          </div>

          {/* Display Heading: "Meet the people behind Netopsys." */}
          <h2 className="teams-title text-4xl sm:text-5xl md:text-6xl lg:text-[4.75rem] font-light tracking-[-0.035em] leading-[1.04]">
            <span className="text-white block">Meet the people</span>
            <span className="text-[#FBAE42] block">behind Netopsys.</span>
          </h2>
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="w-full py-20 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-[#FBAE42] animate-spin" />
          </div>
        )}

        {/* Horizontal Staggered Team Cards Gallery with Auto-Scroll & Pause on Hover */}
        {!isLoading && (
          <div
            ref={scrollContainerRef}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onTouchStart={() => setIsHovered(true)}
            onTouchEnd={() => setIsHovered(false)}
            className="teams-gallery flex items-end gap-5 sm:gap-6 lg:gap-6 xl:gap-7 overflow-x-auto pb-4 pt-2 no-scrollbar select-none cursor-grab active:cursor-grabbing"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {displayMembers.map((member) => (
              <div
                key={member.uniqueKey}
                className="teams-card group flex-shrink-0 w-[220px] sm:w-[250px] lg:w-[260px] xl:w-[280px] 2xl:w-[290px] flex flex-col justify-between h-auto min-w-0 break-words transition-transform duration-300"
              >
                {/* Uniform Portrait Photo Container */}
                <div className="teams-card-img-wrap relative w-full h-[310px] sm:h-[360px] rounded-2xl sm:rounded-[22px] overflow-hidden bg-[#161224] border border-white/[0.08] shadow-xl group-hover:border-white/25 group-hover:shadow-2xl group-hover:shadow-purple-950/30 transition-all duration-500">
                  {/* Team Portrait Photo */}
                  <OptimizedPicture
                    src={member.image || "/teams/member-1.jpg"}
                    alt={member.name}
                    width={290}
                    height={360}
                    sizes="(max-width: 640px) 180px, 290px"
                    style={{ width: "100%", height: "100%" }}
                    className="w-full h-full object-cover object-top select-none filter contrast-[1.08] saturate-[0.7] group-hover:saturate-100 group-hover:scale-105 transition-transform duration-700 pointer-events-none block"
                    loading="lazy"
                    decoding="async"
                  />

                  {/* Subtle cool purple duotone mood overlay */}
                  <div className="absolute inset-0 bg-[#693092]/15 mix-blend-color group-hover:opacity-0 transition-opacity duration-500 pointer-events-none" />

                  {/* Soft gradient bottom vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Member Details Below Photo */}
                <div className="teams-card-info mt-3 sm:mt-3.5 px-0.5 text-left">
                  <h3 className="teams-card-name text-white font-semibold text-base sm:text-lg tracking-tight group-hover:text-[#FBAE42] transition-colors duration-200">
                    {member.name}
                  </h3>
                  <p className="teams-card-role text-[#9B94AA] text-xs sm:text-[13px] font-normal mt-0.5">
                    {member.role}
                  </p>
                </div>
              </div>
            ))}

            {teamMembers.length === 0 && (
              <div className="w-full py-12 text-center text-sm font-medium text-white/60">
                No team members published yet.
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
