import { useState, useRef, useEffect } from "react";
import { ArrowUpRight, ChevronRight, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../componenets/navbar.tsx";
import Footer from "../componenets/footer.tsx";
import { SERVICES_DATA as SERVICES } from "../data/services-data.ts";

export default function ServicesPage() {
  const navigate = useNavigate();
  const [openId, setOpenId] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const supportsFineHover = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const handleMouseEnter = (id: string) => {
    if (!supportsFineHover()) return;
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setOpenId(id);
    }, 20);
  };

  const handleMouseLeave = () => {
    if (!supportsFineHover()) return;
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setOpenId(null);
    }, 80);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const toggleAccordion = (id: string) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen w-full bg-[#08050E] text-white flex flex-col overflow-x-clip selection:bg-[#693092] selection:text-white">
      {/* Floating Navbar with Services active */}
      <Navbar activeTab="Services" />

      {/* Main Interactive Services Section (Matching original Services design and styling) */}
      <section
        id="services-content"
        className="relative w-full bg-[#F5EEF8] text-[#141010] pt-24 sm:pt-28 md:pt-30 pb-16 sm:pb-20 lg:pb-24 overflow-hidden select-none z-20 services-page-main"
        style={{ fontFamily: "'Onest', sans-serif" }}
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

        {/* Main Container - Expanded width matching Hero and About */}
        <div className="relative w-full max-w-[2100px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-14 2xl:px-18">
          {/* Header: Eyebrow + Large Display Title + Subtitle Below Title on Left */}
          <div className="w-full mb-12 sm:mb-16 lg:mb-20 services-page-header">
            {/* Breadcrumb Navigation: Home > Services */}
            <nav aria-label="Breadcrumb" className="mb-4 sm:mb-5 services-page-breadcrumb">
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
                  <span className="text-[#693092] font-semibold">Services</span>
                </li>
              </ol>
            </nav>

            {/* Main Title */}
            <h2 className="services-page-title text-4xl sm:text-5xl md:text-6xl lg:text-[4.75rem] font-light tracking-[-0.035em] leading-[1.04] text-[#141010] mb-4 sm:mb-5 lg:mb-6">
              <span className="block">Everything your business</span>
              <span className="block text-[#693092]">needs to scale.</span>
            </h2>

            {/* Subtitle Placed Below Title on the Left */}
            <p className="services-page-desc text-[#554E62] text-sm sm:text-base md:text-[16px] lg:text-[17px] leading-relaxed font-normal max-w-2xl">
              From AI to infrastructure — we deliver end-to-end technology solutions that drive real results.
            </p>
          </div>

          {/* Accordion Services List (01 through 09) */}
          <div className="w-full border-t border-[#141010]/10 services-accordion-wrap">
            {SERVICES.map((service) => {
              const isOpen = openId === service.id;

              return (
                <div
                  key={service.id}
                  onMouseEnter={() => handleMouseEnter(service.id)}
                  onMouseLeave={handleMouseLeave}
                  className="w-full border-b border-[#141010]/10 transition-colors services-accordion-item"
                >
                  {/* Collapsed Button Row */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateRows: isOpen ? "0fr" : "1fr",
                      opacity: isOpen ? 0 : 1,
                      transition:
                        "grid-template-rows 0.42s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.22s ease",
                      pointerEvents: isOpen ? "none" : "auto",
                    }}
                  >
                    <div className="overflow-hidden">
                      <button
                        type="button"
                        onClick={() => toggleAccordion(service.id)}
                        className="w-full py-4 sm:py-6 lg:py-7 flex items-center justify-between text-left group cursor-pointer transition-colors services-accordion-btn"
                        aria-expanded={isOpen}
                      >
                        <div className="flex items-center gap-3.5 sm:gap-8 lg:gap-12 pr-3 sm:pr-4 min-w-0">
                          <span className="text-xs sm:text-sm font-mono tracking-wider font-semibold text-[#693092] flex-shrink-0 transition-colors duration-300 services-item-num">
                            {service.id}
                          </span>
                          <h3
                            className="text-lg sm:text-2xl md:text-[1.85rem] lg:text-[2.05rem] xl:text-[2.25rem] font-light tracking-[-0.035em] leading-tight text-[#141010] group-hover:text-[#693092] transition-colors duration-300 services-item-title break-words"
                            style={{ fontFamily: "'Onest', sans-serif" }}
                          >
                            {service.title}
                          </h3>
                        </div>
                        <div className="flex-shrink-0 w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center">
                          <span className="text-xl sm:text-2xl font-normal text-[#141010]/40 group-hover:text-[#141010] transition-colors duration-300">
                            +
                          </span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Expanded Card Details */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateRows: isOpen ? "1fr" : "0fr",
                      opacity: isOpen ? 1 : 0,
                      transition:
                        "grid-template-rows 0.42s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.32s ease",
                      pointerEvents: isOpen ? "auto" : "none",
                    }}
                  >
                    <div className="overflow-hidden py-3 sm:py-4">
                      <div
                        className="w-full bg-gradient-to-r from-[#090414] via-[#110724] to-[#220B44] text-white border border-[#BE3093]/30 rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:py-10 lg:px-12 shadow-none relative overflow-hidden transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] services-expanded-card"
                        style={{
                          transform: isOpen ? "translateY(0)" : "translateY(6px)",
                          boxShadow: "none",
                        }}
                      >
                        {/* Ambient Neon Purple Backlight Glow behind illustration */}
                        <div className="absolute -right-12 top-1/2 -translate-y-1/2 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-[#BE3093]/25 blur-[100px] pointer-events-none transition-opacity duration-500" />

                        {/* Seamlessly Blended 3D Tech Illustration Background (Right Half) */}
                        <div className="absolute right-0 top-0 bottom-0 w-full sm:w-[60%] lg:w-[54%] h-full overflow-hidden pointer-events-none z-0">
                          <img
                            src={service.image}
                            alt={service.title}
                            className="w-full h-full object-cover object-center opacity-50 sm:opacity-100"
                            style={{
                              maskImage:
                                "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.15) 12%, rgba(0,0,0,0.7) 38%, black 75%)",
                              WebkitMaskImage:
                                "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.15) 12%, rgba(0,0,0,0.7) 38%, black 75%)",
                              mixBlendMode: "screen",
                            }}
                          />
                          {/* Smooth gradient blend overlay on the left edge */}
                          <div className="absolute inset-0 bg-gradient-to-r from-[#090414]/95 sm:from-[#090414] via-[#090414]/70 sm:via-[#090414]/50 to-transparent pointer-events-none" />
                          {/* Subtle top & bottom edge softening */}
                          <div className="absolute inset-0 bg-gradient-to-b from-[#090414]/25 via-transparent to-[#090414]/35 pointer-events-none" />
                        </div>

                        {/* Close Button in top right */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
                            setOpenId(null);
                          }}
                          className="absolute top-3.5 right-3.5 sm:top-6 sm:right-6 w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer z-20 backdrop-blur-sm"
                          aria-label="Close service details"
                        >
                          <X className="w-4 h-4" />
                        </button>

                        {/* Foreground Content: Number on left + Text column on right where ALL text shares the exact same starting point */}
                        <div className="relative z-10 max-w-2xl flex flex-col sm:flex-row items-start gap-2 sm:gap-6 lg:gap-8 pr-8 sm:pr-0">
                          {/* Number Column */}
                          <span className="text-xs sm:text-sm font-mono tracking-wider font-semibold text-white/50 pt-1.5 flex-shrink-0">
                            {service.id}
                          </span>

                          {/* Text Column: Title, Description, Tags, and Explore ALL share the exact same starting point */}
                          <div className="flex-1 flex flex-col justify-center text-left pr-4">
                            {/* Title */}
                            <h3
                              onClick={() => navigate(`/services/${service.slug}`)}
                              className="text-2xl sm:text-3xl md:text-[2.05rem] lg:text-[2.25rem] font-light tracking-[-0.035em] text-white leading-tight mb-2.5 sm:mb-3 hover:text-[#FBAE42] transition-colors cursor-pointer services-expanded-title"
                            >
                              {service.title}
                            </h3>

                            {/* Description - Aligned with Title */}
                            <p className="text-white/80 text-xs sm:text-sm md:text-[14.5px] leading-relaxed font-normal mb-5 sm:mb-6 max-w-xl services-expanded-desc">
                              {service.description}
                            </p>

                            {/* Badges / Tags - Aligned with Title & Description */}
                            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 mb-5 sm:mb-6 services-expanded-tags">
                              {service.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="px-4 py-1.5 rounded-full border border-white/20 bg-black/30 text-white/90 text-xs sm:text-[13px] font-normal shadow-sm backdrop-blur-md"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>

                            {/* Explore Link - Aligned with Title, Description & Tags */}
                            <div>
                              <Link
                                to={`/services/${service.slug}`}
                                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-white hover:text-[#FBAE42] transition-colors group/explore cursor-pointer"
                              >
                                <span className="underline underline-offset-4">Explore</span>
                                <span className="relative overflow-hidden w-4 h-4 inline-flex items-center justify-center">
                                  <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-all duration-300 ease-out transform group-hover/explore:translate-x-3.5 group-hover/explore:-translate-y-3.5 group-hover/explore:opacity-0" />
                                  <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 absolute transition-all duration-300 ease-out transform -translate-x-3.5 translate-y-3.5 opacity-0 group-hover/explore:translate-x-0 group-hover/explore:translate-y-0 group-hover/explore:opacity-100" />
                                </span>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom CTA Card: "Ready to get started? Let's build something great together." */}
          <div className="mt-8 sm:mt-10 lg:mt-14 w-full">
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
                  to="/contact"
                  className="hover-brand-gradient inline-flex items-center justify-center bg-[#FBAE42] text-black hover:text-white font-medium text-xs sm:text-sm md:text-[15px] px-7 sm:px-8 py-3 sm:py-3.5 rounded-full shadow-md whitespace-nowrap cursor-pointer transition-colors cta-banner-btn"
                >
                  Let's Connect
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export { ServicesPage };
