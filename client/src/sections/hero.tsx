import { useState, useRef, useEffect, memo, type MouseEvent } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion";
import {
  Sparkles,
  Maximize2,
  X,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";
import posterImg from "../assets/hero-tech-poster.jpg";
import { OptimizedPicture } from "../utils/optimized-image.tsx";

const HERO_TITLES: [string, string][] = [
  ["Digital", "Transformation."],
  ["Cloud &", "Automation."],
  ["Intelligent AI", "Solutions."],
  ["Enterprise IT", "Infrastructure."],
  ["Real Results", "at Scale."],
];

// ============================================================================
// 1. HERO GEOMETRIC SOUNDWAVE COMPONENT
// ============================================================================
export function HeroGeometricSoundwave({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ perspective: "1000px" }}
    >
      <svg
        viewBox="0 0 415 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto max-h-[78vh] drop-shadow-sm transition-transform duration-300 ease-out hover:scale-[1.02]"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Col 1: Hourglass | Black (#0B0716) */}
        <g className="transition-transform duration-300 hover:scale-y-[1.03] origin-center">
          <polygon points="6.5,84.5 45.5,84.5 26.0,200.0" fill="#0B0716" />
          <polygon points="26.0,200.0 45.5,315.5 6.5,315.5" fill="#0B0716" />
        </g>

        {/* Col 2: Diamond | Magenta (#BE3093) */}
        <g className="transition-transform duration-300 hover:scale-y-[1.03] origin-center">
          <polygon
            points="71.0,52.0 90.5,200.0 71.0,348.0 51.5,200.0"
            fill="#BE3093"
          />
        </g>

        {/* Col 3: Hourglass | Purple (#693092) */}
        <g className="transition-transform duration-300 hover:scale-y-[1.03] origin-center">
          <polygon points="96.5,22.0 135.5,22.0 116.0,200.0" fill="#693092" />
          <polygon points="116.0,200.0 135.5,378.0 96.5,378.0" fill="#693092" />
        </g>

        {/* Col 4: Diamond | Tall Sharp Center Black (#0B0716) */}
        <g className="transition-transform duration-300 hover:scale-y-[1.03] origin-center">
          <polygon
            points="161.0,12.0 180.5,200.0 161.0,388.0 141.5,200.0"
            fill="#0B0716"
          />
        </g>

        {/* Col 5: Hourglass | Magenta (#BE3093) */}
        <g className="transition-transform duration-300 hover:scale-y-[1.03] origin-center">
          <polygon points="186.5,24.0 225.5,24.0 206.0,200.0" fill="#BE3093" />
          <polygon points="206.0,200.0 225.5,376.0 186.5,376.0" fill="#BE3093" />
        </g>

        {/* Col 6: Diamond | Purple (#693092) */}
        <g className="transition-transform duration-300 hover:scale-y-[1.03] origin-center">
          <polygon
            points="251.0,55.0 270.5,200.0 251.0,345.0 231.5,200.0"
            fill="#693092"
          />
        </g>

        {/* Col 7: Hourglass | Black (#0B0716) */}
        <g className="transition-transform duration-300 hover:scale-y-[1.03] origin-center">
          <polygon points="275.5,87.5 314.5,87.5 295.0,200.0" fill="#0B0716" />
          <polygon points="295.0,200.0 314.5,312.5 275.5,312.5" fill="#0B0716" />
        </g>

        {/* Col 8: Diamond | Magenta (#BE3093) */}
        <g className="transition-transform duration-300 hover:scale-y-[1.03] origin-center">
          <polygon
            points="340.0,109.0 359.5,200.0 340.0,291.0 320.5,200.0"
            fill="#BE3093"
          />
        </g>

        {/* Col 9: Hourglass | Purple (#693092) */}
        <g className="transition-transform duration-300 hover:scale-y-[1.03] origin-center">
          <polygon points="365.5,106.5 404.5,106.5 385.0,200.0" fill="#693092" />
          <polygon points="385.0,200.0 404.5,293.5 365.5,293.5" fill="#693092" />
        </g>
      </svg>
    </div>
  );
}

