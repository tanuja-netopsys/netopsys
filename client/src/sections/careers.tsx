import { useState, useEffect, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, Loader2, Sparkles, Briefcase, MapPin, ArrowRight } from "lucide-react";
import { toast } from "../componenets/toast.tsx";

interface JobRole {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
}

export default function Careers() {
  const [openRoles, setOpenRoles] = useState<JobRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    linkedin: "",
    role: "",
    note: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    fetch("/api/jobs")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && Array.isArray(data.jobs) && data.jobs.length > 0) {
          const parsed: JobRole[] = data.jobs.map((j: any) => ({
            id: j.jobId || String(j.dbId) || j.id,
            title: j.title,
            department: j.category || "Engineering",
            location: j.location || "Hyderabad / Remote",
            type: j.employmentType || "Full-Time",
            description: j.summary || j.description || "Exciting career opportunity at Netopsys AI.",
          }));
          setOpenRoles(parsed);
          setSelectedRole(parsed[0].id);
          setFormData((prev) => ({ ...prev, role: parsed[0].title }));
        } else {
          setOpenRoles([]);
          setSelectedRole("");
          setFormData((prev) => ({ ...prev, role: "" }));
        }
      })
      .catch((err) => {
        console.error("Failed to load roles from database:", err);
        setOpenRoles([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      toast.success("Thank you for applying! Our team will review your application.", {
        title: "Application Received",
      });
    }, 850);
  };

  const handleReset = () => {
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      linkedin: "",
      role: openRoles[0]?.title || "",
      note: "",
    });
    setIsSubmitted(false);
    setIsApplyModalOpen(false);
  };

  return (
    <section
      id="careers"
      className="careers-section-wrap relative w-full bg-[#FBAE42] text-[#141010] px-4 sm:px-6 md:px-8 lg:px-10 xl:px-14 2xl:px-18 py-10 sm:py-14 lg:py-16 xl:py-18 select-none overflow-hidden"
    >
      {/* Main Container - Expanded width matching all sections */}
      <div className="relative w-full max-w-[2100px] mx-auto">
        {/* 3-Column Layout from Screenshot */}
        <div className="careers-grid grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 xl:gap-12 items-center justify-between">
          {/* ================================================================ */}
          {/* LEFT COLUMN: TITLE + DESCRIPTION                                 */}
          {/* ================================================================ */}
          <div className="lg:col-span-5 text-left">
            <h2 className="careers-title text-4xl sm:text-5xl md:text-6xl lg:text-[4.75rem] font-light tracking-[-0.035em] leading-[1.04] text-[#141010] mb-4 sm:mb-5">
              Join Our Team
            </h2>
            <p className="careers-desc text-[#141010]/85 text-sm sm:text-base md:text-[16px] lg:text-[14.5px] xl:text-[15px] 2xl:text-[17px] leading-relaxed font-normal max-w-md">
              We&apos;re looking for talented individuals to help us build the future of AI-powered enterprise solutions. Explore our open positions and start your journey.
            </p>
          </div>

          {/* ================================================================ */}
          {/* MIDDLE COLUMN: 3 CULTURE / PERKS POINTS WITH DIVIDERS            */}
          {/* ================================================================ */}
          <div className="careers-items-wrap lg:col-span-4 xl:col-span-5 text-left flex flex-col justify-center">
            {/* Item 1: Amazing Team */}
            <div className="careers-item pb-4">
              <h3 className="careers-item-title text-[#141010] font-bold text-base sm:text-[17px] tracking-tight mb-1">
                Amazing Team
              </h3>
              <p className="careers-item-desc text-[#141010]/80 text-xs sm:text-[14.5px] md:text-[15px] font-normal">
                Work with passionate professionals
              </p>
            </div>
            <div className="h-[1px] w-full bg-black/15" />

            {/* Item 2: Growth Paths */}
            <div className="careers-item py-4">
              <h3 className="careers-item-title text-[#141010] font-bold text-base sm:text-[17px] tracking-tight mb-1">
                Growth Paths
              </h3>
              <p className="careers-item-desc text-[#141010]/80 text-xs sm:text-[14.5px] md:text-[15px] font-normal">
                Continuous learning & career development
              </p>
            </div>
            <div className="h-[1px] w-full bg-black/15" />

            {/* Item 3: Global Reach */}
            <div className="careers-item pt-4">
              <h3 className="careers-item-title text-[#141010] font-bold text-base sm:text-[17px] tracking-tight mb-1">
                Global Reach
              </h3>
              <p className="careers-item-desc text-[#141010]/80 text-xs sm:text-[14.5px] md:text-[15px] font-normal">
                Work on projects for clients worldwide
              </p>
            </div>
            <div className="h-[1px] w-full bg-black/15 mt-4" />
          </div>

          {/* ================================================================ */}
          {/* RIGHT COLUMN: APPLY NOW BUTTON                                   */}
          {/* ================================================================ */}
          <div className="lg:col-span-3 xl:col-span-2 flex items-center justify-start lg:justify-end">
            <Link
              to="/careers"
              className="careers-apply-btn hover-brand-gradient inline-flex items-center justify-center bg-[#0B0716] text-white font-semibold text-sm sm:text-[15px] px-8 sm:px-9 py-3.5 rounded-full shadow-md whitespace-nowrap cursor-pointer transition-all active:scale-95"
            >
              Apply Now
            </Link>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* INTERACTIVE OPEN ROLES & APPLICATION MODAL                           */}
      {/* ==================================================================== */}
      <AnimatePresence>
        {isApplyModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsApplyModalOpen(false)}
              className="absolute inset-0 cursor-pointer"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative w-full max-w-2xl bg-[#120E22] border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl z-10 overflow-hidden text-left flex flex-col max-h-[90vh]"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsApplyModalOpen(false)}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="overflow-y-auto pr-1">
                {!isSubmitted ? (
                  <div>
                    {/* Header */}
                    <div className="mb-6">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FBAE42]/15 text-[#FBAE42] text-xs font-semibold mb-2">
                        <Briefcase className="w-3.5 h-3.5" />
                        Careers at Netopsys
                      </span>
                      <h3 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
                        Explore Open Positions
                      </h3>
                      <p className="text-slate-400 text-xs sm:text-sm mt-1">
                        Select an open position below or send us your general inquiry.
                      </p>
                    </div>

                    {/* Open Roles List */}
                    <div className="space-y-3 mb-6">
                      {isLoading ? (
                        <div className="py-8 flex flex-col items-center justify-center text-slate-400 gap-2">
                          <Loader2 className="w-6 h-6 animate-spin text-[#FBAE42]" />
                          <span className="text-xs">Loading open positions...</span>
                        </div>
                      ) : openRoles.length === 0 ? (
                        <div className="py-8 text-center text-slate-400 text-sm">
                          No open positions currently available.
                        </div>
                      ) : (
                        openRoles.map((role) => (
                          <div
                            key={role.id}
                            onClick={() => {
                              setSelectedRole(role.id);
                              setFormData((prev) => ({ ...prev, role: role.title }));
                            }}
                            className={`p-4 rounded-xl border transition-all cursor-pointer min-w-0 break-words ${
                              selectedRole === role.id
                                ? "bg-white/[0.08] border-[#FBAE42] shadow-sm"
                                : "bg-white/[0.03] border-white/10 hover:border-white/25"
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                              <h4 className="text-white font-medium text-sm sm:text-base">
                                {role.title}
                              </h4>
                              <span className="text-xs text-[#FBAE42] font-medium flex items-center gap-1 flex-shrink-0">
                                <MapPin className="w-3 h-3" />
                                {role.location}
                              </span>
                            </div>
                            <p className="text-slate-400 text-xs leading-relaxed">
                              {role.description}
                            </p>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Application Form */}
                    <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-white/10">
                      <h4 className="text-white font-medium text-sm">
                        Submit Your Application
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <input
                          type="text"
                          required
                          placeholder="Your Full Name"
                          value={formData.fullName}
                          onChange={(e) =>
                            setFormData({ ...formData, fullName: e.target.value })
                          }
                          className="w-full bg-white/[0.05] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-400 border border-white/10 focus:border-[#FBAE42] focus:outline-none"
                        />
                        <input
                          type="email"
                          required
                          placeholder="Email Address"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          className="w-full bg-white/[0.05] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-400 border border-white/10 focus:border-[#FBAE42] focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <input
                          type="tel"
                          placeholder="Phone Number"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          className="w-full bg-white/[0.05] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-400 border border-white/10 focus:border-[#FBAE42] focus:outline-none"
                        />
                        <input
                          type="url"
                          placeholder="LinkedIn or Portfolio URL"
                          value={formData.linkedin}
                          onChange={(e) =>
                            setFormData({ ...formData, linkedin: e.target.value })
                          }
                          className="w-full bg-white/[0.05] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-400 border border-white/10 focus:border-[#FBAE42] focus:outline-none"
                        />
                      </div>

                      <textarea
                        rows={3}
                        placeholder="Why are you interested in joining Netopsys? (Optional)"
                        value={formData.note}
                        onChange={(e) =>
                          setFormData({ ...formData, note: e.target.value })
                        }
                        className="w-full bg-white/[0.05] rounded-xl p-3.5 text-xs sm:text-sm text-white placeholder-slate-400 border border-white/10 focus:border-[#FBAE42] focus:outline-none resize-none"
                      />

                      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <span className="text-xs text-slate-400">
                          Selected Role: <span className="text-[#FBAE42]">{formData.role || "General Application"}</span>
                        </span>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="hover-brand-gradient w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 bg-[#FBAE42] text-[#141010] font-semibold text-xs sm:text-sm px-6 py-2.5 rounded-full shadow-md cursor-pointer disabled:opacity-70"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Submitting...</span>
                            </>
                          ) : (
                            <>
                              <span>Submit Application</span>
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  /* Success Feedback */
                  <div className="py-12 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-[#10B981]/15 text-[#10B981] flex items-center justify-center mb-5">
                      <CheckCircle2 className="w-9 h-9 stroke-[2.2]" />
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight mb-2">
                      Application Submitted!
                    </h3>
                    <p className="text-slate-300 text-sm leading-relaxed max-w-md mb-6">
                      Thank you, <span className="font-semibold text-white">{formData.fullName}</span>. Our recruitment team will review your application for <span className="text-[#FBAE42]">{formData.role}</span> and reach out to you shortly.
                    </p>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white text-xs sm:text-sm font-medium cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Done</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
