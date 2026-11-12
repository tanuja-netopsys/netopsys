import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, Rocket } from "lucide-react";

interface LaunchingPageProps {
  /** Initial countdown duration in seconds (defaults to 30s -> 00 : 30) */
  initialSeconds?: number;
  /** Optional callback when launch sequence completes and opens the home page */
  onLaunch?: () => void;
}

type LaunchPhase =
  | "idle"
  | "igniting"
  | "liftoff"
  | "clouds"
  | "weAreLaunched"
  | "websiteLaunched";

// In-memory SPA guard: once launched, browser Back navigation cannot reopen LaunchingPage
let hasLaunchedInTab = false;

/** Pure-code Netopsys AI brand mark (no external image assets) */
function NetopsysBrandMark({ centered = false }: { centered?: boolean }) {
  return (
    <div
      className={`inline-flex items-center gap-2.5 select-none ${
        centered ? "justify-center" : ""
      }`}
    >
      <svg
        width="44"
        height="22"
        viewBox="0 0 44 22"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <circle cx="11" cy="11" r="9.5" fill="#FBAE42" fillOpacity="0.92" />
        <circle cx="22" cy="11" r="9.5" fill="#BE3093" fillOpacity="0.88" />
        <circle cx="33" cy="11" r="9.5" fill="#693092" fillOpacity="0.92" />
      </svg>
      <span className="text-[22px] sm:text-[25px] font-medium tracking-[-0.03em] text-[#141010] leading-none">
        netopsys
        <sup className="ml-0.5 text-[10px] font-bold tracking-normal text-[#5E2282] align-super">
          AI
        </sup>
      </span>
    </div>
  );
}

/** Pure SVG 3D-styled Rocket with animated ignition flames */
function PureCodeRocket({ isIgnited }: { isIgnited: boolean }) {
  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      <svg
        viewBox="0 0 220 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-[170px] sm:w-[210px] md:w-[235px] h-auto drop-shadow-[0_22px_35px_rgba(93,35,129,0.22)]"
      >
        <defs>
          <linearGradient id="rocketBodyGrad" x1="68" y1="30" x2="152" y2="205" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="55%" stopColor="#F5EEFC" />
            <stop offset="100%" stopColor="#D7C3EE" />
          </linearGradient>
          <linearGradient id="rocketNoseGrad" x1="88" y1="22" x2="132" y2="75" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#9333EA" />
            <stop offset="100%" stopColor="#5B21B6" />
          </linearGradient>
          <linearGradient id="rocketFinGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#4C1D95" />
          </linearGradient>
          <linearGradient id="windowRimGrad" x1="90" y1="88" x2="130" y2="128" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#C084FC" />
            <stop offset="100%" stopColor="#4C1D95" />
          </linearGradient>
          <radialGradient id="windowGlassGrad" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#64748B" />
            <stop offset="45%" stopColor="#1E1B4B" />
            <stop offset="100%" stopColor="#090514" />
          </radialGradient>
          <linearGradient id="flameOuterGrad" x1="110" y1="210" x2="110" y2="298" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="38%" stopColor="#FB923C" />
            <stop offset="75%" stopColor="#F97316" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#EC4899" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="flameInnerGrad" x1="110" y1="210" x2="110" y2="275" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="55%" stopColor="#FDE047" />
            <stop offset="100%" stopColor="#FB923C" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Exhaust Flames (visible when ignited) */}
        {isIgnited && (
          <motion.g
            initial={{ opacity: 0, scaleY: 0.35 }}
            animate={{
              opacity: [0.85, 1, 0.9, 1],
              scaleY: [0.92, 1.12, 0.98, 1.08],
              scaleX: [0.96, 1.05, 0.98, 1.03],
            }}
            transition={{ duration: 0.45, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: "110px 212px" }}
          >
            <path
              d="M90 212 C84 246, 94 278, 110 296 C126 278, 136 246, 130 212 Z"
              fill="url(#flameOuterGrad)"
            />
            <path
              d="M99 212 C96 236, 102 260, 110 272 C118 260, 124 236, 121 212 Z"
              fill="url(#flameInnerGrad)"
            />
          </motion.g>
        )}

        {/* Left Fin */}
        <path
          d="M72 152 C52 162, 43 188, 48 214 C56 205, 68 197, 78 194 Z"
          fill="url(#rocketFinGrad)"
        />
        {/* Right Fin */}
        <path
          d="M148 152 C168 162, 177 188, 172 214 C164 205, 152 197, 142 194 Z"
          fill="url(#rocketFinGrad)"
        />

        {/* Thruster Nozzle */}
        <path d="M88 196 L132 196 L124 214 L96 214 Z" fill="#4C1D95" />
        <ellipse cx="110" cy="214" rx="14" ry="3.5" fill="#2E1065" />

        {/* Main Rocket Fuselage */}
        <path
          d="M110 22 C136 52, 150 96, 148 148 C147 172, 140 190, 132 198 L88 198 C80 190, 73 172, 72 148 C70 96, 84 52, 110 22 Z"
          fill="url(#rocketBodyGrad)"
        />

        {/* Purple Nose Cone */}
        <path
          d="M110 22 C126 40, 135 58, 140 74 C121 80, 99 80, 80 74 C85 58, 94 40, 110 22 Z"
          fill="url(#rocketNoseGrad)"
        />

        {/* Center Fin / Stabilizer */}
        <path
          d="M110 166 C115 178, 116 196, 110 212 C104 196, 105 178, 110 166 Z"
          fill="#6D28D9"
        />

        {/* Porthole Window */}
        <circle cx="110" cy="112" r="23" fill="url(#windowRimGrad)" />
        <circle cx="110" cy="112" r="17.5" fill="url(#windowGlassGrad)" />
        {/* Glass Specular Highlight */}
        <ellipse
          cx="104"
          cy="105"
          rx="6"
          ry="3.5"
          transform="rotate(-28 104 105)"
          fill="#FFFFFF"
          fillOpacity="0.45"
        />
      </svg>
    </div>
  );
}

