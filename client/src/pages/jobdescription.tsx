import { useState, useEffect } from "react";
import { Link, useLocation, useParams, useNavigate } from "react-router-dom";
import {
  ChevronRight,
  MapPin,
  Briefcase,
  Tag,
  FileText,
  CheckCircle2,
  Share2,
  Info,
  XCircle,
  X,
  Upload,
  Check,
  Loader2,
} from "lucide-react";
import Navbar from "../componenets/navbar.tsx";
import Footer from "../componenets/footer.tsx";
import BackToHeroButton from "../componenets/back-to-hero.tsx";
import LoginModal, { type CareerUser } from "./login.tsx";
import { toast } from "../componenets/toast.tsx";

export interface JobDescriptionData {
  id: string | number;
  title: string;
  location: string;
  employmentType: string;
  category: string;
  summary: string;
  responsibilities: string[];
  requirements: string[];
  importantNote?: string;
  doNotApply?: string[];
}

function parseList(text: string | string[] | undefined): string[] {
  if (!text) return [];
  if (Array.isArray(text)) return text.filter(Boolean);
  return text
    .split(/\r?\n|•|\u2022|\*/)
    .map((s) => s.trim())
    .filter((s) => s.length > 2);
}

export default function JobDescriptionPage() {
  const { id } = useParams<{ id?: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [job, setJob] = useState<JobDescriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Login Modal & Apply State
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    portfolioUrl: "",
    note: "",
  });

  const handleApplyNow = () => {
    if (!job) return;
    const user = localStorage.getItem("career_user");
    if (user) {
      navigate(`/apply?id=${job.id}`, { state: { job } });
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const handleLoginSuccess = (_user: CareerUser) => {
    setIsLoginModalOpen(false);
    if (job) {
      navigate(`/apply?id=${job.id}`, { state: { job } });
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });

    // 1. Check if state was passed via React Router navigation
    const navState = location.state as { job?: any } | undefined;
    if (navState && navState.job) {
      const incoming = navState.job;
      const resp = parseList(incoming.responsibilities || incoming.description);
      const reqs = parseList(incoming.requirements || incoming.qualifications);

      setJob({
        id: incoming.id || incoming.jobId,
        title: incoming.title || "Job Position",
        location: incoming.location || "Remote",
        employmentType: incoming.employmentType || incoming.employment_type || "Full Time",
        category: incoming.category || incoming.department || "Engineering",
        summary: incoming.summary || incoming.description || "",
        responsibilities: resp,
        requirements: reqs,
        importantNote: incoming.importantNote || undefined,
        doNotApply: incoming.doNotApply || undefined,
      });
      setIsLoading(false);
      setNotFound(false);
      document.title = `${incoming.title || "Job Description"} | Careers - Netopsys`;
      return;
    }

    // 2. Check query parameter `?id=...` or route param `:id`
    const queryParams = new URLSearchParams(location.search);
    const targetId = id || queryParams.get("id") || queryParams.get("jobId");

    if (targetId) {
      setIsLoading(true);
      fetch(`/api/jobs/${targetId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.success && data.job) {
            const j = data.job;
            const resp = parseList(j.description);
            const reqs = parseList(j.requirements);

            setJob({
              id: j.jobId || String(j.dbId) || j.id,
              title: j.title || "Job Position",
              location: j.location || "Hyderabad / Remote",
              employmentType: j.employmentType || "Full Time",
              category: j.category || "Engineering",
              summary: j.summary || j.description || "",
              responsibilities: resp,
              requirements: reqs,
              importantNote: j.importantNote || undefined,
              doNotApply: j.doNotApply || undefined,
            });
            setNotFound(false);
            document.title = `${j.title} | Careers - Netopsys`;
          } else {
            setNotFound(true);
            setJob(null);
            document.title = "Job Not Found | Careers - Netopsys";
          }
        })
        .catch(() => {
          setNotFound(true);
          setJob(null);
          document.title = "Job Not Found | Careers - Netopsys";
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setNotFound(true);
      setJob(null);
      setIsLoading(false);
      document.title = "Careers | Netopsys";
    }
  }, [id, location]);

  const handleShareJob = async () => {
    const currentUrl = window.location.href;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(currentUrl);
      } else {
        const input = document.createElement("input");
        input.value = currentUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
      }
      setCopied(true);
      setToastMessage("Job link copied to clipboard!");
      toast.success("Job link copied to clipboard!", { title: "Link Copied" });
      setTimeout(() => {
        setCopied(false);
        setToastMessage("");
      }, 3000);
    } catch {
      setToastMessage("Unable to copy link.");
      setTimeout(() => setToastMessage(""), 3000);
    }
  };

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;
    setIsSubmitting(true);

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
      jobCode: String(job.id) || "NET-JOB",
      jobTitle: job.title,
      position: job.title,
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
      coverLetter: formData.note || `Applied for ${job.title}`,
      portfolioUrl: formData.portfolioUrl || "",
      resumeUrl: "#",
    };

    try {
      const saved = JSON.parse(localStorage.getItem("netopsys_applications") || "[]");
      const updated = Array.isArray(saved) ? [newApp, ...saved] : [newApp];
      localStorage.setItem("netopsys_applications", JSON.stringify(updated));
      window.dispatchEvent(new Event("netopsys_applications_change"));
    } catch (err) {
      console.error("Error storing application:", err);
    }

    setIsSubmitting(false);
    setIsSubmitted(true);
    toast.success(`Application for ${job.title} submitted successfully!`, {
      title: "Application Received",
    });
    setTimeout(() => {
      setIsSubmitted(false);
      setIsApplyModalOpen(false);
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
      className="min-h-screen w-full bg-[#F6EFF9] text-[#141010] flex flex-col selection:bg-[#693092] selection:text-white"
      style={{ fontFamily: "'Onest', sans-serif" }}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1E1B2E] text-white px-5 py-3 rounded-2xl shadow-xl text-xs sm:text-sm font-medium flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3 duration-200 border border-purple-500/30">
          <CheckCircle2 className="w-4 h-4 text-[#A855F7]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Floating Brand Navbar */}
      <Navbar activeTab="Careers" />

      {/* Main Content Area */}
      <main className="relative w-full z-10 flex-1 pt-24 sm:pt-28 md:pt-30 pb-14 sm:pb-20">
        {/* Ambient background glows matching remaining pages */}
        <div className="absolute top-1/6 -right-40 w-80 h-80 rounded-full bg-[#BE3093]/10 blur-[130px] pointer-events-none" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 rounded-full bg-[#693092]/10 blur-[130px] pointer-events-none" />

        {/* Outer content container with full width matching all remaining pages */}
        <div className="relative w-full max-w-[2100px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-14 2xl:px-18">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-28 text-center">
              <Loader2 className="w-10 h-10 animate-spin text-[#693092] mb-4" />
              <p className="text-[#554E62] text-base font-medium">Loading position details...</p>
            </div>
          ) : notFound || !job ? (
            <div className="flex flex-col items-center justify-center py-28 text-center">
              <div className="w-16 h-16 rounded-full bg-[#FAF5FD] border border-[#EADBFA] flex items-center justify-center mb-4 text-[#693092]">
                <Briefcase className="w-8 h-8" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#141010] mb-2">Position Not Found</h2>
              <p className="text-[#554E62] text-sm sm:text-base mb-6 max-w-md">
                The position you are looking for does not exist or may have been closed.
              </p>
              <Link
                to="/careers"
                className="px-6 py-3 rounded-full bg-[#693092] text-white font-medium text-sm hover:opacity-95 transition"
              >
                View All Open Positions
              </Link>
            </div>
          ) : (
            <>
              {/* Breadcrumb Navigation: Home > Careers > Job Title */}
              <nav aria-label="Breadcrumb" className="mb-4 sm:mb-6">
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
                    <Link
                      to="/careers"
                      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                      className="text-[#6C6377] hover:text-[#693092] transition-colors cursor-pointer"
                    >
                      Careers
                    </Link>
                  </li>
                  <li className="text-[#9C94A8] flex items-center" aria-hidden="true">
                    <ChevronRight className="w-3.5 h-3.5 stroke-[2.2]" />
                  </li>
                  <li className="truncate max-w-[220px] sm:max-w-none">
                    <span className="text-[#693092] font-semibold">{job.title}</span>
                  </li>
                </ol>
              </nav>

              {/* Badges / Pill Tags Row */}
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 mb-4 sm:mb-5">
                {/* Location Pill */}
                {job.location && (
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#EADBFA] text-xs sm:text-[13px] font-medium text-[#554E62] shadow-2xs">
                    <MapPin className="w-3.5 h-3.5 text-[#693092]" />
                    <span>{job.location}</span>
                  </span>
                )}

                {/* Employment Type Pill */}
                {job.employmentType && (
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#EADBFA] text-xs sm:text-[13px] font-medium text-[#554E62] shadow-2xs">
                    <Briefcase className="w-3.5 h-3.5 text-[#693092]" />
                    <span>{job.employmentType}</span>
                  </span>
                )}

                {/* Category / Department Pill */}
                {job.category && (
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#EADBFA] text-xs sm:text-[13px] font-medium text-[#554E62] shadow-2xs">
                    <Tag className="w-3.5 h-3.5 text-[#693092]" />
                    <span>{job.category}</span>
                  </span>
                )}
              </div>

              {/* Main Job Title Heading matching other pages font and size */}
              <h1 className="font-light tracking-[-0.035em] text-[#141010] text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] xl:text-[4.75rem] leading-[1.04] mb-4 sm:mb-5">
                {job.title}
              </h1>

              {/* Job Summary / Role Subtitle matching other pages */}
              {job.summary && (
                <p className="text-[#554E62] leading-relaxed font-normal text-sm sm:text-base md:text-[17px] lg:text-[17.5px] max-w-4xl mb-10 sm:mb-14">
                  {job.summary}
                </p>
              )}

              {/* 2-Column Responsive Layout Matching Image */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-start">
                {/* Left Column: Role Overview & Key Requirements Cards */}
                <div className="lg:col-span-8 flex flex-col gap-7 sm:gap-8">
                  {/* Card 1: Role Overview */}
                  <div className="bg-white rounded-[28px] sm:rounded-[34px] p-7 sm:p-9 md:p-10 border border-black/[0.04] shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
                    {/* Card Header with Icon */}
                    <div className="flex items-center gap-3.5 mb-6 pb-5 border-b border-[#F0E6F5]">
                      <div className="w-11 h-11 rounded-2xl bg-[#F6EEFA] flex items-center justify-center text-[#693092] shrink-0">
                        <FileText className="w-5 h-5 stroke-[2.2]" />
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-bold text-[#141010] tracking-tight">
                        Role Overview
                      </h2>
                    </div>

                    {/* Responsibilities Checklist */}
                    {job.responsibilities && job.responsibilities.length > 0 ? (
                      <ul className="space-y-4 sm:space-y-4.5">
                        {job.responsibilities.map((item, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-3.5 text-sm sm:text-base md:text-[16px] text-[#4A4458] leading-relaxed font-normal"
                          >
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 stroke-[2] shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm sm:text-base text-[#4A4458] leading-relaxed font-normal">
                        {job.summary || "Exciting career opportunity at Netopsys AI."}
                      </p>
                    )}
                  </div>

                  {/* Card 2: Key Requirements */}
                  {job.requirements && job.requirements.length > 0 && (
                    <div className="bg-white rounded-[28px] sm:rounded-[34px] p-7 sm:p-9 md:p-10 border border-black/[0.04] shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
                      {/* Card Header with Icon */}
                      <div className="flex items-center gap-3.5 mb-6 pb-5 border-b border-[#F0E6F5]">
                        <div className="w-11 h-11 rounded-2xl bg-[#F6EEFA] flex items-center justify-center text-[#693092] shrink-0">
                          <FileText className="w-5 h-5 stroke-[2.2]" />
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-[#141010] tracking-tight">
                          Key Requirements
                        </h2>
                      </div>

                      {/* Requirements Checklist */}
                      <ul className="space-y-4 sm:space-y-4.5">
                        {job.requirements.map((item, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-3.5 text-sm sm:text-base md:text-[16px] text-[#4A4458] leading-relaxed font-normal"
                          >
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 stroke-[2] shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Right Column: Actions Box, Important Notice & Do Not Apply Boxes */}
                <div className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-32">
                  {/* Box 1: Dark Purple Action Panel with Apply Now & Share Job */}
                  <div className="bg-[#210D35] text-white rounded-[28px] p-7 sm:p-8 shadow-xl border border-white/10 flex flex-col gap-4">
                    <button
                      type="button"
                      onClick={handleApplyNow}
                      className="w-full py-3.5 sm:py-4 px-6 rounded-2xl font-bold text-sm sm:text-base text-[#141010] bg-[#FCAE3B] hover:bg-[#F29F25] active:scale-[0.99] transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer"
                    >
                      Apply Now
                    </button>
                    <button
                      type="button"
                      onClick={handleShareJob}
                      className="w-full py-3 sm:py-3.5 px-6 rounded-2xl font-semibold text-xs sm:text-sm text-white bg-white/10 hover:bg-white/15 transition-all duration-200 border border-white/15 inline-flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>{copied ? "Link Copied!" : "Share Job"}</span>
                    </button>
                  </div>

                  {/* Box 2: Soft Amber "IMPORTANT" Notice Box */}
                  {job.importantNote && (
                    <div className="bg-[#FFF8EC] border border-[#FDE6BA] rounded-[26px] p-6 sm:p-7 text-left">
                      <div className="flex items-center gap-2 mb-2.5 text-amber-800 font-bold text-xs sm:text-[13px] uppercase tracking-wider">
                        <Info className="w-4 h-4 text-amber-600 stroke-[2.5]" />
                        <span>IMPORTANT</span>
                      </div>
                      <p className="text-xs sm:text-sm text-[#5A4518] leading-relaxed font-medium">
                        {job.importantNote}
                      </p>
                    </div>
                  )}

                  {/* Box 3: Soft Pink "DO NOT APPLY IF:" Box */}
                  {job.doNotApply && job.doNotApply.length > 0 && (
                    <div className="bg-[#FFF1F1] border border-[#FCDAD7] rounded-[26px] p-6 sm:p-7 text-left">
                      <h4 className="text-xs sm:text-[13px] font-bold text-rose-600 uppercase tracking-wider mb-4">
                        DO NOT APPLY IF:
                      </h4>
                      <ul className="space-y-3">
                        {job.doNotApply.map((item, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2.5 text-xs sm:text-sm text-[#5C3232] leading-snug"
                          >
                            <XCircle className="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Reusable Global Footer */}
      <Footer />
      <BackToHeroButton />

      {/* Job Application Modal */}
      {isApplyModalOpen && job && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-[#ECE4F2] shadow-2xl w-full max-w-lg p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setIsApplyModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {isSubmitted ? (
              <div className="py-12 text-center">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-7 h-7 stroke-[2.5]" />
                </div>
                <h3 className="text-xl font-bold text-[#141010] mb-1.5">Application Submitted!</h3>
                <p className="text-xs sm:text-sm text-[#716A7E]">
                  Thank you for applying to <strong>{job.title}</strong>. Our hiring team will review your application and get in touch with you.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <span className="px-3 py-1 rounded-full bg-[#F6EEFA] text-[#693092] text-xs font-semibold inline-block mb-2">
                    {job.category}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#141010] leading-snug">
                    Apply for {job.title}
                  </h3>
                  <p className="text-xs sm:text-[13px] text-[#716A7E] mt-1">
                    Fill in your details and we&apos;ll get in touch with you shortly.
                  </p>
                </div>

                <form onSubmit={handleApplySubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#141010] mb-1.5">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full bg-[#FAF8FC] border border-[#EADBFA] focus:border-[#693092] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#141010] outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-[#141010] mb-1.5">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="you@domain.com"
                        className="w-full bg-[#FAF8FC] border border-[#EADBFA] focus:border-[#693092] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#141010] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#141010] mb-1.5">
                        Phone Number <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full bg-[#FAF8FC] border border-[#EADBFA] focus:border-[#693092] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#141010] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#141010] mb-1.5">
                      Portfolio / LinkedIn / GitHub URL
                    </label>
                    <input
                      type="url"
                      value={formData.portfolioUrl}
                      onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full bg-[#FAF8FC] border border-[#EADBFA] focus:border-[#693092] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#141010] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#141010] mb-1.5">
                      Note or Cover Letter (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={formData.note}
                      onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                      placeholder="Tell us briefly why you're a great fit for this role..."
                      className="w-full bg-[#FAF8FC] border border-[#EADBFA] focus:border-[#693092] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#141010] outline-none resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#141010] mb-1.5">
                      Resume / CV (PDF or DOC)
                    </label>
                    <div className="border border-dashed border-[#D5CBE0] hover:border-[#693092] bg-[#FAF8FC] rounded-2xl p-4 text-center cursor-pointer transition-colors">
                      <Upload className="w-5 h-5 text-[#693092] mx-auto mb-1.5" />
                      <p className="text-xs font-semibold text-[#141010]">
                        Click or drag resume file to upload
                      </p>
                      <p className="text-[11px] text-[#716A7E]">PDF, DOCX up to 10MB</p>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#ECE4F2]">
                    <button
                      type="button"
                      onClick={() => setIsApplyModalOpen(false)}
                      className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 rounded-xl hover:bg-gray-100 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2.5 bg-[#693092] hover:bg-[#58257C] text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md cursor-pointer disabled:opacity-50 transition-all"
                    >
                      {isSubmitting ? "Submitting..." : "Submit Application"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
      {/* Login & Create Account Modal */}
      {isLoginModalOpen && (
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </div>
  );
}

export { JobDescriptionPage };