// ============================================================================
// 2. HERO 3D MODAL VIDEO COMPONENT
// ============================================================================
export interface Hero3DModalVideoProps {
  videoSrc?: string;
  posterSrc?: string;
  pinterestEmbedUrl?: string;
  className?: string;
}

export function Hero3DModalVideo({
  videoSrc = "/videos/hero-tech-left.mp4",
  posterSrc = posterImg,
  pinterestEmbedUrl = "https://assets.pinterest.com/ext/embed.html?id=1127448088001277308",
  className = "",
}: Hero3DModalVideoProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [useIframe, setUseIframe] = useState(false);
  const [rotate, setRotate] = useState({ x: 3, y: -6 });
  const [isHovered, setIsHovered] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const modalVideoRef = useRef<HTMLVideoElement>(null);

  // 3D Parallax Mouse Tilt
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 12;

    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotate({ x: 3, y: -6 });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      video.play().catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (isModalOpen && modalVideoRef.current) {
      modalVideoRef.current.currentTime = videoRef.current?.currentTime || 0;
      modalVideoRef.current.play().catch(() => {});
    }
  }, [isModalOpen]);

  return (
    <>
      <div
        className={`relative perspective-[1200px] select-none ${className}`}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className="absolute -inset-4 bg-gradient-to-r from-cyan-500/25 via-blue-600/20 to-purple-600/25 rounded-[2.5rem] blur-2xl opacity-60 transition-opacity duration-500 pointer-events-none"
          style={{
            transform: isHovered ? "scale(1.08)" : "scale(1)",
          }}
        />

        <div
          ref={cardRef}
          style={{
            transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) translateZ(0)`,
            transition: isHovered ? "transform 0.15s ease-out" : "transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)",
            transformStyle: "preserve-3d",
          }}
          className="relative group rounded-2xl sm:rounded-3xl p-1.5 sm:p-2 bg-gradient-to-b from-white/[0.18] via-white/[0.06] to-white/[0.02] border border-cyan-400/40 backdrop-blur-xl shadow-[0_25px_60px_-15px_rgba(0,140,255,0.35)] cursor-pointer overflow-hidden"
          onClick={() => setIsModalOpen(true)}
        >
          <div className="flex items-center justify-between px-3 py-2 bg-black/60 backdrop-blur-md rounded-t-xl sm:rounded-t-2xl border-b border-white/10 mb-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 shadow-sm" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 shadow-sm" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 shadow-sm" />
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] sm:text-[11px] font-mono text-cyan-300">
              <Sparkles className="w-2.5 h-2.5 text-cyan-400 animate-pulse" />
              <span>netopsys // 3d-modal</span>
            </div>

            <button
              type="button"
              className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Expand 3D Modal"
              onClick={(e) => {
                e.stopPropagation();
                setIsModalOpen(true);
              }}
            >
              <Maximize2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
          </div>

          <div className="relative aspect-[9/14] sm:aspect-[9/15] w-full rounded-xl sm:rounded-2xl overflow-hidden bg-black">
            <video
              ref={videoRef}
              src={videoSrc}
              poster={posterSrc}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              className="w-full h-full object-cover object-center filter brightness-[0.98] contrast-[1.05]"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.08] via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-cyan-500/25 via-blue-600/10 to-transparent pointer-events-none" />

            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2 pointer-events-none">
              <div className="w-12 h-12 rounded-full bg-cyan-500/80 text-black flex items-center justify-center shadow-lg shadow-cyan-500/50 scale-90 group-hover:scale-100 transition-transform">
                <Play className="w-5 h-5 ml-0.5 fill-current" />
              </div>
              <span className="text-xs font-semibold text-white tracking-wide uppercase px-2.5 py-1 rounded-full bg-black/60 border border-white/20">
                Click to Expand 3D Modal
              </span>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-fade-in"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative w-full max-w-xl max-h-[92dvh] flex flex-col bg-slate-950/90 border border-cyan-500/40 rounded-2xl sm:rounded-3xl shadow-[0_0_80px_rgba(0,180,255,0.4)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-3.5 bg-black/80 border-b border-white/10">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-rose-500" />
                  <span className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-amber-500" />
                  <span className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-emerald-500" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-white tracking-tight">
                  Netopsys 3D Modal Showcase
                </span>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="inline-flex rounded-lg bg-white/10 p-0.5 border border-white/10 text-xs">
                  <button
                    type="button"
                    onClick={() => setUseIframe(false)}
                    className={`px-2 sm:px-2.5 py-1 rounded-md text-[11px] sm:text-xs transition-all ${
                      !useIframe
                        ? "bg-cyan-500 text-black font-semibold shadow-sm"
                        : "text-gray-300 hover:text-white"
                    }`}
                  >
                    3D Video
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseIframe(true)}
                    className={`px-2 sm:px-2.5 py-1 rounded-md text-[11px] sm:text-xs transition-all ${
                      useIframe
                        ? "bg-cyan-500 text-black font-semibold shadow-sm"
                        : "text-gray-300 hover:text-white"
                    }`}
                  >
                    Pinterest Embed
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-full bg-white/10 text-gray-300 hover:text-white hover:bg-white/20 transition-colors ml-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="relative flex-1 min-h-[280px] sm:min-h-[440px] max-h-[75dvh] flex items-center justify-center bg-black overflow-hidden">
              {useIframe ? (
                <iframe
                  src={pinterestEmbedUrl}
                  title="Pinterest 3D Video Reference"
                  className="w-full h-[640px] border-0"
                  scrolling="no"
                />
              ) : (
                <div className="relative w-full h-full flex items-center justify-center">
                  <video
                    ref={modalVideoRef}
                    src={videoSrc}
                    poster={posterSrc}
                    autoPlay
                    loop
                    playsInline
                    muted={isMuted}
                    className="max-h-[70dvh] w-auto max-w-full object-contain"
                  />

                  <button
                    type="button"
                    onClick={() => setIsMuted(!isMuted)}
                    className="absolute bottom-4 right-4 p-2.5 rounded-full bg-black/70 border border-white/20 text-white hover:bg-black/90 transition-all flex items-center gap-2 text-xs backdrop-blur-md"
                  >
                    {isMuted ? (
                      <>
                        <VolumeX className="w-4 h-4 text-rose-400" />
                        <span>Unmute</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4 text-cyan-400" />
                        <span>Mute</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ============================================================================
// 3. HERO 3D IMAGE CUBE COMPONENT (SOLID PHOTOREALISTIC DICE)
// ============================================================================

export const Hero3DGlassCube = memo(function Hero3DGlassCube({
  className = "",
}: {
  className?: string;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Isometric rotation angles:
  // rotX controls top-to-bottom roll
  // rotY controls horizontal corner yaw
  const rotX = useRef(-26);
  const rotY = useRef(-45);

  // Target angles (cursor adjusts these gently; lerp smoothly follows):
  const targetRotX = useRef(-26);
  const targetRotY = useRef(-45);

  const cubeWrapRef = useRef<HTMLDivElement>(null);
  const cubeRigRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const lastPos = useRef({ x: 0, y: 0, time: 0 });
  const animFrameRef = useRef<number | null>(null);

  // Unified pointer movement: responsive, cushioned, fluid cursor tracking
  const handlePointerMovement = (clientX: number, clientY: number, isDrag: boolean) => {
    const now = performance.now();
    const prevTime = lastPos.current.time;

    // Reset baseline if it's the very first movement or after a pause > 250ms
    if (!prevTime || now - prevTime > 250) {
      lastPos.current = { x: clientX, y: clientY, time: now };
      return;
    }

    const rawDx = clientX - lastPos.current.x;
    const rawDy = clientY - lastPos.current.y;
    lastPos.current = { x: clientX, y: clientY, time: now };

    const dist = Math.hypot(rawDx, rawDy);
    if (dist < 0.2) return;

    // Soft-clamp single frame deltas to prevent sudden jump glitches
    const dx = Math.max(-60, Math.min(60, rawDx));
    const dy = Math.max(-60, Math.min(60, rawDy));

    // Increased sensitivity for a little more rotation on cursor movement (~50% boost)
    const sens = isDrag ? 0.30 : 0.22;

    // Horizontal cursor movement adjusts Yaw target
    targetRotY.current += dx * sens;

    // Vertical cursor movement adjusts Pitch target (rolling top-to-bottom)
    targetRotX.current -= dy * sens;
  };

  // Smooth physics & ambient rotation loop (paused offscreen and when reduced motion is preferred)
  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    let isInView = true;
    let lastTime = performance.now();

    const updatePhysics = (now: number) => {
      if (!isInView) {
        animFrameRef.current = null;
        return;
      }

      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      // Ambient roll from TOP TO BOTTOM
      const ambientRoll = -0.58 * (dt * 60);
      const ambientYaw = 0.08 * (dt * 60);

      targetRotX.current += ambientRoll;
      targetRotY.current += ambientYaw;

      // Framerate-independent exponential lerp for silky-smooth, cushioned inertia
      const lerpFactor = 1 - Math.exp(-5.5 * dt);
      rotX.current += (targetRotX.current - rotX.current) * lerpFactor;
      rotY.current += (targetRotY.current - rotY.current) * lerpFactor;

      // Direct DOM update ensures pure 60/120/144fps GPU compositor performance
      if (cubeRigRef.current) {
        cubeRigRef.current.style.transform = `rotateY(${rotY.current.toFixed(3)}deg) rotateX(${rotX.current.toFixed(3)}deg)`;
      }

      animFrameRef.current = requestAnimationFrame(updatePhysics);
    };

    const startLoop = () => {
      if (animFrameRef.current === null && isInView) {
        lastTime = performance.now();
        animFrameRef.current = requestAnimationFrame(updatePhysics);
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isInView = entry.isIntersecting;
        if (isInView) {
          startLoop();
        } else if (animFrameRef.current !== null) {
          cancelAnimationFrame(animFrameRef.current);
          animFrameRef.current = null;
        }
      },
      { threshold: 0.01 }
    );

    if (cubeWrapRef.current) {
      observer.observe(cubeWrapRef.current);
    }

    startLoop();
    return () => {
      observer.disconnect();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    };
  }, []);

  // Global window mouse & touch handlers for unrestricted omnidirectional dragging
  useEffect(() => {
    const onWindowMouseMove = (e: globalThis.MouseEvent) => {
      if (!isDraggingRef.current) return;
      handlePointerMovement(e.clientX, e.clientY, true);
    };

    const onWindowMouseUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        setIsDragging(false);
        lastPos.current.time = 0;
      }
    };

    const onWindowTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || e.touches.length === 0) return;
      const touch = e.touches[0];
      handlePointerMovement(touch.clientX, touch.clientY, true);
    };

    const onWindowTouchEnd = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        setIsDragging(false);
        lastPos.current.time = 0;
      }
    };

    window.addEventListener("mousemove", onWindowMouseMove);
    window.addEventListener("mouseup", onWindowMouseUp);
    window.addEventListener("touchmove", onWindowTouchMove, { passive: true });
    window.addEventListener("touchend", onWindowTouchEnd);

    return () => {
      window.removeEventListener("mousemove", onWindowMouseMove);
      window.removeEventListener("mouseup", onWindowMouseUp);
      window.removeEventListener("touchmove", onWindowTouchMove);
      window.removeEventListener("touchend", onWindowTouchEnd);
    };
  }, []);

  // Pointer Down (mouse or touch) to initiate drag
  const handlePointerDown = (clientX: number, clientY: number) => {
    isDraggingRef.current = true;
    setIsDragging(true);
    lastPos.current = { x: clientX, y: clientY, time: performance.now() };
  };

  // Wheel scroll to rotate gently
  const handleWheel = (e: React.WheelEvent) => {
    const dPitch = -e.deltaY * 0.1;
    const dYaw = -e.deltaX * 0.1;
    if (Math.abs(dPitch) < 0.1 && Math.abs(dYaw) < 0.1) return;
    targetRotX.current += dPitch;
    targetRotY.current += dYaw;
  };

  // Cube dimensions
  const cubeSize = 300; // px
  const half = cubeSize / 2; // 150px

  return (
    <div
      ref={cubeWrapRef}
      className={`relative flex flex-col items-center justify-center min-h-[210px] xs:min-h-[250px] sm:min-h-[300px] md:min-h-[340px] lg:min-h-[310px] xl:min-h-[310px] 2xl:min-h-[310px] min-[1680px]:min-h-[310px] select-none ${isDragging ? "cursor-grabbing" : "cursor-grab"} touch-pan-y ${className}`}
      style={{ perspective: "1200px" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={(e) => handlePointerDown(e.clientX, e.clientY)}
      onTouchStart={(e) => {
        if (e.touches.length > 0) {
          handlePointerDown(e.touches[0].clientX, e.touches[0].clientY);
        }
      }}
      onWheel={handleWheel}
    >
      {/* Ground Ambient Drop Shadow */}
      <div
        className="absolute -bottom-6 xs:-bottom-8 sm:-bottom-10 lg:-bottom-11 xl:-bottom-11 2xl:-bottom-11 min-[1680px]:-bottom-11 w-44 xs:w-56 sm:w-72 md:w-80 lg:w-72 xl:w-72 2xl:w-72 min-[1680px]:w-72 h-10 sm:h-12 min-[1680px]:h-12 rounded-full blur-xl pointer-events-none transition-transform duration-500"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0, 0, 0, 0.45) 0%, rgba(0, 0, 0, 0.2) 40%, transparent 75%)",
          transform: isHovered ? "scale(1.15)" : "scale(1)",
        }}
      />

      {/* 3D Solid Image Cube Rig */}
      <div
        ref={cubeRigRef}
        className="relative py-0 lg:py-8 pointer-events-none"
        style={{
          width: `${cubeSize}px`,
          height: `${cubeSize}px`,
          transformStyle: "preserve-3d",
          WebkitTransformStyle: "preserve-3d",
          transform: "rotateY(-45deg) rotateX(-26deg)",
          willChange: "transform",
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
        }}
      >
        {/* FACE 1: FRONT - AI Cyborg with Blue Halo Ring */}
        <div
          className="absolute inset-0 overflow-hidden bg-slate-900"
          style={{
            width: `${cubeSize}px`,
            height: `${cubeSize}px`,
            transform: `translateZ(${half}px)`,
            boxShadow: "inset 0 0 1px rgba(255,255,255,0.15)",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            outline: "1px solid transparent",
            willChange: "transform",
          }}
        >
          <OptimizedPicture
            src="/cube/cube-robot-halo.jpg"
            alt="AI Cyborg with Blue Halo Ring - Netopsys"
            width={300}
            height={300}
            sizes="(max-width: 768px) 240px, 300px"
            className="w-full h-full object-cover select-none pointer-events-none block"
            style={{
              transform: "translateZ(0)",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
            draggable={false}
          />
          {/* Natural 3D lighting shadow */}
          <div className="absolute inset-0 bg-black/[0.08] pointer-events-none" />
        </div>

        {/* FACE 2: BACK - Holographic Neural Brain Platform */}
        <div
          className="absolute inset-0 overflow-hidden bg-slate-900"
          style={{
            width: `${cubeSize}px`,
            height: `${cubeSize}px`,
            transform: `rotateX(180deg) translateZ(${half}px)`,
            boxShadow: "inset 0 0 1px rgba(255,255,255,0.15)",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            outline: "1px solid transparent",
            willChange: "transform",
          }}
        >
          <OptimizedPicture
            src="/cube/cube-brain-ai.jpg"
            alt="Holographic Neural Brain Platform - Netopsys AI"
            width={300}
            height={300}
            sizes="(max-width: 768px) 240px, 300px"
            className="w-full h-full object-cover select-none pointer-events-none block"
            style={{
              transform: "translateZ(0)",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
            draggable={false}
          />
          <div className="absolute inset-0 bg-black/[0.18] pointer-events-none" />
        </div>

        {/* FACE 3: RIGHT - High-Performance Cloud Data Center Corridors */}
        <div
          className="absolute inset-0 overflow-hidden bg-slate-900"
          style={{
            width: `${cubeSize}px`,
            height: `${cubeSize}px`,
            transform: `rotateY(90deg) translateZ(${half}px)`,
            boxShadow: "inset 0 0 1px rgba(255,255,255,0.15)",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            outline: "1px solid transparent",
            willChange: "transform",
          }}
        >
          <OptimizedPicture
            src="/cube/cube-server-datacenter.jpg"
            alt="High-Performance Cloud Data Center Corridors - Netopsys"
            width={300}
            height={300}
            sizes="(max-width: 768px) 240px, 300px"
            className="w-full h-full object-cover select-none pointer-events-none block"
            style={{
              transform: "translateZ(0)",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
            draggable={false}
          />
          {/* Subtle directional shadow for realistic depth */}
          <div className="absolute inset-0 bg-black/[0.12] pointer-events-none" />
        </div>

        {/* FACE 4: LEFT - Smart Connected City Geodesic Dome */}
        <div
          className="absolute inset-0 overflow-hidden bg-slate-900"
          style={{
            width: `${cubeSize}px`,
            height: `${cubeSize}px`,
            transform: `rotateY(-90deg) translateZ(${half}px)`,
            boxShadow: "inset 0 0 1px rgba(255,255,255,0.15)",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            outline: "1px solid transparent",
            willChange: "transform",
          }}
        >
          <OptimizedPicture
            src="/cube/cube-city-dome.jpg"
            alt="Smart Connected City Geodesic Dome - Netopsys AI"
            width={300}
            height={300}
            sizes="(max-width: 768px) 240px, 300px"
            className="w-full h-full object-cover select-none pointer-events-none block"
            style={{
              transform: "translateZ(0)",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
            draggable={false}
          />
          <div className="absolute inset-0 bg-black/[0.1] pointer-events-none" />
        </div>

        {/* FACE 5: TOP - Next-Gen AI Microprocessor Core */}
        <div
          className="absolute inset-0 overflow-hidden bg-slate-900"
          style={{
            width: `${cubeSize}px`,
            height: `${cubeSize}px`,
            transform: `rotateX(90deg) translateZ(${half}px)`,
            boxShadow: "inset 0 0 1px rgba(255,255,255,0.2)",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            outline: "1px solid transparent",
            willChange: "transform",
          }}
        >
          <OptimizedPicture
            src="/cube/cube-chip-core.jpg"
            alt="Next-Gen AI Microprocessor Core - Netopsys"
            width={300}
            height={300}
            sizes="(max-width: 768px) 240px, 300px"
            className="w-full h-full object-cover select-none pointer-events-none block"
            style={{
              transform: "translateZ(0)",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
            draggable={false}
          />
          {/* Subtle top light sheen */}
          <div className="absolute inset-0 bg-white/[0.05] pointer-events-none" />
        </div>

        {/* FACE 6: BOTTOM - Human & AI Digital Touch Connection */}
        <div
          className="absolute inset-0 overflow-hidden bg-slate-900"
          style={{
            width: `${cubeSize}px`,
            height: `${cubeSize}px`,
            transform: `rotateX(-90deg) translateZ(${half}px)`,
            boxShadow: "inset 0 0 1px rgba(255,255,255,0.15)",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            outline: "1px solid transparent",
            willChange: "transform",
          }}
        >
          <OptimizedPicture
            src="/cube/cube-touch.jpg"
            alt="Human & AI Digital Touch Connection - Netopsys"
            width={300}
            height={300}
            sizes="(max-width: 768px) 240px, 300px"
            className="w-full h-full object-cover select-none pointer-events-none block"
            style={{
              transform: "translateZ(0)",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
            draggable={false}
          />
          {/* Darker bottom shadow */}
          <div className="absolute inset-0 bg-black/[0.35] pointer-events-none" />
        </div>
      </div>
    </div>
  );
});

// ============================================================================
// 4. MAIN HERO SECTION COMPONENT (UI & UX 100% PRESERVED)
// ============================================================================
function DesktopHeroParallaxCube({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) {
  const { scrollY } = useScroll();
  const smoothScrollY = useSpring(scrollY, {
    stiffness: 150,
    damping: 26,
    mass: 0.35,
  });
  const parallaxCubeY = useTransform(smoothScrollY, [0, 750], [0, 480]);
  const parallaxCubeX = useTransform(smoothScrollY, [0, 750], [0, -45]);
  const parallaxCubeRotate = useTransform(smoothScrollY, [0, 750], [0, 30]);
  const parallaxCubeScale = useTransform(smoothScrollY, [0, 750], [1, 0.9]);

  return (
    <motion.div
      style={{
        y: parallaxCubeY,
        x: parallaxCubeX,
        rotateZ: parallaxCubeRotate,
        scale: parallaxCubeScale,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const [heroTitleIndex, setHeroTitleIndex] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(
    typeof window !== "undefined" ? window.innerHeight : 900
  );
  const [devicePixelRatio, setDevicePixelRatio] = useState(
    typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1
  );

  // Track window resize for desktop-only scroll parallax and height-aware display scaling
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setIsDesktop(w >= 1024);
      setViewportHeight(h);
      setDevicePixelRatio(window.devicePixelRatio || 1);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Dedicated check for 100% display scale (devicePixelRatio <= 1.14 on desktop)
  const is100Scale = isDesktop && devicePixelRatio <= 1.14;

  // Responsive fluid cube scale:
  // For 100% scale ONLY: tuned slightly for ideal balanced proportion on desktop viewports.
  // For all other scales (125%, 150%, 175%, 200%, mobile): preserved exactly as before without change.
  const cubeScaleClass = isDesktop
    ? is100Scale
      ? viewportHeight < 620
        ? "scale-[0.88] xl:scale-[0.96] 2xl:scale-[1.05]"
        : viewportHeight < 740
        ? "scale-[1.02] xl:scale-[1.10] 2xl:scale-[1.18]"
        : "scale-[1.12] xl:scale-[1.22] 2xl:scale-[1.28] min-[1680px]:scale-[1.34]"
      : viewportHeight < 620
      ? "scale-[0.76] xl:scale-[0.80] 2xl:scale-[0.85]"
      : viewportHeight < 740
      ? "scale-[0.80] xl:scale-[0.85] 2xl:scale-[0.90]"
      : "scale-[0.88] xl:scale-[0.96] 2xl:scale-[1.02]"
    : "scale-[0.54] xs:scale-[0.68] sm:scale-[0.80] md:scale-[0.88]";

  // Rotating title cycle: paused when offscreen or reduced-motion preferred
  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    let isVisible = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    const timer = setInterval(() => {
      if (isVisible) {
        setHeroTitleIndex((prev) => (prev + 1) % HERO_TITLES.length);
      }
    }, 3600);
    return () => {
      observer.disconnect();
      clearInterval(timer);
    };
  }, []);

  const heroCubeClassName =
    "hero-cube-wrap w-full max-w-[340px] xs:max-w-[380px] sm:max-w-[440px] md:max-w-[480px] lg:max-w-[440px] xl:max-w-[530px] 2xl:max-w-[660px] h-[220px] xs:h-[270px] sm:h-[315px] md:h-[355px] lg:h-auto lg:max-h-none flex flex-col items-center justify-center origin-center will-change-transform";
  const heroCubeInner = (
    <div
      className={`hero-cube-scaler w-full flex flex-col items-center justify-center origin-center ${cubeScaleClass} transition-transform duration-200`}
    >
      <Hero3DGlassCube className="w-full" />
    </div>
  );

  return (
    <section
      ref={heroRef}
      id="home"
      className="hero-section-wrap relative lg:sticky lg:top-0 w-full min-h-[100dvh] lg:min-h-[100dvh] flex items-center bg-[#FBAE42] px-4 sm:px-6 md:px-8 lg:px-8 xl:px-10 2xl:px-14 min-[1680px]:px-20 pt-24 sm:pt-28 md:pt-32 lg:pt-14 xl:pt-10 pb-12 sm:pb-16 lg:pb-10 overflow-x-clip select-none z-0"
    >
      {/* 2-Column Responsive Layout - Fluid Scaling Across All Breakpoints */}
      <div className="w-full max-w-[2100px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-7 sm:gap-8 lg:gap-6 xl:gap-8 2xl:gap-10 min-[1680px]:gap-16 items-center justify-between">
        {/* Left Column: Fluid Responsive Typography & Adaptive Spacing */}
        <div className="min-w-0 lg:col-span-7 xl:col-span-7 2xl:col-span-7 flex flex-col items-start text-left z-10 animate-text-fade-in w-full">
          {/* Eyebrow Locations Pill Badge */}
          

          {/* Main Display Heading - Carefully Clamped & Sized Responsive Typography */}
          <h1
            className="hero-heading-container text-[#141010] mb-3.5 sm:mb-5 lg:mb-3 xl:mb-3.5 2xl:mb-5 w-full"
            style={{ fontFamily: "'Onest', sans-serif" }}
          >
            <span className="hero-heading-lead block text-[1.45rem] xs:text-[1.7rem] sm:text-2xl md:text-3xl lg:text-[2.1rem] xl:text-[2.35rem] 2xl:text-[3.1rem] leading-[1.1] mb-1 sm:mb-1.5 text-[#141010] font-light">
              Your Partner for
            </span>
            <span
              className="hero-heading-title block relative min-h-[2.25em] sm:h-[2.15em] sm:min-h-[2.15em] sm:max-h-[2.15em] overflow-x-clip sm:overflow-hidden mt-1 sm:mt-1.5 text-[#141010] font-light text-[2rem] xs:text-[2.35rem] sm:text-4xl md:text-5xl lg:text-[2.85rem] xl:text-[3.15rem] 2xl:text-[4.15rem] leading-[1.05] sm:leading-[1.04] tracking-[-0.03em]"
              style={{ fontFamily: "'Onest', sans-serif" }}
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={heroTitleIndex}
                  initial={{ opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -22 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="block w-full"
                  style={{ fontFamily: "'Onest', sans-serif" }}
                >
                  <span className="block leading-[1.04]">{HERO_TITLES[heroTitleIndex][0]}</span>
                  <span className="block leading-[1.04]">{HERO_TITLES[heroTitleIndex][1]}</span>
                </motion.span>
              </AnimatePresence>
            </span>
          </h1>

          {/* Subtitle Description */}
          <p
            className="hero-subtitle text-[#231C18] text-sm sm:text-base md:text-[16px] lg:text-[14.5px] xl:text-[15px] 2xl:text-[17px] leading-relaxed max-w-xl lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl mb-5 sm:mb-7 lg:mb-3.5 xl:mb-4.5 2xl:mb-6 font-normal"
            style={{ fontFamily: "'Onest', sans-serif" }}
          >
            From AI and machine learning to enterprise infrastructure —
            Netopsys transforms businesses across the globe with 15+ years of
            proven expertise.
          </p>

          {/* Action Buttons - Stacked on narrow mobile, side-by-side on xs/sm+ */}
          <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-3 sm:gap-4 w-full xs:w-auto">
            <a
              href="#contact"
              className="hero-btn hover-brand-gradient rounded-full bg-[#0E0B16] text-white text-xs sm:text-sm lg:text-[13px] xl:text-[13.5px] 2xl:text-[14.5px] font-semibold px-6 sm:px-8 lg:px-6 xl:px-6.5 2xl:px-7.5 py-3 sm:py-3.5 lg:py-2.5 xl:py-2.5 2xl:py-3 shadow-md cursor-pointer inline-flex items-center justify-center text-center transition-all duration-200 active:scale-95"
              style={{ fontFamily: "'Onest', sans-serif" }}
            >
              Start Your Journey
            </a>

            <a
              href="#services"
              className="hero-btn rounded-full bg-transparent hover:bg-black/10 text-[#141010] border border-[#141010] text-xs sm:text-sm lg:text-[13px] xl:text-[13.5px] 2xl:text-[14.5px] font-semibold px-6 sm:px-8 lg:px-6 xl:px-6.5 2xl:px-7.5 py-3 sm:py-3.5 lg:py-2.5 xl:py-2.5 2xl:py-3 transition-all duration-200 active:scale-95 cursor-pointer inline-flex items-center justify-center text-center"
              style={{ fontFamily: "'Onest', sans-serif" }}
            >
              Explore Services
            </a>
          </div>
        </div>

        {/* Right Column: 3D Cube with Proportional Breakpoint Scaling & Desktop-only Parallax */}
        <div className="min-w-0 lg:col-span-5 xl:col-span-5 2xl:col-span-5 flex flex-col items-center justify-center z-10 pt-2 pb-1 sm:py-4 lg:py-0 animate-cube-slide-right w-full">
          {isDesktop ? (
            <DesktopHeroParallaxCube className={heroCubeClassName}>
              {heroCubeInner}
            </DesktopHeroParallaxCube>
          ) : (
            <div className={heroCubeClassName}>{heroCubeInner}</div>
          )}
        </div>
      </div>
    </section>
  );
}

export { Hero };