/** Volumetric 3D launchpad smoke & billowing exhaust plume (pure SVG/CSS, no images) */
function LaunchpadSmokePlume({
  phase,
}: {
  phase: LaunchPhase;
}) {
  const isIgnited = phase === "igniting" || phase === "liftoff" || phase === "clouds";
  const isLiftoff = phase === "liftoff" || phase === "clouds";

  // Sculpted 3D cloud puffs around the rocket base: [cx, cy, r, delay, driftX, driftY, layer]
  const basePuffs = [
    { cx: 65, cy: 132, r: 28, delay: 0.0, driftX: -26, driftY: -4, layer: "back" },
    { cx: 255, cy: 132, r: 28, delay: 0.1, driftX: 26, driftY: -4, layer: "back" },
    { cx: 105, cy: 122, r: 36, delay: 0.05, driftX: -18, driftY: -8, layer: "back" },
    { cx: 215, cy: 122, r: 36, delay: 0.15, driftX: 18, driftY: -8, layer: "back" },
    { cx: 160, cy: 116, r: 44, delay: 0.08, driftX: 0, driftY: -10, layer: "mid" },
    { cx: 42, cy: 140, r: 20, delay: 0.12, driftX: -34, driftY: 2, layer: "mid" },
    { cx: 278, cy: 140, r: 20, delay: 0.18, driftX: 34, driftY: 2, layer: "mid" },
    { cx: 90, cy: 136, r: 30, delay: 0.04, driftX: -22, driftY: -2, layer: "front" },
    { cx: 230, cy: 136, r: 30, delay: 0.14, driftX: 22, driftY: -2, layer: "front" },
    { cx: 132, cy: 134, r: 34, delay: 0.09, driftX: -10, driftY: -5, layer: "front" },
    { cx: 188, cy: 134, r: 34, delay: 0.11, driftX: 10, driftY: -5, layer: "front" },
    { cx: 160, cy: 136, r: 38, delay: 0.02, driftX: 0, driftY: -3, layer: "front" },
  ];

  // Dynamic billowing smoke particles emitted during ignition & liftoff
  const blastParticles = [
    { id: 1, startX: 152, startY: 112, endX: 48, endY: 132, r: 26, dur: 1.35, delay: 0.0 },
    { id: 2, startX: 168, startY: 112, endX: 272, endY: 132, r: 26, dur: 1.35, delay: 0.12 },
    { id: 3, startX: 156, startY: 116, endX: 82, endY: 104, r: 30, dur: 1.55, delay: 0.25 },
    { id: 4, startX: 164, startY: 116, endX: 238, endY: 104, r: 30, dur: 1.55, delay: 0.35 },
    { id: 5, startX: 160, startY: 118, endX: 122, endY: 88, r: 28, dur: 1.65, delay: 0.45 },
    { id: 6, startX: 160, startY: 118, endX: 198, endY: 88, r: 28, dur: 1.65, delay: 0.55 },
    { id: 7, startX: 155, startY: 122, endX: 24, endY: 142, r: 22, dur: 1.4, delay: 0.65 },
    { id: 8, startX: 165, startY: 122, endX: 296, endY: 142, r: 22, dur: 1.4, delay: 0.75 },
  ];

  return (
    <div
      className="pointer-events-none absolute -bottom-6 sm:-bottom-8 left-1/2 -translate-x-1/2 w-[310px] sm:w-[390px] md:w-[430px] z-20"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 320 175"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto overflow-visible"
      >
        <defs>
          {/* Organic turbulent smoke edge filter */}
          <filter id="smokeWispyFilter" x="-30%" y="-30%" width="160%" height="160%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.032"
              numOctaves="3"
              seed="7"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="9"
              xChannelSelector="R"
              yChannelSelector="G"
              result="displaced"
            />
            <feGaussianBlur in="displaced" stdDeviation="2.4" />
          </filter>

          {/* Soft ambient haze filter */}
          <filter id="smokeSoftHaze" x="-35%" y="-35%" width="170%" height="170%">
            <feGaussianBlur stdDeviation="8" />
          </filter>

          {/* Volumetric 3D puff gradients (sunlit top, cool lavender underside shadow) */}
          <radialGradient id="smokePuffFront" cx="42%" cy="28%" r="68%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="52%" stopColor="#F8F3FE" />
            <stop offset="82%" stopColor="#E6D7F8" />
            <stop offset="100%" stopColor="#CBB2EA" stopOpacity="0.95" />
          </radialGradient>

          <radialGradient id="smokePuffMid" cx="44%" cy="30%" r="68%">
            <stop offset="0%" stopColor="#FCF9FF" />
            <stop offset="55%" stopColor="#EFE4FB" />
            <stop offset="100%" stopColor="#C8AFE8" stopOpacity="0.88" />
          </radialGradient>

          <radialGradient id="smokePuffBack" cx="48%" cy="32%" r="70%">
            <stop offset="0%" stopColor="#F6EEFD" stopOpacity="0.92" />
            <stop offset="60%" stopColor="#E1CEF6" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#BFA1E3" stopOpacity="0.7" />
          </radialGradient>

          {/* Warm orange/gold firelight bounce inside the smoke */}
          <radialGradient id="fireBounceGlow" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.95" />
            <stop offset="35%" stopColor="#FDBA74" stopOpacity="0.72" />
            <stop offset="70%" stopColor="#F97316" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#C084FC" stopOpacity="0" />
          </radialGradient>

          {/* Ground contact shadow */}
          <radialGradient id="cloudContactShadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.22" />
            <stop offset="65%" stopColor="#A78BFA" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#A78BFA" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ground Ambient Shadow */}
        <ellipse
          cx="160"
          cy="154"
          rx={isIgnited ? 142 : 112}
          ry="16"
          fill="url(#cloudContactShadow)"
        />

        {/* Soft drifting outer vapor halo */}
        <motion.g
          filter="url(#smokeSoftHaze)"
          animate={{
            scale: isIgnited ? [1, 1.18, 1.24] : [1, 1.03, 1],
            opacity: isIgnited ? [0.65, 0.9, 0.85] : [0.5, 0.62, 0.5],
          }}
          transition={{
            duration: isIgnited ? 1.1 : 4.2,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
          style={{ transformOrigin: "160px 135px" }}
        >
          <ellipse cx="160" cy="134" rx="115" ry="34" fill="#E9D8FA" />
        </motion.g>

        {/* Turbulent billowing smoke layer (displaced edges for realistic cloud silhouette) */}
        <motion.g
          filter="url(#smokeWispyFilter)"
          animate={
            isIgnited
              ? { scale: [1, 1.22, 1.32], y: [0, -4, -2] }
              : { scale: [1, 1.025, 1], y: [0, -2, 0] }
          }
          transition={{
            duration: isIgnited ? 1.2 : 4.5,
            repeat: isIgnited ? 0 : Infinity,
            repeatType: "mirror",
            ease: "easeOut",
          }}
          style={{ transformOrigin: "160px 136px" }}
        >
          {basePuffs.map((puff, idx) => (
            <motion.circle
              key={`base-${idx}`}
              cx={puff.cx}
              cy={puff.cy}
              r={puff.r}
              fill={
                puff.layer === "front"
                  ? "url(#smokePuffFront)"
                  : puff.layer === "mid"
                  ? "url(#smokePuffMid)"
                  : "url(#smokePuffBack)"
              }
              animate={
                isIgnited
                  ? {
                      x: [0, puff.driftX * 0.65, puff.driftX],
                      y: [0, puff.driftY - 4, puff.driftY],
                      scale: [1, 1.18, 1.28],
                    }
                  : {
                      x: [0, puff.driftX * 0.08, 0],
                      y: [0, -3, 0],
                      scale: [1, 1.03, 1],
                    }
              }
              transition={{
                duration: isIgnited ? 1.25 : 3.6 + (idx % 3) * 0.5,
                delay: puff.delay,
                repeat: isIgnited ? 0 : Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
              }}
              style={{ transformOrigin: `${puff.cx}px ${puff.cy}px` }}
            />
          ))}
        </motion.g>

        {/* Continuous turbulent exhaust blast puffs when rocket ignites / lifts off */}
        {isIgnited && (
          <g filter="url(#smokeWispyFilter)">
            {blastParticles.map((p) => (
              <motion.circle
                key={`blast-${p.id}`}
                cx={p.startX}
                cy={p.startY}
                r={p.r}
                fill="url(#smokePuffFront)"
                initial={{ opacity: 0, scale: 0.45, x: 0, y: 0 }}
                animate={{
                  opacity: [0, 0.92, 0.7, 0],
                  scale: [0.45, 1.15, 1.55, 1.85],
                  x: p.endX - p.startX,
                  y: p.endY - p.startY,
                }}
                transition={{
                  duration: p.dur,
                  delay: p.delay,
                  repeat: Infinity,
                  ease: [0.16, 1, 0.3, 1],
                }}
                style={{ transformOrigin: `${p.startX}px ${p.startY}px` }}
              />
            ))}
          </g>
        )}

        {/* Vertical rising smoke column behind ascending rocket */}
        {isLiftoff && (
          <motion.g
            filter="url(#smokeWispyFilter)"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.2, 0.95, 0.75] }}
            transition={{ duration: 0.85, ease: "easeOut" }}
          >
            {[
              { cy: 96, r: 28, dx: -10, delay: 0 },
              { cy: 70, r: 26, dx: 12, delay: 0.08 },
              { cy: 42, r: 24, dx: -8, delay: 0.16 },
              { cy: 14, r: 22, dx: 9, delay: 0.24 },
              { cy: -16, r: 20, dx: -6, delay: 0.32 },
            ].map((trail, i) => (
              <motion.circle
                key={`trail-${i}`}
                cx={160 + trail.dx}
                cy={trail.cy}
                r={trail.r}
                fill="url(#smokePuffMid)"
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{
                  opacity: [0, 0.92, 0.55],
                  scale: [0.4, 1.25, 1.55],
                }}
                transition={{
                  duration: 1.1,
                  delay: trail.delay,
                  ease: "easeOut",
                }}
                style={{ transformOrigin: `${160 + trail.dx}px ${trail.cy}px` }}
              />
            ))}
          </motion.g>
        )}

        {/* Warm thruster firelight illuminating the inner smoke puffs */}
        {isIgnited && (
          <motion.ellipse
            cx="160"
            cy="118"
            rx="72"
            ry="34"
            fill="url(#fireBounceGlow)"
            animate={{
              opacity: [0.72, 1, 0.78, 0.96],
              scaleX: [0.95, 1.1, 0.98, 1.06],
              scaleY: [0.92, 1.08, 0.96, 1.05],
            }}
            transition={{ duration: 0.4, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: "160px 118px" }}
          />
        )}
      </svg>
    </div>
  );
}

