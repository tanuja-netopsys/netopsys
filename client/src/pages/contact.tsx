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
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { toast } from "../componenets/toast.tsx";
import { preloadRecaptcha, executeRecaptcha } from "../utils/recaptcha.ts";
import Navbar from "../componenets/navbar.tsx";
import Footer from "../componenets/footer.tsx";
import BackToHeroButton from "../componenets/back-to-hero.tsx";
import { MailboxDeliveryAnimation, SERVICES_LIST } from "../sections/contact.tsx";

// ============================================================================
// 1. OFFICE ADDRESS CONFIG (VISAKHAPATNAM)
// ============================================================================
const VISAKHAPATNAM_OFFICE = {
  city: "Visakhapatnam",
  country: "India",
  officeType: "Development Center",
  addressLines: [
    "2nd Floor, Door No. 39-16-36/5, SF-2",
    "Madhavadhara, Madhavadhara Main Road",
    "Visakhapatnam Mandal, Visakhapatnam",
    "Andhra Pradesh — 530007, India",
  ],
  landmark: "Opposite road to SBI ATM",
  email: "noreply@netopsys.in",
  phone: "+91 40 4000 0000",
};

// ============================================================================
// 2. MAIN CONTACT PAGE COMPONENT
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
    <div
      className="min-h-screen w-full bg-[#F5EEF8] text-[#141010] flex flex-col overflow-x-clip selection:bg-[#693092] selection:text-white"
      style={{ fontFamily: "'Onest', sans-serif" }}
    >
      {/* Floating Dark Navbar */}
      <Navbar activeTab="Contact" />

      {/* Main Page Content */}
      <main className="contact-page-main relative flex-1 w-full pt-24 sm:pt-28 md:pt-30 pb-14 sm:pb-18 overflow-hidden">
        {/* Subtle background tech grid matching remaining pages */}
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(#693092 1px, transparent 1px), linear-gradient(90deg, #693092 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Ambient background glows matching remaining pages */}
        <div className="absolute top-1/4 -right-48 w-96 h-96 rounded-full bg-[#BE3093]/10 blur-[140px] pointer-events-none" />
        <div className="absolute bottom-1/3 -left-48 w-96 h-96 rounded-full bg-[#693092]/10 blur-[140px] pointer-events-none" />

        {/* Main Full-Width Container matching remaining pages (max-w-[2100px]) */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-[2100px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-14 2xl:px-18"
        >
          {/* Breadcrumb Navigation: Home > Contact (Matching remaining pages) */}
          <nav aria-label="Breadcrumb" className="contact-page-breadcrumb mb-4 sm:mb-5 text-left">
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
              LEFT: Heading + Compact Address Card
              RIGHT: White Contact Form Card
          =================================================================== */}
          <div className="contact-page-grid grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 xl:gap-12 lg:items-stretch">
            {/* ===============================================================
                LEFT COLUMN: Hero Copy + Location & Address Card
            =============================================================== */}
            <div className="contact-page-left lg:col-span-6 flex flex-col justify-start gap-4 sm:gap-5 h-full min-w-0 text-left">
              {/* Top Heading Block - Matches text style and size of remaining pages */}
              <div className="w-full text-left">
                <h1 className="contact-page-title text-4xl sm:text-5xl md:text-6xl lg:text-[4.75rem] font-light tracking-[-0.035em] leading-[1.04] text-[#141010] mb-2.5 sm:mb-3">
                  <span className="block">Let&apos;s Transform</span>
                  <span className="block text-[#693092]">Your Business</span>
                </h1>
                <p className="contact-page-desc text-[#554E62] text-sm sm:text-base md:text-[16px] lg:text-[17px] leading-relaxed font-normal max-w-2xl">
                  Fill out the details below and our enterprise solutions team will connect with you.
                </p>
              </div>

              {/* Compact Bottom-Left Location & Address Card */}
              <div className="contact-page-address-card mt-auto bg-white/95 backdrop-blur-xs rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-lg shadow-purple-950/[0.04] border border-[#693092]/[0.08]">
                {/* Card Header */}
                <div className="contact-page-address-header flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 mb-3.5 sm:mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-[#F5EEF8] text-[#693092] flex items-center justify-center shrink-0">
                      <MapPin className="w-4.5 h-4.5" />
                    </div>
                    <span className="text-xs font-semibold text-[#693092] uppercase tracking-wider">
                      Location &amp; Address
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-[#F4EEF9] text-[#5B2A82] shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#693092]" />
                    Operational
                  </span>
                </div>

                {/* Address Lines (Left) + Email & Phone Cards (Right) */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-5 items-center">
                  <address className="contact-page-address-lines sm:col-span-6 min-w-0 not-italic space-y-1 text-[13px] sm:text-sm font-medium text-[#2A2238] leading-relaxed">
                    {VISAKHAPATNAM_OFFICE.addressLines.map((line, index) => (
                      <span key={index} className="block">
                        {line}
                      </span>
                    ))}
                  </address>

                  <div className="sm:col-span-6 min-w-0 flex flex-col gap-2.5">
                    <a
                      href={`mailto:${VISAKHAPATNAM_OFFICE.email}`}
                      className="contact-page-contact-pill flex items-center gap-3 rounded-xl border border-[#ECE4F2] bg-white px-4 py-2.5 text-[#141010] hover:border-[#693092]/30 hover:bg-[#FAF7FC] transition-all group min-w-0"
                    >
                      <div className="w-9 h-9 rounded-lg bg-[#F5EEF8] text-[#693092] flex items-center justify-center shrink-0">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="block text-[10.5px] font-semibold text-[#736B7E] uppercase tracking-wider">
                          Email Us
                        </span>
                        <span className="contact-page-contact-value block text-[13px] sm:text-sm font-semibold truncate group-hover:text-[#693092]">
                          {VISAKHAPATNAM_OFFICE.email}
                        </span>
                      </div>
                    </a>

                    <a
                      href={`tel:${VISAKHAPATNAM_OFFICE.phone.replace(/\s+/g, "")}`}
                      className="contact-page-contact-pill flex items-center gap-3 rounded-xl border border-[#ECE4F2] bg-white px-4 py-2.5 text-[#141010] hover:border-[#693092]/30 hover:bg-[#FAF7FC] transition-all group min-w-0"
                    >
                      <div className="w-9 h-9 rounded-lg bg-[#F5EEF8] text-[#693092] flex items-center justify-center shrink-0">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="block text-[10.5px] font-semibold text-[#736B7E] uppercase tracking-wider">
                          Call Us
                        </span>
                        <span className="contact-page-contact-value block text-[13px] sm:text-sm font-semibold truncate group-hover:text-[#693092]">
                          {VISAKHAPATNAM_OFFICE.phone}
                        </span>
                      </div>
                    </a>
                  </div>
                </div>

                {/* Landmark Footer Bar */}
                <div className="contact-page-landmark mt-4 pt-3 border-t border-[#ECE4F2] flex flex-wrap items-center gap-1.5 text-xs sm:text-[13.5px]">
                  <span className="font-semibold text-[#693092]">Landmark:</span>
                  <span className="text-[#2A2238] font-medium">
                    {VISAKHAPATNAM_OFFICE.landmark}
                  </span>
                </div>
              </div>
            </div>

            {/* ===============================================================
                RIGHT COLUMN: Clean White Contact Form Card
            =============================================================== */}
            <div className="lg:col-span-6 flex flex-col h-full min-w-0">
              <div className="contact-page-form-card relative w-full h-full bg-white rounded-3xl p-5 sm:p-7 shadow-xl shadow-purple-950/[0.05] border border-[#693092]/[0.08] overflow-hidden text-left flex flex-col justify-between">
                <AnimatePresence mode="wait">
                  {submissionStage === "form" && (
                    <motion.form
                      key="contact-page-form"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.25 }}
                      onSubmit={handleSubmit}
                      className="contact-page-form flex-1 flex flex-col justify-between gap-4"
                    >
                      {/* Fields Container */}
                      <div className="contact-page-fields flex-1 flex flex-col gap-3.5 sm:gap-4">
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
                              className="contact-page-input w-full bg-[#F5EEF8] rounded-xl h-12 px-4 text-xs sm:text-sm text-[#141010] border border-transparent focus:border-[#693092]/30 focus:bg-white focus:outline-none transition-all"
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
                              className="contact-page-input w-full bg-[#F5EEF8] rounded-xl h-12 px-4 text-xs sm:text-sm text-[#141010] border border-transparent focus:border-[#693092]/30 focus:bg-white focus:outline-none transition-all"
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
                              className="contact-page-input w-full bg-[#F5EEF8] rounded-xl h-12 px-4 text-xs sm:text-sm text-[#141010] border border-transparent focus:border-[#693092]/30 focus:bg-white focus:outline-none transition-all"
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
                              className="contact-page-input w-full bg-[#F5EEF8] rounded-xl h-12 px-4 text-xs sm:text-sm text-[#141010] border border-transparent focus:border-[#693092]/30 focus:bg-white focus:outline-none transition-all"
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
                            className={`contact-page-input w-full bg-[#F5EEF8] rounded-xl h-12 px-4 flex items-center justify-between text-xs sm:text-sm text-left border transition-all cursor-pointer ${
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

                        {/* Row 4: Message (Optional) */}
                        <div className="flex-1 flex flex-col">
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
                            className="contact-page-textarea w-full flex-1 min-h-[96px] sm:min-h-[110px] bg-[#F5EEF8] rounded-xl p-4 text-xs sm:text-sm text-[#141010] border border-transparent focus:border-[#693092]/30 focus:bg-white focus:outline-none transition-all resize-none"
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
                          className="contact-page-submit w-full hover-brand-gradient inline-flex items-center justify-center gap-2 bg-[#652297] text-white font-medium text-xs sm:text-sm h-12 rounded-xl shadow-md cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed transition-all"
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
