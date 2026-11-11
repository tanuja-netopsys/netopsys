import { useState, useRef, useEffect } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { SERVICES_DATA as SERVICES } from "../data/services-data.ts";

export default function Services() {
  const navigate = useNavigate();
  const cardsTrackRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [descentProgress, setDescentProgress] = useState(0);
  const [isServicesSeen, setIsServicesSeen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );
  const [windowHeight, setWindowHeight] = useState(
    typeof window !== "undefined" ? window.innerHeight : 900
  );
  const touchStartX = useRef<number | null>(null);

  // Track window resize for responsive 3D ring dimensions
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Compute scroll progress through Part 2 (cards track) and entrance from Image 1 to Image 2
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (cardsTrackRef.current) {
            const rect = cardsTrackRef.current.getBoundingClientRect();
            const winH = window.innerHeight;
            const totalScrollable = rect.height - winH;

            // 1. Entrance / Descent progress: Starts as soon as Services boundary appears (Image 2)
            // rect.top moves from winH down to 0 (Image 1)
            const enterDistance = winH;
            const currentEntered = enterDistance - rect.top;
            const dProgress = Math.max(0, Math.min(1, currentEntered / enterDistance));
            setDescentProgress(dProgress);

            // Is services section seen on screen?
            setIsServicesSeen(rect.top < winH);

            // 2. Track scroll progress for ring rotation once Services pins (rect.top <= 0)
            if (totalScrollable > 0) {
              const current = -rect.top;
              const progress = Math.max(0, Math.min(1, current / totalScrollable));
              setScrollProgress(progress);
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Exact 3D physics, ambient rotation & pointer drag tracking (identical to Hero section cube)
  const servicesCubeRigRef = useRef<HTMLDivElement>(null);
  const [isCubeDragging, setIsCubeDragging] = useState(false);
  const [isCubeHovered, setIsCubeHovered] = useState(false);

  // Isometric rotation angles:
  // rotX controls top-to-bottom roll
  // rotY controls horizontal corner yaw
  const cubeRotX = useRef(-26);
  const cubeRotY = useRef(-45);
  const targetCubeRotX = useRef(-26);
  const targetCubeRotY = useRef(-45);

  const isCubeDraggingRef = useRef(false);
  const cubeLastPos = useRef({ x: 0, y: 0, time: 0 });

  const scrollRollXRef = useRef(0);
  const scrollRollYRef = useRef(0);
  const scrollRollZRef = useRef(0);

  // Pointer movement: responsive, cushioned, fluid cursor/hand tracking
  const handleCubePointerMovement = (clientX: number, clientY: number, isDrag: boolean) => {
    const now = performance.now();
    const prevTime = cubeLastPos.current.time;

    if (!prevTime || now - prevTime > 250) {
      cubeLastPos.current = { x: clientX, y: clientY, time: now };
      return;
    }

    const rawDx = clientX - cubeLastPos.current.x;
    const rawDy = clientY - cubeLastPos.current.y;
    cubeLastPos.current = { x: clientX, y: clientY, time: now };

    const dist = Math.hypot(rawDx, rawDy);
    if (dist < 0.2) return;

    // Soft-clamp single frame deltas to prevent sudden jump glitches
    const dx = Math.max(-60, Math.min(60, rawDx));
    const dy = Math.max(-60, Math.min(60, rawDy));

    const sens = isDrag ? 0.30 : 0.22;

    targetCubeRotY.current += dx * sens;
    targetCubeRotX.current -= dy * sens;
  };

  // Continuous ambient physics rotation + inertia lerp + scroll-induced roll
  useEffect(() => {
    let lastTime = performance.now();
    let animId: number;

    const updatePhysics = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      // Ambient roll from TOP TO BOTTOM matching Hero section cube
      const ambientRoll = -0.58 * (dt * 60);
      const ambientYaw = 0.08 * (dt * 60);

      targetCubeRotX.current += ambientRoll;
      targetCubeRotY.current += ambientYaw;

      // Framerate-independent exponential lerp for silky-smooth, cushioned inertia
      const lerpFactor = 1 - Math.exp(-5.5 * dt);
      cubeRotX.current += (targetCubeRotX.current - cubeRotX.current) * lerpFactor;
      cubeRotY.current += (targetCubeRotY.current - cubeRotY.current) * lerpFactor;

      if (servicesCubeRigRef.current) {
        const totalX = (cubeRotX.current + scrollRollXRef.current).toFixed(2);
        const totalY = (cubeRotY.current + scrollRollYRef.current).toFixed(2);
        const totalZ = scrollRollZRef.current.toFixed(2);
        servicesCubeRigRef.current.style.transform = `rotateY(${totalY}deg) rotateX(${totalX}deg) rotateZ(${totalZ}deg)`;
      }

      animId = requestAnimationFrame(updatePhysics);
    };

    animId = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Global window mouse & touch handlers for unrestricted omnidirectional dragging
  useEffect(() => {
    const onWindowMouseMove = (e: globalThis.MouseEvent) => {
      if (!isCubeDraggingRef.current) return;
      handleCubePointerMovement(e.clientX, e.clientY, true);
    };

    const onWindowMouseUp = () => {
      if (isCubeDraggingRef.current) {
        isCubeDraggingRef.current = false;
        setIsCubeDragging(false);
        cubeLastPos.current.time = 0;
      }
    };

    const onWindowTouchMove = (e: TouchEvent) => {
      if (!isCubeDraggingRef.current || e.touches.length === 0) return;
      if (e.cancelable) e.preventDefault();
      const touch = e.touches[0];
      handleCubePointerMovement(touch.clientX, touch.clientY, true);
    };

    const onWindowTouchEnd = () => {
      if (isCubeDraggingRef.current) {
        isCubeDraggingRef.current = false;
        setIsCubeDragging(false);
        cubeLastPos.current.time = 0;
      }
    };

    window.addEventListener("mousemove", onWindowMouseMove);
    window.addEventListener("mouseup", onWindowMouseUp);
    window.addEventListener("touchmove", onWindowTouchMove, { passive: false });
    window.addEventListener("touchend", onWindowTouchEnd);

    return () => {
      window.removeEventListener("mousemove", onWindowMouseMove);
      window.removeEventListener("mouseup", onWindowMouseUp);
      window.removeEventListener("touchmove", onWindowTouchMove);
      window.removeEventListener("touchend", onWindowTouchEnd);
    };
  }, []);

  // Pointer Down (mouse or touch) to initiate drag
  const handleCubePointerDown = (clientX: number, clientY: number) => {
    isCubeDraggingRef.current = true;
    setIsCubeDragging(true);
    cubeLastPos.current = { x: clientX, y: clientY, time: performance.now() };
  };

  // Wheel scroll to rotate gently
  const handleCubeWheel = (e: React.WheelEvent) => {
    const dPitch = -e.deltaY * 0.1;
    const dYaw = -e.deltaX * 0.1;
    if (Math.abs(dPitch) < 0.1 && Math.abs(dYaw) < 0.1) return;
    targetCubeRotX.current += dPitch;
    targetCubeRotY.current += dYaw;
  };

  // Automatic blast state:
  // When cube reaches the middle (descentProgress >= 0.96 as Services reaches fullscreen/Image 2), auto-blast triggers
  const [hasBlasted, setHasBlasted] = useState(false);
  const [autoBlastProgress, setAutoBlastProgress] = useState(0);

  useEffect(() => {
    if (descentProgress >= 0.96 && !hasBlasted) {
      const id = requestAnimationFrame(() => setHasBlasted(true));
      return () => cancelAnimationFrame(id);
    } else if (descentProgress < 0.20 && hasBlasted) {
      // Reset if user scrolls back up into About / Hero
      const id = requestAnimationFrame(() => {
        setHasBlasted(false);
        setAutoBlastProgress(0);
      });
      return () => cancelAnimationFrame(id);
    }
  }, [descentProgress, hasBlasted]);

  // Animate autoBlastProgress smoothly from 0 to 1 when hasBlasted becomes true (Slow, smooth, clear cinematic transition)
  useEffect(() => {
    if (!hasBlasted) {
      return;
    }

    let startTime: number | null = null;
    const duration = 1600; // 1600ms slow, smooth, crystal-clear blast transition
    let animId: number;

    const animateBlast = (now: number) => {
      if (!startTime) startTime = now;
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      // Luxurious ease-out quint for a smooth, slow, clear blast transition
      const eased = 1 - Math.pow(1 - t, 4);
      setAutoBlastProgress(eased);

      if (t < 1) {
        animId = requestAnimationFrame(animateBlast);
      } else {
        setAutoBlastProgress(1);
      }
    };

    animId = requestAnimationFrame(animateBlast);
    return () => cancelAnimationFrame(animId);
  }, [hasBlasted]);

  // Effective blast progress: maximum of auto-blast animation and scroll advance
  const scrollBlast = Math.min(
    1,
    Math.max(0, scrollProgress / 0.12)
  );
  const blastProgress = Math.min(1, Math.max(autoBlastProgress, scrollBlast));

  // Compute face opacity and blur for slow, crystal-clear 3D blast:
  // Faces stay 100% solid & sharp for the first 50% of the blast, then gently dissolve
  const faceOpacity = blastProgress < 0.50 ? 1 : Math.max(0, 1 - (blastProgress - 0.50) / 0.50);
  const faceBlur = blastProgress > 0.65 ? Math.round((blastProgress - 0.65) * 8) : 0;

  // Step 3: Ring rotation phase (after ring has arrived/emerged):
  // When scrolling through the pinned services section, rotates smoothly through all 9 services
  const ringProgress = scrollProgress;
  const targetIndex = ringProgress * (SERVICES.length - 1);
  const activeIntIndex = Math.min(
    SERVICES.length - 1,
    Math.max(0, Math.round(targetIndex))
  );

  // Smooth scroll to a specific card index (0 to 8)
  const scrollToCard = (cardIdx: number) => {
    if (!cardsTrackRef.current) return;
    const rect = cardsTrackRef.current.getBoundingClientRect();
    const top = window.scrollY + rect.top;
    const totalScrollable = rect.height - window.innerHeight;
    const clampedIndex = Math.max(0, Math.min(SERVICES.length - 1, cardIdx));
    const targetProgress = clampedIndex / (SERVICES.length - 1);
    window.scrollTo({
      top: top + targetProgress * totalScrollable,
      behavior: "smooth",
    });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        scrollToCard(Math.min(SERVICES.length - 1, activeIntIndex + 1));
      } else {
        scrollToCard(Math.max(0, activeIntIndex - 1));
      }
    }
    touchStartX.current = null;
  };

  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 1024;
  const isLargeDesktop = windowWidth >= 1680 && windowHeight >= 820;
  const isMidDesktop = windowWidth >= 1360 && windowHeight >= 680 && !isLargeDesktop;
  const is100Screen = isLargeDesktop;
  const is125Screen = isMidDesktop;
  const is150Screen = !isMobile && !isTablet && !isLargeDesktop && !isMidDesktop;

  let radius: number;
  let cardWidth: number;
  let cardHeight: number;
  let perspective: number;
  let cubeSize: number;
  let startX: number;

  if (isMobile) {
    // Mobile (< 640px): balanced radius and card proportions to prevent overlapping and clipping
    radius = 420;
    const targetMobileH = Math.round(windowHeight * (windowHeight < 620 ? 0.40 : 0.45));
    cardHeight = Math.min(370, Math.max(230, targetMobileH));
    cardWidth = Math.min(310, Math.max(230, Math.round(windowWidth * 0.84)));
    perspective = 950;
    cubeSize = Math.min(180, Math.max(130, Math.round(cardHeight * 0.44)));
    startX = 100;
  } else if (isTablet) {
    radius = 480;
    const targetTabletH = Math.round(windowHeight * (windowHeight < 620 ? 0.40 : 0.46));
    cardHeight = Math.min(410, Math.max(235, targetTabletH));
    cardWidth = Math.round(cardHeight * 0.78);
    perspective = 1100;
    cubeSize = Math.round(cardHeight * 0.50);
    startX = 200;
  } else if (is100Screen) {
    // 100% Windows Scaling (1920x1080, tall screen)
    cardHeight = Math.min(540, Math.max(460, Math.round(windowHeight * 0.50)));
    cardWidth = Math.min(440, Math.max(350, Math.round(cardHeight * 0.78)));
    radius = Math.min(720, Math.max(580, Math.round(windowWidth * 0.38)));
    perspective = Math.min(1500, Math.max(1150, Math.round(radius * 2.1)));
    cubeSize = Math.min(280, Math.max(180, Math.round(cardHeight * 0.50)));
    startX = Math.min(380, Math.max(240, Math.round(windowWidth * 0.22)));
  } else if (is125Screen) {
    // 125% Windows Scaling (1536x864, height ~700-800px)
    cardHeight = Math.min(435, Math.max(385, Math.round(windowHeight * 0.51)));
    cardWidth = Math.min(355, Math.max(300, Math.round(cardHeight * 0.78)));
    radius = Math.min(620, Math.max(500, Math.round(windowWidth * 0.36)));
    perspective = Math.min(1350, Math.max(1050, Math.round(radius * 2.1)));
    cubeSize = Math.min(230, Math.max(160, Math.round(cardHeight * 0.48)));
    startX = Math.min(320, Math.max(210, Math.round(windowWidth * 0.20)));
  } else {
    // 150%, 175% and 200% Windows Scaling (1280x720 / 1097x617 / 960x540, height ~420-640px)
    const targetScaledH = Math.round(windowHeight * (windowHeight < 620 ? 0.54 : 0.58));
    cardHeight = Math.min(365, Math.max(300, targetScaledH));
    cardWidth = Math.min(290, Math.max(235, Math.round(cardHeight * 0.78)));
    radius = Math.min(580, Math.max(460, Math.round(windowWidth * 0.38)));
    perspective = Math.min(1300, Math.max(1000, Math.round(radius * 2.15)));
    cubeSize = Math.min(210, Math.max(140, Math.round(cardHeight * 0.48)));
    startX = Math.min(300, Math.max(170, Math.round(windowWidth * 0.19)));
  }

  const half = cubeSize / 2;

  // Top-right starting coordinates: positioned completely behind/underneath the About section top edge
  const startY = -Math.round(windowHeight * 0.50 + half + 20);

  // As user scrolls from Image 1 to Image 2, cube rolls itself from underneath About to exact middle (0, 0)
  const cubeX = Math.round(startX * (1 - descentProgress));
  const cubeY = Math.round(startY * (1 - descentProgress));

  // Update scroll roll deltas: combines with ambient rotation so it rolls dynamically on scroll
  useEffect(() => {
    scrollRollXRef.current = Math.round(-360 * (1 - descentProgress));
    scrollRollYRef.current = Math.round(-270 * (1 - descentProgress));
    scrollRollZRef.current = Math.round(20 * (1 - descentProgress));
  }, [descentProgress]);

  // Cube visibility: visible as soon as Services is seen (Image 1), 100% solid (no fading in bit by bit)
  const cubeVisible = isServicesSeen && blastProgress < 1;

  return (
    <section
      id="services"
      className="relative w-full bg-[#F5EEF8] text-[#141010] select-none z-20"
      style={{ fontFamily: "'Onest', sans-serif" }}
    >
      {/* =========================================================================
          PART 1 & PART 2: Pinned scroll track
          Phase 1: Cube descends down from top (below About) into middle of Services
          Phase 2: In the middle, cube automatically blasts in 3D and services ring emerges
          Phase 3: Scrolling down rotates through all 9 services in the Cover Ring
      ========================================================================= */}
      <div
        ref={cardsTrackRef}
        className="relative w-full"
        style={{ height: "450vh" }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Sticky Fullscreen Stage */}
        <div
          className={`services-stage-wrap sticky top-0 h-screen h-[100dvh] w-full overflow-hidden flex flex-col justify-between select-none ${
            is100Screen
              ? "pt-20 pb-5"
              : is125Screen
              ? "pt-16 pb-3.5"
              : windowHeight < 680
              ? "pt-[72px] sm:pt-[76px] pb-2"
              : "pt-[68px] pb-2.5"
          }`}
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

          {/* ---------------------------------------------------------------------
              PART 1: Text Header
              - Top button "Services ->"
              - Headline: "Everything your business" (black) / "needs to scale." (purple)
              - Subtitle directly underneath
          --------------------------------------------------------------------- */}
          <div className="relative w-full max-w-[2100px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-14 min-[1680px]:px-18 z-10 flex-shrink-0 pointer-events-none">
            {/* Top Eyebrow Button */}
            <div className={is100Screen ? "mb-2.5" : is125Screen ? "mb-1.5" : "mb-1"}>
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-0.5 sm:py-1 rounded-full bg-white border border-[#693092]/20 text-[#693092] text-xs min-[1680px]:text-[13px] font-semibold tracking-wide shadow-xs select-none cursor-default pointer-events-auto">
                <span>Services</span>
                <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#693092] text-white flex items-center justify-center">
                  <ArrowRight className="w-2 sm:w-2.5 h-2 sm:h-2.5 stroke-[2.5]" />
                </div>
              </div>
            </div>

            {/* Main Headline: Matches teams section style and scale */}
            <h2
              className="services-title font-light tracking-[-0.035em] text-[#141010] pointer-events-none mt-1 sm:mt-2"
            >
              <span className="block">Everything your business</span>
              <span className="block text-[#693092]">needs to scale.</span>
            </h2>

            {/* Subtitle directly underneath: Matches hero subtitle size */}
            <p
              className="services-desc text-[#554E62] leading-relaxed font-normal pointer-events-none mt-1"
              style={{
                display: (isMobile && windowHeight < 680) || windowHeight < 620 ? "none" : "block",
                fontSize: windowHeight < 740 ? "12.5px" : undefined,
              }}
            >
              From AI to infrastructure — we deliver end-to-end technology solutions that drive real results.
            </p>
          </div>

          {/* ---------------------------------------------------------------------
              PART 2: Stage (Cube Descent & Blast into 3D Cover Ring)
          --------------------------------------------------------------------- */}
          <div
            className="relative w-full flex-1 flex items-center justify-center overflow-visible my-auto z-30"
            style={{
              perspective: `${perspective}px`,
              perspectiveOrigin: "50% 50%",
            }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* 3D Cylindrical Ring Floor Orbit Indicator (blooms as cube blasts open) */}
            <div
              className="absolute pointer-events-none rounded-full transition-opacity duration-300"
              style={{
                width: `${radius * 2.15}px`,
                height: `${radius * 0.78}px`,
                border: "1.5px dashed rgba(105, 48, 146, 0.22)",
                boxShadow:
                  "0 0 50px rgba(190, 48, 147, 0.12), inset 0 0 40px rgba(105, 48, 146, 0.08)",
                transform: `translate3d(0, ${cardHeight * 0.44}px, -150px) rotateX(72deg)`,
                opacity: blastProgress,
              }}
            />

            {/* -----------------------------------------------------------------
                THE 3D CUBE (Rolling from Underneath About to Middle & Blasting)
                Supports hand/touch & mouse drag rotation (identical to Hero section cube)
            ----------------------------------------------------------------- */}
            {cubeVisible && (
              <div
                className={`absolute left-1/2 top-1/2 flex items-center justify-center z-50 select-none ${
                  isCubeDragging ? "cursor-grabbing" : "cursor-grab"
                } touch-none ${blastProgress < 1 ? "pointer-events-auto" : "pointer-events-none"}`}
                style={{
                  width: `${cubeSize + 60}px`,
                  height: `${cubeSize + 60}px`,
                  perspective: "1200px",
                  transformStyle: "preserve-3d",
                  transform: `translate3d(calc(-50% + ${cubeX}px), calc(-50% + ${cubeY}px), 0)`,
                  display: blastProgress >= 1 ? "none" : "flex",
                }}
                onMouseEnter={() => setIsCubeHovered(true)}
                onMouseLeave={() => setIsCubeHovered(false)}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleCubePointerDown(e.clientX, e.clientY);
                }}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  if (e.touches.length > 0) {
                    handleCubePointerDown(e.touches[0].clientX, e.touches[0].clientY);
                  }
                }}
                onWheel={handleCubeWheel}
              >
                {/* Amber / Golden Ambient Aura matching Hero section */}
                <div
                  className="absolute -inset-24 rounded-full pointer-events-none transition-opacity duration-300"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(251, 174, 66, 0.45) 0%, rgba(190, 48, 147, 0.25) 45%, transparent 70%)",
                    filter: "blur(40px)",
                    opacity: Math.max(0, 1 - blastProgress * 1.25),
                    transform: `scale(${1 + blastProgress * 0.9})`,
                  }}
                />

                {/* Central Energy Shockwave Flare during blast */}
                <div
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    width: `${cubeSize * 1.4}px`,
                    height: `${cubeSize * 1.4}px`,
                    background:
                      "radial-gradient(circle, rgba(255, 255, 255, 0.98) 0%, rgba(190, 48, 147, 0.9) 35%, rgba(105, 48, 146, 0.45) 65%, transparent 80%)",
                    transform: `scale(${0.2 + blastProgress * 3.5})`,
                    opacity: Math.sin(blastProgress * Math.PI) * 0.98,
                    filter: "blur(20px)",
                  }}
                />

                {/* Ground Ambient Drop Shadow matching Hero section cube */}
                <div
                  className="absolute -bottom-10 sm:-bottom-14 lg:-bottom-16 w-60 sm:w-80 lg:w-96 h-12 sm:h-16 rounded-full blur-xl pointer-events-none transition-transform duration-500"
                  style={{
                    background:
                      "radial-gradient(ellipse at center, rgba(0, 0, 0, 0.45) 0%, rgba(0, 0, 0, 0.2) 40%, transparent 75%)",
                    transform: isCubeHovered ? "scale(1.15)" : "scale(1)",
                    opacity: Math.max(0, (1 - blastProgress * 1.5) * 0.9),
                  }}
                />

                {/* The 3D Cube Rig with 6 Solid Faces (Exact Hero Section Look & Textures) */}
                <div
                  ref={servicesCubeRigRef}
                  className="relative pointer-events-auto cursor-grab active:cursor-grabbing"
                  style={{
                    width: `${cubeSize}px`,
                    height: `${cubeSize}px`,
                    transformStyle: "preserve-3d",
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    handleCubePointerDown(e.clientX, e.clientY);
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation();
                    if (e.touches.length > 0) {
                      handleCubePointerDown(e.touches[0].clientX, e.touches[0].clientY);
                    }
                  }}
                >
                  {/* FACE 1: FRONT - Corporate Skyscrapers */}
                  <div
                    className="absolute inset-0 overflow-hidden bg-slate-900 backface-hidden pointer-events-auto cursor-grab active:cursor-grabbing"
                    style={{
                      width: `${cubeSize}px`,
                      height: `${cubeSize}px`,
                      transform: `translate3d(-${blastProgress * 360}px, -${blastProgress * 200}px, ${half + blastProgress * 300}px) rotateY(-${blastProgress * 50}deg) rotateZ(-${blastProgress * 25}deg) scale(${1 - blastProgress * 0.18})`,
                      opacity: faceOpacity,
                      filter: faceBlur > 0 ? `blur(${faceBlur}px)` : "none",
                      boxShadow: "inset 0 0 1px rgba(255,255,255,0.15)",
                    }}
                  >
                    <img
                      src="/cube/cube-buildings.jpg"
                      alt="Corporate Tech Skyscrapers - Netopsys"
                      className="w-full h-full object-cover select-none pointer-events-none block"
                      draggable={false}
                    />
                    <div className="absolute inset-0 bg-black/[0.08] pointer-events-none" />
                  </div>

                  {/* FACE 2: BACK - Cloud Infrastructure & Data Servers */}
                  <div
                    className="absolute inset-0 overflow-hidden bg-slate-900 backface-hidden pointer-events-auto cursor-grab active:cursor-grabbing"
                    style={{
                      width: `${cubeSize}px`,
                      height: `${cubeSize}px`,
                      transform: `rotateX(180deg) translate3d(0, 0, ${half + blastProgress * 400}px) rotateZ(${blastProgress * 70}deg) scale(${1 - blastProgress * 0.18})`,
                      opacity: faceOpacity,
                      filter: faceBlur > 0 ? `blur(${faceBlur}px)` : "none",
                      boxShadow: "inset 0 0 1px rgba(255,255,255,0.15)",
                    }}
                  >
                    <img
                      src="/cube/cube-cloud.jpg"
                      alt="Cloud Infrastructure & Servers - Netopsys"
                      className="w-full h-full object-cover select-none pointer-events-none block"
                      draggable={false}
                    />
                    <div className="absolute inset-0 bg-black/[0.18] pointer-events-none" />
                  </div>

                  {/* FACE 3: RIGHT - Modern Tech Workspace / Office */}
                  <div
                    className="absolute inset-0 overflow-hidden bg-slate-900 backface-hidden pointer-events-auto cursor-grab active:cursor-grabbing"
                    style={{
                      width: `${cubeSize}px`,
                      height: `${cubeSize}px`,
                      transform: `rotateY(90deg) translate3d(${blastProgress * 350}px, -${blastProgress * 180}px, ${half + blastProgress * 320}px) rotateX(${blastProgress * 45}deg) scale(${1 - blastProgress * 0.18})`,
                      opacity: faceOpacity,
                      filter: faceBlur > 0 ? `blur(${faceBlur}px)` : "none",
                      boxShadow: "inset 0 0 1px rgba(255,255,255,0.15)",
                    }}
                  >
                    <img
                      src="/cube/cube-office.jpg"
                      alt="Modern Tech Workspace - Netopsys"
                      className="w-full h-full object-cover select-none pointer-events-none block"
                      draggable={false}
                    />
                    <div className="absolute inset-0 bg-black/[0.12] pointer-events-none" />
                  </div>

                  {/* FACE 4: LEFT - AI & Machine Learning Neural Tech */}
                  <div
                    className="absolute inset-0 overflow-hidden bg-slate-900 backface-hidden pointer-events-auto cursor-grab active:cursor-grabbing"
                    style={{
                      width: `${cubeSize}px`,
                      height: `${cubeSize}px`,
                      transform: `rotateY(-90deg) translate3d(-${blastProgress * 350}px, ${blastProgress * 190}px, ${half + blastProgress * 300}px) rotateZ(${blastProgress * 45}deg) scale(${1 - blastProgress * 0.18})`,
                      opacity: faceOpacity,
                      filter: faceBlur > 0 ? `blur(${faceBlur}px)` : "none",
                      boxShadow: "inset 0 0 1px rgba(255,255,255,0.15)",
                    }}
                  >
                    <img
                      src="/cube/cube-ai.jpg"
                      alt="AI & Machine Learning - Netopsys AI"
                      className="w-full h-full object-cover select-none pointer-events-none block"
                      draggable={false}
                    />
                    <div className="absolute inset-0 bg-black/[0.1] pointer-events-none" />
                  </div>

                  {/* FACE 5: TOP - Microchip & Hardware Circuit Board */}
                  <div
                    className="absolute inset-0 overflow-hidden bg-slate-900 backface-hidden pointer-events-auto cursor-grab active:cursor-grabbing"
                    style={{
                      width: `${cubeSize}px`,
                      height: `${cubeSize}px`,
                      transform: `rotateX(90deg) translate3d(0, -${blastProgress * 360}px, ${half + blastProgress * 260}px) rotateX(${blastProgress * 60}deg) scale(${1 - blastProgress * 0.18})`,
                      opacity: faceOpacity,
                      filter: faceBlur > 0 ? `blur(${faceBlur}px)` : "none",
                      boxShadow: "inset 0 0 1px rgba(255,255,255,0.2)",
                    }}
                  >
                    <img
                      src="/cube/cube-chip.jpg"
                      alt="Microchip & Hardware Circuit Board"
                      className="w-full h-full object-cover select-none pointer-events-none block"
                      draggable={false}
                    />
                    <div className="absolute inset-0 bg-white/[0.05] pointer-events-none" />
                  </div>

                  {/* FACE 6: BOTTOM - Software Engineering Team */}
                  <div
                    className="absolute inset-0 overflow-hidden bg-slate-900 backface-hidden pointer-events-auto cursor-grab active:cursor-grabbing"
                    style={{
                      width: `${cubeSize}px`,
                      height: `${cubeSize}px`,
                      transform: `rotateX(-90deg) translate3d(0, ${blastProgress * 360}px, ${half + blastProgress * 240}px) rotateY(${blastProgress * 40}deg) scale(${1 - blastProgress * 0.18})`,
                      opacity: faceOpacity,
                      filter: faceBlur > 0 ? `blur(${faceBlur}px)` : "none",
                      boxShadow: "inset 0 0 1px rgba(255,255,255,0.15)",
                    }}
                  >
                    <img
                      src="/cube/cube-team.jpg"
                      alt="Software Engineering Team - Netopsys"
                      className="w-full h-full object-cover select-none pointer-events-none block"
                      draggable={false}
                    />
                    <div className="absolute inset-0 bg-black/[0.35] pointer-events-none" />
                  </div>
                </div>
              </div>
            )}

            {/* -----------------------------------------------------------------
                THE 9 SERVICES (Emerging from Blast into 3D Cover Ring)
            ----------------------------------------------------------------- */}
            <div
              className="relative w-0 h-0 flex items-center justify-center"
              style={{
                transformStyle: "preserve-3d",
              }}
            >
              {SERVICES.map((service, index) => {
                // Angle relative to front camera (degrees):
                // 360 / 9 = 40 deg per card slot around cylinder
                const rawAngle = (index - targetIndex) * 40;
                // Normalize to [-180, 180] for continuous 3D ring wrap
                const relAngle = ((rawAngle % 360) + 540) % 360 - 180;
                const rad = (relAngle * Math.PI) / 180;
                const cosVal = Math.cos(rad);
                const sinVal = Math.sin(rad);

                const isCenter = Math.abs(relAngle) < 18;

                // Final cylindrical coordinates in 3D cover ring:
                const targetX = Math.round(sinVal * radius);
                const targetZ = isMobile
                  ? Math.round((cosVal - 1) * radius - (isCenter ? 0 : 70))
                  : Math.round((cosVal - 1) * radius);
                // tiltFactor keeps cards slightly flatter toward the viewer so text is clear
                const targetRotateY = relAngle * (isMobile ? 0.78 : 0.72);

                // Emergence from the cube blast (blossoms smoothly as cube opens):
                const cardEmerge = blastProgress < 0.15 ? 0 : Math.min(1, Math.pow((blastProgress - 0.15) / 0.85, 1.25));
                const emerge = cardEmerge;
                const x = Math.round(targetX * emerge);
                const z = Math.round(targetZ * emerge - (1 - emerge) * 300);
                const rotateY = targetRotateY * emerge;

                // Scale calculation:
                // Desktop: all cards emerge to scale 1.0.
                // Mobile: active card is scale 1.0, while side preview cards scale down gracefully (~0.80) to avoid crowding.
                const mobileScaleFactor = isCenter ? 1 : Math.max(0.70, 0.80 * Math.pow(Math.max(0, cosVal), 1.2));
                const scale = Math.max(0.01, (0.35 + emerge * 0.65) * (isMobile ? mobileScaleFactor : 1));

                // Hemisphere & depth calculation:
                const isFront = cosVal >= 0; // Front hemisphere (-90 to +90 deg)
                const isClickable =
                  isFront && Math.abs(relAngle) <= 75 && blastProgress > 0.90;

                // Explicit z-index ensures front cards always layer flawlessly above back cards
                const zIndex = isCenter
                  ? 100
                  : isFront
                  ? Math.round(50 + cosVal * 40)
                  : Math.round(10 + (cosVal + 1) * 20);

                // Opacity: front cards 0.85-1.0; back ring cards visible at 0.25-0.45 for depth.
                // Mobile: active center card is 1.0; side cards are dimmed (0.15 - 0.32) so the active card stands out with 100% clarity and zero clutter.
                const finalOpacity = isMobile
                  ? (isCenter ? 1 : Math.max(0.12, 0.30 * Math.pow(Math.max(0, cosVal), 1.5)))
                  : (isFront ? Math.max(0.85, 0.85 + 0.15 * cosVal) : Math.max(0.2, 0.2 + 0.22 * (cosVal + 1)));
                const opacity = emerge * finalOpacity;

                // Brightness shading: front cards are crisp, vibrant, and readable
                const brightness = isMobile
                  ? (isCenter ? 1 : 0.45 + 0.35 * Math.max(0, cosVal))
                  : (isFront ? 0.94 + 0.06 * cosVal : 0.38 + 0.25 * (cosVal + 1));

                if (opacity <= 0.01) return null;

                return (
                  <div
                    key={service.id}
                    className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 select-none cursor-pointer"
                    style={{
                      transform: `translate3d(${x}px, 0px, ${z}px) rotateY(${rotateY}deg) scale(${scale})`,
                      transformStyle: "preserve-3d",
                      zIndex,
                      opacity,
                      filter: `brightness(${brightness})`,
                      pointerEvents: isClickable ? "auto" : "none",
                      willChange: "transform, opacity",
                      backfaceVisibility: "visible",
                    }}
                    onClick={() => {
                      if (isClickable) {
                        if (!isCenter) {
                          scrollToCard(index);
                        } else {
                          navigate(`/services/${service.slug}`);
                        }
                      }
                    }}
                  >
                    {/* Card Container - Auto accommodating content without clipping */}
                    <div
                      className={`flex flex-col justify-between text-white relative overflow-hidden group select-none transition-all duration-300 min-w-0 break-words ${
                        is100Screen
                          ? "rounded-[30px] p-5.5 sm:p-6"
                          : is125Screen
                          ? "rounded-[24px] p-4"
                          : isMobile
                          ? "rounded-[20px] p-3.5"
                          : is150Screen
                          ? "rounded-[24px] p-3.5 sm:p-4 pb-3"
                          : "rounded-[24px] p-4 sm:p-4.5 pb-3.5"
                      }`}
                      style={{
                        width: `${cardWidth}px`,
                        height: `${cardHeight}px`,
                        background:
                          "linear-gradient(180deg, #120727 0%, #0D051D 50%, #080312 100%)",
                        border: isCenter
                          ? "1.5px solid rgba(190, 48, 147, 0.75)"
                          : "1px solid rgba(190, 48, 147, 0.3)",
                        boxShadow: isCenter
                          ? "0 30px 65px -15px rgba(105, 48, 146, 0.5), 0 0 40px rgba(190, 48, 147, 0.28)"
                          : "0 15px 35px -10px rgba(0, 0, 0, 0.5)",
                      }}
                    >
                      {/* Ambient Neon Purple Backlight Glow */}
                      <div
                        className={`absolute -right-8 -top-8 w-52 h-52 rounded-full bg-[#BE3093]/20 blur-[60px] pointer-events-none transition-colors duration-500 ${
                          isCenter ? "group-hover:bg-[#BE3093]/45" : ""
                        }`}
                      />
                      <div className="absolute -left-8 -bottom-8 w-52 h-52 rounded-full bg-[#693092]/25 blur-[60px] pointer-events-none" />

                      {/* Top Content: Responsive Tech Illustration */}
                      <div
                        className={`relative w-full rounded-xl min-[1680px]:rounded-2xl overflow-hidden bg-[#180A33] flex-shrink-0 border border-white/10 shadow-inner ${
                          is100Screen ? "mb-3" : is125Screen ? "mb-2" : "mb-1.5"
                        }`}
                        style={{
                          height: is100Screen
                            ? "175px"
                            : is125Screen
                            ? "118px"
                            : isTablet
                            ? "120px"
                            : isMobile
                            ? "100px"
                            : windowHeight < 620
                            ? "95px"
                            : is150Screen
                            ? "100px"
                            : "110px",
                        }}
                      >
                        <img
                          src={service.image}
                          alt={service.title}
                          className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0D051D]/80 via-transparent to-transparent pointer-events-none" />
                      </div>

                      {/* Information Block - Clear, bold, non-clipped typography */}
                      <div className="flex-1 min-h-0 flex flex-col justify-between">
                        <div>
                          {/* Number Indicator & Active Badge */}
                          <div className={`flex items-center justify-between ${is100Screen ? "mb-1.5" : "mb-1"}`}>
                            <span
                              className="font-mono font-bold text-white/60 tracking-wider block"
                              style={{
                                fontSize: is100Screen ? "13px" : is125Screen ? "12px" : "11px",
                              }}
                            >
                              {service.id}
                            </span>
                            {isCenter && (
                              <span
                                className="uppercase font-mono font-bold tracking-wider text-[#FBAE42] bg-[#FBAE42]/20 rounded-full border border-[#FBAE42]/40 shadow-xs"
                                style={{
                                  fontSize: is100Screen ? "10.5px" : "9.5px",
                                  padding: is100Screen ? "2px 10px" : "1px 8px",
                                }}
                              >
                                Active
                              </span>
                            )}
                          </div>

                          {/* Service Title - Larger & bold */}
                          <h3
                            className="font-bold text-white tracking-tight leading-snug group-hover:text-[#FBAE42] transition-colors duration-200 line-clamp-2"
                            style={{
                              fontSize: is100Screen
                                ? "22px"
                                : is125Screen
                                ? "17.5px"
                                : isMobile
                                ? "15.5px"
                                : "16.5px",
                              marginBottom: is100Screen ? "6px" : is125Screen ? "4px" : is150Screen ? "2px" : "2.5px",
                            }}
                          >
                            {service.title}
                          </h3>

                          {/* Description - High contrast white/95 with relaxed line-height */}
                          <p
                            className={`text-white/95 leading-relaxed font-normal line-clamp-2 ${is100Screen ? "mb-3" : is150Screen ? "mb-1" : "mb-1.5"}`}
                            style={{
                              fontSize: is100Screen
                                ? "14px"
                                : is125Screen
                                ? "12px"
                                : isMobile
                                ? "11.5px"
                                : "12px",
                            }}
                          >
                            {service.description}
                          </p>
                        </div>

                        {/* Tag Pills - Flexible wrapping pills with clear text */}
                        <div className={`flex flex-wrap ${is100Screen ? "gap-2 mb-3" : is125Screen ? "gap-1 mb-1.5" : is150Screen ? "gap-1 mb-1" : "gap-1 mb-1.5"}`}>
                          {(is125Screen || is150Screen || isMobile ? service.tags.slice(0, 2) : service.tags).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full border border-white/20 bg-white/10 hover:bg-white/15 text-white font-medium tracking-wide transition-colors truncate backdrop-blur-sm"
                              style={{
                                fontSize: is100Screen ? "12px" : is125Screen ? "10.5px" : "10px",
                                padding: is100Screen ? "4px 12px" : is125Screen ? "2px 8px" : is150Screen ? "1.5px 7.5px" : "2px 8.5px",
                                maxWidth: is150Screen ? "130px" : is125Screen ? "145px" : undefined,
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                          {(is125Screen || is150Screen || isMobile) && service.tags.length > 2 && (
                            <span
                              className="rounded-full border border-white/15 bg-white/5 text-white/70 font-mono tracking-wide"
                              style={{ fontSize: "10px", padding: "2px 6px" }}
                            >
                              +{service.tags.length - 2}
                            </span>
                          )}
                        </div>

                        {/* Bottom Explore Link */}
                        <div className={`border-t border-white/15 flex items-center justify-between ${is100Screen ? "pt-2.5" : is125Screen ? "pt-2" : is150Screen ? "pt-1.5 pb-0.5" : "pt-2 pb-0.5"}`}>
                          <Link
                            to={`/services/${service.slug}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 font-semibold text-white hover:text-[#FBAE42] transition-colors group/exp cursor-pointer"
                            style={{
                              fontSize: is100Screen ? "14px" : is125Screen ? "13px" : "12px",
                            }}
                          >
                            <span className="underline underline-offset-4 font-semibold">Explore</span>
                            <ArrowUpRight className={is100Screen ? "w-3.5 h-3.5" : "w-3 h-3"} />
                          </Link>
                          <span
                            className="font-mono text-white/50"
                            style={{
                              fontSize: is100Screen ? "12px" : "11px",
                            }}
                          >
                            {service.id} / 09
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ---------------------------------------------------------------------
              PART 2 BOTTOM: Ring Progress Indicator & Controls
              Smoothly fades in as the diamond breaks down
          --------------------------------------------------------------------- */}
          <div
            className="relative z-20 flex items-center justify-center w-full max-w-[2100px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-14 2xl:px-18 mt-auto pt-1 pb-2 sm:pb-0 2xl:pt-2 transition-opacity duration-300"
            style={{
              opacity: blastProgress > 0.35 ? Math.min(1, (blastProgress - 0.35) / 0.65) : 0,
              pointerEvents: blastProgress >= 0.85 ? "auto" : "none",
            }}
          >
            {/* Center: 9 Dot/Pill Indicators */}
            <div className="flex items-center gap-1 sm:gap-2 mx-auto">
              {SERVICES.map((s, idx) => {
                const isActive = activeIntIndex === idx;
                return (
                  <button
                    key={s.id}
                    onClick={() => scrollToCard(idx)}
                    className={`transition-all duration-300 rounded-full cursor-pointer ${
                      isActive
                        ? "w-6 sm:w-10 h-1.5 sm:h-2 bg-[#693092] shadow-xs"
                        : "w-1.5 sm:w-2 h-1.5 sm:h-2 bg-[#693092]/25 hover:bg-[#693092]/50"
                    }`}
                    aria-label={`Jump to ${s.title}`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          PART 3: Bottom CTA Card (Untouched as requested)
          Visible immediately after completing all cards in Part 2,
          followed by scrolling into the next section.
      ========================================================================= */}
      <div className="relative w-full max-w-[2100px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-14 2xl:px-18 py-14 sm:py-20 lg:py-24 z-20">
        <div className="w-full bg-[#2A1450] rounded-2xl sm:rounded-3xl px-6 sm:px-10 lg:px-14 py-10 sm:py-14 lg:py-16 shadow-xl shadow-[#2A1450]/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 cta-banner-card">
          {/* Left Texts: Heading and subtitle */}
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-2.5 sm:gap-4 md:gap-6">
            <h3 className="text-2xl sm:text-3xl md:text-[2rem] font-normal text-white tracking-tight whitespace-nowrap cta-banner-title">
              Ready to get started?
            </h3>
            <span className="text-white/85 text-xs sm:text-sm md:text-[15px] font-normal cta-banner-subtitle">
              Let&apos;s build something great together
            </span>
          </div>

          {/* Right Button */}
          <div className="flex-shrink-0">
            <a
              href="#contact"
              className="cta-banner-btn hover-brand-gradient inline-flex items-center justify-center bg-[#FBAE42] text-black hover:text-white font-medium text-xs sm:text-sm md:text-[15px] px-7 sm:px-8 py-3 sm:py-3.5 rounded-full shadow-md whitespace-nowrap cursor-pointer transition-colors"
            >
              Let's Connect
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export { Services };
