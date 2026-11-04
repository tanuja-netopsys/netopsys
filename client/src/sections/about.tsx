import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";

// Animated counter component: counts up from 1 to target value when scrolled into view
function CounterNumber({
  value,
  duration = 1800,
}: {
  value: number;
  duration?: number;
}) {
  const [count, setCount] = useState(1);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.25 });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number | null = null;
    let animId: number;

    const updateCounter = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic: starts fast and smoothly decelerates near target
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentCount = Math.round(1 + (value - 1) * easeOut);

      setCount(currentCount);

      if (progress < 1) {
        animId = requestAnimationFrame(updateCounter);
      } else {
        setCount(value);
      }
    };

    animId = requestAnimationFrame(updateCounter);
    return () => cancelAnimationFrame(animId);
  }, [isInView, value, duration]);

  return <span ref={ref}>{count}</span>;
}

// Exact technologies from the user's reference image + enterprise stack
const TECH_STACK = [
  "OpenAI",
  "Microsoft .NET",
  "C#",
  "Azure",
  "AWS",
  "Docker",
  "Kubernetes",
  "PostgreSQL",
  "MongoDB",
  "Redis",
  "GraphQL",
  "Python",
  "JavaScript",
  "React",
  "Node.js",
  "TypeScript",
  "TensorFlow",
  "Apache Kafka",
  "Terraform",
];

const STATS = [
  {
    value: 150,
    suffix: "+",
    label: "Projects Delivered",
    subtitle: "Successfully delivered for our clients",
  },
  {
    value: 15,
    suffix: "+",
    label: "Years experience",
    subtitle: "Decades of combined global expertise",
  },
  {
    value: 60,
    suffix: "+",
    label: "Technologies",
    subtitle: "Across AI, cloud, networking, and security",
  },
  {
    value: 100,
    suffix: "%",
    label: "Enterprise Grade",
    subtitle: "Security and compliance built in by default",
  },
];

