import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw, WifiOff, Home } from "lucide-react";

interface NotFoundPageProps {
  forceOffline?: boolean;
  onRetry?: () => void;
}

/**
 * 404 Page & Offline Connection Page
 * Faithfully matches the user's reference image:
 * - 404 centered vertically and horizontally with balanced spacing
 * - The entire bird and magnifying glass move together as a single unit
 * - The bird walks back and forth along the floor line across the 404 numbers
 * - Cute waddle walking animation (alternating legs, bobbing body)
 * - Magnifying glass handle is firmly held by the bird (never stretches detached)
 * - Inside the magnifying lens, it magnifies whichever number it passes over (4, 0, or 4 with "HOME" stamp)
 * - The bird turns and faces the direction it is walking
 * - Dual Mode: Page Not Found (404) OR No Internet Connection (Offline)
 */
export default function NotFoundPage({ forceOffline, onRetry }: NotFoundPageProps) {
  const navigate = useNavigate();
  const [isOffline, setIsOffline] = useState(forceOffline || !navigator.onLine);
  const [isRetrying, setIsRetrying] = useState(false);

  // Bird Patrol & Movement State
  const [birdX, setBirdX] = useState(480);
  const [direction, setDirection] = useState<1 | -1>(1); // 1 = facing right, -1 = facing left
  const [isWalking, setIsWalking] = useState(true);
  const [stepPhase, setStepPhase] = useState(0);

  // Interactive mouse override
  const containerRef = useRef<HTMLDivElement | null>(null);
  const targetXRef = useRef<number | null>(null);
  const isUserInteractingRef = useRef(false);
  const pauseTimerRef = useRef<number>(0);

  // Monitor network online/offline events
  useEffect(() => {
    if (forceOffline !== undefined) {
      setIsOffline(forceOffline);
      return;
    }

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [forceOffline]);

  // Handle manual retry for connection
  const handleRetryConnection = () => {
    setIsRetrying(true);
    setTimeout(() => {
      if (navigator.onLine) {
        setIsOffline(false);
      }
      if (onRetry) {
        onRetry();
      } else {
        window.location.reload();
      }
      setIsRetrying(false);
    }, 800);
  };

  // Continuous animation loop for patrolling & walking
  useEffect(() => {
    let animId: number;
    const minX = 220;
    const maxX = 640;
    const speed = 1.35; // gentle detective pacing

    const step = () => {
      // If user is guiding with mouse
      if (isUserInteractingRef.current && targetXRef.current !== null) {
        setBirdX((currentX) => {
          const target = Math.max(minX, Math.min(maxX, targetXRef.current!));
          const diff = target - currentX;
          if (Math.abs(diff) > 2) {
            const nextDir = diff > 0 ? 1 : -1;
            setDirection(nextDir);
            setIsWalking(true);
            setStepPhase((p) => p + 0.18);
            return currentX + Math.sign(diff) * Math.min(speed * 1.5, Math.abs(diff));
          } else {
            setIsWalking(false);
            return currentX;
          }
        });
      } else {
        // Automated patrol back and forth across 404
        if (pauseTimerRef.current > 0) {
          pauseTimerRef.current -= 1;
          setIsWalking(false);
        } else {
          setIsWalking(true);
          setStepPhase((p) => p + 0.16);
          setBirdX((currentX) => {
            let nextX = currentX + direction * speed;
            if (nextX >= maxX) {
              nextX = maxX;
              setDirection(-1);
              pauseTimerRef.current = 45; // brief pause at right turnaround
            } else if (nextX <= minX) {
              nextX = minX;
              setDirection(1);
              pauseTimerRef.current = 45; // brief pause at left turnaround
            }
            return nextX;
          });
        }
      }

      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [direction]);

  // Mouse interaction handler
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relativeX = (e.clientX - rect.left) / rect.width;
    // Map container width to SVG coordinate range (approx 180 to 680)
    const svgX = 180 + relativeX * 500;
    targetXRef.current = svgX;
    isUserInteractingRef.current = true;
  };

  const handleMouseLeave = () => {
    isUserInteractingRef.current = false;
    targetXRef.current = null;
  };

  // Calculate body bob and leg angles from walking stepPhase
  const bodyBob = isWalking ? Math.sin(stepPhase * 2) * 2.5 : 0;
  const legAngle1 = isWalking ? Math.sin(stepPhase) * 20 : 0;
  const legAngle2 = isWalking ? Math.sin(stepPhase + Math.PI) * 20 : 0;

  // Lens coordinate for magnifying view
  const lensGlobalX = birdX + (direction === 1 ? 112 : -112);
  const lensGlobalY = 246 + bodyBob;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="min-h-screen w-full bg-[#FBF7F0] text-[#141010] font-['Onest',sans-serif] flex flex-col justify-between items-center select-none overflow-hidden relative"
      style={{
        backgroundImage: `radial-gradient(circle at 50% 36%, #FFFDF9 0%, #FAF5EC 60%, #F4ECE0 100%)`,
      }}
    >
      {/* Top Header / Branding */}
      <div className="w-full max-w-6xl mx-auto px-6 pt-6 sm:pt-8 flex items-center justify-between z-20">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex items-center gap-2 group cursor-pointer"
        >
          {/* Logo 3 Spheres */}
          <svg width="38" height="20" viewBox="0 0 54 26" fill="none">
            <circle cx="12" cy="13" r="11" fill="#FBAE42" />
            <circle cx="25" cy="13" r="11" fill="#D13B89" />
            <circle cx="38" cy="13" r="11" fill="#5E2282" />
          </svg>
          <span className="text-sm sm:text-base font-bold tracking-tight text-[#141010] group-hover:text-[#5E2282] transition-colors">
            Netopsys
          </span>
        </button>

        {isOffline && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 border border-amber-200 text-amber-800 text-xs font-semibold animate-pulse">
            <WifiOff className="w-3.5 h-3.5" />
            <span>Offline Mode</span>
          </div>
        )}
      </div>

      {/* Main Center Stage: Vertically Balanced & Centered */}
      <div className="w-full flex-1 flex flex-col items-center justify-center max-w-4xl px-4 py-4 sm:py-6 relative z-10">
        {/* Headings & Action Button */}
        <div className="text-center flex flex-col items-center mb-4 sm:mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <h1 className="text-3xl sm:text-4xl md:text-[44px] font-extrabold text-[#231815] tracking-tight mb-2">
            {isOffline ? "No Internet Connection" : "Page Not Found"}
          </h1>

          <p className="text-sm sm:text-base text-[#7C6E6A] font-medium mb-6 max-w-md px-4">
            {isOffline
              ? "It looks like you're offline. Please check your network and reconnect."
              : "Nothing at this address."}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {isOffline ? (
              <>
                <button
                  type="button"
                  onClick={handleRetryConnection}
                  disabled={isRetrying}
                  className="inline-flex items-center gap-2 bg-[#B84033] hover:bg-[#A0352A] text-white px-7 py-3 rounded-full text-sm font-bold shadow-sm hover:shadow transition-all cursor-pointer active:scale-95 disabled:opacity-60"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${isRetrying ? "animate-spin" : ""}`}
                  />
                  <span>{isRetrying ? "Checking..." : "Try Again"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="inline-flex items-center gap-2 bg-white/90 hover:bg-white border border-[#E4D7C5] text-[#2D1F1C] px-6 py-3 rounded-full text-sm font-bold shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                >
                  <Home className="w-4 h-4 text-[#5E2282]" />
                  <span>Back to Home</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => navigate("/")}
                className="inline-flex items-center gap-2 bg-[#B84033] hover:bg-[#A0352A] active:bg-[#8E2F25] text-white px-7 py-2.5 sm:py-3 rounded-full text-sm sm:text-[15px] font-bold shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-95"
              >
                <span>Back to Home</span>
              </button>
            )}
          </div>
        </div>

        {/* ===============================================================
            CENTERED 404 STAGE: Numbers in Center + Walking Bird on Floor
        =============================================================== */}
        <div className="w-full flex items-center justify-center relative overflow-visible">
          <svg
            viewBox="0 0 860 380"
            className="w-full max-w-[720px] md:max-w-[780px] h-auto overflow-visible select-none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Glass Lens Reflection Gradient */}
              <linearGradient
                id="lensGlassGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
                <stop offset="45%" stopColor="#FFF7E6" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#E6D3B3" stopOpacity="0.25" />
              </linearGradient>

              {/* Dynamic Lens Clip Path following bird's magnifying glass */}
              <clipPath id="activeLensClip">
                <circle cx={lensGlobalX} cy={lensGlobalY} r="46" />
              </clipPath>
            </defs>

            {/* -----------------------------------------------------------
                FLOOR SEAMS & GROUND LINE
            ------------------------------------------------------------ */}
            <g opacity="0.6">
              <line x1="80" y1="310" x2="80" y2="360" stroke="#E5D9C8" strokeWidth="1.2" />
              <line x1="220" y1="310" x2="220" y2="360" stroke="#E5D9C8" strokeWidth="1.2" />
              <line x1="360" y1="310" x2="360" y2="360" stroke="#E5D9C8" strokeWidth="1.2" />
              <line x1="500" y1="310" x2="500" y2="360" stroke="#E5D9C8" strokeWidth="1.2" />
              <line x1="640" y1="310" x2="640" y2="360" stroke="#E5D9C8" strokeWidth="1.2" />
              <line x1="780" y1="310" x2="780" y2="360" stroke="#E5D9C8" strokeWidth="1.2" />
            </g>

            {/* Main Ground Line */}
            <line
              x1="20"
              y1="310"
              x2="840"
              y2="310"
              stroke="#E2D4BF"
              strokeWidth="2.2"
            />

            {/* Walking Shadow Dots across the patrol line */}
            <g fill="#A89A88" opacity="0.4">
              <circle cx="160" cy="312" r="3" />
              <circle cx="260" cy="312" r="3" />
              <circle cx="360" cy="312" r="3" />
              <circle cx="460" cy="312" r="3" />
              <circle cx="560" cy="312" r="3" />
              <circle cx="660" cy="312" r="3" />
            </g>

            {/* -----------------------------------------------------------
                MASSIVE SOFT 404 NUMBERS (Centered)
            ------------------------------------------------------------ */}
            <g
              fill="#EAD7B0"
              opacity="0.95"
              className="select-none font-black"
              style={{
                fontFamily: "system-ui, -apple-system, sans-serif",
                fontWeight: 900,
                letterSpacing: "-0.04em",
              }}
            >
              {/* First '4' */}
              <text x="65" y="295" fontSize="250">
                4
              </text>

              {/* Middle '0' */}
              <text x="310" y="295" fontSize="250">
                0
              </text>

              {/* Last '4' */}
              <text x="565" y="295" fontSize="250">
                4
              </text>
            </g>

            {/* -----------------------------------------------------------
                MAGNIFYING GLASS INSPECTION CONTENT (Under the lens)
            ------------------------------------------------------------ */}
            <g
              clipPath="url(#activeLensClip)"
              className="cursor-pointer"
              onClick={() => navigate("/")}
            >
              {/* Magnified Background Canvas inside lens */}
              <rect
                x={lensGlobalX - 60}
                y={lensGlobalY - 60}
                width="120"
                height="120"
                fill="#FFF8EC"
              />

              {/* Magnified Ground Line inside lens */}
              <line
                x1={lensGlobalX - 50}
                y1={310}
                x2={lensGlobalX + 50}
                y2={310}
                stroke="#D3BEA2"
                strokeWidth="2.5"
              />

              {/* Magnified Numbers based on bird's position */}
              <g
                fill="#DDBB7D"
                opacity="0.95"
                fontWeight="900"
                style={{
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  fontSize: "150px",
                }}
              >
                {lensGlobalX < 310 && (
                  <text x={lensGlobalX - 42} y={305}>
                    4
                  </text>
                )}
                {lensGlobalX >= 310 && lensGlobalX <= 540 && (
                  <text x={lensGlobalX - 40} y={305}>
                    0
                  </text>
                )}
                {lensGlobalX > 540 && (
                  <text x={lensGlobalX - 42} y={305}>
                    4
                  </text>
                )}
              </g>

              {/* Secret "HOME" (or "RETRY") stamp inside lens */}
              <text
                x={lensGlobalX - 25}
                y={lensGlobalY + 5}
                fill="#C0382B"
                fontSize="16"
                fontWeight="800"
                letterSpacing="0.08em"
                fontFamily="system-ui, sans-serif"
                opacity="0.88"
              >
                {isOffline ? "RETRY" : "HOME"}
              </text>

              {/* Glass Lens Highlight Reflection */}
              <rect
                x={lensGlobalX - 55}
                y={lensGlobalY - 55}
                width="110"
                height="110"
                fill="url(#lensGlassGradient)"
              />

              {/* Curved Reflection Arc */}
              <path
                d={`M ${lensGlobalX - 30} ${lensGlobalY - 24} A 36 36 0 0 1 ${lensGlobalX + 24} ${lensGlobalY - 30}`}
                stroke="#FFFFFF"
                strokeWidth="3.5"
                strokeLinecap="round"
                opacity="0.75"
                fill="none"
              />
            </g>

            {/* -----------------------------------------------------------
                SINGLE UNIFIED BIRD + MAGNIFYING GLASS CHARACTER UNIT
            ------------------------------------------------------------ */}
            {/* The bird and magnifying glass are locked together and patrol along the floor */}
            <g transform={`translate(${birdX}, 0)`}>
              {/* Dynamic Ground Ellipse Shadow directly under feet */}
              <ellipse
                cx="0"
                cy="312"
                rx={isWalking ? 34 : 38}
                ry="6"
                fill="#D8C7B0"
                opacity="0.8"
              />

              {/* Flip bird and magnifying glass when changing direction */}
              <g transform={`scale(${direction}, 1)`}>
                {/* 1. Bird Legs & Feet with Walking Rotation */}
                <g stroke="#261A16" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
                  {/* Left / Back Leg */}
                  <g transform={`translate(-8, 280) rotate(${legAngle1})`}>
                    <line x1="0" y1="0" x2="0" y2="28" />
                    <line x1="0" y1="28" x2="-7" y2="32" />
                    <line x1="0" y1="28" x2="0" y2="33" />
                    <line x1="0" y1="28" x2="7" y2="32" />
                  </g>

                  {/* Right / Front Leg */}
                  <g transform={`translate(8, 280) rotate(${legAngle2})`}>
                    <line x1="0" y1="0" x2="0" y2="28" />
                    <line x1="0" y1="28" x2="-7" y2="32" />
                    <line x1="0" y1="28" x2="0" y2="33" />
                    <line x1="0" y1="28" x2="7" y2="32" />
                  </g>
                </g>

                {/* 2. Bird Body Group (Bobs slightly up & down when walking) */}
                <g transform={`translate(0, ${bodyBob})`}>
                  {/* Tail Feathers at back */}
                  <path
                    d="M -42 245 L -72 230 L -58 250 L -74 268 L -38 260 Z"
                    fill="#241714"
                  />

                  {/* Red Comb Tufts on Head */}
                  <g fill="#D84234">
                    <path d="M -12 182 Q -10 165 -2 170 Q -4 184 -6 190 Z" />
                    <path d="M -2 178 Q 5 160 14 165 Q 10 181 6 188 Z" />
                    <path d="M 10 180 Q 22 162 28 170 Q 22 185 16 190 Z" />
                  </g>

                  {/* Main Bird Body (Chubby Round Sphere) */}
                  <ellipse cx="0" cy="245" rx="50" ry="48" fill="#251815" />

                  {/* Red Polka Dots on Belly / Chest */}
                  <g fill="#D84234" opacity="0.95">
                    <circle cx="-28" cy="248" r="3.2" />
                    <circle cx="-16" cy="262" r="3.2" />
                    <circle cx="-26" cy="274" r="3.2" />
                    <circle cx="-10" cy="282" r="3.2" />
                    <circle cx="4" cy="276" r="3.2" />
                    <circle cx="16" cy="280" r="3.2" />
                  </g>

                  {/* Cute Curved Smile / Cheek Line */}
                  <path
                    d="M 6 256 Q 18 267 32 254"
                    stroke="#FFFFFF"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    fill="none"
                  />

                  {/* Large Eye White */}
                  <circle cx="34" cy="220" r="13.5" fill="#FFFFFF" />

                  {/* Eye Pupil Looking forward through magnifying glass */}
                  <circle cx="40" cy="220" r="6" fill="#141010" />

                  {/* Catchlight in Eye */}
                  <circle cx="42" cy="218" r="2" fill="#FFFFFF" />

                  {/* Cute Orange Beak */}
                  <path d="M 46 222 L 72 230 L 46 237 Z" fill="#F39C12" />

                  {/* Bird Hand / Arm holding the handle */}
                  <path
                    d="M 22 258 Q 50 258 72 252"
                    stroke="#251815"
                    strokeWidth="11"
                    strokeLinecap="round"
                    fill="none"
                  />

                  {/* 3. Magnifying Glass (Firmly attached to hand, moves with bird) */}
                  {/* Handle */}
                  <line
                    x1="62"
                    y1="252"
                    x2="88"
                    y2="248"
                    stroke="#221512"
                    strokeWidth="11"
                    strokeLinecap="round"
                  />
                  <line
                    x1="65"
                    y1="251"
                    x2="86"
                    y2="248"
                    stroke="#382622"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />

                  {/* Outer Heavy Dark Lens Rim (Fixed to handle at x=112, y=246) */}
                  <circle
                    cx="112"
                    cy="246"
                    r="46"
                    stroke="#221512"
                    strokeWidth="9"
                    fill="none"
                  />

                  {/* Inner Glass Lip */}
                  <circle
                    cx="112"
                    cy="246"
                    r="41.5"
                    stroke="#543C36"
                    strokeWidth="1.6"
                    fill="none"
                    opacity="0.6"
                  />
                </g>
              </g>
            </g>
          </svg>
        </div>
      </div>

      {/* Bottom Footer Credits / Home Button */}
      <div className="w-full max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-[#8F8177] z-20 border-t border-[#EDE1D1]/60">
        <p>&copy; {new Date().getFullYear()} Netopsys Pte. Ltd. All rights reserved.</p>

        <div className="flex items-center gap-4 mt-2 sm:mt-0">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="hover:text-[#5E2282] transition-colors cursor-pointer font-medium"
          >
            Home
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => navigate("/careers")}
            className="hover:text-[#5E2282] transition-colors cursor-pointer font-medium"
          >
            Careers
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => navigate("/blogs")}
            className="hover:text-[#5E2282] transition-colors cursor-pointer font-medium"
          >
            Blogs
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => navigate("/contact")}
            className="hover:text-[#5E2282] transition-colors cursor-pointer font-medium"
          >
            Contact
          </button>
        </div>
      </div>
    </div>
  );
}
