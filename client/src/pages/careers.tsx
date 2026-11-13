import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  TrendingUp,
  FileText,
  Clock,
  ArrowUpRight,
  ArrowRight,
  X,
  CheckCircle2,
  MapPin,
  Send,
  Loader2,
  Mail,
} from "lucide-react";
import Navbar from "../componenets/navbar.tsx";
import Footer from "../componenets/footer.tsx";
import { toast } from "../componenets/toast.tsx";
import BackToHeroButton from "../componenets/back-to-hero.tsx";
import LoginModal from "./login.tsx";
import { preloadRecaptcha, executeRecaptcha } from "../utils/recaptcha.ts";

interface JobRole {
  id: string;
  title: string;
  badges: string[];
  description: string;
  location: string;
  department: string;
  employmentType?: string;
  experience?: string;
  responsibilities: string[];
  qualifications: string[];
}

export default function CareersPage() {
  const navigate = useNavigate();
  const [roles, setRoles] = useState<JobRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewingRole, setViewingRole] = useState<JobRole | null>(null);
  const [applyingRole, setApplyingRole] = useState<JobRole | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingJobForApply, setPendingJobForApply] = useState<JobRole | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [isNotified, setIsNotified] = useState(false);
  const [isSubmittingNotify, setIsSubmittingNotify] = useState(false);
  const [isPaperRocketFlying, setIsPaperRocketFlying] = useState(false);

  const handleJobNotifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = notifyEmail.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address.", { title: "Invalid Email" });
      return;
    }

    try {
      // Morph button into paper rocket and launch flight
      setIsPaperRocketFlying(true);
      setIsSubmittingNotify(true);

      // Generate invisible reCAPTCHA v3 token for job alert notification
      const captchaToken = await executeRecaptcha("job_alert_subscribe").catch((err) => {
        console.warn("reCAPTCHA execution note:", err);
        return "";
      });

      const res = await fetch("/api/subscribers/job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, captchaToken }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to register for alerts.");
      }

      // Allow paper rocket flight animation to finish soaring up and to the right
      setTimeout(() => {
        setIsNotified(true);
        setIsPaperRocketFlying(false);
      }, 1050);

      if (data.alreadySubscribed) {
        toast.info(data.message || "You are already registered for job alerts!", {
          title: "Already Registered",
        });
      } else {
        toast.success(data.message || "Thank you! We'll notify you as soon as a role opens up.", {
          title: "Job Alerts Activated",
        });
      }
    } catch (err: any) {
      setIsPaperRocketFlying(false);
      toast.error(err.message || "Failed to register. Please try again later.", {
        title: "Registration Error",
      });
    } finally {
      setIsSubmittingNotify(false);
    }
  };

  const handleApplyClick = (role: JobRole) => {
    const storedUser = localStorage.getItem("career_user");
    if (storedUser) {
      navigate(`/apply?id=${role.id}`, { state: { job: role } });
    } else {
      setPendingJobForApply(role);
      setIsAuthModalOpen(true);
    }
  };

  const handleLoginSuccess = () => {
    setIsAuthModalOpen(false);
    if (pendingJobForApply) {
      const targetRole = pendingJobForApply;
      setPendingJobForApply(null);
      navigate(`/apply?id=${targetRole.id}`, { state: { job: targetRole } });
    } else {
      navigate("/apply");
    }
  };

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    portfolioUrl: "",
    note: "",
  });

  const parseList = (text?: string): string[] => {
    if (!text || !text.trim()) return [];
    return text
      .split("\n")
      .map((s) => s.replace(/^[-•*]\s*/, "").trim())
      .filter(Boolean);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    document.title = "Careers | Build the Future With Us - Netopsys";

    setIsLoading(true);
    fetch("/api/jobs")
      .then((res) => {
        if (!res.ok) throw new Error("HTTP error " + res.status);
        return res.json();
      })
      .then((data) => {
        if (data && data.success && Array.isArray(data.jobs)) {
          const parsedRoles: JobRole[] = data.jobs.map((j: any) => {
            const resp = parseList(j.description);
            const quals = parseList(j.requirements);
            const loc = j.location || "Onsite";
            const emp = j.employmentType || j.employment_type || "Full Time";
            const exp = j.experience || "Entry Level";
            const dept = j.category || j.department || "Engineering";

            return {
              id: j.jobId || String(j.dbId) || j.id,
              title: j.title,
              badges: [loc, emp, exp].filter(Boolean),
              description: j.summary || j.description || "Exciting career opportunity at Netopsys AI.",
              location: loc,
              department: dept,
              employmentType: emp,
              experience: exp,
              responsibilities: resp,
              qualifications: quals,
            };
          });
          setRoles(parsedRoles);
        } else {
          setRoles([]);
        }
      })
      .catch((err) => {
        console.warn("Could not fetch jobs from API:", err);
        setRoles([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (applyingRole) {
      const newApp = {
        id: `app-${Date.now()}`,
        initials:
          formData.fullName
            .trim()
            .split(/\s+/)
            .map((p) => p[0])
            .join("")
            .toUpperCase()
            .slice(0, 2) || "CA",
        fullName: formData.fullName.trim(),
        name: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        jobCode: applyingRole.id || `NET-${applyingRole.title.slice(0, 2).toUpperCase()}-001`,
        jobTitle: applyingRole.title,
        position: applyingRole.title,
        status: "New",
        appliedDate: new Date().toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        appliedOn: new Date().toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        coverLetter: formData.note || `Applied for ${applyingRole.title}`,
        portfolioUrl: formData.portfolioUrl || "",
        resumeUrl: "#",
      };

      try {
        const saved = JSON.parse(
          localStorage.getItem("netopsys_applications") || "[]"
        );
        const updated = Array.isArray(saved) ? [newApp, ...saved] : [newApp];
        localStorage.setItem("netopsys_applications", JSON.stringify(updated));
        window.dispatchEvent(new Event("netopsys_applications_change"));
      } catch (err) {
        console.error("Error storing application:", err);
      }
    }

    setIsSubmitted(true);
    toast.success(`Application for ${applyingRole?.title || "role"} submitted successfully!`, {
      title: "Application Sent",
    });
    setTimeout(() => {
      setIsSubmitted(false);
      setApplyingRole(null);
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        portfolioUrl: "",
        note: "",
      });
    }, 2000);
  };

  return (
    <div
      className="min-h-screen w-full bg-[#F5EEF8] text-[#141010] flex flex-col selection:bg-[#693092] selection:text-white"
      style={{ fontFamily: "'Onest', sans-serif" }}
    >
      {/* Floating Brand Navbar */}
      <Navbar activeTab="Careers" />

      {/* Main Page Content */}
      <main className="careers-page-main relative w-full z-10 flex-1 pt-24 sm:pt-28 md:pt-30 pb-12 sm:pb-16 select-none">
        {/* Subtle background tech grid */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(#693092 1px, transparent 1px), linear-gradient(90deg, #693092 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Ambient background glows */}
        <div className="absolute top-1/6 -right-40 w-80 h-80 rounded-full bg-[#BE3093]/10 blur-[130px] pointer-events-none" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 rounded-full bg-[#693092]/10 blur-[130px] pointer-events-none" />

        {/* Main Full-Width Container matching all remaining pages (max-w-[2100px]) */}
        <div className="relative w-full max-w-[2100px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-14 2xl:px-18">
          {/* Breadcrumb Navigation: Home > Careers (Matching remaining pages) */}
          <nav aria-label="Breadcrumb" className="careers-page-breadcrumb mb-4 sm:mb-5 text-left">
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
                <span className="text-[#693092] font-semibold">Careers</span>
              </li>
            </ol>
          </nav>

          {/* =========================================================================
              HEADER SECTION
              - "Build the Future With Us"
              - Subtitle (Matches font styles, tracking, and sizes from remaining pages)
          ========================================================================= */}
          <div className="careers-page-header w-full mb-10 sm:mb-14 lg:mb-16 text-left">
            <h1 className="careers-page-title careers-title text-4xl sm:text-5xl md:text-6xl lg:text-[4.75rem] font-light tracking-[-0.035em] leading-[1.04] text-[#141010] mb-4 sm:mb-5 lg:mb-6">
              <span className="block">Build the Future</span>
              <span className="block text-[#693092]">With Us</span>
            </h1>

            <p className="careers-page-desc careers-desc text-[#554E62] text-sm sm:text-base md:text-[16px] lg:text-[17px] leading-relaxed font-normal max-w-2xl">
              Join Netopsys and be part of a team that&apos;s transforming businesses through AI-powered solutions and cutting-edge technology.
            </p>
          </div>

          {/* =========================================================================
              OPEN POSITIONS SECTION (Vertical Stack Cards matching remaining pages)
          ========================================================================= */}
          <section className="careers-page-positions mb-16 sm:mb-24">
            {/* Section Header */}
            <h2 className="careers-open-title about-block-title font-light tracking-[-0.035em] text-[#141010] text-3xl sm:text-4xl md:text-[2.65rem] lg:text-[3.25rem] leading-[1.06] mb-6 sm:mb-8 text-left">
              Open Positions
            </h2>

            {/* Loading / Empty / Cards List */}
            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3 text-[#554E62]">
                <Loader2 className="w-8 h-8 text-[#693092] animate-spin" />
                <p className="text-xs sm:text-sm font-medium">Loading open positions...</p>
              </div>
            ) : roles.length === 0 ? (
              <div className="bg-white rounded-[28px] sm:rounded-[36px] p-8 sm:p-12 md:p-14 w-full border border-[#ECE4F2] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-8 md:gap-14 text-left">
                {/* Left Side */}
                <div className="max-w-md lg:max-w-lg">
                  <div className="w-9 h-1 rounded-full bg-[#693092] mb-5 sm:mb-6" />
                  <h3 className="text-3xl sm:text-4xl md:text-[2.65rem] font-bold text-[#141010] tracking-tight leading-[1.15] mb-3 sm:mb-4">
                    No open positions<br />
                    <span className="text-[#693092]">right now</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-[#716A7E] leading-relaxed">
                    We don&apos;t have any openings at the moment.<br className="hidden sm:inline" />
                    Leave your email and we&apos;ll let you know as soon as a role opens up.
                  </p>
                </div>

                {/* Right Side */}
                <div className="w-full md:w-auto md:min-w-[400px] lg:min-w-[460px]">
                  {isNotified ? (
                    <div className="flex items-center gap-3 bg-[#FAF8FC] border border-[#EADBFA] rounded-full px-5 py-3.5 text-xs sm:text-sm text-[#693092] font-semibold animate-in fade-in duration-200">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span>Thank you! We&apos;ll notify you when a role opens up.</span>
                    </div>
                  ) : (
                    <>
                      <form
                        onSubmit={handleJobNotifySubmit}
                        className="relative flex items-center bg-[#FAF8FC] border border-[#EADBFA] rounded-full p-1.5 focus-within:border-[#693092] focus-within:bg-white transition-all shadow-xs"
                      >
                        <div className="pl-2.5 sm:pl-3.5 pr-1.5 sm:pr-2 text-[#8E869B] shrink-0">
                          <Mail className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.8]" />
                        </div>
                        <input
                          type="email"
                          value={notifyEmail}
                          onFocus={() => preloadRecaptcha()}
                          onChange={(e) => setNotifyEmail(e.target.value)}
                          placeholder="Enter your email"
                          required
                          className="w-full min-w-0 bg-transparent text-xs sm:text-sm text-[#141010] placeholder:text-[#9A91A7] outline-none py-1.5 pr-2"
                        />
                        <button
                          type="submit"
                          disabled={isSubmittingNotify}
                          className="hover-brand-gradient bg-[#693092] disabled:opacity-60 text-white text-xs sm:text-sm font-semibold px-3.5 sm:px-6 min-h-[40px] py-2 rounded-full shrink-0 shadow-xs transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                        >
                          {isSubmittingNotify && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                          <span>Notify Me</span>
                        </button>
                      </form>
                      <p className="text-[11.5px] text-[#8E869B] mt-2.5 pl-3">
                        We&apos;ll only email you about new roles.
                      </p>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="careers-roles-list flex flex-col gap-4 sm:gap-5">
                {roles.map((role) => (
                  <div
                    key={role.id}
                    className="careers-role-card bg-white rounded-[24px] sm:rounded-[28px] border border-[#F0E6F4] shadow-[0_4px_24px_rgba(0,0,0,0.02)] p-6 sm:p-7 md:px-8 md:py-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(105,48,146,0.06)] text-left h-auto min-w-0 break-words"
                  >
                    {/* Left Column: Department & Job Title */}
                    <div className="min-w-0 flex-1 break-words">
                      <div className="careers-role-dept text-[#693092] text-xs sm:text-[13px] font-semibold mb-1">
                        {role.department}
                      </div>
                      <h3 className="careers-role-title text-xl sm:text-2xl md:text-[26px] font-bold text-[#141010] tracking-tight break-words">
                        {role.title}
                      </h3>
                    </div>

                    {/* Middle Column: 3 Pill Badges */}
                    <div className="careers-role-pills flex flex-wrap items-center gap-2.5 sm:gap-3">
                      <span className="careers-role-pill inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FAF8FC] border border-[#EADBFA] text-[#693092] text-xs sm:text-[13px] font-medium">
                        <FileText className="w-3.5 h-3.5 stroke-[2] text-[#693092]" />
                        <span>{role.location || "Onsite"}</span>
                      </span>
                      <span className="careers-role-pill inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FAF5FC] border border-[#EADBFA] text-[#693092] text-xs sm:text-[13px] font-medium">
                        <Clock className="w-3.5 h-3.5 stroke-[2] text-[#693092]" />
                        <span>{role.employmentType || "Full Time"}</span>
                      </span>
                      <span className="careers-role-pill inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FAF5FC] border border-[#EADBFA] text-[#693092] text-xs sm:text-[13px] font-medium">
                        <TrendingUp className="w-3.5 h-3.5 stroke-[2] text-[#693092]" />
                        <span>{role.experience || "Entry Level"}</span>
                      </span>
                    </div>

                    {/* Right Column: Action Buttons */}
                    <div className="careers-role-actions grid grid-cols-2 sm:flex items-center gap-2.5 sm:gap-3.5 w-full sm:w-auto shrink-0">
                      <button
                        onClick={() => navigate(`/jobdescription?id=${role.id}`, { state: { job: role } })}
                        className="careers-role-btn-outline bg-white border border-[#DDD6E5] hover:border-[#693092] text-[#141010] hover:text-[#693092] font-semibold text-xs sm:text-sm rounded-full px-3.5 sm:px-6 py-2.5 transition-all cursor-pointer whitespace-nowrap shadow-xs text-center"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleApplyClick(role)}
                        className="careers-role-btn-primary hover-brand-gradient bg-[#693092] hover:bg-[#58247c] text-white font-semibold text-xs sm:text-sm rounded-full px-3.5 sm:px-6 py-2.5 flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shadow-sm"
                      >
                        <span>Apply Now</span>
                        <ArrowUpRight className="w-4 h-4 stroke-[2.2]" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Stay Connected for New Roles Banner */}
                <div className="mt-6 bg-white rounded-[24px] sm:rounded-[28px] border border-[#F0E6F4] px-6 sm:px-8 md:px-10 py-10 sm:py-12 md:py-14 min-h-[140px] sm:min-h-[160px] md:min-h-[175px] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] text-left careers-alert-banner">
                  <div className="max-w-md lg:max-w-lg">
                    <h4 className="careers-alert-title text-xl sm:text-2xl md:text-[26px] font-bold text-[#141010] tracking-tight">
                      Don&apos;t see the right role?
                    </h4>
                    <p className="careers-alert-desc text-sm sm:text-base md:text-[16px] text-[#554E62] leading-relaxed font-normal mt-1.5">
                      Subscribe to job alerts and be the first to know when new positions open.
                    </p>
                  </div>
                  <div className="w-full md:w-auto md:min-w-[380px] lg:min-w-[420px]">
                    {isNotified ? (
                      <div className="flex items-center gap-3 bg-[#FAF8FC] border border-[#EADBFA] rounded-full px-5 py-3 text-xs sm:text-sm text-[#693092] font-semibold">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        <span>Job alerts active! We&apos;ll notify you when a role opens.</span>
                      </div>
                    ) : (
                      <form
                        onSubmit={handleJobNotifySubmit}
                        className="relative flex items-center bg-[#FAF8FC] border border-[#EADBFA] rounded-full p-1.5 focus-within:border-[#693092] focus-within:bg-white transition-all shadow-xs overflow-visible"
                      >
                        <div className="pl-2.5 sm:pl-3.5 pr-1.5 sm:pr-2 text-[#8E869B] shrink-0">
                          <Mail className="w-4 h-4 stroke-[1.8]" />
                        </div>
                        <input
                          type="email"
                          value={notifyEmail}
                          onFocus={() => preloadRecaptcha()}
                          onChange={(e) => setNotifyEmail(e.target.value)}
                          placeholder="Enter your email"
                          required
                          disabled={isPaperRocketFlying}
                          className="w-full min-w-0 bg-transparent text-xs sm:text-sm text-[#141010] placeholder:text-[#9A91A7] outline-none py-1 pr-2"
                        />
                        <div className="relative shrink-0 flex items-center justify-center">
                          <button
                            type="submit"
                            disabled={isSubmittingNotify || isPaperRocketFlying}
                            className={`relative transition-all duration-300 font-semibold text-xs sm:text-sm rounded-full shrink-0 shadow-xs cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap overflow-visible ${
                              isPaperRocketFlying
                                ? "w-10 h-10 p-0 bg-transparent shadow-none"
                                : "hover-brand-gradient bg-[#693092] text-white px-3.5 sm:px-5 min-h-[40px] py-2 disabled:opacity-60"
                            }`}
                          >
                            {isPaperRocketFlying ? (
                              /* Button Morphs into Origami Paper Rocket & Soars to Top-Right */
                              <div className="animate-paper-rocket flex items-center justify-center pointer-events-none">
                                <div className="relative flex items-center justify-center">
                                  {/* Crisp Brand-Themed Paper Rocket */}
                                  <svg
                                    width="32"
                                    height="32"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    className="drop-shadow-[0_4px_14px_rgba(105,48,146,0.65)]"
                                  >
                                    {/* Main Wing in Netopsys Deep Purple */}
                                    <path
                                      d="M 2 12 L 22 2 L 15 22 L 11 13 Z"
                                      fill="#693092"
                                      stroke="#693092"
                                      strokeWidth="0.8"
                                      strokeLinejoin="round"
                                    />
                                    {/* Fold Wing in Brand Magenta */}
                                    <path
                                      d="M 11 13 L 22 2 L 15 22 Z"
                                      fill="#BE3093"
                                      stroke="#BE3093"
                                      strokeWidth="0.6"
                                      strokeLinejoin="round"
                                    />
                                    {/* Gold Center Fold Crease */}
                                    <line
                                      x1="2"
                                      y1="12"
                                      x2="22"
                                      y2="2"
                                      stroke="#FBAE42"
                                      strokeWidth="1.2"
                                    />
                                  </svg>

                                  {/* Dotted Flight Breeze Trail */}
                                  <svg
                                    className="absolute -bottom-3 -left-8 w-10 h-7 overflow-visible pointer-events-none opacity-85"
                                    viewBox="0 0 32 24"
                                    fill="none"
                                  >
                                    <path
                                      d="M 0 22 Q 10 24 16 15 Q 22 6 32 2"
                                      stroke="#693092"
                                      strokeWidth="1.8"
                                      strokeDasharray="2.5 3"
                                      strokeLinecap="round"
                                    />
                                  </svg>
                                </div>
                              </div>
                            ) : (
                              <>
                                {isSubmittingNotify && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                <span>Notify Me</span>
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            )}
          </section>


        </div>
      </main>

      {/* =========================================================================
          VIEW DETAILS MODAL
      ========================================================================= */}
      <AnimatePresence>
        {viewingRole && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingRole(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="relative w-full max-w-xl bg-white rounded-3xl p-7 sm:p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto text-left"
            >
              <button
                onClick={() => setViewingRole(null)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-black transition-colors cursor-pointer"
                aria-label="Close details"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="mb-4">
                <span className="inline-block px-3 py-1 rounded-full bg-[#F6EEFA] text-[#693092] text-xs font-semibold mb-2">
                  {viewingRole.department}
                </span>
                <h3 className="text-2xl sm:text-3xl font-light tracking-[-0.035em] text-[#141010]">
                  {viewingRole.title}
                </h3>
              </div>

              <div className="flex items-center gap-3 text-xs text-[#554E62] mb-5">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#693092]" />
                  {viewingRole.location}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#693092]" />
                  {viewingRole.employmentType || "Full Time"}
                </span>
              </div>

              <p className="text-sm text-[#554E62] leading-relaxed font-normal mb-5">
                {viewingRole.description}
              </p>

              <div className="mb-5">
                <h4 className="text-sm font-semibold tracking-tight text-[#141010] mb-2.5">Key Responsibilities</h4>
                <ul className="space-y-1.5 text-xs sm:text-[13px] text-[#554E62]">
                  {viewingRole.responsibilities.map((r, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#693092] mt-1.5 flex-shrink-0" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-7">
                <h4 className="text-sm font-semibold tracking-tight text-[#141010] mb-2.5">Qualifications</h4>
                <ul className="space-y-1.5 text-xs sm:text-[13px] text-[#554E62]">
                  {viewingRole.qualifications.map((q, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FBAE42] mt-1.5 flex-shrink-0" />
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => {
                    const r = viewingRole;
                    setViewingRole(null);
                    if (r) handleApplyClick(r);
                  }}
                  className="hover-brand-gradient px-5 py-2.5 rounded-xl bg-[#693092] text-white font-semibold text-xs shadow-md cursor-pointer flex items-center gap-2"
                >
                  <span>Apply for this Role</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewingRole(null)}
                  className="hover-brand-gradient px-4 py-2.5 rounded-xl border border-gray-200 text-[#554E62] font-semibold text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          APPLY NOW APPLICATION MODAL
      ========================================================================= */}
      <AnimatePresence>
        {applyingRole && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setApplyingRole(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl z-10 text-left"
            >
              <button
                onClick={() => setApplyingRole(null)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-black transition-colors cursor-pointer"
                aria-label="Close application"
              >
                <X className="w-4 h-4" />
              </button>

              {isSubmitted ? (
                <div className="py-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-light tracking-[-0.035em] text-[#141010] mb-1.5">
                    Application Submitted!
                  </h3>
                  <p className="text-xs sm:text-sm text-[#554E62] max-w-xs mx-auto leading-relaxed font-normal">
                    Thank you for applying for {applyingRole.title}. Our team will review your
                    application and get in touch with you!
                  </p>
                </div>
              ) : (
                <form onSubmit={handleApplySubmit} className="space-y-3.5">
                  <div>
                    <span className="text-[11px] font-semibold text-[#693092] uppercase tracking-wider block mb-0.5">
                      Applying for
                    </span>
                    <h3 className="text-xl sm:text-2xl font-light tracking-[-0.035em] text-[#141010]">
                      {applyingRole.title}
                    </h3>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#141010] mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Jane Doe"
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:border-[#693092] focus:ring-2 focus:ring-[#693092]/20 text-xs sm:text-sm outline-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#160F29] mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="jane@example.com"
                        className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:border-[#693092] focus:ring-2 focus:ring-[#693092]/20 text-xs sm:text-sm outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#160F29] mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+1 (555) 000-0000"
                        className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:border-[#693092] focus:ring-2 focus:ring-[#693092]/20 text-xs sm:text-sm outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#160F29] mb-1">
                      Portfolio / LinkedIn / Resume Link *
                    </label>
                    <input
                      type="url"
                      required
                      value={formData.portfolioUrl}
                      onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:border-[#693092] focus:ring-2 focus:ring-[#693092]/20 text-xs sm:text-sm outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#160F29] mb-1">
                      Cover Note (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={formData.note}
                      onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                      placeholder="Briefly tell us why you are a great fit..."
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:border-[#693092] focus:ring-2 focus:ring-[#693092]/20 text-xs sm:text-sm outline-none transition-all resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full hover-brand-gradient py-2.5 rounded-xl bg-[#120A21] text-white font-semibold text-xs sm:text-sm shadow-md cursor-pointer flex items-center justify-center gap-2 mt-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Application</span>
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Login & Create Account Popup */}
      {isAuthModalOpen && (
        <LoginModal
          isOpen={isAuthModalOpen}
          onClose={() => {
            setIsAuthModalOpen(false);
            setPendingJobForApply(null);
          }}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {/* Footer & Back to Hero */}
      <Footer />
      <BackToHeroButton />
    </div>
  );
}

export { CareersPage };
