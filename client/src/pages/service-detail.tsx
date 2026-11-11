import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { Landmark, Zap, ShieldCheck, ArrowLeft } from "lucide-react";
import Navbar from "../componenets/navbar.tsx";
import Footer from "../componenets/footer.tsx";
import BackToHeroButton from "../componenets/back-to-hero.tsx";
import { getServiceByIdOrSlug } from "../data/services-data.ts";

export default function ServiceDetailPage() {
  const { serviceId } = useParams<{ serviceId?: string }>();
  const navigate = useNavigate();

  const service = getServiceByIdOrSlug(serviceId);

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/services");
    }
  };

  // Scroll to top when service changes so animation starts from center image
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [service.id]);

  // Track responsive screen size for horizontal center calculation
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 1024 : true
  );

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Scroll animation driven by actual scroll distance
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  // Animation transforms:
  // 1. Initial State (scrollY = 0):
  //    - Hero image starts full width (100%), height fixed at 480px, strictly below navbar.
  //    - Text is hidden (opacity = 0).
  // 2. On scroll (scrollY: 0 -> 260px):
  //    - Hero image contracts ONLY horizontally to the side (100% -> 54% width).
  //    - It does NOT move up vertically (hero stays pinned in place).
  //    - Text smoothly reveals (opacity 0 -> 1, x: -30 -> 0).
  // 3. Pinned Hold Range (scrollY: 260px -> ~680px):
  //    - Hero stays pinned in its final state so user sees the complete text and image clearly.
  // 4. Past ~680px:
  //    - Entire hero section scrolls up naturally, and the content below scrolls into view.
  const imageWidth = useTransform(
    scrollY,
    [0, 280],
    [isDesktop ? "100%" : "100%", isDesktop ? "54%" : "100%"]
  );

  const imageHeight = useTransform(
    scrollY,
    [0, 280],
    [isDesktop ? "660px" : "380px", isDesktop ? "480px" : "320px"]
  );

  const textOpacity = useTransform(
    scrollY,
    [50, 250],
    [isDesktop ? 0 : 1, 1]
  );

  const textX = useTransform(
    scrollY,
    [50, 250],
    [isDesktop ? -30 : 0, 0]
  );

  const textPointerEvents = useTransform(scrollY, (v) =>
    !isDesktop || v > 100 ? "auto" : "none"
  );

  return (
    <div
      className="min-h-screen w-full bg-[#F5EEF8] text-[#141010] flex flex-col selection:bg-[#693092] selection:text-white"
      style={{ fontFamily: "'Onest', sans-serif" }}
    >
      {/* Floating Brand Navbar */}
      <Navbar activeTab="Services" />

      {/* Main Page Container - No overflow-hidden so position:sticky works */}
      <main className="relative w-full z-10 flex-1 pb-16 select-none servicedetail-page-main">
        {/* Subtle background tech grid and glows clipped in their own container */}
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
        <div ref={heroRef} className="relative w-full min-h-[500px] h-auto lg:h-[930px] pt-20 sm:pt-24 lg:pt-26 servicedetail-hero-wrap">
          <div
            className="relative lg:sticky top-0 lg:top-24 xl:top-28 w-full flex flex-col justify-start overflow-visible pt-1 servicedetail-pinned-wrap"
            style={{
              top: isDesktop ? "6rem" : undefined,
            }}
          >
            <div className="relative w-full max-w-[2100px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-14 2xl:px-18">
              {/* Back to Services link button */}
              <div className="mb-3.5 sm:mb-4 lg:mb-5 servicedetail-back-wrap">
                <Link
                  to="/services"
                  onClick={handleBack}
                  className="inline-flex items-center gap-2 text-xs sm:text-[13px] font-semibold text-[#6C6377] hover:text-[#693092] transition-colors cursor-pointer select-none w-fit"
                  aria-label="Back to Services"
                >
                  <ArrowLeft className="w-3.5 h-3.5 stroke-[2.2]" />
                  <span>Back to Services</span>
                </Link>
              </div>

              <div className="relative w-full flex flex-col lg:flex-row items-start justify-between min-h-[360px] lg:min-h-[480px] servicedetail-hero-row">
                {/* Left Column: Heading and description (Reveals on scroll) */}
                <motion.div
                  style={{
                    opacity: textOpacity,
                    x: textX,
                    pointerEvents: textPointerEvents,
                  }}
                  className="order-2 lg:order-1 w-full lg:w-[42%] text-left z-10 pt-1 lg:pt-3 servicedetail-hero-text"
                >
                  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] xl:text-[4.75rem] font-light tracking-[-0.035em] leading-[1.04] text-[#141010] servicedetail-hero-title">
                    <span className="block">{service.titlePart1}</span>
                    <span className="block text-[#693092]">{service.titlePart2}</span>
                  </h1>

                  {/* Subtitle Description */}
                  <p className="text-[#554E62] text-sm sm:text-base md:text-[16px] font-normal leading-relaxed mt-4 sm:mt-5 max-w-xl servicedetail-hero-desc">
                    {service.description}
                  </p>
                </motion.div>

                {/* Right-anchored Featured Image:
                    Starts 100% full width of the container & 660px tall.
                    On scroll, contracts ONLY horizontally into the right column (54% width, 480px height).
                    Does NOT move up vertically. */}
                <div className="order-1 lg:order-2 lg:absolute lg:right-0 lg:top-0 w-full flex justify-end z-20 pointer-events-none mb-6 lg:mb-0 servicedetail-img-container">
                  <motion.div
                    style={{
                      width: imageWidth,
                      height: imageHeight,
                      pointerEvents: "auto",
                    }}
                    className="rounded-2xl sm:rounded-3xl overflow-hidden border border-black/[0.08] shadow-2xl shadow-purple-950/15 bg-[#120727] origin-right servicedetail-hero-img"
                  >
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover object-center"
                    />
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Container for Following Sections - Scrolls up directly after hero is complete */}
        <div className="relative w-full max-w-[2100px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-14 2xl:px-18">
          {/* Section: "What We Offer" */}
          <section className="mt-4 sm:mt-6 lg:mt-6 text-left servicedetail-offer-section">
            <div className="mb-5 sm:mb-6">
              <h2 className="text-3xl sm:text-4xl md:text-[2.65rem] lg:text-[3rem] font-light tracking-[-0.035em] leading-[1.08] text-[#141010] mb-2 sm:mb-2.5 servicedetail-section-title">
                What We Offer
              </h2>
              <p className="text-[#554E62] text-sm sm:text-base md:text-[17px] font-normal leading-relaxed max-w-3xl servicedetail-section-desc">
                {service.whatWeOfferSubtitle}
              </p>
            </div>

            {/* 3-Column Grid matching the card design in the image */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7 lg:gap-8 servicedetail-grid">
              {service.whatWeOffer.map((item) => (
                <div
                  key={item.number}
                  className="bg-white rounded-2xl sm:rounded-3xl p-7 sm:p-8 lg:p-9 flex flex-col justify-start relative group transition-all duration-300 border border-black/[0.04] shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-lg servicedetail-card"
                >
                  {/* Number Indicator */}
                  <span className="text-sm sm:text-[15px] font-semibold text-[#B32B8C] mb-4 sm:mb-5 block servicedetail-card-num">
                    {item.number}
                  </span>

                  {/* Card Title */}
                  <h3 className="text-xl sm:text-2xl lg:text-[1.65rem] font-bold tracking-tight leading-snug text-[#141010] mb-2.5 sm:mb-3 servicedetail-card-title">
                    {item.title}
                  </h3>

                  {/* Card Description */}
                  <p className="text-[#554E62] text-sm sm:text-[15px] md:text-[16px] leading-relaxed font-normal servicedetail-card-desc">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Section: "Why choose us" */}
          <section className="mt-16 sm:mt-20 lg:mt-24 text-left servicedetail-why-section">
            <div className="mb-7 sm:mb-9">
              <h2 className="text-3xl sm:text-4xl md:text-[2.65rem] lg:text-[3rem] font-light tracking-[-0.035em] leading-[1.08] text-[#141010] mb-2.5 sm:mb-3 servicedetail-section-title">
                Why choose us
              </h2>
              <p className="text-[#554E62] text-sm sm:text-base md:text-[17px] font-normal leading-relaxed max-w-3xl servicedetail-section-desc">
                {service.whyChooseUsSubtitle ||
                  "We choose technology based on the problem, not the trend."}
              </p>
            </div>

            {/* Step Timeline Indicator matching image */}
            <div className="relative mb-6 sm:mb-7">
              {/* Connecting Line (Desktop) */}
              <div
                className="hidden md:block absolute top-5 left-[16.666%] right-[16.666%] h-[2px] -translate-y-1/2 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(90deg, #F59E0B 0%, #9D2582 50%, #50155A 100%)",
                }}
              />

              {/* 3 Step Indicator Points */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7 lg:gap-8">
                {service.whyChooseUs.map((item, idx) => (
                  <div
                    key={item.number || idx}
                    className="flex flex-col items-center relative"
                  >
                    {/* Circle badge */}
                    <div
                      className={`w-9 sm:w-10 h-9 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold text-white shadow-sm z-10 ${
                        idx === 0
                          ? "bg-[#F59E0B]"
                          : idx === 1
                          ? "bg-[#9D2582]"
                          : "bg-[#50155A]"
                      }`}
                    >
                      {item.number}
                    </div>

                    {/* Dotted indicator line to card */}
                    <div
                      className={`hidden md:block w-px h-6 border-l border-dotted mt-1.5 ${
                        idx === 0
                          ? "border-[#F59E0B]/70"
                          : idx === 1
                          ? "border-[#9D2582]/70"
                          : "border-[#50155A]/70"
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* 3-Column Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7 lg:gap-8 servicedetail-grid">
              {service.whyChooseUs.map((item, idx) => (
                <div
                  key={item.number || idx}
                  className="bg-white rounded-2xl sm:rounded-3xl p-7 sm:p-8 lg:p-9 flex flex-col justify-start relative group transition-all duration-300 border border-black/[0.04] shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-lg servicedetail-card"
                >
                  {/* Icon Badge */}
                  <div className="mb-5 servicedetail-badge-wrap">
                    {idx === 0 && (
                      <div className="w-12 h-12 rounded-2xl bg-[#EDE4F7] text-[#7E37A8] flex items-center justify-center shadow-xs">
                        <Landmark className="w-6 h-6" />
                      </div>
                    )}
                    {idx === 1 && (
                      <div className="w-12 h-12 rounded-2xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center shadow-xs">
                        <Zap className="w-6 h-6 fill-[#D97706]/20" />
                      </div>
                    )}
                    {idx === 2 && (
                      <div className="w-12 h-12 rounded-2xl bg-[#D1FAE5] text-[#059669] flex items-center justify-center shadow-xs">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-xl sm:text-2xl lg:text-[1.65rem] font-bold tracking-tight leading-snug text-[#141010] mb-2.5 sm:mb-3 servicedetail-card-title">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="text-[#554E62] text-sm sm:text-[15px] md:text-[16px] leading-relaxed font-normal servicedetail-card-desc">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Bottom CTA Card: Exactly matching height, width, and styling from services page */}
          <div className="mt-14 sm:mt-20 lg:mt-24 mb-14 sm:mb-20 w-full">
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
      </main>

      {/* Site Footer */}
      <Footer />

      {/* Back to top button */}
      <BackToHeroButton />
    </div>
  );
}

export { ServiceDetailPage };
