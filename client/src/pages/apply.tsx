import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useParams, useNavigate } from "react-router-dom";
import {
  ChevronRight,
  MapPin,
  Briefcase,
  Clock,
  Mail,
  Upload,
  FileCheck,
  Check,
  Loader2,
} from "lucide-react";
import Navbar from "../componenets/navbar.tsx";
import Footer from "../componenets/footer.tsx";
import BackToHeroButton from "../componenets/back-to-hero.tsx";
import { toast } from "../componenets/toast.tsx";
import LoginModal, { type CareerUser } from "./login.tsx";

export interface ApplyJobData {
  id: string | number;
  code: string;
  title: string;
  category: string;
  location: string;
  employmentType: string;
  experience: string;
  summary: string;
  description?: string;
  requirements?: string;
}

export default function ApplyPage() {
  const { id } = useParams<{ id?: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [job, setJob] = useState<ApplyJobData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [currentUser, setCurrentUser] = useState<CareerUser | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Form State
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load user from localStorage
  const loadUser = () => {
    try {
      const stored = localStorage.getItem("career_user");
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      } else {
        setCurrentUser(null);
      }
    } catch {
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    loadUser();

    // Listen to user auth events
    window.addEventListener("career_user_change", loadUser);

    // 1. Check if state was passed via React Router navigation
    const navState = location.state as { job?: any } | undefined;
    if (navState && navState.job) {
      const incoming = navState.job;
      setJob({
        id: incoming.id || incoming.jobId,
        code: incoming.code || incoming.jobId || incoming.id || "NET-JOB",
        title: incoming.title || "Job Position",
        category: incoming.category || incoming.department || "Engineering",
        location: incoming.location || "Remote",
        employmentType: incoming.employmentType || incoming.employment_type || "Full Time",
        experience: incoming.experience || "Entry Level",
        summary: incoming.summary || incoming.description || "",
      });
      setIsLoading(false);
      setNotFound(false);
      document.title = `Apply for ${incoming.title || "Job"} | Careers - Netopsys`;
      return () => window.removeEventListener("career_user_change", loadUser);
    }

    // 2. Fetch by query parameter or route param
    const queryParams = new URLSearchParams(location.search);
    const targetId = id || queryParams.get("id") || queryParams.get("jobId");

    if (targetId) {
      setIsLoading(true);
      fetch(`/api/jobs/${targetId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.success && data.job) {
            const j = data.job;
            setJob({
              id: j.jobId || String(j.dbId) || j.id,
              code: j.jobId || j.code || "NET-JOB",
              title: j.title || "Job Position",
              category: j.category || "Engineering",
              location: j.location || "Remote",
              employmentType: j.employmentType || "Full Time",
              experience: j.experience || "Entry Level",
              summary: j.summary || j.description || "",
            });
            setNotFound(false);
            document.title = `Apply for ${j.title} | Careers - Netopsys`;
          } else {
            setNotFound(true);
            setJob(null);
            document.title = "Position Not Found | Careers - Netopsys";
          }
        })
        .catch(() => {
          setNotFound(true);
          setJob(null);
          document.title = "Position Not Found | Careers - Netopsys";
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setNotFound(true);
      setJob(null);
      setIsLoading(false);
      document.title = "Apply | Careers - Netopsys";
    }

    return () => window.removeEventListener("career_user_change", loadUser);
  }, [id, location]);

  // If user is not logged in when reaching the page, prompt login modal
  useEffect(() => {
    const stored = localStorage.getItem("career_user");
    if (!stored) {
      setIsLoginModalOpen(true);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage("Resume file size must be less than 10MB");
        return;
      }
      setErrorMessage("");
      setResumeFile(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;

    if (!currentUser) {
      setIsLoginModalOpen(true);
      toast.info("Please sign in or create an account to apply.", { title: "Sign In Required" });
      return;
    }

    if (!coverLetter.trim()) {
      setErrorMessage("Please enter a cover letter.");
      toast.warning("Please enter your cover letter.", { title: "Cover Letter Required" });
      return;
    }

    if (!resumeFile) {
      setErrorMessage("Please upload your resume.");
      toast.warning("Please upload your resume before submitting.", { title: "Resume Required" });
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    const newApp = {
      id: `app-${Date.now()}`,
      initials: currentUser.initials || "CA",
      fullName: currentUser.name || "Candidate",
      name: currentUser.name || "Candidate",
      email: currentUser.email,
      phone: currentUser.phone || "",
      jobCode: job.code || String(job.id),
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
      coverLetter: coverLetter.trim(),
      resumeName: resumeFile.name,
      resumeUrl: "#",
    };

    try {
      const saved = JSON.parse(localStorage.getItem("netopsys_applications") || "[]");
      const updated = Array.isArray(saved) ? [newApp, ...saved] : [newApp];
      localStorage.setItem("netopsys_applications", JSON.stringify(updated));
      window.dispatchEvent(new Event("netopsys_applications_change"));
    } catch (err) {
      console.error("Error saving application:", err);
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      toast.success(`Application for "${job.title}" submitted successfully!`, {
        title: "Application Sent",
      });
    }, 1000);
  };

  return (
    <div
      className="min-h-screen w-full bg-[#F6EFF9] text-[#141010] flex flex-col selection:bg-[#693092] selection:text-white"
      style={{ fontFamily: "'Onest', sans-serif" }}
    >
      {/* Floating Brand Navbar */}
      <Navbar activeTab="Careers" />

      {/* Main Content Area */}
      <main className="relative w-full z-10 flex-1 pt-24 sm:pt-28 md:pt-30 pb-14 sm:pb-20">
        {/* Ambient background glows */}
        <div className="absolute top-1/6 -right-40 w-80 h-80 rounded-full bg-[#BE3093]/10 blur-[130px] pointer-events-none" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 rounded-full bg-[#693092]/10 blur-[130px] pointer-events-none" />

        <div className="relative w-full max-w-[2100px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-14 2xl:px-18">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-28 text-center">
              <Loader2 className="w-10 h-10 animate-spin text-[#693092] mb-4" />
              <p className="text-[#554E62] text-base font-medium">Loading application form...</p>
            </div>
          ) : notFound || !job ? (
            <div className="flex flex-col items-center justify-center py-28 text-center">
              <div className="w-16 h-16 rounded-full bg-[#FAF5FD] border border-[#EADBFA] flex items-center justify-center mb-4 text-[#693092]">
                <Briefcase className="w-8 h-8" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#141010] mb-2">Position Not Found</h2>
              <p className="text-[#554E62] text-sm sm:text-base mb-6 max-w-md">
                The position you are trying to apply for does not exist or may have been closed.
              </p>
              <Link
                to="/careers"
                className="px-6 py-3 rounded-full hover-brand-gradient bg-[#693092] text-white font-medium text-sm transition"
              >
                View All Open Positions
              </Link>
            </div>
          ) : (
            <>
              {/* Breadcrumb Navigation: Home > Careers > Job Title > Apply */}
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
              <li className="truncate max-w-[180px] sm:max-w-none">
                <Link
                  to={`/jobdescription?id=${job.id}`}
                  state={{ job }}
                  className="text-[#6C6377] hover:text-[#693092] transition-colors cursor-pointer"
                >
                  {job.title}
                </Link>
              </li>
              <li className="text-[#9C94A8] flex items-center" aria-hidden="true">
                <ChevronRight className="w-3.5 h-3.5 stroke-[2.2]" />
              </li>
              <li>
                <span className="text-[#693092] font-semibold">Apply</span>
              </li>
            </ol>
          </nav>

          {/* Top Job Card Banner matching screenshot */}
          <div className="bg-white rounded-[26px] sm:rounded-[32px] p-6 sm:p-8 md:p-9 border border-[#EADBFA]/80 shadow-[0_8px_30px_rgba(93,35,129,0.04)] mb-8 sm:mb-10">
            {/* Top Badges Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-5">
              {/* Left Badges Group: Code & Category */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                <span className="px-3.5 py-1.5 rounded-full border border-[#EADBFA] text-xs sm:text-[13px] font-medium text-[#544862] bg-[#FAF8FC]">
                  {job.code}
                </span>
                <span className="px-3.5 py-1.5 rounded-full bg-[#F1E4F8] text-[#693092] text-xs sm:text-[13px] font-semibold">
                  {job.category}
                </span>
              </div>

              {/* Right Badges Group: Location, Employment Type, Experience */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                {job.location && (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#F5EEFA] text-[#554E62] text-xs sm:text-[13px] font-medium">
                    <MapPin className="w-3.5 h-3.5 text-[#693092]" />
                    <span>{job.location}</span>
                  </span>
                )}
                {job.employmentType && (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#F5EEFA] text-[#554E62] text-xs sm:text-[13px] font-medium">
                    <Briefcase className="w-3.5 h-3.5 text-[#693092]" />
                    <span>{job.employmentType}</span>
                  </span>
                )}
                {job.experience && (
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#F5EEFA] text-[#554E62] text-xs sm:text-[13px] font-medium">
                    <Clock className="w-3.5 h-3.5 text-[#693092]" />
                    <span>{job.experience}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Title matching signature heading font-light and tracking */}
            <h1 className="font-light tracking-[-0.035em] text-[#141010] text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] xl:text-[3.5rem] leading-[1.08] mb-3 sm:mb-4">
              {job.title}
            </h1>

            {/* Summary matching other pages subtitle typography */}
            <p className="text-[#554E62] leading-relaxed font-normal text-sm sm:text-base md:text-[16px] lg:text-[17px] max-w-4xl">
              {job.summary}
            </p>
          </div>

          {/* Main 2-Column Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
            {/* Left Column: Application Form */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-[26px] sm:rounded-[32px] p-7 sm:p-9 md:p-10 border border-[#EADBFA]/80 shadow-[0_8px_30px_rgba(93,35,129,0.04)]">
                {isSubmitted ? (
                  <div className="py-16 text-center">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                      <Check className="w-8 h-8 stroke-[2.5]" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#141010] mb-2">Application Submitted!</h2>
                    <p className="text-sm text-[#716A7E] max-w-md mx-auto mb-6">
                      Thank you for applying to <strong>{job.title}</strong>. Your application has been received and our hiring team will review it.
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      <Link
                        to="/careers"
                        className="px-6 py-2.5 hover-brand-gradient bg-[#693092] hover:bg-[#58257C] text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md transition-colors"
                      >
                        Back to Careers
                      </Link>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl sm:text-3xl font-bold text-[#141010] tracking-tight pb-5 mb-6 border-b border-[#F0E6F5]">
                      Application Form
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Cover Letter */}
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-[#141010] mb-1.5">
                          Cover Letter<span className="text-rose-500">*</span>
                        </label>
                        <p className="text-xs sm:text-[13px] text-[#716A7E] leading-normal mb-2.5">
                          Introduce yourself and explain why you&apos;re the ideal candidate for this position
                        </p>
                        <textarea
                          required
                          rows={10}
                          value={coverLetter}
                          onChange={(e) => {
                            setCoverLetter(e.target.value);
                            setErrorMessage("");
                          }}
                          placeholder={`Dear Hiring Manager,\n\nI am writing to express my interest in the position...\n\nPlease include:\n- Your relevant experience and achievements\n- Why you're interested in this role\n- What unique value you bring to the team\n- Your career goals and how this position aligns with them`}
                          className="w-full bg-[#FAF8FC] border border-[#E2DBEA] focus:border-[#693092] rounded-2xl p-4 sm:p-5 text-xs sm:text-sm text-[#141010] outline-none leading-relaxed placeholder:text-[#9C94A8] resize-y"
                        />
                      </div>

                      {/* Resume / CV */}
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-[#141010] mb-1.5">
                          Resume / CV<span className="text-rose-500">*</span>
                        </label>
                        <p className="text-xs sm:text-[13px] text-[#716A7E] leading-normal mb-2.5">
                          Upload your latest resume in PDF, DOC, or DOCX format (Max 10MB)
                        </p>

                        {resumeFile ? (
                          <div className="relative rounded-2xl border border-emerald-300 bg-emerald-50/60 p-4 sm:p-5 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                                <FileCheck className="w-5 h-5 stroke-[2.2]" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs sm:text-sm font-bold text-[#141010] truncate">
                                  {resumeFile.name}
                                </p>
                                <p className="text-[11px] text-gray-500">
                                  {(resumeFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to submit
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="text-xs font-semibold text-[#693092] hover:underline cursor-pointer shrink-0"
                            >
                              Replace
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-[#BE95D4] hover:border-[#693092] bg-[#FAF8FC] hover:bg-[#F9F5FB] rounded-2xl p-7 sm:p-9 text-center cursor-pointer transition-colors group"
                          >
                            <div className="w-11 h-11 rounded-full bg-[#F6EEFA] text-[#693092] flex items-center justify-center mx-auto mb-2.5 group-hover:scale-110 transition-transform">
                              <Upload className="w-5 h-5 stroke-[2.2]" />
                            </div>
                            <p className="text-xs sm:text-sm font-semibold text-[#141010]">
                              Click to upload your resume
                            </p>
                            <p className="text-xs text-[#716A7E] mt-1">
                              PDF, DOC, DOCX up to 10MB
                            </p>
                          </div>
                        )}

                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </div>

                      {/* Error Banner */}
                      {errorMessage && (
                        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                          {errorMessage}
                        </div>
                      )}

                      {/* Submit Application Button */}
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3.5 sm:py-4 px-6 rounded-2xl font-bold text-sm sm:text-base text-white hover-brand-gradient bg-[#693092] hover:bg-[#58257C] active:scale-[0.99] transition-all shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50"
                      >
                        {isSubmitting ? "Submitting Application..." : "Submit Application"}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-4 flex flex-col gap-5 lg:sticky lg:top-32">
              {/* Applying As Card */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#EADBFA]/80 shadow-[0_4px_20px_rgba(93,35,129,0.03)] flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-full bg-[#F6EEFA] text-[#693092] flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-[#716A7E] font-medium">Applying as</p>
                  <p className="text-xs sm:text-sm font-semibold text-[#141010] truncate mt-0.5">
                    {currentUser?.email || (
                      <span
                        onClick={() => setIsLoginModalOpen(true)}
                        className="text-[#693092] underline cursor-pointer"
                      >
                        Click to Sign In
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Review The Role Card */}
              <div className="bg-[#210D35] text-white rounded-[26px] p-6 sm:p-7 shadow-xl border border-white/10 text-left">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-1.5 tracking-tight">Review the role</h3>
                <p className="text-xs sm:text-sm text-white/75 font-normal leading-relaxed mb-5">
                  See the full job details first.
                </p>
                <button
                  type="button"
                  onClick={() => navigate(`/jobdescription?id=${job.id}`, { state: { job } })}
                  className="w-full py-3 px-6 rounded-2xl font-bold text-xs sm:text-sm text-[#141010] bg-[#FCAE3B] hover:bg-[#F29F25] hover-brand-gradient active:scale-[0.99] transition-all shadow-md cursor-pointer text-center block"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
            </>
          )}
        </div>
      </main>

      {/* Global Footer */}
      <Footer />
      <BackToHeroButton />

      {/* Login & Create Account Modal */}
      {isLoginModalOpen && (
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            setIsLoginModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

export { ApplyPage };