export default function About() {
  const containerRef = useRef<HTMLElement>(null);

  // Parallax scroll progression for smooth entrance from hero section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const contentY = useTransform(scrollYProgress, [0.02, 0.25], [36, 0]);
  const contentOpacity = useTransform(scrollYProgress, [0.02, 0.20], [0.35, 1]);

  return (
    <section
      ref={containerRef}
      id="about"
      className="about-section-wrap relative w-full min-h-[100dvh] flex flex-col justify-between bg-[#08050E] text-white overflow-x-clip z-20 -mt-2 sm:-mt-6 lg:mt-0 rounded-t-[2rem] xs:rounded-t-[2.5rem] sm:rounded-t-[3.5rem] lg:rounded-t-none border-t border-white/[0.12] lg:border-t-0 scroll-mt-0"
      style={{ fontFamily: "'Onest', sans-serif" }}
    >
      {/* ==================================================================== */}
      {/* 1. SCROLLING TECH MARQUEE                                            */}
      {/* ==================================================================== */}
      <div className="relative w-full bg-[#0E0B1A]/95 backdrop-blur-md py-2.5 sm:py-3.5 overflow-hidden select-none flex-shrink-0">
        {/* Gradient edge masks for smooth fade in/out at screen sides */}
        <div className="absolute left-0 inset-y-0 w-8 xs:w-14 sm:w-24 md:w-28 bg-gradient-to-r from-[#0E0B1A] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 inset-y-0 w-8 xs:w-14 sm:w-24 md:w-28 bg-gradient-to-l from-[#0E0B1A] to-transparent z-10 pointer-events-none" />

        {/* Very light bottom line only (no dark line) */}
        <div className="absolute bottom-0 inset-x-0 h-[1px] bg-white/[0.08] pointer-events-none" />

        {/* Infinite Horizontal Running Marquee */}
        <div className="animate-marquee flex items-center whitespace-nowrap">
          {/* First set */}
          {TECH_STACK.map((tech, index) => (
            <div key={`tech-1-${index}`} className="flex items-center gap-3 sm:gap-4 md:gap-5 pr-3 sm:pr-4 md:pr-5">
              <span className="text-[#8D8A9D] hover:text-white transition-colors text-xs sm:text-[13.5px] md:text-[14px] font-normal tracking-wide cursor-default">
                {tech}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#BE3093] flex-shrink-0" />
            </div>
          ))}

          {/* Second duplicate set for seamless infinite loop */}
          {TECH_STACK.map((tech, index) => (
            <div key={`tech-2-${index}`} className="flex items-center gap-3 sm:gap-4 md:gap-5 pr-3 sm:pr-4 md:pr-5">
              <span className="text-[#8D8A9D] hover:text-white transition-colors text-xs sm:text-[13.5px] md:text-[14px] font-normal tracking-wide cursor-default">
                {tech}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#BE3093] flex-shrink-0" />
            </div>
          ))}

          {/* Third duplicate set for ultra-wide displays */}
          {TECH_STACK.map((tech, index) => (
            <div key={`tech-3-${index}`} className="flex items-center gap-3 sm:gap-4 md:gap-5 pr-3 sm:pr-4 md:pr-5">
              <span className="text-[#8D8A9D] hover:text-white transition-colors text-xs sm:text-[13.5px] md:text-[14px] font-normal tracking-wide cursor-default">
                {tech}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#BE3093] flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Subtle background tech grid */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Ambient background glows */}
      <div className="absolute top-1/4 -left-48 w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-[#BE3093]/10 blur-[100px] sm:blur-[130px] pointer-events-none" />
      <div className="absolute top-1/3 -right-48 w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-[#693092]/15 blur-[100px] sm:blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-80 sm:w-[500px] lg:w-[600px] h-48 sm:h-72 rounded-full bg-purple-600/10 blur-[100px] sm:blur-[150px] pointer-events-none" />

      {/* ==================================================================== */}
      {/* 2. MAIN ABOUT SECTION CONTENT                                        */}
      {/* ==================================================================== */}
      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="about-content-wrap relative w-full max-w-[2100px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-14 2xl:px-20 flex-1 flex items-center justify-center my-auto py-8 sm:py-10 lg:py-12"
      >
        <div className="about-grid-container grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-10 xl:gap-14 2xl:gap-16 items-center w-full">
          {/* Left Column: Heading + Narrative Content + Action Button */}
          <div className="lg:col-span-7 xl:col-span-7 2xl:col-span-7 flex flex-col items-start text-left w-full">
            {/* Top Badge: About us -> */}
            <div className="about-badge-wrap mb-3.5 sm:mb-4 lg:mb-5">
              <div className="about-badge-text inline-flex items-center gap-2 sm:gap-2.5 px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full bg-white/[0.08] border border-white/20 text-[11px] sm:text-xs md:text-[13px] text-white/90 font-medium shadow-sm select-none">
                <span>About us</span>
                <div className="w-3.5 sm:w-4 h-3.5 sm:h-4 rounded-full bg-white text-[#0B0716] flex items-center justify-center">
                  <ArrowRight className="w-2 sm:w-2.5 h-2 sm:h-2.5 stroke-[2.5]" />
                </div>
              </div>
            </div>

            {/* Display Heading: Matches teams section font style and scale */}
            <h2
              className="about-title text-4xl sm:text-5xl md:text-6xl lg:text-[4.75rem] font-light tracking-[-0.035em] leading-[1.04] text-white mb-4 sm:mb-5 lg:mb-6 xl:mb-7 w-full"
              style={{ fontFamily: "'Onest', sans-serif" }}
            >
              <span className="block text-white">Your Partner for</span>
              <span className="block text-[#FBAE42]">
                Digital Transformation
              </span>
            </h2>

            {/* Narrative Description */}
            <p
              className="about-desc text-gray-300 text-sm sm:text-base md:text-[16px] lg:text-[14.5px] xl:text-[15px] 2xl:text-[17px] leading-relaxed max-w-xl lg:max-w-xl xl:max-w-2xl 2xl:max-w-3xl mb-5 sm:mb-6 lg:mb-7 xl:mb-8 font-normal"
              style={{ fontFamily: "'Onest', sans-serif" }}
            >
              Netopsys is more than just a technology partner — we&apos;re the catalyst that
              transforms your business vision into digital reality. With over 15 years of
              combined expertise, we&apos;ve been Singapore&apos;s trusted choice for enterprises
              seeking to revolutionise their operations through cutting-edge AI, robust IT
              infrastructure, and innovative software development.
            </p>

            {/* Know More Button */}
            <div className="w-full xs:w-auto">
              <Link
                to="/about"
                className="about-btn hover-brand-gradient rounded-full bg-[#FBAE42] text-[#141010] text-xs sm:text-sm lg:text-[15px] xl:text-base font-semibold px-6 sm:px-8 xl:px-9 py-2.5 sm:py-3 lg:py-3.5 xl:py-4 shadow-[0_0_25px_rgba(251,174,66,0.25)] cursor-pointer inline-flex items-center justify-center text-center w-full xs:w-auto transition-all duration-200 active:scale-95"
                style={{ fontFamily: "'Onest', sans-serif" }}
              >
                Know More
              </Link>
            </div>
          </div>

          {/* Right Column: Stat Cards (1 col mobile, 2x2 grid tablet, 1 col stacked desktop) */}
          <div className="about-cards-wrap lg:col-span-5 xl:col-span-5 2xl:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-3.5 lg:gap-3.5 xl:gap-4.5 w-full">
            {STATS.map((stat, idx) => (
              <div
                key={idx}
                className="about-card bg-[#0D0A18]/90 hover:bg-[#140F24] border border-white/[0.09] hover:border-[#FBAE42]/40 rounded-xl sm:rounded-2xl lg:rounded-[1.25rem] p-4 sm:p-5 md:p-5.5 lg:p-4.5 xl:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-md transition-all duration-300 group flex flex-col justify-between h-auto min-w-0 break-words"
                style={{ fontFamily: "'Onest', sans-serif" }}
              >
                <div>
                  <div className="about-card-number text-3xl xs:text-4xl sm:text-4xl lg:text-[2.75rem] xl:text-[3.25rem] font-light text-[#FBAE42] group-hover:text-[#FDC975] transition-colors tracking-tight leading-none mb-1 sm:mb-1.5 flex items-baseline">
                    <CounterNumber value={stat.value} duration={1800} />
                    <span className="about-card-suffix font-light ml-0.5 text-2xl xs:text-3xl sm:text-3xl lg:text-3xl xl:text-4xl text-[#FBAE42] group-hover:text-[#FDC975]">
                      {stat.suffix}
                    </span>
                  </div>
                  <div className="about-card-label text-sm xs:text-base sm:text-base lg:text-base xl:text-lg font-semibold text-white tracking-tight">
                    {stat.label}
                  </div>
                </div>
                {stat.subtitle && (
                  <div className="about-card-sub text-[11px] xs:text-xs sm:text-xs lg:text-[13px] text-[#948FA8] mt-1 sm:mt-1.5 font-normal leading-relaxed">
                    {stat.subtitle}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