/** Pure-CSS/SVG volumetric cloud bank rising across the bottom of the screen */
function FluffyCloudBank({ expanded }: { expanded: boolean }) {
  const backMounds = [
    { cx: 80, cy: 230, r: 125 },
    { cx: 260, cy: 215, r: 140 },
    { cx: 470, cy: 225, r: 130 },
    { cx: 690, cy: 205, r: 150 },
    { cx: 920, cy: 220, r: 135 },
    { cx: 1140, cy: 210, r: 145 },
    { cx: 1350, cy: 228, r: 130 },
  ];

  const frontPuffs = [
    { cx: 40, cy: 270, r: 110, drift: -6 },
    { cx: 190, cy: 255, r: 125, drift: 5 },
    { cx: 355, cy: 265, r: 115, drift: -5 },
    { cx: 525, cy: 245, r: 135, drift: 6 },
    { cx: 705, cy: 260, r: 120, drift: -4 },
    { cx: 885, cy: 248, r: 132, drift: 5 },
    { cx: 1065, cy: 262, r: 125, drift: -6 },
    { cx: 1245, cy: 250, r: 130, drift: 4 },
    { cx: 1400, cy: 268, r: 115, drift: -5 },
  ];

  return (
    <motion.div
      initial={false}
      animate={{
        y: expanded ? 0 : 140,
        scale: expanded ? 1.03 : 0.96,
        opacity: expanded ? 1 : 0,
      }}
      transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 bottom-0 h-[40vh] sm:h-[45vh] pointer-events-none z-20 overflow-hidden"
      aria-hidden="true"
    >
      {/* Back soft lavender-mist atmospheric gradient */}
      <div
        className="absolute inset-x-0 bottom-0 h-full"
        style={{
          background:
            "linear-gradient(to top, rgba(226,210,248,0.96) 0%, rgba(242,233,252,0.78) 48%, transparent 100%)",
        }}
      />

      <svg
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-x-0 bottom-0 w-full h-full"
      >
        <defs>
          <filter id="bankTurbulence" x="-10%" y="-20%" width="120%" height="140%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.014"
              numOctaves="3"
              seed="11"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="16"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>

          <radialGradient id="bankBackGrad" cx="48%" cy="25%" r="72%">
            <stop offset="0%" stopColor="#FAF6FF" stopOpacity="0.95" />
            <stop offset="55%" stopColor="#E9DAF9" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#CDB4EC" stopOpacity="0.85" />
          </radialGradient>

          <radialGradient id="bankFrontGrad" cx="44%" cy="26%" r="70%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="52%" stopColor="#F8F2FE" />
            <stop offset="84%" stopColor="#E5D4F7" />
            <stop offset="100%" stopColor="#CEB5EC" />
          </radialGradient>
        </defs>

        {/* Back layer */}
        <g filter="url(#bankTurbulence)" opacity="0.85">
          {backMounds.map((m, i) => (
            <circle key={`bm-${i}`} cx={m.cx} cy={m.cy} r={m.r} fill="url(#bankBackGrad)" />
          ))}
        </g>

        {/* Foreground sculpted volumetric cloud layer */}
        <g filter="url(#bankTurbulence)">
          {frontPuffs.map((p, i) => (
            <motion.circle
              key={`fp-${i}`}
              cx={p.cx}
              cy={p.cy}
              r={p.r}
              fill="url(#bankFrontGrad)"
              animate={
                expanded
                  ? {
                      y: [6, -6, 3],
                      x: [0, p.drift, 0],
                    }
                  : { y: 20, x: 0 }
              }
              transition={{
                duration: 4.2 + (i % 3) * 0.7,
                delay: i * 0.06,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
              }}
            />
          ))}
        </g>
      </svg>
    </motion.div>
  );
}

