import { useState, useRef, useEffect, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Mail,
  Phone,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Building2,
  Sparkles,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import { toast } from "../componenets/toast.tsx";
import { preloadRecaptcha, executeRecaptcha } from "../utils/recaptcha.ts";
import Navbar from "../componenets/navbar.tsx";
import Footer from "../componenets/footer.tsx";
import BackToHeroButton from "../componenets/back-to-hero.tsx";
import { MailboxDeliveryAnimation, SERVICES_LIST } from "../sections/contact.tsx";

// ============================================================================
// 1. CRISP VECTOR FLAGS
// ============================================================================
function IndiaFlag({ className = "w-5 h-3.5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 36 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`rounded-[2px] shadow-xs border border-black/10 overflow-hidden shrink-0 ${className}`}
    >
      <rect width="36" height="8" fill="#FF9933" />
      <rect y="8" width="36" height="8" fill="#FFFFFF" />
      <rect y="16" width="36" height="8" fill="#138808" />
      <circle cx="18" cy="12" r="3.2" stroke="#000080" strokeWidth="0.65" fill="none" />
      <circle cx="18" cy="12" r="0.8" fill="#000080" />
    </svg>
  );
}

function SingaporeFlag({ className = "w-5 h-3.5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 36 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`rounded-[2px] shadow-xs border border-black/10 overflow-hidden shrink-0 ${className}`}
    >
      <rect width="36" height="12" fill="#ED2939" />
      <rect y="12" width="36" height="12" fill="#FFFFFF" />
      <g transform="translate(7.5, 6)">
        <path d="M 0 -4.2 A 4.2 4.2 0 1 0 0 4.2 A 3.3 3.3 0 1 1 0 -4.2 Z" fill="#FFFFFF" />
        <circle cx="2.6" cy="-2.5" r="0.65" fill="#FFFFFF" />
        <circle cx="4.6" cy="-0.8" r="0.65" fill="#FFFFFF" />
        <circle cx="3.8" cy="2" r="0.65" fill="#FFFFFF" />
        <circle cx="1.4" cy="2" r="0.65" fill="#FFFFFF" />
        <circle cx="0.6" cy="-0.8" r="0.65" fill="#FFFFFF" />
      </g>
    </svg>
  );
}

function USAFlag({ className = "w-5 h-3.5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 36 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`rounded-[2px] shadow-xs border border-black/10 overflow-hidden shrink-0 ${className}`}
    >
      <rect width="36" height="24" fill="#B22234" />
      <rect y="1.846" width="36" height="1.846" fill="#FFFFFF" />
      <rect y="5.538" width="36" height="1.846" fill="#FFFFFF" />
      <rect y="9.231" width="36" height="1.846" fill="#FFFFFF" />
      <rect y="12.923" width="36" height="1.846" fill="#FFFFFF" />
      <rect y="16.615" width="36" height="1.846" fill="#FFFFFF" />
      <rect y="20.308" width="36" height="1.846" fill="#FFFFFF" />
      <rect width="14.4" height="12.923" fill="#3C3B6E" />
    </svg>
  );
}

// ============================================================================
// 2. LOCATIONS CONFIG
// ============================================================================
interface LocationMapConfig {
  id: string;
  label: string;
  city: string;
  country: string;
  address: string;
  email: string;
  phone: string;
  embedUrl: string;
}

const OFFICE_LOCATIONS: LocationMapConfig[] = [
  {
    id: "melbourne",
    label: "Melbourne",
    city: "Melbourne",
    country: "Australia",
    address: "Melbourne VIC 3000, Australia",
    email: "contact@netopsys.com",
    phone: "+61 3 9000 0000",
    embedUrl:
      "https://maps.google.com/maps?q=Melbourne%20VIC%20Australia&t=&z=13&ie=UTF8&iwloc=&output=embed",
  },
  {
    id: "singapore",
    label: "Singapore (HQ)",
    city: "Singapore",
    country: "Singapore",
    address: "10 Ubi Crescent, #03-52 Ubi Techpark Lobby C, Singapore 408564",
    email: "info@netopsys.com",
    phone: "+65 6749 0000",
    embedUrl:
      "https://maps.google.com/maps?q=10%20Ubi%20Crescent%20Ubi%20Techpark%20Singapore&t=&z=14&ie=UTF8&iwloc=&output=embed",
  },
  {
    id: "india",
    label: "India (Dev Center)",
    city: "Hyderabad / Visakhapatnam",
    country: "India",
    address: "HITEC City, Madhapur, Hyderabad, Telangana 500081",
    email: "india@netopsys.com",
    phone: "+91 40 4000 0000",
    embedUrl:
      "https://maps.google.com/maps?q=HITEC%20City%20Hyderabad&t=&z=14&ie=UTF8&iwloc=&output=embed",
  },
  {
    id: "usa",
    label: "USA",
    city: "Irving, TX",
    country: "United States",
    address: "9907 Valley Ranch Pkwy E, Suite 3005, Irving, TX 75063",
    email: "usa@netopsys.com",
    phone: "+1 469 555 0199",
    embedUrl:
      "https://maps.google.com/maps?q=9907%20Valley%20Ranch%20Pkwy%20E%20Irving%20TX&t=&z=14&ie=UTF8&iwloc=&output=embed",
  },
];

// ============================================================================
// 3. MAIN CONTACT PAGE COMPONENT
// ============================================================================
export default function ContactPage() {
  // Form State: 100% matched to Image 2 (the contact section popup form)
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
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Map state (defaults to Melbourne matching previous reference screenshot)
  const [activeLocationId, setActiveLocationId] = useState("melbourne");
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const currentLocation =
    OFFICE_LOCATIONS.find((loc) => loc.id === activeLocationId) || OFFICE_LOCATIONS[0];

  // Reset map fade when switching office location
  useEffect(() => {
    setIsMapLoaded(false);
  }, [activeLocationId]);

  // Preload Google reCAPTCHA v3 script silently on mount
  useEffect(() => {
    preloadRecaptcha();
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsServiceSelectOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      // Automatically generate invisible reCAPTCHA v3 token on form submission
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

      // Persist inquiry to localStorage
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
    setIsServiceSelectOpen(false);
  };

  return (
    <div className="min-h-screen w-full bg-[#FAF9FD] text-[#141010] flex flex-col selection:bg-[#693092] selection:text-white">
      {/* Floating Dark Navbar */}
      <Navbar activeTab="Contact" />

      {/* Main Page Content */}
      <main className="relative flex-1 w-full pt-24 sm:pt-28 md:pt-30 pb-14 sm:pb-18 lg:pb-20 overflow-hidden">
        {/* Subtle Ambient Background Gradients */}
        <div className="absolute top-1/4 -right-48 w-96 h-96 rounded-full bg-[#BE3093]/8 blur-[140px] pointer-events-none" />
        <div className="absolute bottom-1/3 -left-48 w-96 h-96 rounded-full bg-[#693092]/8 blur-[140px] pointer-events-none" />

        {/* Subtle Tech Grid lines */}
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(#693092 1px, transparent 1px), linear-gradient(90deg, #693092 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Main Full-Width Container matching max-w-[2100px] */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-[2100px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-14 2xl:px-18"
        >
          {/* Breadcrumb Navigation: Home > Contact */}
          <nav aria-label="Breadcrumb" className="mb-6 sm:mb-8">
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
                <span className="text-[#693092] font-semibold">Contact</span>
              </li>
            </ol>
          </nav>

          {/* ===================================================================
              TWO-COLUMN SECTION:
              LEFT: Contact Form Card matching Image 2
              RIGHT: Clean Interactive Map with Purple Pin
              BOTH EQUAL HEIGHT: lg:items-stretch ensures left card = map height
          =================================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12 2xl:gap-14 lg:items-stretch">
            {/* ===============================================================
                LEFT COLUMN: Form matching Image 2 with equal height to map
            =============================================================== */}
            <div className="lg:col-span-6 xl:col-span-6 flex flex-col h-full">
              {/* White Card matching Image 2, stretched to full height */}
              <div className="relative w-full h-full min-h-[480px] lg:min-h-[560px] bg-white rounded-3xl p-6 sm:p-8 md:p-9 shadow-xl shadow-black/[0.04] border border-[#693092]/10 overflow-hidden text-left flex flex-col justify-between">
                <AnimatePresence mode="wait">
                  {submissionStage === "form" && (
                    <motion.form
                      key="contact-page-form"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.25 }}
                      onSubmit={handleSubmit}
                      className="flex-1 flex flex-col justify-between gap-5 sm:gap-6"
                    >
                      {/* Header from Image 2 */}
                      <div>
                        <span className="text-xs font-semibold text-[#693092] uppercase tracking-wider block mb-1">
                          LET'S CONNECT
                        </span>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#141010] tracking-tight mt-1 mb-2">
                          Let's Transform Your Business
                        </h2>
                        <p className="text-xs sm:text-sm text-[#554E62] leading-relaxed">
                          Fill out the details below and our enterprise solutions team will connect with you.
                        </p>
                      </div>

                      {/* Fields Container */}
                      <div className="flex-1 flex flex-col justify-between gap-4 sm:gap-5">
                        {/* Row 1: Full Name * | Email * */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex flex-col">
                            <label
                              htmlFor="fullName"
                              className="text-xs sm:text-[13px] text-[#141010] font-medium mb-1.5"
                            >
                              Full Name *
                            </label>
                            <input
                              id="fullName"
                              type="text"
                              required
                              value={formData.fullName}
                              onChange={(e) =>
                                setFormData({ ...formData, fullName: e.target.value })
                              }
                              className="w-full bg-[#F5EEF8] rounded-xl h-12 px-4 text-xs sm:text-sm text-[#141010] border border-transparent focus:border-[#693092]/30 focus:bg-white focus:outline-none transition-all"
                            />
                          </div>

                          <div className="flex flex-col">
                            <label
                              htmlFor="email"
                              className="text-xs sm:text-[13px] text-[#141010] font-medium mb-1.5"
                            >
                              Email *
                            </label>
                            <input
                              id="email"
                              type="email"
                              required
                              value={formData.email}
                              onChange={(e) =>
                                setFormData({ ...formData, email: e.target.value })
                              }
                              className="w-full bg-[#F5EEF8] rounded-xl h-12 px-4 text-xs sm:text-sm text-[#141010] border border-transparent focus:border-[#693092]/30 focus:bg-white focus:outline-none transition-all"
                            />
                          </div>
                        </div>

                        {/* Row 2: Phone * | Company (Optional) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex flex-col">
                            <label
                              htmlFor="phone"
                              className="text-xs sm:text-[13px] text-[#141010] font-medium mb-1.5"
                            >
                              Phone *
                            </label>
                            <input
                              id="phone"
                              type="tel"
                              required
                              value={formData.phone}
                              onChange={(e) =>
                                setFormData({ ...formData, phone: e.target.value })
                              }
                              className="w-full bg-[#F5EEF8] rounded-xl h-12 px-4 text-xs sm:text-sm text-[#141010] border border-transparent focus:border-[#693092]/30 focus:bg-white focus:outline-none transition-all"
                            />
                          </div>

                          <div className="flex flex-col">
                            <label
                              htmlFor="company"
                              className="text-xs sm:text-[13px] text-[#141010] font-medium mb-1.5 flex items-center justify-between"
                            >
                              <span>Company</span>
                              <span className="text-[11px] text-[#736B7E] font-normal">Optional</span>
                            </label>
                            <input
                              id="company"
                              type="text"
                              value={formData.company}
                              onChange={(e) =>
                                setFormData({ ...formData, company: e.target.value })
                              }
                              className="w-full bg-[#F5EEF8] rounded-xl h-12 px-4 text-xs sm:text-sm text-[#141010] border border-transparent focus:border-[#693092]/30 focus:bg-white focus:outline-none transition-all"
                            />
                          </div>
                        </div>

                        {/* Row 3: Service * Dropdown */}
                        <div ref={dropdownRef} className="relative flex flex-col">
                          <label
                            htmlFor="serviceDropdown"
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
                            id="serviceDropdown"
                            type="button"
                            onClick={() => setIsServiceSelectOpen(!isServiceSelectOpen)}
                            className={`w-full bg-[#F5EEF8] rounded-xl h-12 px-4 flex items-center justify-between text-xs sm:text-sm text-left border transition-all cursor-pointer ${
                              !formData.service && isServiceSelectOpen
                                ? "border-[#BE3093]/60 focus:border-[#BE3093]"
                                : "border-transparent focus:border-[#693092]/30"
                            }`}
                          >
                            <span
                              className={
                                formData.service ? "text-[#141010] font-normal" : "text-[#554E62]"
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

                          {/* Hidden input for native HTML form validity */}
                          <input
                            tabIndex={-1}
                            aria-hidden="true"
                            className="sr-only"
                            required
                            value={formData.service}
                            onChange={() => {}}
                          />

                          {/* Dropdown Options Menu */}
                          <AnimatePresence>
                            {isServiceSelectOpen && (
                              <motion.div
                                initial={{ opacity: 0, y: -6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.15 }}
                                className="absolute top-full left-0 right-0 z-30 mt-1 bg-white border border-[#693092]/15 rounded-xl shadow-lg py-1.5 max-h-56 overflow-y-auto"
                              >
                                {SERVICES_LIST.map((srv, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => {
                                      setFormData({ ...formData, service: srv });
                                      setIsServiceSelectOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-2.5 text-xs sm:text-sm text-[#141010] hover:bg-[#F5EEF8] hover:text-[#693092] transition-colors"
                                  >
                                    {srv}
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Row 4: Message (Optional) - flexibly sized to balance height */}
                        <div className="flex-1 flex flex-col min-h-[130px] lg:min-h-[150px]">
                          <label
                            htmlFor="message"
                            className="text-xs sm:text-[13px] text-[#141010] font-medium mb-1.5 flex items-center justify-between"
                          >
                            <span>Message</span>
                            <span className="text-[11px] text-[#736B7E] font-normal">Optional</span>
                          </label>
                          <textarea
                            id="message"
                            value={formData.message}
                            onChange={(e) =>
                              setFormData({ ...formData, message: e.target.value })
                            }
                            className="w-full flex-1 min-h-[120px] lg:min-h-[140px] bg-[#F5EEF8] rounded-xl p-4 text-xs sm:text-sm text-[#141010] border border-transparent focus:border-[#693092]/30 focus:bg-white focus:outline-none transition-all resize-none"
                          />
                        </div>
                      </div>

                      {/* Security Error Feedback (if any) */}
                      {captchaError && (
                        <div className="pt-1 text-xs text-red-600 font-medium flex items-center justify-center gap-1.5 text-center">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{captchaError}</span>
                        </div>
                      )}

                      {/* Row 5: Submit Button & Google reCAPTCHA v3 Notice */}
                      <div className="pt-2 flex flex-col gap-2.5">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full hover-brand-gradient inline-flex items-center justify-center gap-2 bg-[#652297] text-white font-medium text-xs sm:text-sm h-12 rounded-xl shadow-md cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                        >
                          <span>{isSubmitting ? "Verifying..." : "Submit"}</span>
                        </button>

                        <p className="text-[11px] text-[#7E7A8D] text-center leading-relaxed">
                          Protected by Google reCAPTCHA v3.{" "}
                          <a
                            href="https://policies.google.com/privacy"
                            target="_blank"
                            rel="noreferrer"
                            className="underline hover:text-[#693092]"
                          >
                            Privacy
                          </a>{" "}
                          &amp;{" "}
                          <a
                            href="https://policies.google.com/terms"
                            target="_blank"
                            rel="noreferrer"
                            className="underline hover:text-[#693092]"
                          >
                            Terms
                          </a>
                          .
                        </p>
                      </div>
                    </motion.form>
                  )}

                  {/* Delivering Stage: Animated Letter & Mailbox */}
                  {submissionStage === "delivering" && (
                    <motion.div
                      key="contact-delivering"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className="w-full flex-1 flex flex-col items-center justify-center"
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

                  {/* Success Stage */}
                  {submissionStage === "success" && (
                    <motion.div
                      key="contact-success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="w-full flex-1 flex flex-col items-center justify-center text-center py-12"
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
                        <span>Send Another Inquiry</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* ===============================================================
                RIGHT COLUMN: Clean Interactive Map with Purple Pin
                Matching height to the left contact form card
            =============================================================== */}
            <div className="lg:col-span-6 xl:col-span-6 flex flex-col h-full">
              {/* Map Container Card - exactly matching height to left card */}
              <div className="relative w-full h-full min-h-[600px] lg:min-h-[720px] rounded-3xl overflow-hidden border border-gray-200/80 shadow-md bg-[#E5E3DF] flex flex-col">
                {/* Location Selector Tabs as sleek frosted pill overlay at top */}
                <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-auto">
                  <div className="bg-white/95 backdrop-blur-md p-1.5 rounded-2xl border border-black/10 shadow-md flex items-center gap-1 overflow-x-auto scrollbar-none max-w-full">
                    {OFFICE_LOCATIONS.map((loc) => {
                      const isActive = loc.id === activeLocationId;
                      return (
                        <button
                          key={loc.id}
                          type="button"
                          onClick={() => setActiveLocationId(loc.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                            isActive
                              ? "bg-[#693092] text-white shadow-xs"
                              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                          }`}
                        >
                          {loc.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Embedded Map Iframe */}
                <iframe
                  title={`Map showing ${currentLocation.city}`}
                  src={currentLocation.embedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="eager"
                  onLoad={() => setIsMapLoaded(true)}
                  allowFullScreen={false}
                  referrerPolicy="no-referrer-when-downgrade"
                  className={`w-full h-full object-cover flex-1 transition-opacity duration-500 ${
                    isMapLoaded ? "opacity-100" : "opacity-0"
                  }`}
                />

                {/* Overlaid Center Purple Pin (Teardrop with center circle) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center z-10">
                  <div className="relative flex flex-col items-center animate-bounce duration-1000">
                    <div className="w-10 h-10 rounded-full bg-[#7F56D9] border-[2.5px] border-white shadow-xl flex items-center justify-center">
                      <div className="w-3.5 h-3.5 rounded-full bg-white" />
                    </div>
                    <div className="w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[10px] border-t-[#7F56D9] -mt-1" />
                  </div>
                  <div className="w-5 h-2 rounded-full bg-black/25 blur-[1.5px] -mt-0.5" />
                </div>

                {/* Floating Office Details Card at bottom */}
                <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-black/5 shadow-xl z-20 flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#693092]/10 text-[#693092] flex items-center justify-center">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <h4 className="text-sm sm:text-base font-bold text-[#141010]">
                        {currentLocation.city} Office
                      </h4>
                    </div>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Operational
                    </span>
                  </div>

                  <p className="text-xs sm:text-[13px] text-gray-600 leading-relaxed flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                    <span>{currentLocation.address}</span>
                  </p>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#693092]" />
                      <span>{currentLocation.email}</span>
                    </span>
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(
                        currentLocation.address
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#693092] font-semibold hover:underline"
                    >
                      <span>Directions</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ===================================================================
              GLOBAL PRESENCE CARDS SECTION
          =================================================================== */}
          <div className="mt-20 sm:mt-24 pt-12 sm:pt-16 border-t border-[#ECE4F2]">
            <div className="text-left mb-8 sm:mb-10">
              <span className="text-xs font-semibold text-[#693092] uppercase tracking-wider block mb-2">
                Worldwide Reach
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-light tracking-tight text-[#141010]">
                Our Global Offices
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* India */}
              <div className="bg-white rounded-2xl p-6 border border-[#ECE4F2] shadow-2xs hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <IndiaFlag className="w-6 h-4" />
                    <span className="text-base font-bold text-[#141010]">India</span>
                  </div>
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#F5EEF8] text-[#693092]">
                    Development Center
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#554E62] leading-relaxed mb-4">
                  Hyderabad & Visakhapatnam, India
                </p>
                <div className="text-xs text-[#736B7E] flex flex-col gap-1.5 pt-3 border-t border-[#F5EEF8]">
                  <span className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-[#693092]" />
                    <span>india@netopsys.com</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#693092]" />
                    <span>+91 40 4000 0000</span>
                  </span>
                </div>
              </div>

              {/* Singapore */}
              <div className="bg-white rounded-2xl p-6 border border-[#ECE4F2] shadow-2xs hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <SingaporeFlag className="w-6 h-4" />
                    <span className="text-base font-bold text-[#141010]">Singapore</span>
                  </div>
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#F5EEF8] text-[#693092]">
                    Asia-Pacific HQ
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#554E62] leading-relaxed mb-4">
                  10 Ubi Crescent, #03-52 Ubi Techpark Lobby C, Singapore 408564
                </p>
                <div className="text-xs text-[#736B7E] flex flex-col gap-1.5 pt-3 border-t border-[#F5EEF8]">
                  <span className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-[#693092]" />
                    <span>info@netopsys.com</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#693092]" />
                    <span>+65 6749 0000</span>
                  </span>
                </div>
              </div>

              {/* USA */}
              <div className="bg-white rounded-2xl p-6 border border-[#ECE4F2] shadow-2xs hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <USAFlag className="w-6 h-4" />
                    <span className="text-base font-bold text-[#141010]">United States</span>
                  </div>
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#F5EEF8] text-[#693092]">
                    US Office
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#554E62] leading-relaxed mb-4">
                  9907 Valley Ranch Pkwy E, Suite 3005, Irving, TX 75063
                </p>
                <div className="text-xs text-[#736B7E] flex flex-col gap-1.5 pt-3 border-t border-[#F5EEF8]">
                  <span className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-[#693092]" />
                    <span>usa@netopsys.com</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#693092]" />
                    <span>+1 469 555 0199</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Back to Top */}
      <BackToHeroButton />
    </div>
  );
}
