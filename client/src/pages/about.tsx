import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, Search, TrendingUp } from "lucide-react";
import Navbar from "../componenets/navbar.tsx";
import Footer from "../componenets/footer.tsx";
import BackToHeroButton from "../componenets/back-to-hero.tsx";

const LOCATIONS = ["Singapore", "India", "United States"];

export default function AboutPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    document.title = "About Us | Netopsys - Pioneering Digital Excellence";
  }, []);

  return (
    <div
      className="min-h-screen w-full bg-[#F5EEF8] text-[#141010] flex flex-col overflow-x-clip selection:bg-[#693092] selection:text-white"
      style={{ fontFamily: "'Onest', sans-serif" }}
    >
      <Navbar activeTab="About" />

      <main className="relative flex-1 w-full select-none overflow-hidden pt-24 sm:pt-28 md:pt-30 pb-14 sm:pb-18">
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
          {/* Breadcrumb Navigation: Home > About (matching Image 3) */}
          <nav aria-label="Breadcrumb" className="mb-4 sm:mb-6">
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
                <span className="text-[#693092] font-semibold">About</span>
              </li>
            </ol>
          </nav>

          {/* ================================================================ */}
          {/* 1. HERO SECTION: Exactly matching Image 2                         */}
          {/*    Pioneering Digital Excellence + Semicircular Arch Infographic  */}
          {/* ================================================================ */}
          <section className="w-full mb-10 sm:mb-14 lg:mb-16">
            {/* Screen reader semantic header for accessibility and SEO */}
            <div className="sr-only">
              <h1>Pioneering Digital Excellence</h1>
              <p>
                Netopsys is more than just a technology partner — we&apos;re the
                catalyst that transforms your business vision into digital reality.
                With over 15 years of combined expertise, we&apos;ve been
                Singapore&apos;s trusted choice for enterprises seeking to
                revolutionise their operations through cutting-edge AI, robust IT
                infrastructure, and innovative software development.
              </p>
            </div>

            {/* Exact Composition from Image 2 */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              className="w-full flex justify-start items-center select-none"
            >
              {/* 
                Unified SVG matching Image 2 (media_1793605533565_baa831b8.jpg)
                ViewBox 0 0 900 435 with exact pixel coordinates 
              */}
              <svg
                viewBox="0 0 900 435"
                className="w-full h-auto overflow-visible select-none"
                aria-label="Pioneering Digital Excellence - Key Metrics and Capabilities Infographic"
              >
                <defs>
                  <style>{`
                    @import url('https://fonts.googleapis.com/css2?family=Onest:wght@300;400;500;600;700&display=swap');
                    .arch-number {
                      font-family: 'Onest', sans-serif !important;
                      font-weight: 400 !important;
                    }
                    .capability-heading {
                      font-family: 'Onest', sans-serif !important;
                      font-weight: 600 !important;
                      letter-spacing: -0.025em !important;
                    }
                    .capability-desc {
                      font-family: 'Onest', sans-serif !important;
                      font-weight: 400 !important;
                      letter-spacing: -0.01em !important;
                    }

                    /* Keyframe animations for sequential staggered formation */
                    @keyframes archGrow {
                      0% { transform: scale(0); opacity: 0; }
                      35% { opacity: 1; }
                      100% { transform: scale(1); opacity: 1; }
                    }
                    @keyframes popIn {
                      0% { transform: scale(0); opacity: 0; }
                      70% { transform: scale(1.2); opacity: 1; }
                      100% { transform: scale(1); opacity: 1; }
                    }
                    @keyframes textFloat {
                      0% { transform: translateY(12px) scale(0.85); opacity: 0; }
                      100% { transform: translateY(0) scale(1); opacity: 1; }
                    }
                    @keyframes drawLine {
                      0% { stroke-dashoffset: 650; opacity: 0; }
                      5% { opacity: 1; }
                      100% { stroke-dashoffset: 0; opacity: 1; }
                    }
                    @keyframes labelSlide {
                      0% { transform: translateX(18px); opacity: 0; }
                      100% { transform: translateX(0); opacity: 1; }
                    }
                    @keyframes fadeInIntro {
                      0% { opacity: 0; transform: translateY(-8px); }
                      100% { opacity: 1; transform: translateY(0); }
                    }

                    .hero-infographic-intro {
                      animation: fadeInIntro 0.6s ease-out 0.05s both;
                    }

                    .arch-path {
                      transform-origin: 875px 239px;
                      animation-fill-mode: both;
                    }
                    .arch-line {
                      stroke-dasharray: 650;
                      animation-fill-mode: both;
                    }

                    /* Phase 1: 150+ & Projects Delivered (Purple) */
                    .arch-purple { animation: archGrow 0.65s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both; }
                    .num-purple { transform-origin: 575px 158px; animation: textFloat 0.45s ease-out 0.45s both; }
                    .node-purple { transform-origin: 575px 198px; animation: popIn 0.35s ease-out 0.55s both; }
                    .line-purple { animation: drawLine 0.55s ease-out 0.65s both; }
                    .label-1 { transform-origin: 354px 290px; animation: labelSlide 0.45s ease-out 0.95s both; }

                    /* Phase 2: 15+ & Years experience (Pink) */
                    .arch-pink { animation: archGrow 0.65s cubic-bezier(0.16, 1, 0.3, 1) 0.5s both; }
                    .num-pink { transform-origin: 655px 186px; animation: textFloat 0.45s ease-out 0.8s both; }
                    .node-pink { transform-origin: 655px 218px; animation: popIn 0.35s ease-out 0.9s both; }
                    .line-pink { animation: drawLine 0.55s ease-out 1.0s both; }
                    .label-2 { transform-origin: 354px 322px; animation: labelSlide 0.45s ease-out 1.3s both; }

                    /* Phase 3: 60+ & Technologies (Yellow) */
                    .arch-yellow { animation: archGrow 0.65s cubic-bezier(0.16, 1, 0.3, 1) 0.85s both; }
                    .num-yellow { transform-origin: 740px 205px; animation: textFloat 0.45s ease-out 1.15s both; }
                    .node-yellow { transform-origin: 740px 228px; animation: popIn 0.35s ease-out 1.25s both; }
                    .line-yellow { animation: drawLine 0.55s ease-out 1.35s both; }
                    .label-3 { transform-origin: 354px 355px; animation: labelSlide 0.45s ease-out 1.65s both; }

                    /* Phase 4: 100% & Enterprise Grade (Navy) */
                    .arch-navy { animation: archGrow 0.65s cubic-bezier(0.16, 1, 0.3, 1) 1.2s both; }
                    .num-navy { transform-origin: 830px 217px; animation: textFloat 0.45s ease-out 1.5s both; }
                    .node-navy { transform-origin: 830px 238px; animation: popIn 0.35s ease-out 1.6s both; }
                    .line-navy { animation: drawLine 0.55s ease-out 1.7s both; }
                    .label-4 { transform-origin: 354px 387px; animation: labelSlide 0.45s ease-out 2.0s both; }

                    @media (prefers-reduced-motion: reduce) {
                      .hero-infographic-intro,
                      .arch-path,
                      .arch-number,
                      .node-purple, .node-pink, .node-yellow, .node-navy,
                      .arch-line,
                      .label-1, .label-2, .label-3, .label-4 {
                        animation: none !important;
                        opacity: 1 !important;
                        transform: none !important;
                        stroke-dashoffset: 0 !important;
                      }
                    }
                  `}</style>
                  {/* Solid Triangular Arrowhead Pointing Left (◄) - Restored earlier size (6x6) and direction (◄) */}
                  <marker
                    id="arrow-left-solid"
                    viewBox="0 0 10 10"
                    refX="9"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto"
                  >
                    <path d="M 0 1.5 L 9 5 L 0 8.5 Z" fill="#573E75" />
                  </marker>
                </defs>

                {/* ============================================================== */}
                {/* TOP LEFT: DISPLAY TITLE & INTRO PARAGRAPH                      */}
                {/* Aligned to x=0 to match exact left margin of remaining pages  */}
                {/* ============================================================== */}
                <g className="hero-infographic-intro">
                  {/* Main Title: Pioneering Digital Excellence */}
                  <text
                    x="0"
                    y="44"
                    fontFamily="'Onest', sans-serif"
                    fontSize="38"
                    fontWeight="300"
                    fill="#141010"
                    letterSpacing="-0.035em"
                  >
                    Pioneering{" "}
                    <tspan fill="#693092" fontWeight="400">
                      Digital Excellence
                    </tspan>
                  </text>

                  {/* Description Paragraph with full CSS font styling */}
                  <foreignObject x="0" y="62" width="475" height="150">
                    <p
                      className="text-[#554E62] text-[13.5px] leading-[1.62] font-normal m-0"
                      style={{ fontFamily: "'Onest', sans-serif" }}
                    >
                      Netopsys is more than just a technology partner — we&apos;re the
                      catalyst that transforms your business vision into digital reality.
                      With over 15 years of combined expertise, we&apos;ve been
                      Singapore&apos;s trusted choice for enterprises seeking to
                      revolutionise their operations through cutting-edge AI, robust IT
                      infrastructure, and innovative software development.
                    </p>
                  </foreignObject>
                </g>

                {/* ============================================================== */}
                {/* TOP RIGHT: 4 CONCENTRIC SEMICIRCULAR ARCHES                    */}
                {/* Baseline y = 239, Right anchor x = 875                         */}
                {/* ============================================================== */}

                {/* 1. Outer Arch: Purple (150+) */}
                {/* R = 188.5, starts at x = 498, ends at x = 875, peak y = 50.5 */}
                <path
                  d="M 498,239 A 188.5,188.5 0 0,1 875,239 Z"
                  fill="#73419A"
                  className="arch-path arch-purple transition-opacity hover:opacity-95"
                />
                {/* 150+ Number - Regular font, moved to middle */}
                <text
                  x="575"
                  y="158"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="28"
                  className="arch-number num-purple"
                  style={{ fontFamily: "'Onest', sans-serif", fontWeight: 400, letterSpacing: "-0.02em" }}
                >
                  150+
                </text>
                {/* Node 1: Circular target (white ring with dark center) */}
                <g className="node-purple">
                  <circle cx="575" cy="198" r="6.5" fill="#FFFFFF" />
                  <circle cx="575" cy="198" r="3" fill="#1C1429" />
                </g>

                {/* 2. Second Arch: Magenta/Pink (15+) */}
                {/* R = 140, starts at x = 595, ends at x = 875, peak y = 99 */}
                <path
                  d="M 595,239 A 140,140 0 0,1 875,239 Z"
                  fill="#D359AC"
                  className="arch-path arch-pink transition-opacity hover:opacity-95"
                />
                {/* 15+ Number - Regular font, moved to middle */}
                <text
                  x="655"
                  y="186"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="26"
                  className="arch-number num-pink"
                  style={{ fontFamily: "'Onest', sans-serif", fontWeight: 400, letterSpacing: "-0.02em" }}
                >
                  15+
                </text>
                {/* Node 2: Circular target */}
                <g className="node-pink">
                  <circle cx="655" cy="218" r="6" fill="#FFFFFF" />
                  <circle cx="655" cy="218" r="2.8" fill="#1C1429" />
                </g>

                {/* 3. Third Arch: Golden Yellow (60+) */}
                {/* R = 93.5, starts at x = 688, ends at x = 875, peak y = 145.5 */}
                <path
                  d="M 688,239 A 93.5,93.5 0 0,1 875,239 Z"
                  fill="#FDB75C"
                  className="arch-path arch-yellow transition-opacity hover:opacity-95"
                />
                {/* 60+ Number - Regular font, moved to middle */}
                <text
                  x="740"
                  y="205"
                  textAnchor="middle"
                  fill="#141010"
                  fontSize="24"
                  className="arch-number num-yellow"
                  style={{ fontFamily: "'Onest', sans-serif", fontWeight: 400, letterSpacing: "-0.02em" }}
                >
                  60+
                </text>
                {/* Node 3: Circular target */}
                <g className="node-yellow">
                  <circle cx="740" cy="228" r="5.5" fill="#FFFFFF" />
                  <circle cx="740" cy="228" r="2.5" fill="#1C1429" />
                </g>

                {/* 4. Fourth Arch: Deep Navy/Purple (100%) */}
                {/* R = 44.5, starts at x = 786, ends at x = 875, peak y = 194.5 */}
                <path
                  d="M 786,239 A 44.5,44.5 0 0,1 875,239 Z"
                  fill="#2E1E57"
                  className="arch-path arch-navy transition-opacity hover:opacity-95"
                />
                {/* 100% Number - Regular font, moved to middle */}
                <text
                  x="830"
                  y="217"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="18"
                  className="arch-number num-navy"
                  style={{ fontFamily: "'Onest', sans-serif", fontWeight: 400, letterSpacing: "-0.02em" }}
                >
                  100%
                </text>
                {/* Node 4: Circular target */}
                <g className="node-navy">
                  <circle cx="830" cy="238" r="5" fill="#FFFFFF" />
                  <circle cx="830" cy="238" r="2.2" fill="#FFFFFF" />
                </g>

                {/* ============================================================== */}
                {/* CONNECTOR LINES WITH SOLID ARROWHEADS POINTING LEFT            */}
                {/* Lines drop vertically from nodes, turn left to x = 368         */}
                {/* ============================================================== */}

                {/* Line 1: From 150+ (x=575, y=205) down to y=290, then left to x=368 */}
                <path
                  d="M 575,205 L 575,290 L 368,290"
                  fill="none"
                  stroke="#573E75"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="arch-line line-purple"
                  markerEnd="url(#arrow-left-solid)"
                />

                {/* Line 2: From 15+ (x=655, y=224) down to y=322, then left to x=368 */}
                <path
                  d="M 655,224 L 655,322 L 368,322"
                  fill="none"
                  stroke="#573E75"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="arch-line line-pink"
                  markerEnd="url(#arrow-left-solid)"
                />

                {/* Line 3: From 60+ (x=740, y=233) down to y=355, then left to x=368 */}
                <path
                  d="M 740,233 L 740,355 L 368,355"
                  fill="none"
                  stroke="#573E75"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="arch-line line-yellow"
                  markerEnd="url(#arrow-left-solid)"
                />

                {/* Line 4: From 100% (x=830, y=243) down to y=387, then left to x=368 */}
                <path
                  d="M 830,243 L 830,387 L 368,387"
                  fill="none"
                  stroke="#573E75"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="arch-line line-navy"
                  markerEnd="url(#arrow-left-solid)"
                />

                {/* ============================================================== */}
                {/* 4 CAPABILITY TEXT LABELS (Right-aligned to x = 354)             */}
                {/* Styled in Onest typeface with clean typography                  */}
                {/* ============================================================== */}

                {/* Item 1: Projects Delivered (Aligned with y = 290) */}
                <g className="label-1">
                  <text
                    x="354"
                    y="286"
                    textAnchor="end"
                    fontSize="15.5"
                    fill="#141010"
                    className="capability-heading"
                    style={{
                      fontFamily: "'Onest', sans-serif",
                      fontWeight: 600,
                      letterSpacing: "-0.025em",
                    }}
                  >
                    Projects Delivered
                  </text>
                  <text
                    x="354"
                    y="299"
                    textAnchor="end"
                    fontSize="11"
                    fill="#6B6377"
                    className="capability-desc"
                    style={{
                      fontFamily: "'Onest', sans-serif",
                      fontWeight: 400,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    Successfully delivered for our clients
                  </text>
                </g>

                {/* Item 2: Years experience (Aligned with y = 322) */}
                <g className="label-2">
                  <text
                    x="354"
                    y="318"
                    textAnchor="end"
                    fontSize="15.5"
                    fill="#141010"
                    className="capability-heading"
                    style={{
                      fontFamily: "'Onest', sans-serif",
                      fontWeight: 600,
                      letterSpacing: "-0.025em",
                    }}
                  >
                    Years experience
                  </text>
                  <text
                    x="354"
                    y="331"
                    textAnchor="end"
                    fontSize="11"
                    fill="#6B6377"
                    className="capability-desc"
                    style={{
                      fontFamily: "'Onest', sans-serif",
                      fontWeight: 400,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    Decades of combined global expertise
                  </text>
                </g>

                {/* Item 3: Technologies (Aligned with y = 355) */}
                <g className="label-3">
                  <text
                    x="354"
                    y="351"
                    textAnchor="end"
                    fontSize="15.5"
                    fill="#141010"
                    className="capability-heading"
                    style={{
                      fontFamily: "'Onest', sans-serif",
                      fontWeight: 600,
                      letterSpacing: "-0.025em",
                    }}
                  >
                    Technologies
                  </text>
                  <text
                    x="354"
                    y="364"
                    textAnchor="end"
                    fontSize="11"
                    fill="#6B6377"
                    className="capability-desc"
                    style={{
                      fontFamily: "'Onest', sans-serif",
                      fontWeight: 400,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    Across AI, cloud, networking, and security
                  </text>
                </g>

                {/* Item 4: Enterprise Grade (Aligned with y = 387) */}
                <g className="label-4">
                  <text
                    x="354"
                    y="383"
                    textAnchor="end"
                    fontSize="15.5"
                    fill="#141010"
                    className="capability-heading"
                    style={{
                      fontFamily: "'Onest', sans-serif",
                      fontWeight: 600,
                      letterSpacing: "-0.025em",
                    }}
                  >
                    Enterprise Grade
                  </text>
                  <text
                    x="354"
                    y="396"
                    textAnchor="end"
                    fontSize="11"
                    fill="#6B6377"
                    className="capability-desc"
                    style={{
                      fontFamily: "'Onest', sans-serif",
                      fontWeight: 400,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    Security and compliance built in by default
                  </text>
                </g>
              </svg>
            </motion.div>
          </section>

          {/* ================================================================ */}
          {/* 3. TIMELINE SECTIONS: MISSION & GLOBAL PRESENCE                  */}
          {/* ================================================================ */}
          <section className="relative mb-14 sm:mb-20 lg:mb-24">
            {/* Left Vertical Timeline Line with Golden Indicator Nodes */}
            <div className="hidden lg:block absolute left-0 top-6 bottom-12 w-[1px]">
              <div className="w-full h-full bg-gradient-to-b from-[#FBAE42] via-[#BE3093]/40 to-[#FBAE42]" />
              <div className="absolute top-0 -left-[7px] w-[15px] h-[15px] rounded-full border-2 border-[#FBAE42] bg-[#F5EEF8] shadow-sm" />
              <div className="absolute top-[52%] -left-[7px] w-[15px] h-[15px] rounded-full border-2 border-[#FBAE42] bg-[#F5EEF8] shadow-sm" />
            </div>

            {/* Content Container */}
            <div className="space-y-12 sm:space-y-16 lg:space-y-20 lg:pl-8 xl:pl-12">
              {/* BLOCK 1: MISSION */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-12 xl:gap-14 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.55 }}
                  className="lg:col-span-6 w-full"
                >
                  <div className="relative w-full aspect-[4/3] max-h-[380px] rounded-2xl sm:rounded-3xl overflow-hidden border border-[#693092]/15 shadow-md group bg-[#EBDFF1]">
                    <img
                      src="/about/about-mission.jpg"
                      alt="Netopsys Technology Strategy and Architecture Workshop"
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-2xl sm:rounded-3xl pointer-events-none" />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.55 }}
                  className="lg:col-span-6 text-left"
                >
                  <div className="mb-2.5 sm:mb-3">
                    <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-white border border-black/[0.08] text-[#554E62] text-xs sm:text-[13px] font-medium select-none">
                      Mission
                    </div>
                  </div>

                  <h2
                    className="about-block-title font-light tracking-[-0.035em] text-[#141010] mb-3 sm:mb-4"
                    style={{ fontFamily: "'Onest', sans-serif" }}
                  >
                    <span className="block text-[#141010]">Mission: Empowering</span>
                    <span className="block text-[#693092]">Tomorrow&apos;s Success</span>
                  </h2>

                  <p className="text-[#554E62] text-sm sm:text-base leading-relaxed font-normal max-w-xl">
                    We believe technology should amplify human potential, not complicate it.
                    That&apos;s why we&apos;ve dedicated ourselves to creating intelligent solutions
                    that seamlessly integrate with your business processes, delivering
                    measurable results that drive growth and efficiency.
                  </p>
                </motion.div>
              </div>

              {/* BLOCK 2: GLOBAL PRESENCE */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-12 xl:gap-14 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.55 }}
                  className="lg:col-span-6 text-left order-2 lg:order-1"
                >
                  <div className="mb-2.5 sm:mb-3">
                    <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-white border border-black/[0.08] text-[#554E62] text-xs sm:text-[13px] font-medium select-none">
                      Global Presence
                    </div>
                  </div>

                  <h2
                    className="about-block-title font-light tracking-[-0.035em] text-[#141010] mb-3 sm:mb-4"
                    style={{ fontFamily: "'Onest', sans-serif" }}
                  >
                    <span className="block text-[#141010]">Global Presence,</span>
                    <span className="block text-[#693092]">Local Excellence</span>
                  </h2>

                  <p className="text-[#554E62] text-sm sm:text-base leading-relaxed font-normal max-w-xl mb-3">
                    With headquarters in Singapore, expanding presence in the United States,
                    and development centres in India, we combine global expertise with local
                    understanding.
                  </p>

                  <p className="text-[#554E62] text-sm sm:text-base leading-relaxed font-normal max-w-xl mb-5 sm:mb-6">
                    Our international footprint ensures 24/7 support and culturally-aware
                    solutions for diverse markets.
                  </p>

                  <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 select-none">
                    {LOCATIONS.map((loc, lIdx) => (
                      <span
                        key={lIdx}
                        className="rounded-full bg-white border border-black/[0.08] text-[#554E62] font-medium hover:border-[#693092]/40 transition-colors px-3.5 py-1 text-xs sm:text-sm"
                      >
                        {loc}
                      </span>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.55 }}
                  className="lg:col-span-6 w-full order-1 lg:order-2"
                >
                  <div className="relative w-full aspect-[4/3] max-h-[380px] rounded-2xl sm:rounded-3xl overflow-hidden border border-[#693092]/15 shadow-md group bg-[#EBDFF1]">
                    <img
                      src="/about/about-global.jpg"
                      alt="Netopsys Global International Headquarters at Twilight"
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-2xl sm:rounded-3xl pointer-events-none" />
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* ================================================================ */}
          {/* 3.1 WHY CHOOSE US SECTION                                        */}
          {/* ================================================================ */}
          <section className="w-full mt-12 sm:mt-16 lg:mt-20 mb-12 sm:mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 xl:gap-16 items-center">
              {/* Left Column: Title & Description */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.55 }}
                className="lg:col-span-5 text-left"
              >
                <div className="mb-2.5 sm:mb-3">
                  <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-white border border-black/[0.08] text-[#554E62] text-xs sm:text-[13px] font-medium select-none">
                    Why Netopsys
                  </div>
                </div>

                <h2
                  className="about-block-title font-bold tracking-[-0.035em] text-[#141010] mb-3 sm:mb-4"
                  style={{ fontFamily: "'Onest', sans-serif" }}
                >
                  Why Choose Us
                </h2>

                <p className="text-[#554E62] text-sm sm:text-base leading-relaxed font-normal max-w-xl">
                  At Netopsys, we&apos;ll work on technology that goes beyond ideas. From AI-powered applications to enterprise infrastructure, our teams turn complex business challenges into practical digital solutions.
                </p>
              </motion.div>

              {/* Right Column: 3 Staggered Stacked Cards matching image */}
              <div className="lg:col-span-7 flex flex-col gap-4 sm:gap-5 w-full">
                {/* Card 1: Understand & Think (White, aligned left) */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.45, delay: 0.1 }}
                  className="w-full lg:w-[90%] lg:mr-auto bg-white rounded-2xl sm:rounded-[26px] px-6 sm:px-8 py-5 sm:py-6 border border-black/[0.06] shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow h-auto min-w-0 break-words"
                >
                  <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-[#F3ECF8] flex items-center justify-center shrink-0">
                    <Search className="w-5 h-5 text-[#5D2381] stroke-[2.2]" />
                  </div>
                  <div className="min-w-0 flex-1 break-words">
                    <h3 className="text-base sm:text-lg font-bold text-[#141010] mb-1 tracking-tight break-words">
                      Understand &amp; Think
                    </h3>
                    <p className="text-xs sm:text-[13px] text-[#554E62] leading-relaxed break-words">
                      We understand the challenge, explore different perspectives and focus on finding practical thoughtful solutions.
                    </p>
                  </div>
                </motion.div>

                {/* Card 2: Collaborate & Build (Purple, shifted right matching image) */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.45, delay: 0.2 }}
                  className="w-full lg:w-[90%] lg:ml-auto bg-[#693092] rounded-2xl sm:rounded-[26px] px-6 sm:px-8 py-5 sm:py-6 shadow-lg shadow-[#693092]/20 flex items-center gap-5 hover:bg-[#5f2b84] transition-colors h-auto min-w-0 break-words"
                >
                  <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <svg
                      className="w-6 h-6 text-white stroke-[2.2]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="9" cy="12" r="4.5" />
                      <circle cx="15" cy="12" r="4.5" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1 break-words">
                    <h3 className="text-base sm:text-lg font-bold text-white mb-1 tracking-tight break-words">
                      Collaborate &amp; Build
                    </h3>
                    <p className="text-xs sm:text-[13px] text-white/90 leading-relaxed break-words">
                      We deliver solutions on time without compromising on quality or attention to detail.
                    </p>
                  </div>
                </motion.div>

                {/* Card 3: Learn & Improve (White, aligned left matching Card 1) */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.45, delay: 0.3 }}
                  className="w-full lg:w-[90%] lg:mr-auto bg-white rounded-2xl sm:rounded-[26px] px-6 sm:px-8 py-5 sm:py-6 border border-black/[0.06] shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow h-auto min-w-0 break-words"
                >
                  <div className="w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-[#F3ECF8] flex items-center justify-center shrink-0">
                    <TrendingUp className="w-5 h-5 text-[#5D2381] stroke-[2.2]" />
                  </div>
                  <div className="min-w-0 flex-1 break-words">
                    <h3 className="text-base sm:text-lg font-bold text-[#141010] mb-1 tracking-tight break-words">
                      Learn &amp; Improve
                    </h3>
                    <p className="text-xs sm:text-[13px] text-[#554E62] leading-relaxed break-words">
                      Every solution undergoes rigorous testing and quality assurance processes.
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* ================================================================ */}
          {/* 4. BOTTOM CTA BANNER: "Ready to get started?"                    */}
          {/* ================================================================ */}
          <div className="w-full mt-10 sm:mt-14 lg:mt-16 mb-10 sm:mb-14">
            <div className="w-full bg-[#2A1450] rounded-2xl sm:rounded-3xl shadow-xl shadow-[#2A1450]/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 px-6 sm:px-10 lg:px-12 py-7 sm:py-9 lg:py-10">
              {/* Left Texts: Heading and subtitle */}
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 md:gap-5">
                <h3 className="font-light tracking-[-0.035em] text-white text-xl sm:text-2xl md:text-[1.85rem] whitespace-nowrap">
                  Ready to get started?
                </h3>
                <span className="text-white/85 font-normal text-xs sm:text-sm md:text-[15px]">
                  Let&apos;s build something great together
                </span>
              </div>

              {/* Right Button */}
              <div className="flex-shrink-0">
                <Link
                  to="/contact"
                  className="hover-brand-gradient inline-flex items-center justify-center bg-[#FBAE42] text-black hover:text-white font-medium rounded-full shadow-md whitespace-nowrap cursor-pointer transition-colors text-xs sm:text-sm px-6 sm:px-7 py-2.5 sm:py-3"
                >
                  Let's Connect
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <BackToHeroButton />
    </div>
  );
}
