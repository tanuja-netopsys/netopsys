import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion";
import { Landmark, Zap, ShieldCheck, ArrowLeft } from "lucide-react";
import Navbar from "../componenets/navbar.tsx";
import Footer from "../componenets/footer.tsx";
import BackToHeroButton from "../componenets/back-to-hero.tsx";
import { getServiceByIdOrSlug } from "../data/services-data.ts";

function DesktopServiceDetailHero({
  service,
  handleBack,
}: {
  service: ReturnType<typeof getServiceByIdOrSlug>;
  handleBack: (e: React.MouseEvent) => void;
}) {
  const { scrollY } = useScroll();
  const smoothScrollY = useSpring(scrollY, {
    stiffness: 140,
    damping: 26,
    mass: 0.35,
  });
  const imageWidth = useTransform(smoothScrollY, [0, 280], ["100%", "54%"]);
  const imageHeight = useTransform(smoothScrollY, [0, 280], ["660px", "480px"]);
  const textOpacity = useTransform(smoothScrollY, [50, 250], [0, 1]);
  const textX = useTransform(smoothScrollY, [50, 250], [-30, 0]);
  const textPointerEvents = useTransform(smoothScrollY, (v) =>
    v > 100 ? "auto" : "none"
  );

  return (
    <div className="relative w-full h-[930px] pt-26 servicedetail-hero-wrap">
      <div
        className="sticky top-28 w-full flex flex-col justify-start overflow-visible pt-1 servicedetail-pinned-wrap"
        style={{ top: "6rem" }}
      >
        <div className="relative w-full max-w-[2100px] mx-auto px-10 xl:px-14 2xl:px-18">
          <div className="mb-5 servicedetail-back-wrap">
            <Link
              to="/services"
              onClick={handleBack}
              className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#6C6377] hover:text-[#693092] transition-colors cursor-pointer select-none w-fit"
              aria-label="Back to Services"
            >
              <ArrowLeft className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>Back to Services</span>
            </Link>
          </div>

          <div className="relative w-full flex flex-row items-start justify-between min-h-[480px] servicedetail-hero-row">
            <motion.div
              style={{
                opacity: textOpacity,
                x: textX,
                pointerEvents: textPointerEvents,
              }}
              className="w-[42%] text-left z-10 pt-3 servicedetail-hero-text"
            >
              <h1 className="text-[4.25rem] xl:text-[4.75rem] font-light tracking-[-0.035em] leading-[1.04] text-[#141010] servicedetail-hero-title">
                <span className="block">{service.titlePart1}</span>
                <span className="block text-[#693092]">{service.titlePart2}</span>
              </h1>
              <p className="text-[#554E62] text-[16px] font-normal leading-relaxed mt-5 max-w-xl servicedetail-hero-desc">
                {service.description}
              </p>
            </motion.div>

            <div className="absolute right-0 top-0 w-full flex justify-end z-20 pointer-events-none servicedetail-img-container">
              <motion.div
                style={{
                  width: imageWidth,
                  height: imageHeight,
                  pointerEvents: "auto",
                }}
                className="rounded-3xl overflow-hidden border border-black/[0.08] shadow-2xl shadow-purple-950/15 bg-[#120727] origin-right servicedetail-hero-img"
              >
                <img
                  src={service.image}
                  srcSet={service.imageSrcSet}
                  sizes="54vw"
                  alt={service.title}
                  width={1200}
                  height={670}
                  decoding="async"
                  className="w-full h-full object-cover object-center"
                />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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

  const [whyState, setWhyState] = useState({ serviceId: service.id, index: 0 });
  const activeWhyIndex = whyState.serviceId === service.id ? whyState.index : 0;
  const setActiveWhyIndex = (updater: number | ((prev: number) => number)) => {
    setWhyState((prev) => {
      const current = prev.serviceId === service.id ? prev.index : 0;
      const nextIndex = typeof updater === "function" ? updater(current) : updater;
      return { serviceId: service.id, index: nextIndex };
    });
  };
  const whyTouchStartXRef = useRef<number | null>(null);

  // Scroll to top when service changes so animation starts from center image
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [service.id]);

  const handleWhyTouchStart = (e: React.TouchEvent) => {
    whyTouchStartXRef.current = e.touches[0].clientX;
  };

  const handleWhyTouchEnd = (e: React.TouchEvent) => {
    if (whyTouchStartXRef.current === null) return;
    const diff = whyTouchStartXRef.current - e.changedTouches[0].clientX;
    const total = service.whyChooseUs.length;
    if (Math.abs(diff) > 40 && total > 1) {
      setActiveWhyIndex((prev) =>
        diff > 0 ? (prev + 1) % total : (prev - 1 + total) % total
      );
    }
    whyTouchStartXRef.current = null;
  };

  const renderWhyIcon = (idx: number) => {
    if (idx === 0) {
      return (
        <div className="w-12 h-12 rounded-2xl bg-[#EDE4F7] text-[#7E37A8] flex items-center justify-center shadow-xs">
          <Landmark className="w-6 h-6" />
        </div>
      );
    }
    if (idx === 1) {
      return (
        <div className="w-12 h-12 rounded-2xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center shadow-xs">
          <Zap className="w-6 h-6 fill-[#D97706]/20" />
        </div>
      );
    }
    return (
      <div className="w-12 h-12 rounded-2xl bg-[#D1FAE5] text-[#059669] flex items-center justify-center shadow-xs">
        <ShieldCheck className="w-6 h-6" />
      </div>
    );
  };

  // Track responsive screen size for horizontal center calculation
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

        {/* Hero Section: Desktop scroll parallax vs static lightweight mobile hero */}
        {isDesktop ? (
          <DesktopServiceDetailHero service={service} handleBack={handleBack} />
        ) : (
          <div className="relative w-full min-h-[360px] sm:min-h-[460px] h-auto pt-20 sm:pt-24 servicedetail-hero-wrap">
            <div className="relative w-full flex flex-col justify-start pt-1 servicedetail-pinned-wrap">
              <div className="relative w-full max-w-[2100px] mx-auto px-4 sm:px-6 md:px-8">
                <div className="mb-3.5 sm:mb-4 servicedetail-back-wrap">
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

                <div className="relative w-full flex flex-col items-start justify-between servicedetail-hero-row">
                  <div className="order-2 w-full text-left z-10 pt-1 servicedetail-hero-text">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-light tracking-[-0.035em] leading-[1.04] text-[#141010] servicedetail-hero-title">
                      <span className="block">{service.titlePart1}</span>
                      <span className="block text-[#693092]">{service.titlePart2}</span>
                    </h1>
                    <p className="text-[#554E62] text-sm sm:text-base md:text-[16px] font-normal leading-relaxed mt-4 sm:mt-5 max-w-xl servicedetail-hero-desc">
                      {service.description}
                    </p>
                  </div>

                  <div className="order-1 w-full mb-6 servicedetail-img-container">
                    <div
                      style={{ height: isSmallMobile ? "220px" : "300px" }}
                      className="w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-black/[0.08] shadow-md bg-[#120727] servicedetail-hero-img"
                    >
                      <img
                        src={service.image}
                        srcSet={service.imageSrcSet}
                        sizes="100vw"
                        alt={service.title}
                        width={600}
                        height={335}
                        decoding="async"
                        className="w-full h-full object-cover object-center"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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
          <section className="mt-10 md:mt-20 lg:mt-24 text-left servicedetail-why-section">
            <div className="mb-6 md:mb-9">
              <h2 className="text-[2rem] sm:text-4xl md:text-[2.65rem] lg:text-[3rem] font-light tracking-[-0.035em] leading-[1.08] text-[#141010] mb-2 md:mb-3 servicedetail-section-title">
                Why choose us
              </h2>
              <p className="text-[#554E62] text-sm sm:text-base md:text-[17px] font-normal leading-relaxed max-w-3xl servicedetail-section-desc">
                {service.whyChooseUsSubtitle ||
                  "We choose technology based on the problem, not the trend."}
              </p>
            </div>

            {/* Mobile (< 768px) Horizontal Stepper + Single Swipeable Card Carousel */}
            <div className="md:hidden">
              {/* Step Timeline Indicator */}
              <div className="relative px-2">
                <div
                  className="absolute top-[22px] left-6 right-6 h-[2px] -translate-y-1/2 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(90deg, #F59E0B 0%, #9D2582 50%, #50155A 100%)",
                  }}
                />
                <div className="flex items-start justify-between relative z-10">
                  {service.whyChooseUs.map((item, idx) => {
                    const isActive = idx === activeWhyIndex;
                    const circleStyle =
                      idx === 0
                        ? isActive
                          ? "bg-[#F59E0B] text-white shadow-[0_0_0_6px_rgba(245,158,11,0.2)]"
                          : "bg-[#FCD39D] text-white"
                        : idx === 1
                        ? isActive
                          ? "bg-[#9D2582] text-white shadow-[0_0_0_6px_rgba(157,37,130,0.2)]"
                          : "bg-[#DDA6CB] text-white"
                        : isActive
                        ? "bg-[#50155A] text-white shadow-[0_0_0_6px_rgba(105,48,146,0.18)]"
                        : "bg-[#9978AD] text-white";

                    return (
                      <div
                        key={item.number || idx}
                        className="flex flex-col items-center"
                      >
                        <div className="h-11 flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => setActiveWhyIndex(idx)}
                            aria-label={`Step ${item.number}: ${item.title}`}
                            aria-current={isActive ? "step" : undefined}
                            className={`rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                              isActive
                                ? "w-11 h-11 text-[13px]"
                                : "w-8 h-8 text-[11px]"
                            } ${circleStyle}`}
                          >
                            {item.number}
                          </button>
                        </div>
                        <div
                          className={`w-px h-5 border-l-2 border-dotted mt-0.5 ${
                            isActive
                              ? "border-[#693092]/70"
                              : "border-[#C7B3D6]/70"
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Active White Showcase Card */}
              {service.whyChooseUs[activeWhyIndex] && (
                <div
                  onTouchStart={handleWhyTouchStart}
                  onTouchEnd={handleWhyTouchEnd}
                  className="bg-white rounded-2xl p-6 pb-8 border border-black/[0.04] shadow-[0_6px_26px_rgba(80,21,90,0.06)] overflow-hidden"
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeWhyIndex}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="mb-5">
                        {renderWhyIcon(activeWhyIndex)}
                      </div>
                      <h3 className="text-[1.35rem] font-bold tracking-tight leading-snug text-[#141010] mb-2.5">
                        {service.whyChooseUs[activeWhyIndex].title}
                      </h3>
                      <p className="text-[#554E62] text-[14.5px] leading-relaxed font-normal">
                        {service.whyChooseUs[activeWhyIndex].description}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>
              )}

              {/* Pagination Dots */}
              <div className="flex items-center justify-center gap-2 mt-4">
                {service.whyChooseUs.map((item, idx) => (
                  <button
                    key={item.number || idx}
                    type="button"
                    onClick={() => setActiveWhyIndex(idx)}
                    aria-label={`Show ${item.title}`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === activeWhyIndex
                        ? "w-6 bg-[#693092]"
                        : "w-1.5 bg-[#693092]/25"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Desktop & Tablet (>= 768px): Original 3-Step Timeline + 3-Column Grid */}
            <div className="hidden md:block relative mb-6 sm:mb-7">
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

            {/* 3-Column Cards Grid (Desktop & Tablet) */}
            <div className="hidden md:grid md:grid-cols-3 gap-6 sm:gap-7 lg:gap-8 servicedetail-grid">
              {service.whyChooseUs.map((item, idx) => (
                <div
                  key={item.number || idx}
                  className="bg-white rounded-2xl sm:rounded-3xl p-7 sm:p-8 lg:p-9 flex flex-col justify-start relative group transition-all duration-300 border border-black/[0.04] shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-lg servicedetail-card"
                >
                  {/* Icon Badge */}
                  <div className="mb-5 servicedetail-badge-wrap">
                    {renderWhyIcon(idx)}
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
          <div className="mt-7 md:mt-20 lg:mt-24 mb-10 md:mb-20 w-full">
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
