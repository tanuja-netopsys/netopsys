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

  // Bird Autonomous Patrol & Movement State (Completely self-animating)
  const [birdX, setBirdX] = useState(480);
  const [direction, setDirection] = useState<1 | -1>(1); // 1 = walking right, -1 = walking left
  const [isWalking, setIsWalking] = useState(true);
  const [stepPhase, setStepPhase] = useState(0);
  const pauseTimerRef = useRef<number>(0);

  // Mouse Cursor Tracking (for aiming the magnifying glass and bird gaze)
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const mousePosRef = useRef<{ x: number; y: number } | null>(null);

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

  // Track cursor position mapped to SVG coordinate space (0..860, 0..440)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const svgX = ((e.clientX - rect.left) / rect.width) * 860;
      const svgY = ((e.clientY - rect.top) / rect.height) * 440;
      const pos = { x: svgX, y: svgY };
      mousePosRef.current = pos;
      setMousePos(pos);
    };

    const handleMouseLeave = () => {
      mousePosRef.current = null;
      setMousePos(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

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

  // Continuous animation loop:
  // - When cursor is active, bird waddles along floor line following cursor X
  // - When idle/no cursor, bird gently patrols back and forth autonomously
  useEffect(() => {
    let animId: number;
    const minX = 160;
    const maxX = 700;

    const step = () => {
      const mouse = mousePosRef.current;

      if (mouse) {
        // Cursor-directed movement along the floor line
        const targetX = Math.max(minX, Math.min(maxX, mouse.x));
        setBirdX((currentX) => {
          const diff = targetX - currentX;
          const dist = Math.abs(diff);

          if (dist > 8) {
            setIsWalking(true);
            setStepPhase((p) => p + 0.18);
            const speed = Math.min(dist * 0.08 + 1.2, 4.0);
            const nextX = currentX + Math.sign(diff) * speed;
            return Math.max(minX, Math.min(maxX, nextX));
          } else {
            setIsWalking(false);
            return currentX;
          }
        });
      } else {
        // Autonomous patrol when no mouse interaction
        if (pauseTimerRef.current > 0) {
          pauseTimerRef.current -= 1;
          setIsWalking(false);
        } else {
          setIsWalking(true);
          setStepPhase((p) => p + 0.16);
          setBirdX((currentX) => {
            let nextX = currentX + direction * 1.35;
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

  // Calculate body bob and leg angles from walking stepPhase
  const bodyBob = isWalking ? Math.sin(stepPhase * 2) * 2.5 : 0;
  const legAngle1 = isWalking ? Math.sin(stepPhase) * 20 : 0;
  const legAngle2 = isWalking ? Math.sin(stepPhase + Math.PI) * 20 : 0;

  // The character faces whichever direction the cursor is in!
  // If cursor is to the right of bird -> face right; to the left -> face left.
  const facingDirection: 1 | -1 = mousePos
    ? mousePos.x >= birdX
      ? 1
      : -1
    : direction;

  // Calculate wide-arc angle for magnifying glass aiming towards cursor
  // Supports more than semi-circle sweep (> 180°):
  // From pointing high up/overhead (-135°) through forward (0°) to pointing down (+90°)
  let glassTilt = 0;
  if (mousePos) {
    const shoulderGlobalX = birdX + facingDirection * 22;
    const shoulderGlobalY = 316 + bodyBob; // 58 (bird group translate) + 258 (shoulder) + bodyBob

    const dx = mousePos.x - shoulderGlobalX;
    const dy = mousePos.y - shoulderGlobalY;

    // Convert into bird's local coordinate system (scaled by facingDirection)
    const localDx = dx * facingDirection;
    const localDy = dy;

    // Angle in degrees: 0° forward, -90° straight up, +90° straight down
    const rawAngle = (Math.atan2(localDy, localDx) * 180) / Math.PI;

    // Sweep arc exceeds a semi-circle (total range: -135° to +90° = 225°)
    glassTilt = Math.max(-135, Math.min(90, rawAngle));
  }

  // Eye pupil offset dynamically tracks cursor direction
  let pupilDx = 0;
  let pupilDy = 0;
  if (mousePos) {
    const shoulderGlobalX = birdX + facingDirection * 22;
    const shoulderGlobalY = 316 + bodyBob;
    const dx = (mousePos.x - shoulderGlobalX) * facingDirection;
    const dy = mousePos.y - shoulderGlobalY;
    const dist = Math.hypot(dx, dy) || 1;
    pupilDx = (dx / dist) * 5;
    pupilDy = (dy / dist) * 5;
  }

  return (
    <div
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
            ref={svgRef}
            viewBox="0 0 860 440"
            className="w-full max-w-[740px] md:max-w-[800px] h-auto overflow-visible select-none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Ultra-Realistic Glass Lens Sheen Gradient (100% transparent center, subtle rim refraction) */}
              <linearGradient
                id="lensGlassGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.32" />
                <stop offset="35%" stopColor="#FFFBF2" stopOpacity="0.06" />
                <stop offset="70%" stopColor="#F5E8D0" stopOpacity="0.10" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.22" />
              </linearGradient>
            </defs>

            {/* -----------------------------------------------------------
                FLOOR SEAMS & GROUND LINE (Lowered position)
            ------------------------------------------------------------ */}
            <g opacity="0.6">
              <line x1="80" y1="370" x2="80" y2="435" stroke="#E5D9C8" strokeWidth="1.2" />
              <line x1="220" y1="370" x2="220" y2="435" stroke="#E5D9C8" strokeWidth="1.2" />
              <line x1="360" y1="370" x2="360" y2="435" stroke="#E5D9C8" strokeWidth="1.2" />
              <line x1="500" y1="370" x2="500" y2="435" stroke="#E5D9C8" strokeWidth="1.2" />
              <line x1="640" y1="370" x2="640" y2="435" stroke="#E5D9C8" strokeWidth="1.2" />
              <line x1="780" y1="370" x2="780" y2="435" stroke="#E5D9C8" strokeWidth="1.2" />
            </g>

            {/* Main Ground Line (Lowered for clear vertical breathing room) */}
            <line
              x1="20"
              y1="370"
              x2="840"
              y2="370"
              stroke="#E2D4BF"
              strokeWidth="2.2"
            />

            {/* Walking Shadow Dots across the patrol floor line */}
            <g fill="#A89A88" opacity="0.4">
              <circle cx="160" cy="372" r="3" />
              <circle cx="260" cy="372" r="3" />
              <circle cx="360" cy="372" r="3" />
              <circle cx="460" cy="372" r="3" />
              <circle cx="560" cy="372" r="3" />
              <circle cx="660" cy="372" r="3" />
              <circle cx="760" cy="372" r="3" />
            </g>

            {/* -----------------------------------------------------------
                MASSIVE SOFT 404 NUMBERS (Maintained at exact original position)
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
                SINGLE UNIFIED BIRD + MAGNIFYING GLASS CHARACTER UNIT
                - Patrols autonomously along the floor line (y = 370)
                - Turns and points magnifying glass in cursor direction
                - Transparent glass reveals background numbers & floor naturally
            ------------------------------------------------------------ */}
            <g transform={`translate(${birdX}, 58)`}>
              {/* Dynamic Ground Ellipse Shadow directly under feet on the floor */}
              <ellipse
                cx="0"
                cy="312"
                rx={isWalking ? 34 : 38}
                ry="6"
                fill="#D8C7B0"
                opacity="0.8"
              />

              {/* Flip character orientation to face cursor direction */}
              <g transform={`scale(${facingDirection}, 1)`}>
                {/* 1. Bird Legs & Feet with Walking Waddle Rotation */}
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

                  {/* Dynamic Eye Pupil - naturally tracks cursor */}
                  <circle cx={40 + pupilDx} cy={220 + pupilDy} r="6" fill="#141010" />

                  {/* Eye Catchlight */}
                  <circle cx={42 + pupilDx} cy={218 + pupilDy} r="2" fill="#FFFFFF" />

                  {/* Cute Orange Beak */}
                  <path d="M 46 222 L 72 230 L 46 237 Z" fill="#F39C12" />

                  {/* 3. Magnifying Glass & Arm (Aims towards cursor tilt) */}
                  <g
                    transform={`rotate(${glassTilt}, 22, 258)`}
                    className="cursor-pointer"
                    onClick={() => navigate("/")}
                  >
                    {/* Bird Hand / Arm holding the handle */}
                    <path
                      d="M 22 258 Q 44 260 62 252"
                      stroke="#251815"
                      strokeWidth="11"
                      strokeLinecap="round"
                      fill="none"
                    />

                    {/* Magnifying Glass Holding Handle (Increased length & elevated height) */}
                    <line
                      x1="52"
                      y1="254"
                      x2="110"
                      y2="240"
                      stroke="#221512"
                      strokeWidth="9"
                      strokeLinecap="round"
                    />
                    <line
                      x1="55"
                      y1="253"
                      x2="108"
                      y2="240"
                      stroke="#382622"
                      strokeWidth="3.4"
                      strokeLinecap="round"
                    />

                    {/* Fully Transparent Glass Lens - Slightly decreased to balanced size */}
                    <circle
                      cx="152"
                      cy="230"
                      r="45"
                      fill="url(#lensGlassGradient)"
                    />

                    {/* Outer Heavy Dark Lens Rim */}
                    <circle
                      cx="152"
                      cy="230"
                      r="47.5"
                      stroke="#221512"
                      strokeWidth="8.5"
                      fill="none"
                    />

                    {/* Inner Glass Bezel Lip */}
                    <circle
                      cx="152"
                      cy="230"
                      r="42.5"
                      stroke="#543C36"
                      strokeWidth="1.6"
                      fill="none"
                      opacity="0.6"
                    />

                    {/* Primary Specular Glint Highlight (Gloss Reflection) */}
                    <path
                      d="M 126 208 A 35 35 0 0 1 178 204"
                      stroke="#FFFFFF"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                      opacity="0.8"
                      fill="none"
                    />

                    {/* Secondary Subtle Bottom Lens Rim Glare */}
                    <path
                      d="M 134 252 A 35 35 0 0 0 170 252"
                      stroke="#FFFFFF"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      opacity="0.4"
                      fill="none"
                    />
                  </g>
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
