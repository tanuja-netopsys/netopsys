import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Cloud,
  Code2,
  Database,
  Globe,
  Headset,
  Rocket,
  Shield,
  Smartphone,
} from "lucide-react";
import netopsysAiLogo from "../assets/netopsys-ai-logo.png";

interface LaunchingPageProps {
  /** Initial countdown duration in seconds (defaults to 120s -> 02 : 00) */
  initialSeconds?: number;
  /** Optional callback when Launch button is clicked */
  onLaunch?: () => void;
}

// In-memory SPA guard: once launched, browser Back navigation cannot reopen LaunchingPage
let hasLaunchedInTab = false;

export default function LaunchingPage({ initialSeconds = 120, onLaunch }: LaunchingPageProps) {
  const navigate = useNavigate();

  useEffect(() => {
    if (hasLaunchedInTab) {
      navigate("/", { replace: true });
    }
  }, [navigate]);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const mins = Number(params.get("minutes") || 0);
      const secs = Number(params.get("seconds") || 0);
      const fromQuery = Math.max(0, Math.floor(mins * 60 + secs));
      if (fromQuery > 0) return fromQuery;
    }
    return Math.max(0, Math.floor(initialSeconds));
  });

  // Smooth floating 3D crystal motion + interactive drag
  const cubeRigRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const targetRotRef = useRef({ x: 56, y: 0, z: 45 });
  const currentRotRef = useRef({ x: 56, y: 0, z: 45 });
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    document.title = "Netopsys AI | Launching Soon";
  }, []);

  useEffect(() => {
    if (remainingSeconds <= 0) return;
    const timer = window.setInterval(() => {
      setRemainingSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [remainingSeconds > 0]);

  useEffect(() => {
    let rafId = 0;
    let lastTime = performance.now();
    const startTime = lastTime;

    const animateCube = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      const elapsed = (now - startTime) / 1000;
      lastTime = now;

      const swayX = isDraggingRef.current ? 0 : Math.sin(elapsed * 1.1) * 1.8;
      const swayY = isDraggingRef.current ? 0 : Math.cos(elapsed * 0.9) * 2.2;
      const swayZ = isDraggingRef.current ? 0 : Math.sin(elapsed * 0.75) * 2.5;

      const lerpFactor = 1 - Math.exp(-6 * dt);
      currentRotRef.current.x += (targetRotRef.current.x + swayX - currentRotRef.current.x) * lerpFactor;
      currentRotRef.current.y += (targetRotRef.current.y + swayY - currentRotRef.current.y) * lerpFactor;
      currentRotRef.current.z += (targetRotRef.current.z + swayZ - currentRotRef.current.z) * lerpFactor;

      const floatY = Math.sin(elapsed * 1.5) * 6;

      if (cubeRigRef.current) {
        cubeRigRef.current.style.transform = `translateY(${floatY.toFixed(
          2
        )}px) rotateX(${currentRotRef.current.x.toFixed(2)}deg) rotateY(${currentRotRef.current.y.toFixed(
          2
        )}deg) rotateZ(${currentRotRef.current.z.toFixed(2)}deg)`;
      }

      rafId = requestAnimationFrame(animateCube);
    };

    rafId = requestAnimationFrame(animateCube);
    return () => cancelAnimationFrame(rafId);
  }, []);

  useEffect(() => {
    const handleMove = (clientX: number, clientY: number) => {
      if (!isDraggingRef.current) return;
      const dx = clientX - prevMouseRef.current.x;
      const dy = clientY - prevMouseRef.current.y;
      prevMouseRef.current = { x: clientX, y: clientY };
      targetRotRef.current.z += dx * 0.4;
      targetRotRef.current.x = Math.max(34, Math.min(74, targetRotRef.current.x - dy * 0.35));
    };

    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) handleMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onEnd = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      setIsDragging(false);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("mouseup", onEnd);
    window.addEventListener("touchend", onEnd);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("mouseup", onEnd);
      window.removeEventListener("touchend", onEnd);
    };
  }, []);

  const startDrag = (clientX: number, clientY: number) => {
    isDraggingRef.current = true;
    setIsDragging(true);
    prevMouseRef.current = { x: clientX, y: clientY };
  };

  const showMinutes = remainingSeconds >= 60;
  const canLaunch = remainingSeconds <= 2;
  const minutesDisplay = String(Math.floor(remainingSeconds / 60)).padStart(2, "0");
  const secondsDisplay = String(remainingSeconds % 60).padStart(2, "0");

  // Crystal clear glassmorphism AI cube proportions & seamless slice stack
  const cubeSize = 180;
  const coreSize = 112;

  const makeSliceRange = (start: number, end: number, step = 0.65): number[] => {
    const out: number[] = [];
    for (let z = start; z <= end + 1e-6; z += step) {
      out.push(Number(z.toFixed(2)));
    }
    return out;
  };
  const layer1WallZs = makeSliceRange(-32.2, -23.1, 0.65);
  const layer2WallZs = makeSliceRange(1.2, 17.5, 0.65);
  const layer3WallZs = makeSliceRange(18.8, 30.8, 0.65);

  const hollowRimMask = {
    WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
    WebkitMaskComposite: "xor" as const,
    maskComposite: "exclude" as const,
  };
  const basePlateRimGrad =
    "linear-gradient(250deg, rgba(251,191,36,0.38) 0%, rgba(255,255,255,0.6) 35%, rgba(236,72,153,0.44) 62%, rgba(124,58,237,0.5) 100%)";
  const trayWallRimGrad =
    "linear-gradient(250deg, rgba(251,191,36,0.56) 0%, rgba(255,255,255,0.62) 28%, rgba(244,114,182,0.55) 56%, rgba(124,58,237,0.62) 82%, rgba(255,255,255,0.72) 100%)";
  const coreWallGrad =
    "linear-gradient(250deg, #FDBA74 0%, #FB7185 30%, #EC4899 54%, #7C3AED 82%, #6366F1 100%)";
  const outerRingConic =
    "conic-gradient(from 0deg at 50% 50%, #EC4899 0deg, #C026D3 28deg, #7C3AED 62deg, #6366F1 84deg, #A855F7 108deg, #FB923C 138deg, #FBBF24 156deg, #FDE047 172deg, #F472B6 198deg, #D946EF 224deg, #EC4899 248deg, #FB923C 272deg, #FDA4AF 296deg, #EC4899 330deg, #EC4899 360deg)";
  const iconCls = "w-[25px] h-[25px] sm:w-[28px] sm:h-[28px]";
  const outerNodes = [
    {
      id: "software",
      label: "Custom Software Development",
      angleDeg: -90,
      icon: <Code2 className={iconCls} strokeWidth={2.05} />,
    },
    {
      id: "mobile",
      label: "Web & Mobile Applications",
      angleDeg: -45,
      icon: <Smartphone className={iconCls} strokeWidth={1.95} />,
    },
    {
      id: "websites",
      label: "Websites",
      angleDeg: 0,
      icon: <Globe className={iconCls} strokeWidth={1.9} />,
    },
    {
      id: "networking",
      label: "Networking",
      angleDeg: 45,
      icon: (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.95}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={iconCls}
        >
          <circle cx="11" cy="12" r="2.2" />
          <circle cx="6.2" cy="12.5" r="1.7" />
          <circle cx="11.5" cy="6.2" r="1.7" />
          <circle cx="17.8" cy="9.2" r="1.8" />
          <circle cx="17.2" cy="17.2" r="1.8" />
          <circle cx="8" cy="17.5" r="1.6" />
          <path d="M9 12.2l-1.2.1M11.2 9.9l.2-2M12.9 11l3.2-1.3M12.7 13.4l3.1 2.5M9.5 13.7l-.8 2.3" />
        </svg>
      ),
    },
    {
      id: "security",
      label: "Security",
      angleDeg: 90,
      icon: <Shield className={iconCls} strokeWidth={1.95} />,
    },
    {
      id: "cloud",
      label: "Cloud Solutions",
      angleDeg: 135,
      icon: <Cloud className={iconCls} strokeWidth={1.95} />,
    },
    {
      id: "backup",
      label: "Backup & Recovery",
      angleDeg: 180,
      icon: <Database className={iconCls} strokeWidth={1.95} />,
    },
    {
      id: "support",
      label: "IT Support",
      angleDeg: 225,
      icon: <Headset className={iconCls} strokeWidth={1.95} />,
    },
  ];

  return (
    <div
      className="relative min-h-[100dvh] w-full overflow-hidden flex flex-col justify-between select-none"
      style={{
        fontFamily: "'Onest', sans-serif",
        backgroundColor: "#FFFFFF",
        backgroundImage: [
          "radial-gradient(ellipse 44% 88% at 0% 48%, rgba(239, 223, 255, 0.72) 0%, rgba(248, 240, 255, 0.34) 55%, rgba(255, 255, 255, 0) 100%)",
          "radial-gradient(ellipse 46% 92% at 100% 42%, rgba(226, 209, 255, 0.78) 0%, rgba(242, 232, 255, 0.38) 56%, rgba(255, 255, 255, 0) 100%)",
          "radial-gradient(circle at 50% 48%, #FFFFFF 0%, #FFFFFF 52%, #FAF6FF 100%)",
        ].join(", "),
      }}
    >
      {/* Top-Left Corner Silky Peach-Pink & Lavender Translucent Waves */}
      <svg
        aria-hidden="true"
        viewBox="0 0 640 460"
        fill="none"
        className="pointer-events-none absolute top-0 left-0 w-[34vw] min-w-[230px] max-w-[480px] h-auto z-0"
      >
        <defs>
          <linearGradient id="launchTopWave1" x1="0%" y1="0%" x2="88%" y2="85%">
            <stop offset="0%" stopColor="#FCAE8E" stopOpacity="0.62" />
            <stop offset="48%" stopColor="#F49CC8" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#D7B5FF" stopOpacity="0.12" />
          </linearGradient>
          <linearGradient id="launchTopWave2" x1="5%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#FDBA8C" stopOpacity="0.52" />
            <stop offset="52%" stopColor="#E9A8EA" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#C4B5FD" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M-20 -20 H410 C325 75 230 148 110 185 C45 205 10 235 -20 270 Z"
          fill="url(#launchTopWave1)"
          stroke="rgba(255,255,255,0.55)"
          strokeWidth="1.5"
        />
        <path
          d="M-20 -20 H255 C235 95 165 205 60 275 C22 300 0 322 -20 345 Z"
          fill="url(#launchTopWave2)"
          stroke="rgba(255,255,255,0.45)"
          strokeWidth="1.2"
        />
      </svg>

      {/* Bottom-Right Corner Layered Lavender & Periwinkle Gloss Ribbons */}
      <svg
        aria-hidden="true"
        viewBox="0 0 760 480"
        fill="none"
        className="pointer-events-none absolute bottom-0 right-0 w-[44vw] min-w-[280px] max-w-[680px] h-auto z-0"
      >
        <defs>
          <linearGradient id="launchBottomWave1" x1="12%" y1="88%" x2="96%" y2="14%">
            <stop offset="0%" stopColor="#E9D8FF" stopOpacity="0.08" />
            <stop offset="45%" stopColor="#CEB0FC" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#B896F6" stopOpacity="0.52" />
          </linearGradient>
          <linearGradient id="launchBottomWave2" x1="18%" y1="100%" x2="100%" y2="22%">
            <stop offset="0%" stopColor="#EFE4FF" stopOpacity="0.1" />
            <stop offset="55%" stopColor="#C8A6FA" stopOpacity="0.48" />
            <stop offset="100%" stopColor="#A9C4FC" stopOpacity="0.42" />
          </linearGradient>
        </defs>
        <path
          d="M90 500 C215 390 340 315 475 288 C595 264 685 205 780 115 V500 Z"
          fill="url(#launchBottomWave1)"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth="1.5"
        />
        <path
          d="M250 500 C370 435 465 340 570 295 C655 258 725 225 780 185 V500 Z"
          fill="url(#launchBottomWave2)"
          stroke="rgba(255,255,255,0.45)"
          strokeWidth="1.2"
        />
      </svg>

      {/* Soft Ambient Radial Aura behind the Right Cube */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[8%] top-[18%] w-[360px] sm:w-[460px] h-[360px] sm:h-[460px] rounded-full blur-[90px] opacity-45 z-0"
        style={{
          background:
            "radial-gradient(circle, rgba(196,155,252,0.32) 0%, rgba(186,162,252,0.16) 52%, transparent 76%)",
        }}
      />

      {/* Top Left-Aligned Netopsys AI Brand Logo */}
      <header className="launching-header relative z-10 w-full max-w-[1260px] mx-auto flex justify-start pt-6 sm:pt-8 px-6 sm:px-10 md:px-14">
        <img
          src={netopsysAiLogo}
          alt="Netopsys AI"
          className="launching-logo object-contain select-none mix-blend-multiply"
          style={{ width: "clamp(185px, 17vw, 240px)", height: "auto" }}
          draggable={false}
        />
      </header>

      {/* Main Centered Split Hero Content */}
      <main className="launching-main relative z-10 flex-1 w-full max-w-[1260px] mx-auto px-6 sm:px-10 md:px-14 py-8 flex items-center">
        <div className="launching-grid w-full grid grid-cols-1 lg:grid-cols-12 items-center gap-12 lg:gap-8">
          {/* Left Column: Badge, Headline, Subtitle, Divider, Countdown */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="launching-left-col lg:col-span-7 flex flex-col items-start text-left"
          >
            {/* Launching Soon Pill Badge */}
            <div className="launching-badge inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FDF7FF] border border-[#C084FC]/50 shadow-[0_4px_16px_rgba(147,51,234,0.08)] mb-6 sm:mb-7">
              <span className="text-sm sm:text-base leading-none" role="img" aria-label="Rocket">
                🚀
              </span>
              <span className="text-xs sm:text-[13.5px] font-medium text-[#2A1546] tracking-tight">
                Launching Soon
              </span>
            </div>

            {/* Display Heading */}
            <h1 className="launching-title font-bold tracking-[-0.03em] leading-[1.06] text-[2.65rem] sm:text-[3.5rem] md:text-[4rem] xl:text-[4.35rem] text-[#0B0924] mb-5 sm:mb-6">
              <span className="block">Netopsys AI is</span>
              <span
                className="block mt-1 bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(90deg, #6D12F2 0%, #9A1CD8 30%, #E51C8E 60%, #F5554A 82%, #FA7921 100%)",
                }}
              >
                Coming Soon.
              </span>
            </h1>

            {/* Description Copy */}
            <p className="launching-desc text-[#2E2249] text-sm sm:text-base md:text-[18px] leading-[1.58] font-normal max-w-[530px] mb-8 sm:mb-10">
              AI-powered solutions to automate operations, boost productivity
              <br className="hidden sm:inline" /> and drive smarter business growth.
            </p>

            {/* Countdown Section */}
            <div className="launching-countdown-wrap w-full max-w-[390px] sm:max-w-[430px] flex flex-col items-center">
              {/* "OUR PLATFORM LAUNCHES IN" with side horizontal rules */}
              <div className="launching-divider w-full flex items-center gap-3.5 sm:gap-4 mb-5 sm:mb-6">
                <div className="flex-1 h-[1px] bg-[#B48CE2]/65" />
                <span className="text-[10.5px] sm:text-[11.5px] font-bold tracking-[0.22em] text-[#281448] whitespace-nowrap">
                  Our Platform Launches In
                </span>
                <div className="flex-1 h-[1px] bg-[#B48CE2]/65" />
              </div>

              {/* Minutes & Seconds Cards (Minutes box hides at <= 59s) */}
              <div className="flex items-center justify-center gap-4 sm:gap-5">
                <AnimatePresence mode="popLayout">
                  {showMinutes && (
                    <motion.div
                      key="minutes-group"
                      initial={{ opacity: 0, scale: 0.92 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85, width: 0, marginRight: -16 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="flex items-center gap-4 sm:gap-5"
                    >
                      {/* Minutes Box */}
                      <div className="launching-timer-box w-[132px] sm:w-[154px] py-4 sm:py-5 px-4 rounded-[20px] bg-white/95 border border-[#C7A1F5]/55 shadow-[0_14px_34px_rgba(124,58,237,0.12)] flex flex-col items-center justify-center backdrop-blur-sm">
                        <span className="launching-timer-num text-[2.25rem] sm:text-[2.75rem] font-extrabold leading-none text-[#240F46] tracking-tight tabular-nums">
                          {minutesDisplay}
                        </span>
                        <span className="launching-timer-label mt-2.5 text-[10px] sm:text-[11px] font-bold tracking-[0.22em] text-[#29154A] uppercase">
                          MINUTES
                        </span>
                      </div>

                      {/* Colon Separator */}
                      <span
                        aria-hidden="true"
                        className="text-2xl sm:text-3xl font-extrabold text-[#2A144D] pb-2 select-none"
                      >
                        :
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Seconds Box */}
                <motion.div
                  layout
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="launching-timer-box w-[132px] sm:w-[154px] py-4 sm:py-5 px-4 rounded-[20px] bg-white/95 border border-[#C7A1F5]/55 shadow-[0_14px_34px_rgba(124,58,237,0.12)] flex flex-col items-center justify-center backdrop-blur-sm"
                >
                  <span className="launching-timer-num text-[2.25rem] sm:text-[2.75rem] font-extrabold leading-none text-[#240F46] tracking-tight tabular-nums">
                    {secondsDisplay}
                  </span>
                  <span className="launching-timer-label mt-2.5 text-[10px] sm:text-[11px] font-bold tracking-[0.22em] text-[#29154A] uppercase">
                    SECONDS
                  </span>
                </motion.div>
              </div>

              {/* Launch Button appearing below timer once countdown enters final 59 seconds */}
              <AnimatePresence>
                {!showMinutes && (
                  <motion.div
                    key="launch-cta"
                    initial={{ opacity: 0, y: 12, scale: 0.94 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.94 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="launching-cta-wrap mt-6 sm:mt-7"
                  >
                    <button
                      type="button"
                      disabled={!canLaunch}
                      aria-disabled={!canLaunch}
                      onClick={() => {
                        if (!canLaunch) return;
                        hasLaunchedInTab = true;
                        try {
                          sessionStorage.setItem("netopsys_launch_confetti", "1");
                        } catch {}
                        if (onLaunch) {
                          onLaunch();
                        } else {
                          navigate("/", { state: { celebrateLaunch: true }, replace: true });
                        }
                      }}
                      className={`launching-cta-btn inline-flex items-center justify-center gap-2.5 px-9 sm:px-11 py-3.5 sm:py-4 rounded-full text-white font-semibold text-sm sm:text-[15px] tracking-wide border border-white/40 transition-all duration-200 ${
                        canLaunch
                          ? "shadow-[0_14px_34px_rgba(179,36,181,0.3)] hover:shadow-[0_18px_40px_rgba(116,40,232,0.38)] hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
                          : "opacity-65 shadow-[0_8px_20px_rgba(179,36,181,0.18)] cursor-not-allowed"
                      }`}
                      style={{
                        background:
                          "linear-gradient(90deg, #7428E8 0%, #B324B5 52%, #EA267A 100%)",
                      }}
                    >
                      <Rocket className="w-4 h-4 stroke-[2.2]" />
                      <span>Launch</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Right Column: 3D Frosted Glassmorphism AI Cube + Outer Iridescent Service Orbit */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
            className="launching-cube-col lg:col-span-5 flex flex-col items-center justify-center relative py-4 sm:py-6"
          >
            <div
              className={`launching-orbit-stage relative flex items-center justify-center w-[356px] sm:w-[420px] lg:w-[448px] aspect-square ${
                isDragging ? "cursor-grabbing" : "cursor-grab"
              }`}
              onMouseDown={(e) => startDrag(e.clientX, e.clientY)}
              onTouchStart={(e) => {
                if (e.touches.length > 0) {
                  startDrag(e.touches[0].clientX, e.touches[0].clientY);
                }
              }}
            >
              {/* Slow Autonomous Rotating Outer Part (Ring + 8 Services Only) */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-[15] launching-orbit-spin"
              >
                {/* Outer Iridescent Luminous 3D Glass-Tube Ring (matching reference image) */}
                <div className="pointer-events-none absolute inset-[8.5%] rounded-full z-0">
                  {/* Soft Pastel Chromatic Halo Behind Tube */}
                  <div
                    className="absolute inset-[-4px] rounded-full blur-[7px] opacity-75"
                    style={{
                      padding: "8px",
                      background: outerRingConic,
                      ...hollowRimMask,
                    }}
                  />
                  {/* Outer Chromatic Glass Tube Shell */}
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      padding: "4.5px",
                      background: outerRingConic,
                      ...hollowRimMask,
                    }}
                  />
                  {/* Crisp White Glowing Inner Glass Filament (creating the 3D double-edge tube look) */}
                  <div
                    className="absolute inset-[1.25px] rounded-full"
                    style={{
                      padding: "2px",
                      background:
                        "linear-gradient(145deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.82) 50%, rgba(255,255,255,0.95) 100%)",
                      ...hollowRimMask,
                    }}
                  />
                  {/* Subtle Outer Specular Glass Bevel Highlight */}
                  <div
                    className="absolute inset-[-0.5px] rounded-full"
                    style={{
                      padding: "1px",
                      background:
                        "linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.22) 50%, rgba(255,255,255,0.75) 100%)",
                      ...hollowRimMask,
                    }}
                  />
                </div>

                {/* 8 Frosted Pearl-Glass Service Icon Cards (counter-rotated to stay upright) */}
                {outerNodes.map((node) => {
                  const rad = (node.angleDeg * Math.PI) / 180;
                  const radiusPct = 41.5;
                  const leftPct = 50 + radiusPct * Math.cos(rad);
                  const topPct = 50 + radiusPct * Math.sin(rad);
                  return (
                    <div
                      key={node.id}
                      className="pointer-events-none absolute z-10"
                      style={{
                        left: `${leftPct}%`,
                        top: `${topPct}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      <div
                        aria-label={node.label}
                        className="launching-orbit-counter-spin flex items-center justify-center w-[54px] h-[54px] sm:w-[62px] sm:h-[62px] rounded-[16px] sm:rounded-[18px] backdrop-blur-md border-[1.5px] border-white"
                        style={{
                          background:
                            "linear-gradient(155deg, #FFFFFF 0%, #FAF7FF 58%, #F1EBFF 100%)",
                          boxShadow:
                            "0 12px 26px rgba(124, 58, 237, 0.14), 0 4px 10px rgba(168, 85, 247, 0.08), inset 0 2px 5px rgba(255,255,255,0.98)",
                          color: "#8D1BC8",
                        }}
                      >
                        {node.icon}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Soft Multi-Tone Floor Reflection under the Crystal AI Cube */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute bottom-14 sm:bottom-16 w-52 sm:w-64 h-12 sm:h-14 rounded-full blur-2xl z-0"
                style={{
                  background:
                    "radial-gradient(ellipse at 26% 52%, rgba(251, 146, 60, 0.34) 0%, rgba(236, 72, 153, 0.44) 45%, rgba(124, 58, 237, 0.42) 78%, transparent 100%)",
                }}
              />

              {/* Dedicated 3D Perspective Container */}
              <div
                className="relative z-10 flex items-center justify-center pointer-events-none"
                style={{ perspective: "1200px" }}
              >
                {/* 3D Stacked Crystal Clear Glassmorphism AI Cube (matching Image 1) */}
                <div
                  ref={cubeRigRef}
                  className="relative flex items-center justify-center pointer-events-none"
                  style={{
                    width: `${cubeSize}px`,
                    height: `${cubeSize}px`,
                    transformStyle: "preserve-3d",
                    WebkitTransformStyle: "preserve-3d",
                    transform: "rotateX(56deg) rotateZ(45deg)",
                    willChange: "transform",
                  }}
                >
                  {/* LAYER 1: Bottom Crystal Clear Acrylic Glass Plate */}
                  <div
                    className="absolute inset-0 rounded-[24px]"
                    style={{
                      transform: "translateZ(-33px)",
                      background:
                        "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.04) 55%, rgba(216,198,254,0.16) 100%)",
                      boxShadow: "0 20px 40px rgba(139, 92, 246, 0.2)",
                    }}
                  />
                  {/* Bottom Plate Seamless Hollow Perimeter Rim Walls */}
                  {layer1WallZs.map((z) => (
                    <div
                      key={`base-rim-${z}`}
                      className="absolute inset-0 rounded-[24px]"
                      style={{
                        transform: `translateZ(${z}px)`,
                        padding: "2px",
                        background: basePlateRimGrad,
                        ...hollowRimMask,
                      }}
                    />
                  ))}
                  {/* Bottom Plate Crisp Top Edge Highlight */}
                  <div
                    className="absolute inset-0 rounded-[24px]"
                    style={{
                      transform: "translateZ(-22.2px)",
                      background:
                        "linear-gradient(135deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.04) 50%, rgba(226,210,254,0.18) 100%)",
                      border: "1.5px solid rgba(255,255,255,0.9)",
                      boxShadow: "inset 0 1px 6px rgba(255,255,255,0.75)",
                    }}
                  />

                  {/* LAYER 1.5: Soft Iridescent Bounce Glow Floating Between Plates */}
                  <div
                    className="absolute rounded-[22px] blur-lg pointer-events-none"
                    style={{
                      width: `${cubeSize * 0.78}px`,
                      height: `${cubeSize * 0.78}px`,
                      transform: "translateZ(-11px)",
                      background:
                        "radial-gradient(circle at 68% 68%, rgba(251,146,60,0.42), rgba(236,72,153,0.4) 48%, rgba(124,58,237,0.34) 84%, transparent 100%)",
                    }}
                  />

                  {/* LAYER 2: Upper Crystal Clear Glass Collar Tray (see-through walls) */}
                  <div
                    className="absolute inset-0 rounded-[24px]"
                    style={{
                      transform: "translateZ(0.4px)",
                      background:
                        "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.03) 55%, rgba(226,210,254,0.14) 100%)",
                      border: "1.25px solid rgba(255,255,255,0.8)",
                      boxShadow: "0 12px 26px rgba(139,92,246,0.14)",
                    }}
                  />
                  {/* Tall Seamless Crystal Glass Perimeter Walls (hollow center, zero striping) */}
                  {layer2WallZs.map((z) => (
                    <div
                      key={`tray-wall-${z}`}
                      className="absolute inset-0 rounded-[24px]"
                      style={{
                        transform: `translateZ(${z}px)`,
                        padding: "2.2px",
                        background: trayWallRimGrad,
                        ...hollowRimMask,
                      }}
                    />
                  ))}
                  {/* Upper Glass Tray Top Specular Rim + Subtle Crystal Film */}
                  <div
                    className="absolute inset-0 rounded-[24px]"
                    style={{
                      transform: "translateZ(18.2px)",
                      background:
                        "linear-gradient(135deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.03) 52%, rgba(232,216,255,0.18) 100%)",
                      border: "1.75px solid rgba(255,255,255,0.95)",
                      boxShadow:
                        "inset 0 2px 8px rgba(255,255,255,0.88), inset -3px -3px 14px rgba(168,85,247,0.16)",
                    }}
                  />

                  {/* LAYER 3: Raised Glowing AI Core Block */}
                  {layer3WallZs.map((z) => (
                    <div
                      key={`core-wall-${z}`}
                      className="absolute rounded-[18px]"
                      style={{
                        width: `${coreSize}px`,
                        height: `${coreSize}px`,
                        transform: `translateZ(${z}px)`,
                        background: coreWallGrad,
                      }}
                    />
                  ))}
                  {/* AI Core Satin Pearl-White Top Cap */}
                  <div
                    className="absolute rounded-[18px] flex items-center justify-center"
                    style={{
                      width: `${coreSize}px`,
                      height: `${coreSize}px`,
                      transform: "translateZ(31.8px)",
                      background:
                        "linear-gradient(135deg, #FFFFFF 0%, #F8F4FF 54%, #E6DDFF 100%)",
                      border: "1.5px solid rgba(255,255,255,0.98)",
                      boxShadow:
                        "inset 0 2px 6px rgba(255,255,255,0.98), inset -4px -4px 14px rgba(124,58,237,0.2), 0 12px 24px rgba(124,58,237,0.24)",
                    }}
                  >
                    <span
                      className="font-black tracking-[-0.04em] leading-none bg-clip-text text-transparent select-none"
                      style={{
                        fontSize: "3.4rem",
                        backgroundImage:
                          "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 55%, #5B21B6 100%)",
                        filter: "drop-shadow(0 1px 0 rgba(255,255,255,0.85))",
                      }}
                    >
                      AI
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Bottom Balance Spacer matching clean full-viewport framing */}
      <div className="launching-spacer h-6 sm:h-8 pointer-events-none" />
    </div>
  );
}