/** Celebration burst lines around Launched titles */
function CelebrationSparkTicks() {
  const ticks = [
    { x: -175, y: -38, rotate: -38, color: "#F97316" },
    { x: -195, y: 2, rotate: -10, color: "#6D28D9" },
    { x: -168, y: 36, rotate: 28, color: "#EC4899" },
    { x: 175, y: -38, rotate: 38, color: "#EC4899" },
    { x: 195, y: 2, rotate: 10, color: "#F97316" },
    { x: 168, y: 36, rotate: -28, color: "#6D28D9" },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      {ticks.map((tick, idx) => (
        <motion.span
          key={idx}
          initial={{ opacity: 0, scale: 0.4, x: tick.x * 0.5, y: tick.y * 0.5 }}
          animate={{ opacity: 1, scale: 1, x: tick.x, y: tick.y }}
          transition={{ duration: 0.5, delay: 0.12 + idx * 0.04, ease: [0.22, 1, 0.36, 1] }}
          style={{
            backgroundColor: tick.color,
            rotate: `${tick.rotate}deg`,
          }}
          className="hidden sm:block absolute w-4 h-1 rounded-full"
        />
      ))}
    </div>
  );
}

export default function LaunchingPage({ initialSeconds = 30, onLaunch }: LaunchingPageProps) {
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

  const [phase, setPhase] = useState<LaunchPhase>("idle");
  const [isExiting, setIsExiting] = useState(false);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    document.title = "Netopsys AI | Launching Soon";
  }, []);

  useEffect(() => {
    if (remainingSeconds <= 0 || phase !== "idle") return;
    const timer = window.setInterval(() => {
      setRemainingSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [remainingSeconds, phase]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
      timersRef.current = [];
    };
  }, []);

  const showMinutes = remainingSeconds >= 60;
  const minutesDisplay = String(Math.floor(remainingSeconds / 60)).padStart(2, "0");
  const secondsDisplay = String(remainingSeconds % 60).padStart(2, "0");

  const completeLaunchNavigation = useCallback(() => {
    hasLaunchedInTab = true;
    try {
      sessionStorage.setItem("netopsys_launch_confetti", "1");
    } catch {
      // ignore storage errors
    }
    if (onLaunch) {
      onLaunch();
    } else {
      navigate("/", { state: { celebrateLaunch: true }, replace: true });
    }
  }, [navigate, onLaunch]);

  const startLaunchSequence = useCallback(() => {
    if (phase !== "idle") return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      setPhase("websiteLaunched");
      timersRef.current.push(
        window.setTimeout(() => completeLaunchNavigation(), 900)
      );
      return;
    }

    setPhase("igniting");
    timersRef.current.push(
      window.setTimeout(() => setPhase("liftoff"), 650),
      window.setTimeout(() => setPhase("clouds"), 1500),
      window.setTimeout(() => setPhase("weAreLaunched"), 2850),
      window.setTimeout(() => setPhase("websiteLaunched"), 4650),
      window.setTimeout(() => setIsExiting(true), 6400),
      window.setTimeout(() => completeLaunchNavigation(), 7200)
    );
  }, [phase, completeLaunchNavigation]);

  useEffect(() => {
    if (remainingSeconds !== 0 || phase !== "idle") return;
    const autoLaunchTimer = window.setTimeout(() => {
      startLaunchSequence();
    }, 150);
    return () => window.clearTimeout(autoLaunchTimer);
  }, [remainingSeconds, phase, startLaunchSequence]);

  const isRocketScene =
    phase === "idle" || phase === "igniting" || phase === "liftoff" || phase === "clouds";
  const isIgnited = phase === "igniting" || phase === "liftoff" || phase === "clouds";
  const showCloudBank = phase === "igniting" || phase === "liftoff" || phase === "clouds" || phase === "weAreLaunched" || phase === "websiteLaunched";

  return (
    <div
      className="relative min-h-[100dvh] w-full overflow-hidden flex flex-col justify-between select-none"
      style={{
        fontFamily: "'Onest', sans-serif",
        background:
          "linear-gradient(125deg, #F6E9FA 0%, #FAF5FD 38%, #F4ECFB 68%, #EBD9FB 100%)",
      }}
    >
      {/* Soft Pastel Ambient Blobs */}
      <div
        className="pointer-events-none absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full opacity-55"
        style={{
          background:
            "radial-gradient(circle, rgba(244,114,182,0.28) 0%, rgba(192,132,252,0.16) 50%, transparent 72%)",
        }}
      />
      <div
        className="pointer-events-none absolute top-1/4 -right-28 w-[460px] h-[460px] rounded-full opacity-50"
        style={{
          background:
            "radial-gradient(circle, rgba(167,139,250,0.32) 0%, rgba(232,121,249,0.14) 55%, transparent 74%)",
        }}
      />

      {/* Subtle Orbital Rings */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
        <div className="w-[460px] h-[460px] sm:w-[620px] sm:h-[620px] rounded-full border border-[#C084FC]/20" />
        <div className="absolute w-[680px] h-[680px] sm:w-[880px] sm:h-[880px] rounded-full border border-[#C084FC]/12" />
      </div>

      {/* Top Bar: Logo shifts to center during Panels 5 & 6 */}
      <header className="relative z-30 w-full max-w-[1260px] mx-auto px-6 sm:px-10 md:px-14 pt-6 sm:pt-8">
        <div
          className={`flex items-center transition-all duration-700 ${
            isRocketScene ? "justify-start" : "justify-center"
          }`}
        >
          <NetopsysBrandMark centered={!isRocketScene} />
        </div>
      </header>

      {/* Main Stage */}
      <main className="relative z-30 flex-1 w-full max-w-[1260px] mx-auto px-6 sm:px-10 md:px-14 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {/* PANELS 1-4: Split Hero + Countdown + Rocket Launch */}
          {isRocketScene && (
            <motion.div
              key="rocket-stage"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } }}
              className="w-full grid grid-cols-1 lg:grid-cols-12 items-center gap-8 lg:gap-10 py-6"
            >
              {/* Left Column: Title lingers softly while lower controls dissolve into rising clouds */}
              <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
                <motion.h1
                  animate={
                    phase === "clouds"
                      ? { opacity: 0.2, y: -10, filter: "blur(1.5px)" }
                      : { opacity: 1, y: 0, filter: "blur(0px)" }
                  }
                  transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
                  className="font-bold tracking-[-0.03em] leading-[1.06] text-[2.35rem] sm:text-[3.35rem] md:text-[3.9rem] xl:text-[4.25rem] text-[#110C24] mb-4 sm:mb-5 will-change-transform"
                >
                  <span className="block">Netopsys AI is</span>
                  <span
                    className="block mt-1 bg-clip-text text-transparent"
                    style={{
                      backgroundImage:
                        "linear-gradient(90deg, #6D12F2 0%, #B824B2 48%, #F97316 100%)",
                    }}
                  >
                    Launching.
                  </span>
                </motion.h1>

                <motion.div
                  animate={
                    phase === "clouds"
                      ? { opacity: 0, y: 14 }
                      : { opacity: 1, y: 0 }
                  }
                  transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col items-center lg:items-start w-full will-change-transform"
                >
                  <p className="text-[#3C3154] text-sm sm:text-base md:text-[17.5px] leading-[1.58] max-w-[500px] mb-6 sm:mb-8">
                    AI-powered solutions to automate operations, boost productivity,
                    and drive smarter business growth.
                  </p>

                  <div className="w-full max-w-[340px] flex flex-col items-center">
                    <div className="w-full flex items-center gap-3 mb-4">
                      <div className="flex-1 h-[1px] bg-[#B48CE2]/60" />
                      <span className="text-[11px] font-bold tracking-[0.14em] text-[#281448] uppercase whitespace-nowrap">
                        Our Website Launches In
                      </span>
                      <div className="flex-1 h-[1px] bg-[#B48CE2]/60" />
                    </div>

                    {/* Countdown Cards */}
                    <div className="flex items-center justify-center gap-3.5 sm:gap-4 mb-5">
                      {showMinutes && (
                        <>
                          <div className="w-[116px] sm:w-[132px] py-3.5 px-3 rounded-[18px] bg-white/95 border border-[#C7A1F5]/55 shadow-[0_12px_28px_rgba(124,58,237,0.12)] flex flex-col items-center">
                            <span className="text-[2rem] sm:text-[2.4rem] font-extrabold leading-none text-[#240F46] tabular-nums">
                              {minutesDisplay}
                            </span>
                            <span className="mt-2 text-[10px] font-bold tracking-[0.2em] text-[#29154A] uppercase">
                              MINUTES
                            </span>
                          </div>
                          <span className="text-2xl font-extrabold text-[#2A144D] pb-1">:</span>
                        </>
                      )}

                      <div className="w-[116px] sm:w-[132px] py-3.5 px-3 rounded-[18px] bg-white/95 border border-[#C7A1F5]/55 shadow-[0_12px_28px_rgba(124,58,237,0.12)] flex flex-col items-center">
                        <span className="text-[2rem] sm:text-[2.4rem] font-extrabold leading-none text-[#240F46] tabular-nums">
                          {secondsDisplay}
                        </span>
                        <span className="mt-2 text-[10px] font-bold tracking-[0.2em] text-[#29154A] uppercase">
                          SECONDS
                        </span>
                      </div>
                    </div>

                    {/* Launch / Launching... Pill Button */}
                    <button
                      type="button"
                      disabled={phase !== "idle"}
                      onClick={startLaunchSequence}
                      className={`inline-flex items-center justify-center gap-2.5 px-9 py-3.5 rounded-full text-white font-semibold text-sm sm:text-[15px] tracking-wide border border-white/40 transition-all duration-300 ${
                        phase === "idle"
                          ? "shadow-[0_14px_34px_rgba(179,36,181,0.32)] hover:shadow-[0_18px_40px_rgba(116,40,232,0.4)] hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
                          : "opacity-80 shadow-[0_8px_20px_rgba(116,40,232,0.2)] cursor-default"
                      }`}
                      style={{
                        background:
                          phase === "idle"
                            ? "linear-gradient(90deg, #7428E8 0%, #B324B5 52%, #EA267A 100%)"
                            : "linear-gradient(90deg, #8B7BB8 0%, #A185BD 100%)",
                      }}
                    >
                      {phase === "idle" ? (
                        <>
                          <Rocket className="w-4 h-4 stroke-[2.2]" />
                          <span>Launch</span>
                        </>
                      ) : (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Launching...</span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              </div>

              {/* Right Column: Pure Code Rocket + Base Cloud */}
              <div className="lg:col-span-5 relative flex items-center justify-center min-h-[260px] sm:min-h-[340px]">
                {/* Orbital Ring behind rocket */}
                <div className="pointer-events-none absolute w-[260px] h-[260px] sm:w-[330px] sm:h-[330px] rounded-full border border-[#B48CE2]/35" />

                {/* Continuous Silky-Smooth Rocket Launch Motion */}
                <motion.div
                  initial={{ y: 0, x: 0, scale: 1, opacity: 1 }}
                  animate={
                    phase === "idle"
                      ? { y: [0, -8, 0], x: 0, scale: 1, opacity: 1 }
                      : phase === "igniting"
                      ? {
                          y: [0, -1.5, 0.5, -1, 0],
                          x: [-0.8, 0.8, -0.5, 0.5, 0],
                          scale: 1.015,
                          opacity: 1,
                        }
                      : {
                          y: [0, -130, -350, -720],
                          x: 0,
                          scale: [1.015, 0.9, 0.72, 0.52],
                          opacity: [1, 1, 0.95, 0],
                        }
                  }
                  transition={
                    phase === "idle"
                      ? { duration: 3.4, repeat: Infinity, ease: "easeInOut" }
                      : phase === "igniting"
                      ? { duration: 0.18, repeat: Infinity, ease: "linear" }
                      : {
                          duration: 2.15,
                          times: [0, 0.34, 0.68, 1],
                          ease: [0.36, 0, 0.66, 1],
                        }
                  }
                  className="relative z-10 will-change-transform"
                >
                  <PureCodeRocket isIgnited={isIgnited} />
                </motion.div>

                {/* Volumetric 3D Launchpad Smoke & Exhaust Plume */}
                <LaunchpadSmokePlume phase={phase} />
              </div>
            </motion.div>
          )}

          {/* PANEL 5: "We Are Launched!" */}
          {phase === "weAreLaunched" && (
            <motion.div
              key="we-are-launched"
              initial={{ opacity: 0, y: 18, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -14, scale: 0.97 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex flex-col items-center text-center py-12 mb-16"
            >
              <CelebrationSparkTicks />
              <h2 className="text-4xl sm:text-6xl font-bold tracking-[-0.03em] leading-[1.08] text-[#110C24]">
                <span className="block">We Are</span>
                <span
                  className="block mt-1 bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, #6D12F2 0%, #C026D3 52%, #F97316 100%)",
                  }}
                >
                  Launched!
                </span>
              </h2>
              <p className="mt-4 text-base sm:text-lg text-[#3C3154] font-medium">
                Our website is now live.
              </p>
            </motion.div>
          )}

          {/* PANEL 6: "Website Launched!" -> smooth automatic transition to Home */}
          {phase === "websiteLaunched" && (
            <motion.div
              key="website-launched"
              initial={{ opacity: 0, y: 18, scale: 0.95 }}
              animate={
                isExiting
                  ? { opacity: 0, y: -10, scale: 1.03 }
                  : { opacity: 1, y: 0, scale: 1 }
              }
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex flex-col items-center text-center py-12 mb-16"
            >
              <CelebrationSparkTicks />

              {/* Checkmark Badge */}
              <motion.div
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 280, damping: 18 }}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-white shadow-[0_12px_30px_rgba(124,58,237,0.3)] mb-5"
                style={{
                  background: "linear-gradient(135deg, #A855F7 0%, #6D28D9 100%)",
                }}
              >
                <Check className="w-7 h-7 stroke-[2.8]" />
              </motion.div>

              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-[-0.03em] leading-[1.1] text-[#110C24]">
                Website{" "}
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, #6D12F2 0%, #C026D3 55%, #F97316 100%)",
                  }}
                >
                  Launched!
                </span>
              </h2>

              <p className="mt-3.5 text-base sm:text-lg text-[#3C3154] font-medium">
                Ready to Witness Innovation?
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Cloud Bank rising on Launch */}
      <FluffyCloudBank expanded={showCloudBank} />

      {/* Smooth luminous veil matching HeroLaunchReveal for seamless transition to Home */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isExiting ? 1 : 0 }}
        transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-0 z-50 pointer-events-none bg-[#FAF7FC]"
        aria-hidden="true"
      />
    </div>
  );
}
