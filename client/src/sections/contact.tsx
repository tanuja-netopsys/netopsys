import { useState, useEffect, useRef, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion";
import { ArrowRight, X, ChevronDown, CheckCircle2, Sparkles, AlertCircle } from "lucide-react";
import { preloadRecaptcha, executeRecaptcha } from "../utils/recaptcha.ts";
import { toast } from "../componenets/toast.tsx";

// ============================================================================
// 1. CRISP VECTOR COUNTRY FLAGS (Renders true visual flags on Windows/all OS)
// ============================================================================
function SingaporeFlag({ className = "w-9 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 36 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`rounded-[3px] shadow-xs border border-black/10 overflow-hidden flex-shrink-0 ${className}`}
    >
      <rect width="36" height="12" fill="#ED2939" />
      <rect y="12" width="36" height="12" fill="#FFFFFF" />
      <g transform="translate(7.5, 6)">
        <path
          d="M 0 -4.2 A 4.2 4.2 0 1 0 0 4.2 A 3.3 3.3 0 1 1 0 -4.2 Z"
          fill="#FFFFFF"
        />
        <circle cx="2.6" cy="-2.5" r="0.65" fill="#FFFFFF" />
        <circle cx="4.6" cy="-0.8" r="0.65" fill="#FFFFFF" />
        <circle cx="3.8" cy="2" r="0.65" fill="#FFFFFF" />
        <circle cx="1.4" cy="2" r="0.65" fill="#FFFFFF" />
        <circle cx="0.6" cy="-0.8" r="0.65" fill="#FFFFFF" />
      </g>
    </svg>
  );
}

function IndiaFlag({ className = "w-9 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 36 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`rounded-[3px] shadow-xs border border-black/10 overflow-hidden flex-shrink-0 ${className}`}
    >
      <rect width="36" height="8" fill="#FF9933" />
      <rect y="8" width="36" height="8" fill="#FFFFFF" />
      <rect y="16" width="36" height="8" fill="#138808" />
      <g transform="translate(18, 12)">
        <circle r="3.2" stroke="#000080" strokeWidth="0.65" fill="none" />
        <circle r="0.8" fill="#000080" />
        {[...Array(12)].map((_, i) => (
          <line
            key={i}
            x1="-3"
            y1="0"
            x2="3"
            y2="0"
            stroke="#000080"
            strokeWidth="0.35"
            transform={`rotate(${i * 15})`}
          />
        ))}
      </g>
    </svg>
  );
}

function USAFlag({ className = "w-9 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 36 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`rounded-[3px] shadow-xs border border-black/10 overflow-hidden flex-shrink-0 ${className}`}
    >
      <rect width="36" height="24" fill="#B22234" />
      <rect y="1.846" width="36" height="1.846" fill="#FFFFFF" />
      <rect y="5.538" width="36" height="1.846" fill="#FFFFFF" />
      <rect y="9.231" width="36" height="1.846" fill="#FFFFFF" />
      <rect y="12.923" width="36" height="1.846" fill="#FFFFFF" />
      <rect y="16.615" width="36" height="1.846" fill="#FFFFFF" />
      <rect y="20.308" width="36" height="1.846" fill="#FFFFFF" />
      <rect width="14.4" height="12.923" fill="#3C3B6E" />
      <g fill="#FFFFFF">
        <circle cx="2.4" cy="2.2" r="0.6" />
        <circle cx="4.8" cy="2.2" r="0.6" />
        <circle cx="7.2" cy="2.2" r="0.6" />
        <circle cx="9.6" cy="2.2" r="0.6" />
        <circle cx="12.0" cy="2.2" r="0.6" />

        <circle cx="3.6" cy="4.3" r="0.6" />
        <circle cx="6.0" cy="4.3" r="0.6" />
        <circle cx="8.4" cy="4.3" r="0.6" />
        <circle cx="10.8" cy="4.3" r="0.6" />

        <circle cx="2.4" cy="6.4" r="0.6" />
        <circle cx="4.8" cy="6.4" r="0.6" />
        <circle cx="7.2" cy="6.4" r="0.6" />
        <circle cx="9.6" cy="6.4" r="0.6" />
        <circle cx="12.0" cy="6.4" r="0.6" />

        <circle cx="3.6" cy="8.5" r="0.6" />
        <circle cx="6.0" cy="8.5" r="0.6" />
        <circle cx="8.4" cy="8.5" r="0.6" />
        <circle cx="10.8" cy="8.5" r="0.6" />

        <circle cx="2.4" cy="10.6" r="0.6" />
        <circle cx="4.8" cy="10.6" r="0.6" />
        <circle cx="7.2" cy="10.6" r="0.6" />
        <circle cx="9.6" cy="10.6" r="0.6" />
        <circle cx="12.0" cy="10.6" r="0.6" />
      </g>
    </svg>
  );
}

// ============================================================================
// 2. GLOBAL OFFICES DATA (Exact order and details from screenshot)
// ============================================================================
interface Office {
  id: string;
  country: string;
  flagComponent: React.ComponentType<{ className?: string }>;
  type: string;
  status: string;
  addressLines: string[];
}

const GLOBAL_OFFICES: Office[] = [
  {
    id: "india",
    country: "India",
    flagComponent: IndiaFlag,
    type: "Development Center",
    status: "Operational",
    addressLines: ["Hyderabad", "Visakhapatnam"],
  },
  {
    id: "singapore",
    country: "Singapore",
    flagComponent: SingaporeFlag,
    type: "Asia-Pacific Headquarters",
    status: "Operational",
    addressLines: [
      "10 Ubi Crescent, #03-52 Ubi Techpark",
      "Lobby C, Singapore 408564",
    ],
  },
  {
    id: "usa",
    country: "United States",
    flagComponent: USAFlag,
    type: "US Office",
    status: "Operational",
    addressLines: [
      "9907 Valley Ranch Pkwy E, Suite 3005,",
      "Irving, TX 75063",
    ],
  },
];

export const SERVICES_LIST = [
  "Custom Software Development",
  "Web & Mobile Applications",
  "Websites",
  "Networking",
  "Security",
  "Cloud Solutions",
  "VoIP Solutions",
  "Backup & Recovery",
  "IT Support",
];

// ============================================================================
// 3. LETTER FOLDING & MAILBOX DELIVERY ANIMATION (As in reference reel)
// ============================================================================
export function MailboxDeliveryAnimation({
  senderName,
  senderEmail,
  serviceName,
  messagePreview,
  onComplete,
}: {
  senderName: string;
  senderEmail?: string;
  serviceName?: string;
  messagePreview?: string;
  onComplete: () => void;
}) {
  const [phase, setPhase] = useState<"folding" | "sealing" | "opening" | "flying" | "sealed">("folding");
  const containerRef = useRef<HTMLDivElement>(null);
  const [flightDistance, setFlightDistance] = useState(165);

  useEffect(() => {
    const calcDistance = () => {
      if (containerRef.current) {
        const w = containerRef.current.offsetWidth;
        // Mailbox is positioned at right edge (right: 16px to 32px)
        // Letter starts centered (x = w / 2)
        // Travel distance from middle to mailbox slot:
        const dist = Math.max(105, Math.min(235, Math.round(w / 2 - 70)));
        setFlightDistance(dist);
      }
    };
    calcDistance();
    window.addEventListener("resize", calcDistance);
    return () => window.removeEventListener("resize", calcDistance);
  }, []);

  useEffect(() => {
    // Phase 1: 0ms - 700ms: Form paper folds into envelope pocket
    // Phase 2: 700ms - 1200ms: Triangular flap folds down over center & wax seal stamps
    const sealTimer = setTimeout(() => {
      setPhase("sealing");
    }, 700);

    // Phase 3: 1200ms - 1500ms: Mailbox door on right side swings open
    const openTimer = setTimeout(() => {
      setPhase("opening");
    }, 1200);

    // Phase 4: 1500ms - 2350ms: Sealed envelope glides from middle into right-side mailbox
    const flightTimer = setTimeout(() => {
      setPhase("flying");
    }, 1500);

    // Phase 5: 2350ms - 3000ms: Letter enters, door slams shut with bounce, flag pops up!
    const finishDeliveryTimer = setTimeout(() => {
      setPhase("sealed");
    }, 2350);

    // 3050ms: Complete and trigger Thank You & Done screen
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 3050);

    return () => {
      clearTimeout(sealTimer);
      clearTimeout(openTimer);
      clearTimeout(flightTimer);
      clearTimeout(finishDeliveryTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      ref={containerRef}
      className="py-6 sm:py-8 flex flex-col items-center justify-center min-h-[380px] sm:min-h-[420px] w-full relative overflow-hidden select-none"
      style={{ perspective: 1200 }}
    >
      {/* Background ambient lighting */}
      <div className="absolute w-72 h-72 rounded-full bg-[#693092]/10 blur-3xl pointer-events-none" />

      {/* Progress status caption */}
      <motion.p
        key={phase}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xs sm:text-[13px] font-semibold tracking-wider text-[#693092] uppercase mb-6 sm:mb-8 text-center"
      >
        {phase === "folding" && "Folding inquiry into letter..."}
        {phase === "sealing" && "Sealing envelope with wax seal..."}
        {(phase === "opening" || phase === "flying") && "Mailing letter into mailbox..."}
        {phase === "sealed" && "Inquiry Safely Delivered!"}
      </motion.p>

      {/* Animation Stage: Middle = Letter / Envelope, Right = Mailbox */}
      <div className="relative w-full h-64 sm:h-72 flex items-center justify-center">

        {/* ======================================================== */}
        {/* 1. THE FOLDING LETTER & WHITE ENVELOPE (Starts in Middle) */}
        {/* ======================================================== */}
        <motion.div
          initial={{ x: 0, y: 0, scale: 1, rotate: 0, rotateY: 0, opacity: 1 }}
          animate={
            phase === "flying"
              ? {
                  x: [0, flightDistance * 0.45, flightDistance],
                  y: [0, -52, -10],
                  scale: [1, 0.72, 0.22],
                  rotate: [0, -6, 14],
                  rotateY: [0, -15, -35],
                  opacity: [1, 1, 0.95, 0],
                  transition: { duration: 0.82, ease: "easeInOut" },
                }
              : phase === "sealed"
              ? { opacity: 0, scale: 0.2 }
              : { x: 0, y: 0, scale: 1, rotate: 0, rotateY: 0, opacity: 1 }
          }
          className="absolute z-20 w-48 sm:w-52 h-32 sm:h-36 pointer-events-none origin-center"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Envelope Main Shell (White Paper Envelope matching reference photo) */}
          <div className="relative w-full h-full bg-white rounded-md border border-gray-200/90 shadow-xl overflow-hidden">

            {/* Inner Form Paper (Folds down into the envelope pocket) */}
            <motion.div
              initial={{ y: -24, scaleY: 1, opacity: 1 }}
              animate={
                phase === "folding"
                  ? { y: [-24, 0], scaleY: [1, 0.75], opacity: [1, 0.7] }
                  : { y: 0, scaleY: 0.7, opacity: 0.5 }
              }
              transition={{ duration: 0.65, ease: "easeInOut" }}
              className="absolute inset-x-3 top-2 bg-[#FAF7FD] border border-[#693092]/20 rounded-xs p-2 z-0 origin-bottom"
            >
              <div className="flex items-center justify-between pb-1 mb-1 border-b border-[#693092]/15">
                <span className="text-[7.5px] font-bold text-[#693092] tracking-wider uppercase">
                  Netopsys Inquiry
                </span>
                <div className="flex items-center space-x-0.5">
                  <span className="w-1 h-1 rounded-full bg-[#FBAE42]" />
                  <span className="w-1 h-1 rounded-full bg-[#BE3093]" />
                  <span className="w-1 h-1 rounded-full bg-[#693092]" />
                </div>
              </div>
              <p className="text-[8px] font-semibold text-[#141010] truncate">
                {senderName || "Enterprise Client"}
              </p>
              <p className="text-[7px] text-[#736B7E] truncate">
                {senderEmail ? `${senderEmail} • ` : ""}{serviceName || "Solutions"}
              </p>
              {messagePreview && (
                <p className="text-[6.5px] text-[#8C8398] truncate italic">
                  "{messagePreview}"
                </p>
              )}
              <div className="mt-1 space-y-0.5">
                <div className="h-[2px] w-3/4 bg-[#693092]/20 rounded-full" />
                <div className="h-[2px] w-1/2 bg-[#693092]/15 rounded-full" />
              </div>
            </motion.div>

            {/* Envelope Paper Seams (SVG Triangles creating exact diagonal creases from reference image) */}
            <svg
              viewBox="0 0 200 135"
              className="absolute inset-0 w-full h-full z-10 pointer-events-none"
              preserveAspectRatio="none"
            >
              {/* Left Side Fold */}
              <polygon
                points="0,0 100,72 0,135"
                fill="#F8F9FA"
                stroke="#E5E7EB"
                strokeWidth="0.8"
              />
              {/* Right Side Fold */}
              <polygon
                points="200,0 100,72 200,135"
                fill="#F3F4F6"
                stroke="#E5E7EB"
                strokeWidth="0.8"
              />
              {/* Bottom Fold Triangle (Pointing Up towards center) */}
              <polygon
                points="0,135 100,72 200,135"
                fill="#FFFFFF"
                stroke="#E2E8F0"
                strokeWidth="1"
              />
            </svg>

            {/* Top Triangular Flap (Folds DOWN over center to seal the envelope shut) */}
            <motion.div
              initial={{ rotateX: 175 }}
              animate={
                phase === "folding"
                  ? { rotateX: 175 }
                  : { rotateX: 0 }
              }
              transition={{ duration: 0.48, ease: "easeInOut" }}
              className="absolute top-0 left-0 right-0 h-[56%] z-20 origin-top"
              style={{ transformStyle: "preserve-3d" }}
            >
              <svg
                viewBox="0 0 200 76"
                className="w-full h-full drop-shadow-sm"
                preserveAspectRatio="none"
              >
                <polygon
                  points="0,0 100,74 200,0"
                  fill="#FFFFFF"
                  stroke="#D1D5DB"
                  strokeWidth="1"
                />
              </svg>
            </motion.div>

            {/* Wax Seal (Stamps onto the triangular flap point when sealed) */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={
                phase === "folding"
                  ? { scale: 0, opacity: 0 }
                  : { scale: 1, opacity: 1 }
              }
              transition={{ type: "spring", stiffness: 350, damping: 14, delay: 0.15 }}
              className="absolute top-[50%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 w-7 h-7 rounded-full bg-gradient-to-br from-[#BE3093] to-[#693092] border-2 border-white/80 shadow-md flex items-center justify-center text-white text-[9px] font-bold"
            >
              <span>✓</span>
            </motion.div>
          </div>
        </motion.div>

        {/* ======================================================== */}
        {/* 2. THE POSTAL MAILBOX (Positioned on the RIGHT SIDE)     */}
        {/* ======================================================== */}
        <div className="absolute right-2 sm:right-6 bottom-1 sm:bottom-2 w-36 sm:w-40 flex flex-col items-center z-10 pointer-events-none">

          {/* Mailbox Chamber / Hood */}
          <div className="relative w-32 sm:w-36 h-26 sm:h-28 bg-gradient-to-br from-[#2D1B4E] via-[#1A0E2E] to-[#0D0618] rounded-t-[42px] rounded-b-xl border-2 border-[#693092]/60 shadow-2xl flex flex-col items-center pt-2.5 overflow-hidden">
            
            {/* Top metallic curvature sheen */}
            <div className="absolute top-0 inset-x-0 h-6 rounded-t-[40px] bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />

            {/* Front Mail Slot Opening */}
            <div className="relative w-24 sm:w-28 h-8 sm:h-9 bg-[#05020A] rounded-t-[20px] rounded-b-sm border border-[#693092]/40 shadow-inner flex items-center justify-center overflow-hidden">
              {/* Mailbox Door (Hinged at bottom, swings open during delivery, slams shut with bounce) */}
              <motion.div
                initial={{ rotateX: 0 }}
                animate={
                  phase === "folding" || phase === "sealing"
                    ? { rotateX: 0 }
                    : phase === "opening" || phase === "flying"
                    ? { rotateX: 72 }
                    : { rotateX: [72, -14, 6, -2, 0] }
                }
                transition={
                  phase === "sealed"
                    ? { duration: 0.45, ease: "easeInOut" }
                    : { duration: 0.25, ease: "easeOut" }
                }
                className="w-full h-full bg-gradient-to-b from-[#382657] to-[#1D1231] rounded-xs flex items-center justify-center origin-bottom border-b border-[#693092]/50 shadow-md"
              >
                {/* Silver Handle on Door */}
                <div className="w-6 h-1 bg-white/40 rounded-full" />
              </motion.div>
            </div>

            {/* Mailbox Brand Emblem: 3 brand dots + NETOPSYS text */}
            <div className="mt-3 flex flex-col items-center gap-1">
              <div className="flex items-center -space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FBAE42]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#BE3093]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#693092]" />
              </div>
              <span className="text-[9px] font-bold tracking-widest text-white/90 uppercase font-sans">
                NETOPSYS
              </span>
            </div>

            {/* Delivery Success Status Light */}
            <motion.div
              animate={
                phase === "sealed"
                  ? {
                      backgroundColor: "#10B981",
                      boxShadow: "0 0 14px #10B981",
                      scale: [1, 1.3, 1],
                    }
                  : {
                      backgroundColor: "#BE3093",
                      boxShadow: "0 0 4px #BE3093",
                    }
              }
              transition={{ duration: 0.3 }}
              className="w-2 h-2 rounded-full mt-2"
            />
          </div>

          {/* Postal Flag on the Right Side of Mailbox (Springs UP when delivered) */}
          <motion.div
            initial={{ rotate: 0 }}
            animate={phase === "sealed" ? { rotate: -90 } : { rotate: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 10 }}
            className="absolute -right-3 top-7 origin-bottom-left flex items-center z-20"
          >
            {/* Flag arm & pennant */}
            <div className="w-8 h-2 bg-[#EF4444] rounded-xs shadow-md border border-black/20 flex items-center justify-end pr-0.5">
              <div className="w-3.5 h-4.5 bg-[#DC2626] rounded-xs -mt-2.5 shadow-xs border border-white/20" />
            </div>
          </motion.div>

          {/* Mailbox Stand & Base */}
          <div className="w-3.5 h-16 sm:h-20 bg-gradient-to-b from-[#180F2A] via-[#10091C] to-[#0A0512] border-x border-[#693092]/30" />
          <div className="w-18 h-2 bg-[#0E0717] rounded-full shadow-md border border-[#693092]/30" />
        </div>

        {/* Celebratory sparkles when deposited */}
        {phase === "sealed" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 10 }}
            animate={{ opacity: 1, scale: 1.25, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 12 }}
            className="absolute right-8 sm:right-12 top-4 flex items-center gap-2 text-[#10B981] pointer-events-none z-30"
          >
            <Sparkles className="w-7 h-7 animate-pulse text-[#10B981]" />
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// 3. MAIN CONTACT SECTION COMPONENT
// ============================================================================
export default function Contact() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    company: "",
    service: "",
    message: "",
  });

  const [submissionStage, setSubmissionStage] = useState<"form" | "delivering" | "success">("form");
  const [isServiceSelectOpen, setIsServiceSelectOpen] = useState(false);
  const [captchaError, setCaptchaError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Preload Google reCAPTCHA v3 when the contact modal opens
  useEffect(() => {
    if (isModalOpen) {
      preloadRecaptcha();
    }
  }, [isModalOpen]);

  // Scroll animation setup for card fan & separation effect (3-col desktop lg+ only)
  const sectionRef = useRef<HTMLElement>(null);
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 1024 : true
  );
  const [isTabletOrUp, setIsTabletOrUp] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 768 : true
  );

  useEffect(() => {
    const checkViewport = () => {
      setIsDesktop(window.innerWidth >= 1024);
      setIsTabletOrUp(window.innerWidth >= 768);
    };
    checkViewport();
    window.addEventListener("resize", checkViewport);
    return () => window.removeEventListener("resize", checkViewport);
  }, []);

  // Track scroll position: starts fanned when section enters viewport,
  // and finishes completely back to original positions by the time the section is in full view
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "start 10%"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 26,
    restDelta: 0.001,
  });

  const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

  // Left Card (India): starts shifted behind the middle card, tilted counter-clockwise and down
  const leftCardX = useTransform(smoothProgress, (raw) => {
    const v = clamp01(raw);
    return isDesktop ? `${(1 - v) * 75}%` : "0%";
  });
  const leftCardRotate = useTransform(smoothProgress, (raw) => {
    const v = clamp01(raw);
    return isDesktop ? (1 - v) * -8 : 0;
  });
  const leftCardY = useTransform(smoothProgress, (raw) => {
    const v = clamp01(raw);
    return isTabletOrUp ? (1 - v) * 52 : 0;
  });

  // Middle Card (Singapore): elevated on top in the center, straight
  const midCardY = useTransform(smoothProgress, (raw) => {
    const v = clamp01(raw);
    return isTabletOrUp ? (1 - v) * -18 : 0;
  });
  const midCardScale = useTransform(smoothProgress, (raw) => {
    const v = clamp01(raw);
    return isTabletOrUp ? 1 + (1 - v) * 0.03 : 1;
  });

  // Right Card (United States): starts shifted behind the middle card, tilted clockwise and down
  const rightCardX = useTransform(smoothProgress, (raw) => {
    const v = clamp01(raw);
    return isDesktop ? `${(1 - v) * -75}%` : "0%";
  });
  const rightCardRotate = useTransform(smoothProgress, (raw) => {
    const v = clamp01(raw);
    return isDesktop ? (1 - v) * 8 : 0;
  });
  const rightCardY = useTransform(smoothProgress, (raw) => {
    const v = clamp01(raw);
    return isTabletOrUp ? (1 - v) * 52 : 0;
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setCaptchaError("");

    if (!formData.service) {
      setIsServiceSelectOpen(true);
      toast.warning("Please select a service before submitting.", { title: "Service Required" });
      return;
    }

    setIsSubmitting(true);

    try {
      const captchaToken = await executeRecaptcha("contact_form_submit");

      const response = await fetch("/api/contact/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          captchaToken,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "reCAPTCHA verification failed. Please try again.");
      }

      // Persist to localStorage
      try {
        const existing = JSON.parse(localStorage.getItem("netopsys_inquiries") || "[]");
        existing.unshift({
          id: data.submissionId || Date.now(),
          ...formData,
          createdAt: new Date().toISOString(),
        });
        localStorage.setItem("netopsys_inquiries", JSON.stringify(existing));
      } catch {
        // ignore storage error
      }

      setSubmissionStage("delivering");
      toast.success("Thank you! Your message has been sent successfully.", {
        title: "Message Sent",
      });
    } catch (err: unknown) {
      const error = err as Error;
      const msg = error.message || "Security verification failed. Please try again.";
      setCaptchaError(msg);
      toast.error(msg, { title: "Submission Failed" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      company: "",
      service: "",
      message: "",
    });
    setCaptchaError("");
    setSubmissionStage("form");
    setIsModalOpen(false);
    setIsServiceSelectOpen(false);
  };

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="contact-section-wrap relative w-full min-h-[100dvh] flex flex-col justify-center bg-[#F5EEF8] text-[#141010] px-4 sm:px-6 md:px-8 lg:px-10 xl:px-14 2xl:px-18 select-none overflow-x-clip scroll-mt-0"
    >
      {/* Subtle ambient glows */}
      <div className="absolute top-1/4 -right-48 w-96 h-96 rounded-full bg-[#BE3093]/5 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/3 -left-48 w-96 h-96 rounded-full bg-[#693092]/5 blur-[140px] pointer-events-none" />

      {/* Main Container - Full expanded width matching all remaining sections */}
      <div className="contact-content-wrap relative w-full max-w-[2100px] mx-auto flex flex-col justify-center my-auto w-full">
        {/* Header Section */}
        <div className="contact-header max-w-3xl mb-8 sm:mb-10 lg:mb-8 xl:mb-10 text-left">
          {/* Eyebrow Badge: Button Design matching remaining sections */}
          <div className="contact-eyebrow-wrap mb-3 sm:mb-4 lg:mb-3 xl:mb-3.5">
            <div className="contact-eyebrow-text inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white border border-[#693092]/20 text-[#693092] text-xs sm:text-[13px] font-semibold tracking-wide shadow-sm select-none cursor-default">
              <span>Global Presence</span>
              <div className="w-4 h-4 rounded-full bg-[#693092] text-white flex items-center justify-center">
                <ArrowRight className="w-2.5 h-2.5 stroke-[2.5]" />
              </div>
            </div>
          </div>

          {/* Large Display Title: Identical font style to remaining sections */}
          <h2 className="contact-title text-4xl sm:text-5xl md:text-6xl lg:text-[4.75rem] font-light tracking-[-0.035em] leading-[1.04] text-[#141010] mb-3.5 sm:mb-4 lg:mb-3 xl:mb-4">
            <span className="block">Ready to Transform</span>
            <span className="block">Your Business?</span>
          </h2>

          {/* Subtitle: Matches hero subtitle size */}
          <p className="contact-desc text-[#554E62] text-sm sm:text-base md:text-[16px] lg:text-[14.5px] xl:text-[15px] 2xl:text-[17px] leading-relaxed font-normal max-w-xl">
            Connect with Netopsys across our global offices and discover how AI-powered solutions can revolutionize your enterprise.
          </p>
        </div>

        {/* 3 Global Offices Cards Grid with Scroll-driven separation effect */}
        <div className="contact-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7 xl:gap-8 items-stretch mb-8 sm:mb-10 lg:mb-8 xl:mb-10 w-full">
          {GLOBAL_OFFICES.map((office, idx) => {
            const cardMotionStyle =
              idx === 0
                ? { x: leftCardX, rotate: leftCardRotate, y: leftCardY, zIndex: 10 }
                : idx === 1
                ? { y: midCardY, scale: midCardScale, zIndex: 20 }
                : { x: rightCardX, rotate: rightCardRotate, y: rightCardY, zIndex: 10 };

            return (
              <motion.div
                key={office.id}
                style={cardMotionStyle}
                className={`contact-card relative bg-white rounded-[22px] p-6 sm:p-7 lg:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-black/[0.04] flex flex-col justify-between hover:shadow-lg hover:shadow-purple-900/[0.04] transition-shadow duration-300 text-left h-auto min-w-0 break-words ${
                  idx === 1 ? "shadow-xl" : ""
                }`}
              >
                <div className="flex flex-col justify-between h-full w-full">
                  <div>
                    {/* Top Row: Flag on left, Operational Badge on right */}
                    <div className="contact-card-top flex items-center justify-between mb-4 sm:mb-5 lg:mb-4 xl:mb-5">
                      <office.flagComponent className="contact-flag w-9 h-6 sm:w-10 sm:h-6.5" />
                      <div className="contact-status-badge inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDE4F7] text-[#693092]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#693092]" />
                        <span className="text-xs font-semibold tracking-tight">
                          {office.status}
                        </span>
                      </div>
                    </div>

                    {/* Country Title */}
                    <h3 className="contact-country text-2xl sm:text-[26px] lg:text-[28px] font-bold text-[#141010] tracking-tight mb-1">
                      {office.country}
                    </h3>

                    {/* Office Sub-label */}
                    <p className="contact-office-type text-xs sm:text-sm md:text-[14.5px] text-[#736B7E] font-normal">
                      {office.type}
                    </p>
                  </div>

                  <div className="mt-4 sm:mt-5 lg:mt-4 xl:mt-5">
                    {/* Horizontal Divider Line */}
                    <div className="contact-divider w-full h-px bg-[#F0EBF5] mb-4 sm:mb-5 lg:mb-3.5 xl:mb-4" />

                    {/* Address Lines */}
                    <div className="contact-address text-xs sm:text-sm md:text-[14.5px] text-[#4A4553] font-normal leading-relaxed space-y-1">
                      {office.addressLines.map((line, aIdx) => (
                        <p key={aIdx} className="block">
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Centered CTA Button: "Let's Connect" */}
        <div className="contact-cta flex justify-center mt-5 sm:mt-6 lg:mt-7 xl:mt-8">
          <Link
            to="/contact"
            className="contact-cta-btn hover-brand-gradient inline-flex items-center justify-center bg-[#652297] text-white font-medium text-xs sm:text-sm md:text-base px-8 sm:px-10 py-3.5 sm:py-4 rounded-full shadow-md cursor-pointer"
          >
            Let's Connect
          </Link>
        </div>
      </div>

      {/* Interactive Contact / Let's Connect Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
            style={{ perspective: 1400 }}
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Card with 3D Paper Unfolding / Uncrumpling Animation */}
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.22,
                rotateX: 42,
                rotateY: -22,
                rotateZ: -5,
                y: 35,
                transformOrigin: "center center",
              }}
              animate={{
                opacity: 1,
                scale: 1,
                rotateX: 0,
                rotateY: 0,
                rotateZ: 0,
                y: 0,
                transition: {
                  type: "spring",
                  stiffness: 220,
                  damping: 18,
                  mass: 0.85,
                },
              }}
              exit={{
                opacity: 0,
                scale: 0.22,
                rotateX: 38,
                rotateY: -16,
                rotateZ: -4,
                y: 20,
                transition: { duration: 0.24, ease: "easeInOut" },
              }}
              style={{ transformStyle: "preserve-3d" }}
              className="relative w-full max-w-xl sm:max-w-2xl bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 shadow-2xl z-10 max-h-[88dvh] overflow-y-auto text-left"
            >
              {/* Paper Creases Overlay (Simulates paper uncreasing/flattening out on open) */}
              <motion.div
                initial={{ opacity: 0.7 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 0.52, ease: "easeOut" }}
                className="absolute inset-0 pointer-events-none z-30 overflow-hidden rounded-2xl sm:rounded-3xl"
              >
                {/* Horizontal Fold Crease 1 */}
                <div className="absolute top-1/3 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#693092]/25 to-transparent" />
                <div className="absolute top-1/3 left-0 right-0 -mt-2 h-4 bg-gradient-to-b from-black/[0.04] to-transparent pointer-events-none" />

                {/* Horizontal Fold Crease 2 */}
                <div className="absolute top-2/3 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#693092]/25 to-transparent" />
                <div className="absolute top-2/3 left-0 right-0 -mt-2 h-4 bg-gradient-to-b from-black/[0.04] to-transparent pointer-events-none" />

                {/* Diagonal Crumple Facet Line */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.45),transparent_60%)]" />
                <div className="absolute -inset-x-10 top-1/2 h-[1px] rotate-[-14deg] bg-gradient-to-r from-transparent via-[#693092]/20 to-transparent" />
              </motion.div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors cursor-pointer z-40"
              >
                <X className="w-4 h-4" />
              </button>

              <AnimatePresence mode="wait">
                {submissionStage === "form" && (
                  <motion.form
                    key="modal-form"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92, y: -10 }}
                    transition={{ duration: 0.28 }}
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-4 sm:gap-5"
                  >
                    <div>
                      <span className="text-xs font-semibold text-[#693092] uppercase tracking-wider">
                        Let's Connect
                      </span>
                      <h3 className="text-2xl sm:text-3xl font-bold text-[#141010] tracking-tight mt-1 mb-2">
                        Let's Transform Your Business
                      </h3>
                      <p className="text-xs sm:text-sm text-[#554E62]">
                        Fill out the details below and our enterprise solutions team will connect with you.
                      </p>
                    </div>

                    {/* Row 1: Full name + Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col">
                        <label
                          htmlFor="modalFullName"
                          className="text-xs sm:text-[13px] text-[#141010] font-medium mb-1.5"
                        >
                          Full Name *
                        </label>
                        <input
                          id="modalFullName"
                          type="text"
                          required
                          value={formData.fullName}
                          onChange={(e) =>
                            setFormData({ ...formData, fullName: e.target.value })
                          }
                          className="w-full bg-[#F5EEF8] rounded-xl h-11 px-3.5 text-xs sm:text-sm text-[#141010] border border-transparent focus:border-[#693092]/30 focus:bg-white focus:outline-none transition-all"
                        />
                      </div>

                      <div className="flex flex-col">
                        <label
                          htmlFor="modalEmail"
                          className="text-xs sm:text-[13px] text-[#141010] font-medium mb-1.5"
                        >
                          Email *
                        </label>
                        <input
                          id="modalEmail"
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          className="w-full bg-[#F5EEF8] rounded-xl h-11 px-3.5 text-xs sm:text-sm text-[#141010] border border-transparent focus:border-[#693092]/30 focus:bg-white focus:outline-none transition-all"
                        />
                      </div>
                    </div>

                    {/* Row 2: Phone + Company */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col">
                        <label
                          htmlFor="modalPhone"
                          className="text-xs sm:text-[13px] text-[#141010] font-medium mb-1.5"
                        >
                          Phone *
                        </label>
                        <input
                          id="modalPhone"
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          className="w-full bg-[#F5EEF8] rounded-xl h-11 px-3.5 text-xs sm:text-sm text-[#141010] border border-transparent focus:border-[#693092]/30 focus:bg-white focus:outline-none transition-all"
                        />
                      </div>

                      <div className="flex flex-col">
                        <label
                          htmlFor="modalCompany"
                          className="text-xs sm:text-[13px] text-[#141010] font-medium mb-1.5 flex items-center justify-between"
                        >
                          <span>Company</span>
                          <span className="text-[11px] text-[#736B7E] font-normal">Optional</span>
                        </label>
                        <input
                          id="modalCompany"
                          type="text"
                          value={formData.company}
                          onChange={(e) =>
                            setFormData({ ...formData, company: e.target.value })
                          }
                          className="w-full bg-[#F5EEF8] rounded-xl h-11 px-3.5 text-xs sm:text-sm text-[#141010] border border-transparent focus:border-[#693092]/30 focus:bg-white focus:outline-none transition-all"
                        />
                      </div>
                    </div>

                    {/* Row 3: Service Selection Dropdown */}
                    <div className="relative flex flex-col">
                      <label
                        htmlFor="modalService"
                        className="text-xs sm:text-[13px] text-[#141010] font-medium mb-1.5 flex items-center justify-between"
                      >
                        <span>Service *</span>
                        {!formData.service && isServiceSelectOpen && (
                          <span className="text-[11px] text-[#BE3093] font-normal">
                            Please select a service
                          </span>
                        )}
                      </label>
                      <button
                        id="modalService"
                        type="button"
                        onClick={() => {
                          setIsServiceSelectOpen(!isServiceSelectOpen);
                        }}
                        className={`w-full bg-[#F5EEF8] rounded-xl h-11 px-3.5 flex items-center justify-between text-xs sm:text-sm text-left border transition-all cursor-pointer ${
                          !formData.service && isServiceSelectOpen
                            ? "border-[#BE3093]/60 focus:border-[#BE3093]"
                            : "border-transparent focus:border-[#693092]/30"
                        }`}
                      >
                        <span
                          className={
                            formData.service ? "text-[#141010]" : "text-[#554E62]"
                          }
                        >
                          {formData.service || "Select a service"}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 text-[#141010] transition-transform duration-200 ${
                            isServiceSelectOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {/* Hidden input to ensure native HTML5 form validity check */}
                      <input
                        tabIndex={-1}
                        aria-hidden="true"
                        className="sr-only"
                        required
                        value={formData.service}
                        onChange={() => {}}
                      />

                      <AnimatePresence>
                        {isServiceSelectOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.15 }}
                            className="absolute top-full left-0 right-0 z-30 mt-1 bg-white border border-[#693092]/15 rounded-xl shadow-lg py-1.5 max-h-52 overflow-y-auto"
                          >
                            {SERVICES_LIST.map((srv, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  setFormData({ ...formData, service: srv });
                                  setIsServiceSelectOpen(false);
                                }}
                                className="w-full text-left px-4 py-2 text-xs sm:text-sm text-[#141010] hover:bg-[#F5EEF8] hover:text-[#693092] transition-colors"
                              >
                                {srv}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Row 5: Message (Optional) */}
                    <div className="flex flex-col">
                      <label
                        htmlFor="modalMessage"
                        className="text-xs sm:text-[13px] text-[#141010] font-medium mb-1.5 flex items-center justify-between"
                      >
                        <span>Message</span>
                        <span className="text-[11px] text-[#736B7E] font-normal">Optional</span>
                      </label>
                      <textarea
                        id="modalMessage"
                        rows={4}
                        value={formData.message}
                        onChange={(e) =>
                          setFormData({ ...formData, message: e.target.value })
                        }
                        className="w-full bg-[#F5EEF8] rounded-xl p-3.5 text-xs sm:text-sm text-[#141010] border border-transparent focus:border-[#693092]/30 focus:bg-white focus:outline-none transition-all resize-none"
                      />
                    </div>

                    {/* Google reCAPTCHA v3 Error Display */}
                    {captchaError && (
                      <div className="mt-1 text-xs text-red-600 font-medium flex items-center justify-center gap-1.5 text-center">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{captchaError}</span>
                      </div>
                    )}

                    {/* Submit Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full hover-brand-gradient inline-flex items-center justify-center gap-2 bg-[#652297] text-white font-medium text-xs sm:text-sm h-12 rounded-xl shadow-md cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                      >
                        <span>{isSubmitting ? "Verifying..." : "Submit"}</span>
                      </button>
                      <p className="mt-2.5 text-[11px] leading-relaxed text-[#5F5A64] text-center">
                        This site is protected by reCAPTCHA and the Google{" "}
                        <a
                          href="https://policies.google.com/privacy"
                          target="_blank"
                          rel="noreferrer"
                          className="underline hover:text-[#652297]"
                        >
                          Privacy Policy
                        </a>{" "}
                        and{" "}
                        <a
                          href="https://policies.google.com/terms"
                          target="_blank"
                          rel="noreferrer"
                          className="underline hover:text-[#652297]"
                        >
                          Terms of Service
                        </a>{" "}
                        apply.
                      </p>
                    </div>
                  </motion.form>
                )}

                {/* Animated Letter Folding & Mailbox Delivery Stage */}
                {submissionStage === "delivering" && (
                  <motion.div
                    key="modal-delivering"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="w-full"
                  >
                    <MailboxDeliveryAnimation
                      senderName={formData.fullName}
                      senderEmail={formData.email}
                      serviceName={formData.service}
                      messagePreview={formData.message}
                      onComplete={() => setSubmissionStage("success")}
                    />
                  </motion.div>
                )}

                {/* Thank You & Done Stage */}
                {submissionStage === "success" && (
                  <motion.div
                    key="modal-success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-10 flex flex-col items-center text-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-[#10B981]/15 text-[#10B981] flex items-center justify-center mb-5 shadow-lg shadow-emerald-500/10">
                      <CheckCircle2 className="w-9 h-9 stroke-[2.2]" />
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-semibold text-[#141010] tracking-tight mb-2">
                      Inquiry Sent
                    </h3>
                    <p className="text-[#554E62] text-xs sm:text-sm leading-relaxed max-w-sm mb-6">
                      Thank you, <span className="font-semibold text-[#141010]">{formData.fullName}</span>. Our enterprise solutions team will reach out to you.
                    </p>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="hover-brand-gradient inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#0B0716] text-white text-xs sm:text-sm font-medium cursor-pointer shadow-md"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Done</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
