import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw, WifiOff, Home } from "lucide-react";

interface NotFoundPageProps {
  forceOffline?: boolean;
  onRetry?: () => void;
}

/**
 * 404 Page & Offline Connection Page
 * Designed faithfully to match the reference image:
 * - Clean, warm minimal canvas with centered typography
 * - Huge soft sand "404" in the background
 * - Cute animated dark bird character with red crest, polka dots, and big cartoon eye
 * - Interactive magnifying glass inspecting the scene with magnified "HOME" lens view
 * - Smooth mouse cursor tracking for the magnifying glass and bird pupil
 * - Floor line with floorboard seams and walking shadow dots
 * - Dual Mode: Page Not Found (404) OR No Internet Connection (Offline)
 */
export default function NotFoundPage({ forceOffline, onRetry }: NotFoundPageProps) {
  const navigate = useNavigate();
  const [isOffline, setIsOffline] = useState(forceOffline || !navigator.onLine);
  const [isRetrying, setIsRetrying] = useState(false);

  // Mouse tracking state for magnifying glass inspection
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [mousePos, setMousePos] = useState({ x: 580, y: 390 });

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

  // Mouse movement handler
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Constrain lens movement to inspection area around 404
    const clampedX = Math.max(380, Math.min(760, x));
    const clampedY = Math.max(260, Math.min(480, y));

    setMousePos({ x: clampedX, y: clampedY });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        setMousePos({ x: 620, y: 385 });
      }}
      className="min-h-screen w-full bg-[#FBF7F0] text-[#141010] font-['Onest',sans-serif] flex flex-col justify-between items-center select-none overflow-hidden relative"
      style={{
        backgroundImage: `radial-gradient(circle at 50% 30%, #FFFDF9 0%, #FAF5EC 65%, #F4ECE0 100%)`,
      }}
    >
      {/* Top Branding / Status Pill */}
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

      {/* Main Content Area */}
      <div className="w-full flex-1 flex flex-col items-center justify-between max-w-4xl px-4 pt-8 sm:pt-12 relative z-10">
        {/* Headings & Action Button */}
        <div className="text-center flex flex-col items-center animate-in fade-in slide-in-from-top-4 duration-500">
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
            ILLUSTRATION STAGE: 404 Numbers + Bird + Magnifying Glass + Floor
        =============================================================== */}
        <div className="w-full flex items-end justify-center mt-auto relative pt-4 overflow-visible">
          <svg
            viewBox="0 0 860 440"
            className="w-full max-w-[760px] md:max-w-[820px] h-auto overflow-visible"
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
                <stop offset="40%" stopColor="#FFF7E6" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#E6D3B3" stopOpacity="0.3" />
              </linearGradient>

              {/* Clip Path for the Magnifying Glass Lens */}
              <clipPath id="lensClip">
                <circle cx={mousePos.x} cy={mousePos.y} r="58" />
              </clipPath>
            </defs>

            {/* -----------------------------------------------------------
                FLOOR SEAMS & GROUND
            ------------------------------------------------------------ */}
            <g opacity="0.6">
              {/* Floor seam vertical tick lines */}
              <line x1="80" y1="390" x2="80" y2="440" stroke="#E5D9C8" strokeWidth="1.2" />
              <line x1="220" y1="390" x2="220" y2="440" stroke="#E5D9C8" strokeWidth="1.2" />
              <line x1="360" y1="390" x2="360" y2="440" stroke="#E5D9C8" strokeWidth="1.2" />
              <line x1="500" y1="390" x2="500" y2="440" stroke="#E5D9C8" strokeWidth="1.2" />
              <line x1="640" y1="390" x2="640" y2="440" stroke="#E5D9C8" strokeWidth="1.2" />
              <line x1="780" y1="390" x2="780" y2="440" stroke="#E5D9C8" strokeWidth="1.2" />
            </g>

            {/* Ground Baseline */}
            <line
              x1="20"
              y1="390"
              x2="840"
              y2="390"
              stroke="#E2D4BF"
              strokeWidth="2"
            />

            {/* Walking Shadow Dots on Ground */}
            <g fill="#A89A88" opacity="0.45">
              <circle cx="160" cy="392" r="3.2" />
              <circle cx="260" cy="392" r="3.2" />
              <circle cx="310" cy="392" r="3.2" />
              <circle cx="360" cy="392" r="3.2" />
              <circle cx="410" cy="392" r="3.2" />
            </g>

            {/* -----------------------------------------------------------
                MASSIVE SOFT 404 NUMBERS
            ------------------------------------------------------------ */}
            <g fill="#EAD7B0" opacity="0.95" className="select-none font-black">
              {/* First '4' */}
              <text
                x="60"
                y="370"
                fontSize="270"
                fontWeight="900"
                fontFamily="system-ui, -apple-system, sans-serif"
                letterSpacing="-0.04em"
              >
                4
              </text>

              {/* Middle '0' */}
              <text
                x="305"
                y="370"
                fontSize="270"
                fontWeight="900"
                fontFamily="system-ui, -apple-system, sans-serif"
                letterSpacing="-0.04em"
              >
                0
              </text>

              {/* Last '4' */}
              <text
                x="560"
                y="370"
                fontSize="270"
                fontWeight="900"
                fontFamily="system-ui, -apple-system, sans-serif"
                letterSpacing="-0.04em"
              >
                4
              </text>
            </g>

            {/* -----------------------------------------------------------
                BIRD SHADOW ON FLOOR
            ------------------------------------------------------------ */}
            <ellipse cx="465" cy="392" rx="36" ry="6.5" fill="#D8C7B0" />

            {/* -----------------------------------------------------------
                CUTE BIRD CHARACTER
            ------------------------------------------------------------ */}
            <g id="bird-character">
              {/* Bird Legs & Feet */}
              <g stroke="#261A16" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
                {/* Back Leg */}
                <path d="M 452 355 L 452 384 L 444 388 M 452 384 L 452 389 M 452 384 L 459 388" />
                {/* Front Leg */}
                <path d="M 468 355 L 468 385 L 460 389 M 468 385 L 469 390 M 468 385 L 476 389" />
              </g>

              {/* Tail Feathers at back */}
              <path
                d="M 416 324 L 382 305 L 396 328 L 380 348 L 420 340 Z"
                fill="#241714"
              />

              {/* Red Comb / Tufts on Head */}
              <g fill="#D84234">
                <path d="M 448 248 Q 450 230 458 234 Q 456 248 454 256 Z" />
                <path d="M 458 244 Q 465 224 474 230 Q 470 246 466 254 Z" />
                <path d="M 470 245 Q 482 228 488 236 Q 482 250 476 256 Z" />
              </g>

              {/* Main Bird Body (Chubby Round Sphere) */}
              <ellipse
                cx="460"
                cy="312"
                rx="54"
                ry="52"
                fill="#251815"
              />

              {/* Polka Dots on Belly / Chest */}
              <g fill="#D84234" opacity="0.95">
                <circle cx="430" cy="315" r="3.2" />
                <circle cx="442" cy="330" r="3.2" />
                <circle cx="432" cy="342" r="3.2" />
                <circle cx="448" cy="350" r="3.2" />
                <circle cx="462" cy="344" r="3.2" />
                <circle cx="474" cy="348" r="3.2" />
              </g>

              {/* Cute Curved Smile / Cheek Line */}
              <path
                d="M 466 324 Q 478 335 492 322"
                stroke="#FFFFFF"
                strokeWidth="3.2"
                strokeLinecap="round"
                fill="none"
              />

              {/* Large Eye White */}
              <circle cx="494" cy="285" r="14" fill="#FFFFFF" />

              {/* Eye Pupil smoothly following magnifying glass */}
              {(() => {
                const dx = mousePos.x - 494;
                const dy = mousePos.y - 285;
                const dist = Math.hypot(dx, dy);
                const maxOffset = 5.5;
                const ox = dist > 0 ? (dx / dist) * Math.min(maxOffset, dist / 40) : 3;
                const oy = dist > 0 ? (dy / dist) * Math.min(maxOffset, dist / 40) : 0;
                return (
                  <circle
                    cx={494 + ox}
                    cy={285 + oy}
                    r="6.5"
                    fill="#141010"
                    className="transition-all duration-75"
                  />
                );
              })()}

              {/* Catchlight in Eye */}
              <circle cx="497" cy="282" r="2" fill="#FFFFFF" />

              {/* Cute Orange Beak */}
              <path
                d="M 506 288 L 532 297 L 506 304 Z"
                fill="#F39C12"
              />

              {/* Bird Hand / Arm holding the handle */}
              <path
                d="M 480 326 Q 512 326 534 322"
                stroke="#251815"
                strokeWidth="11"
                strokeLinecap="round"
                fill="none"
              />
            </g>

            {/* -----------------------------------------------------------
                MAGNIFYING GLASS HANDLE & STEM
            ------------------------------------------------------------ */}
            {/* Handle extends from bird's hand (around 525, 322) to lens center */}
            {(() => {
              const handleStartX = 515;
              const handleStartY = 324;
              // Handle attaches to lens outer rim
              const angle = Math.atan2(handleStartY - mousePos.y, handleStartX - mousePos.x);
              const rimAttachX = mousePos.x + Math.cos(angle) * 58;
              const rimAttachY = mousePos.y + Math.sin(angle) * 58;

              return (
                <g>
                  {/* Outer Thick Dark Handle */}
                  <line
                    x1={handleStartX}
                    y1={handleStartY}
                    x2={rimAttachX}
                    y2={rimAttachY}
                    stroke="#221512"
                    strokeWidth="12"
                    strokeLinecap="round"
                  />
                  {/* Inner Handle Grip Accent */}
                  <line
                    x1={handleStartX + 4}
                    y1={handleStartY - 1}
                    x2={rimAttachX}
                    y2={rimAttachY}
                    stroke="#382622"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                </g>
              );
            })()}

            {/* -----------------------------------------------------------
                MAGNIFYING GLASS LENS & MAGNIFIED CONTENT
            ------------------------------------------------------------ */}
            <g
              className="cursor-pointer"
              onClick={() => navigate("/")}
            >
              <title>Click to go Home</title>
              {/* Magnified Area (Clipped inside Lens Circle) */}
              <g clipPath="url(#lensClip)">
                {/* Magnified Background Tile & Grid */}
                <rect
                  x={mousePos.x - 70}
                  y={mousePos.y - 70}
                  width="140"
                  height="140"
                  fill="#FFF8EC"
                />

                {/* Magnified 404 Digit Fragment behind */}
                <g fill="#DDBB7D" opacity="0.95" fontWeight="900">
                  <text
                    x={mousePos.x - 45}
                    y={mousePos.y + 35}
                    fontSize="135"
                    fontFamily="system-ui, -apple-system, sans-serif"
                  >
                    4
                  </text>
                </g>

                {/* Magnified Floor Line Seams inside Lens */}
                <line
                  x1={mousePos.x - 60}
                  y1={mousePos.y + 15}
                  x2={mousePos.x + 60}
                  y2={mousePos.y + 15}
                  stroke="#D3BEA2"
                  strokeWidth="1.8"
                />

                {/* Red "HOME" Secret Stamp discovered inside the lens */}
                <g
                  transform={`translate(${mousePos.x - 28}, ${mousePos.y - 8})`}
                  className="transition-transform duration-150"
                >
                  <text
                    x="0"
                    y="0"
                    fill="#C0382B"
                    fontSize="17"
                    fontWeight="800"
                    letterSpacing="0.08em"
                    fontFamily="system-ui, sans-serif"
                    opacity="0.85"
                  >
                    {isOffline ? "RETRY" : "HOME"}
                  </text>
                </g>

                {/* Glass Glare Sheen Reflection */}
                <rect
                  x={mousePos.x - 65}
                  y={mousePos.y - 65}
                  width="130"
                  height="130"
                  fill="url(#lensGlassGradient)"
                />

                {/* Curved Glass Highlight Arc */}
                <path
                  d={`M ${mousePos.x - 40} ${mousePos.y - 32} A 48 48 0 0 1 ${mousePos.x + 32} ${mousePos.y - 40}`}
                  stroke="#FFFFFF"
                  strokeWidth="4"
                  strokeLinecap="round"
                  opacity="0.75"
                  fill="none"
                />
              </g>

              {/* Lens Outer Heavy Dark Rim */}
              <circle
                cx={mousePos.x}
                cy={mousePos.y}
                r="58"
                stroke="#221512"
                strokeWidth="10"
                fill="none"
              />

              {/* Lens Inner Glass Lip */}
              <circle
                cx={mousePos.x}
                cy={mousePos.y}
                r="53"
                stroke="#543C36"
                strokeWidth="1.8"
                fill="none"
                opacity="0.6"
              />
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
