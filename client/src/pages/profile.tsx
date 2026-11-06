import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  User,
  Briefcase,
  GraduationCap,
  Award,
  FileText,
  AlertCircle,
  Send,
  Calendar,
  ChevronDown,
  CheckCircle2,
  Plus,
  Trash2,
  Loader2,
} from "lucide-react";
import Navbar from "../componenets/navbar.tsx";
import Footer from "../componenets/footer.tsx";

type ProfileTab = "personal" | "professional" | "education" | "certs" | "jobs";

export interface WorkExperienceItem {
  id: string;
  jobTitle: string;
  companyName: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface CareerUser {
  name: string;
  email: string;
  initials: string;
  phone?: string;
  role?: string;
  registeredDate?: string;
  verificationStatus?: string;
  isEmailVerified?: boolean;
  accountStatus?: string;
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<ProfileTab>("personal");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // OTP Verification States
  const [isOtpOpen, setIsOtpOpen] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [otpError, setOtpError] = useState("");
  const [isSubmittingOtp, setIsSubmittingOtp] = useState(false);

  useEffect(() => {
    if (otpCountdown <= 0) return;
    const timer = setInterval(() => {
      setOtpCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [otpCountdown]);

  // ---------------------------------------------------------------------------
  // Personal Info State
  // ---------------------------------------------------------------------------
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("xxxxx@gmail.com");
  const [mobileNumber, setMobileNumber] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");

  // Address State
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [pincode, setPincode] = useState("");

  // ---------------------------------------------------------------------------
  // Professional State
  // ---------------------------------------------------------------------------
  const [jobTitle, setJobTitle] = useState("");
  const [currentCompany, setCurrentCompany] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [skills, setSkills] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [workExperiences, setWorkExperiences] = useState<WorkExperienceItem[]>([
    {
      id: "1",
      jobTitle: "",
      companyName: "",
      location: "",
      startDate: "",
      endDate: "",
      description: "",
    },
  ]);

  // ---------------------------------------------------------------------------
  // Education State
  // ---------------------------------------------------------------------------
  const [highestDegree, setHighestDegree] = useState("");
  const [fieldOfStudy, setFieldOfStudy] = useState("");
  const [institution, setInstitution] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [gradeScore, setGradeScore] = useState("");

  // ---------------------------------------------------------------------------
  // Certifications State
  // ---------------------------------------------------------------------------
  const [certName, setCertName] = useState("");
  const [issuingOrg, setIssuingOrg] = useState("");
  const [certIssueDate, setCertIssueDate] = useState("");
  const [certUrl, setCertUrl] = useState("");
  const [savedCerts, setSavedCerts] = useState<
    { name: string; org: string; date: string; url?: string }[]
  >([]);

  // ---------------------------------------------------------------------------
  // Load saved profile data from LocalStorage & PostgreSQL Database
  // ---------------------------------------------------------------------------
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });

    let activeEmail = "";

    try {
      const storedUser = localStorage.getItem("career_user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser) as CareerUser;
        if (parsed.email) {
          activeEmail = parsed.email;
          setEmail(parsed.email);
        }
        if (parsed.phone) {
          setMobileNumber(parsed.phone);
        }
        if (parsed.verificationStatus === "verified") {
          setIsEmailVerified(true);
        }
      } else {
        const defaultUser: CareerUser = {
          name: "Indrani",
          email: "xxxxx@gmail.com",
          initials: "IN",
          role: "Candidate",
        };
        localStorage.setItem("career_user", JSON.stringify(defaultUser));
        window.dispatchEvent(new Event("career_user_change"));
      }

      const storedDetails = localStorage.getItem("career_profile_details");
      if (storedDetails) {
        const p = JSON.parse(storedDetails);
        if (p.firstName !== undefined) setFirstName(p.firstName);
        if (p.lastName !== undefined) setLastName(p.lastName);
        if (p.email !== undefined && !activeEmail) {
          activeEmail = p.email;
          setEmail(p.email);
        }
        if (p.mobileNumber !== undefined) setMobileNumber(p.mobileNumber);
        if (p.dob !== undefined) setDob(p.dob);
        if (p.gender !== undefined) setGender(p.gender);
        if (p.address !== undefined) setAddress(p.address);
        if (p.city !== undefined) setCity(p.city);
        if (p.state !== undefined) setState(p.state);
        if (p.country !== undefined) setCountry(p.country);
        if (p.pincode !== undefined) setPincode(p.pincode);
        if (p.isEmailVerified !== undefined) setIsEmailVerified(p.isEmailVerified);

        if (p.jobTitle) setJobTitle(p.jobTitle);
        if (p.currentCompany) setCurrentCompany(p.currentCompany);
        if (p.experienceYears) setExperienceYears(p.experienceYears);
        if (p.skills) setSkills(p.skills);
        if (p.linkedinUrl) setLinkedinUrl(p.linkedinUrl);
        if (p.githubUrl) setGithubUrl(p.githubUrl);
        if (p.portfolioUrl) setPortfolioUrl(p.portfolioUrl);
        if (p.workExperiences && Array.isArray(p.workExperiences) && p.workExperiences.length > 0) {
          setWorkExperiences(p.workExperiences);
        }

        if (p.highestDegree) setHighestDegree(p.highestDegree);
        if (p.fieldOfStudy) setFieldOfStudy(p.fieldOfStudy);
        if (p.institution) setInstitution(p.institution);
        if (p.graduationYear) setGraduationYear(p.graduationYear);
        if (p.gradeScore) setGradeScore(p.gradeScore);

        if (p.savedCerts) setSavedCerts(p.savedCerts);
      }
    } catch {
      // ignore parse errors
    }

    // Fetch latest profile from PostgreSQL database if email is available
    if (activeEmail && activeEmail !== "xxxxx@gmail.com") {
      fetch(`/api/users/profile?email=${encodeURIComponent(activeEmail)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.success && data.profile) {
            const p = data.profile;
            if (p.firstName !== undefined) setFirstName(p.firstName);
            if (p.lastName !== undefined) setLastName(p.lastName);
            if (p.email) setEmail(p.email);
            if (p.mobileNumber !== undefined) setMobileNumber(p.mobileNumber);
            if (p.isEmailVerified !== undefined) setIsEmailVerified(p.isEmailVerified);
            if (p.dob) setDob(p.dob);
            if (p.gender) setGender(p.gender);
            if (p.address) setAddress(p.address);
            if (p.city) setCity(p.city);
            if (p.state) setState(p.state);
            if (p.country) setCountry(p.country);
            if (p.pincode) setPincode(p.pincode);
            if (p.jobTitle) setJobTitle(p.jobTitle);
            if (p.currentCompany) setCurrentCompany(p.currentCompany);
            if (p.experienceYears) setExperienceYears(p.experienceYears);
            if (p.skills) setSkills(p.skills);
            if (p.linkedinUrl) setLinkedinUrl(p.linkedinUrl);
            if (p.githubUrl) setGithubUrl(p.githubUrl);
            if (p.portfolioUrl) setPortfolioUrl(p.portfolioUrl);
            if (p.highestDegree) setHighestDegree(p.highestDegree);
            if (p.fieldOfStudy) setFieldOfStudy(p.fieldOfStudy);

            if (Array.isArray(p.workExperiences) && p.workExperiences.length > 0) {
              setWorkExperiences(p.workExperiences);
            }
            if (Array.isArray(p.savedCerts) && p.savedCerts.length > 0) {
              setSavedCerts(p.savedCerts);
            }
          }
        })
        .catch((err) => {
          console.warn("Could not fetch remote profile:", err);
        });
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // ---------------------------------------------------------------------------
  // Save Helpers (Saves to both PostgreSQL Database & LocalStorage)
  // ---------------------------------------------------------------------------
  const saveAllToDatabaseAndStorage = async (overrides = {}) => {
    setIsSaving(true);
    const fullProfile = {
      firstName,
      lastName,
      email,
      mobileNumber,
      dob,
      gender,
      address,
      city,
      state,
      country,
      pincode,
      isEmailVerified,
      jobTitle,
      currentCompany,
      experienceYears,
      skills,
      linkedinUrl,
      githubUrl,
      portfolioUrl,
      workExperiences,
      highestDegree,
      fieldOfStudy,
      institution,
      graduationYear,
      gradeScore,
      savedCerts,
      ...overrides,
    };

    // 1. Sync immediately with LocalStorage
    try {
      localStorage.setItem("career_profile_details", JSON.stringify(fullProfile));

      const fullName = `${(fullProfile.firstName || "").trim()} ${(fullProfile.lastName || "").trim()}`.trim() || fullProfile.firstName || "User";
      const existingUserStr = localStorage.getItem("career_user");
      let existingUser: CareerUser = {
        name: fullName,
        email: fullProfile.email,
        initials: (fullProfile.firstName?.[0] || "U").toUpperCase(),
        phone: fullProfile.mobileNumber,
        role: fullProfile.jobTitle || "Candidate",
      };
      if (existingUserStr) {
        existingUser = {
          ...JSON.parse(existingUserStr),
          name: fullName,
          email: fullProfile.email,
          phone: fullProfile.mobileNumber,
          initials: (fullProfile.firstName?.[0] || "U").toUpperCase(),
        };
      }
      localStorage.setItem("career_user", JSON.stringify(existingUser));
      window.dispatchEvent(new Event("career_user_change"));
    } catch {
      // storage error fallback
    }

    // 2. Persist to PostgreSQL database via backend API
    try {
      const res = await fetch("/api/users/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fullProfile),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Profile saved successfully to database!");
        if (data.user?.email && (!email || email === "xxxxx@gmail.com")) {
          setEmail(data.user.email);
        }
      } else {
        showToast(data.message || "Failed to save profile to database.");
      }
    } catch (err) {
      console.error("Error saving profile to database:", err);
      showToast("Unable to reach server. Please check connection.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePersonalInfo = () => {
    saveAllToDatabaseAndStorage({
      firstName,
      lastName,
      email,
      mobileNumber,
      dob,
      gender,
    });
  };

  const handleSaveAddress = () => {
    saveAllToDatabaseAndStorage({
      address,
      city,
      state,
      country,
      pincode,
    });
  };

  const handleSendVerification = async () => {
    if (!email || !email.includes("@") || email === "xxxxx@gmail.com") {
      showToast("Please enter a valid email address first.");
      return;
    }
    setIsVerifying(true);
    setOtpError("");
    try {
      const res = await fetch("/api/auth/send-verification-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsOtpOpen(true);
        setOtpCountdown(60);
        showToast(data.message || `Verification code sent to ${email}`);
      } else if (data.alreadyVerified) {
        setIsEmailVerified(true);
        setIsOtpOpen(false);
        showToast("Your email is already verified!");
      } else {
        setOtpError(data.message || "Failed to send verification code.");
        showToast(data.message || "Failed to send code.");
      }
    } catch (err) {
      setOtpError("Network error. Please try again.");
      showToast("Network error. Please check connection.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyOtp = async () => {
    const cleanOtp = otpInput.trim();
    if (!cleanOtp || cleanOtp.length < 6) {
      setOtpError("Please enter the complete 6-digit verification code.");
      return;
    }
    setIsSubmittingOtp(true);
    setOtpError("");
    try {
      const res = await fetch("/api/auth/verify-email-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: cleanOtp }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsEmailVerified(true);
        setIsOtpOpen(false);
        setOtpInput("");
        showToast("Email successfully verified! You can now apply for jobs.");

        // Update localStorage career_user and career_profile_details
        try {
          const cur = localStorage.getItem("career_user");
          if (cur) {
            const u = JSON.parse(cur);
            u.verificationStatus = "verified";
            u.isEmailVerified = true;
            localStorage.setItem("career_user", JSON.stringify(u));
            window.dispatchEvent(new Event("career_user_change"));
          }
          const prof = localStorage.getItem("career_profile_details");
          if (prof) {
            const p = JSON.parse(prof);
            p.isEmailVerified = true;
            localStorage.setItem("career_profile_details", JSON.stringify(p));
          }
        } catch {}
      } else {
        setOtpError(data.message || "Invalid verification code.");
      }
    } catch (err) {
      setOtpError("Unable to verify. Please try again.");
    } finally {
      setIsSubmittingOtp(false);
    }
  };

  const handleUpdateExperience = (
    id: string,
    field: keyof WorkExperienceItem,
    value: string
  ) => {
    setWorkExperiences((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleAddExperience = () => {
    setWorkExperiences((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        jobTitle: "",
        companyName: "",
        location: "",
        startDate: "",
        endDate: "",
        description: "",
      },
    ]);
    showToast("New experience block added!");
  };

  const handleRemoveExperience = (id: string) => {
    if (workExperiences.length <= 1) {
      setWorkExperiences([
        {
          id: "1",
          jobTitle: "",
          companyName: "",
          location: "",
          startDate: "",
          endDate: "",
          description: "",
        },
      ]);
      return;
    }
    setWorkExperiences((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSaveProfessional = () => {
    saveAllToDatabaseAndStorage({
      jobTitle,
      currentCompany,
      experienceYears,
      skills,
      linkedinUrl,
      githubUrl,
      portfolioUrl,
      workExperiences,
    });
  };

  const handleSaveEducation = () => {
    saveAllToDatabaseAndStorage({
      highestDegree,
      fieldOfStudy,
      institution,
      graduationYear,
      gradeScore,
    });
  };

  const handleAddCert = () => {
    if (!certName.trim()) {
      showToast("Please enter certification name.");
      return;
    }
    const updated = [
      ...savedCerts,
      {
        name: certName.trim(),
        org: issuingOrg.trim() || "Online Provider",
        date: certIssueDate.trim() || new Date().getFullYear().toString(),
        url: certUrl.trim(),
      },
    ];
    setSavedCerts(updated);
    setCertName("");
    setIssuingOrg("");
    setCertIssueDate("");
    setCertUrl("");
    saveAllToDatabaseAndStorage({ savedCerts: updated });
  };

  const handleDeleteCert = (idx: number) => {
    const updated = savedCerts.filter((_, i) => i !== idx);
    setSavedCerts(updated);
    saveAllToDatabaseAndStorage({ savedCerts: updated });
  };

  return (
    <div
      className="min-h-screen w-full bg-[#F5EEF8] text-[#141010] flex flex-col selection:bg-[#652297] selection:text-white"
      style={{ fontFamily: "'Onest', sans-serif" }}
    >
      {/* Floating Website Navbar */}
      <Navbar activeTab="Careers" />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#140D26] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-white/15 flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Main Page Content */}
      <main className="relative w-full z-10 flex-1 pt-24 sm:pt-28 md:pt-30 pb-16 sm:pb-20 select-none profile-page-main">
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

        {/* Outer content container with full width matching all remaining pages (max-w-[2100px]) */}
        <div className="relative w-full max-w-[2100px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-14 2xl:px-18">
          {/* Title and Subtitle */}
          <div className="text-center mb-8 sm:mb-10 profile-page-header">
            <h1 className="profile-page-title text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] font-light tracking-[-0.035em] text-[#141010] leading-[1.05]">
              My Profile
            </h1>
            <p className="profile-page-desc text-[#554E62] text-sm sm:text-base md:text-[16px] lg:text-[17px] leading-relaxed font-normal mt-2 sm:mt-3">
              Manage your account and application details
            </p>
          </div>

          {/* Navigation Tabs Bar */}
          <div className="flex justify-center mb-8 sm:mb-10 profile-page-tabs-bar">
            <div className="inline-flex items-center justify-center p-1.5 bg-white rounded-2xl sm:rounded-full border border-[#ECE4F2] shadow-xs gap-1 sm:gap-2 flex-wrap sm:flex-nowrap profile-page-tabs-wrap">
              {/* 1. Personal */}
              <button
                type="button"
                onClick={() => setActiveTab("personal")}
                className={`profile-page-tab-btn flex items-center gap-2 px-5 py-2.5 rounded-xl sm:rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === "personal"
                    ? "bg-[#652297] text-white shadow-xs"
                    : "text-[#554E62] hover:text-[#141010]"
                }`}
              >
                <User className="w-4 h-4" />
                <span>Personal</span>
              </button>

              {/* 2. Professional */}
              <button
                type="button"
                onClick={() => setActiveTab("professional")}
                className={`profile-page-tab-btn flex items-center gap-2 px-5 py-2.5 rounded-xl sm:rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === "professional"
                    ? "bg-[#652297] text-white shadow-xs"
                    : "text-[#554E62] hover:text-[#141010]"
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>Professional</span>
              </button>

              {/* 3. Education */}
              <button
                type="button"
                onClick={() => setActiveTab("education")}
                className={`profile-page-tab-btn flex items-center gap-2 px-5 py-2.5 rounded-xl sm:rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === "education"
                    ? "bg-[#652297] text-white shadow-xs"
                    : "text-[#554E62] hover:text-[#141010]"
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Education</span>
              </button>

              {/* 4. Certs */}
              <button
                type="button"
                onClick={() => setActiveTab("certs")}
                className={`profile-page-tab-btn flex items-center gap-2 px-5 py-2.5 rounded-xl sm:rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === "certs"
                    ? "bg-[#652297] text-white shadow-xs"
                    : "text-[#554E62] hover:text-[#141010]"
                }`}
              >
                <Award className="w-4 h-4" />
                <span>Certs</span>
              </button>

              {/* 5. Jobs */}
              <button
                type="button"
                onClick={() => setActiveTab("jobs")}
                className={`profile-page-tab-btn flex items-center gap-2 px-5 py-2.5 rounded-xl sm:rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === "jobs"
                    ? "bg-[#652297] text-white shadow-xs"
                    : "text-[#554E62] hover:text-[#141010]"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Jobs</span>
              </button>
            </div>
          </div>

          {/* Cards Container matching navbar max-width */}
          <div className="w-full max-w-5xl lg:max-w-6xl mx-auto">

        {/* =================================================================== */}
        {/* TAB 1: PERSONAL INFORMATION (MATCHES THE SCREENSHOT EXACTLY)        */}
        {/* =================================================================== */}
        {activeTab === "personal" && (
          <div className="bg-white rounded-[28px] sm:rounded-[32px] border border-[#ECE4F2] shadow-sm p-6 sm:p-9 md:p-11 lg:p-12 w-full text-[#141010] animate-in fade-in duration-200 profile-page-card">
            {/* Header */}
            <div className="flex items-center gap-3.5 mb-6 sm:mb-7 profile-page-card-header">
              <div className="w-10 h-10 rounded-full bg-[#F5EDF9] text-[#652297] flex items-center justify-center shrink-0 profile-page-card-icon">
                <User className="w-5 h-5 stroke-[2.2]" />
              </div>
              <h2 className="text-xl sm:text-[22px] font-bold text-[#141010] profile-page-card-title">
                Personal Information
              </h2>
            </div>

            {/* Form Fields */}
            <div className="space-y-5 profile-page-form">
              {/* Row 1: First Name & Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 text-left">
                <div>
                  <label className="block text-xs sm:text-[13px] font-semibold text-[#141010] mb-2 profile-page-label">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter your first name"
                    className="w-full bg-[#FAF8FC] border border-[#E2DBEA] hover:border-[#C8B8D7] focus:border-[#652297] focus:bg-white rounded-2xl px-4 py-3 sm:py-3.5 text-xs sm:text-sm text-[#141010] placeholder:text-[#9F96AC] outline-none transition-colors profile-page-input"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-[13px] font-semibold text-[#141010] mb-2 profile-page-label">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter your last name"
                    className="w-full bg-[#FAF8FC] border border-[#E2DBEA] hover:border-[#C8B8D7] focus:border-[#652297] focus:bg-white rounded-2xl px-4 py-3 sm:py-3.5 text-xs sm:text-sm text-[#141010] placeholder:text-[#9F96AC] outline-none transition-colors profile-page-input"
                  />
                </div>
              </div>

              {/* Row 2: Email */}
              <div className="text-left">
                <label className="block text-xs sm:text-[13px] font-semibold text-[#141010] mb-2 profile-page-label">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="xxxxx@gmail.com"
                  className="w-full bg-[#F5EDF9]/70 border border-[#E2DBEA] hover:border-[#C8B8D7] focus:border-[#652297] focus:bg-white rounded-2xl px-4 py-3 sm:py-3.5 text-xs sm:text-sm text-[#554E62] placeholder:text-[#9F96AC] outline-none transition-colors profile-page-input"
                />
              </div>

              {/* Row 3: Verification Alert Notice & OTP Form */}
              <div className="rounded-2xl bg-[#FFF8EE] border border-[#FFE7BA] p-4 sm:p-5 flex flex-col gap-4 text-left profile-page-alert">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-[#D48806] shrink-0 mt-0.5 sm:mt-0 stroke-[2.2]" />
                    <p className="text-xs sm:text-[13px] font-medium text-[#7D4A00] leading-relaxed profile-page-alert-text">
                      {isEmailVerified
                        ? "Your email address is verified. You can now apply for open positions and receive updates."
                        : "Email verification is required before applying for jobs. Please verify your email with a one-time passcode (OTP)."}
                    </p>
                  </div>
                  {!isEmailVerified ? (
                    <button
                      type="button"
                      onClick={handleSendVerification}
                      disabled={isVerifying || (isOtpOpen && otpCountdown > 0)}
                      className="bg-[#FBAE42] hover:bg-[#efa132] hover-brand-gradient text-[#141010] font-semibold text-xs sm:text-[13px] px-4.5 py-2.5 rounded-full inline-flex items-center gap-1.5 shadow-xs cursor-pointer transition-all whitespace-nowrap self-start sm:self-auto disabled:opacity-60 profile-page-alert-badge"
                    >
                      {isVerifying ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Sending Code...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>
                            {isOtpOpen && otpCountdown > 0
                              ? `Resend in ${otpCountdown}s`
                              : isOtpOpen
                              ? "Resend Code"
                              : "Send Verification Code"}
                          </span>
                        </>
                      )}
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-full shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Verified
                    </span>
                  )}
                </div>

                {/* OTP Entry Panel */}
                {!isEmailVerified && isOtpOpen && (
                  <div className="pt-3.5 border-t border-[#FFE7BA]/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#7D4A00] mb-1">
                        Enter 6-Digit Verification Code sent to <span className="font-bold underline">{email}</span>:
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          value={otpInput}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "");
                            setOtpInput(val);
                            if (otpError) setOtpError("");
                          }}
                          placeholder="e.g. 582914"
                          className="w-44 bg-white border border-[#E2DBEA] focus:border-[#652297] rounded-xl px-3.5 py-2 text-sm tracking-widest font-mono text-[#141010] placeholder:tracking-normal placeholder:font-sans placeholder:text-[#9F96AC] outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyOtp}
                          disabled={isSubmittingOtp || otpInput.trim().length !== 6}
                          className="bg-[#652297] hover:bg-[#521780] text-white font-semibold text-xs px-4 py-2 rounded-xl inline-flex items-center gap-1.5 shadow-xs cursor-pointer transition-all disabled:opacity-50"
                        >
                          {isSubmittingOtp ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Verifying...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Verify</span>
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsOtpOpen(false);
                            setOtpError("");
                          }}
                          className="text-xs font-medium text-[#7D4A00]/80 hover:text-[#7D4A00] px-2 py-2 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                      {otpError && (
                        <p className="text-xs text-rose-600 font-semibold mt-1">{otpError}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Row 4: Mobile Number */}
              <div className="text-left">
                <label className="block text-xs sm:text-[13px] font-semibold text-[#141010] mb-2 profile-page-label">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder=""
                  className="w-full bg-[#FAF8FC] border border-[#E2DBEA] hover:border-[#C8B8D7] focus:border-[#652297] focus:bg-white rounded-2xl px-4 py-3 sm:py-3.5 text-xs sm:text-sm text-[#141010] placeholder:text-[#9F96AC] outline-none transition-colors profile-page-input"
                />
              </div>

              {/* Row 5: Date of Birth & Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 text-left">
                {/* Date of Birth */}
                <div>
                  <label className="block text-xs sm:text-[13px] font-semibold text-[#141010] mb-2 profile-page-label">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      placeholder="mm/dd/yyyy"
                      className="w-full bg-[#FAF8FC] border border-[#E2DBEA] hover:border-[#C8B8D7] focus:border-[#652297] focus:bg-white rounded-2xl pl-4 pr-11 py-3 sm:py-3.5 text-xs sm:text-sm text-[#141010] placeholder:text-[#9F96AC] outline-none transition-colors profile-page-input"
                    />
                    <Calendar className="w-4 h-4 text-[#8E869B] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-xs sm:text-[13px] font-semibold text-[#141010] mb-2 profile-page-label">
                    Gender
                  </label>
                  <div className="relative">
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full bg-[#FAF8FC] border border-[#E2DBEA] hover:border-[#C8B8D7] focus:border-[#652297] focus:bg-white rounded-2xl pl-4 pr-11 py-3 sm:py-3.5 text-xs sm:text-sm text-[#141010] outline-none transition-colors appearance-none cursor-pointer profile-page-select"
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Non-binary">Non-binary</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-[#8E869B] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Row 6: Address */}
              <div className="text-left">
                <label className="block text-xs sm:text-[13px] font-semibold text-[#141010] mb-2">
                  Address
                </label>
                <textarea
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder=""
                  className="w-full bg-[#FAF8FC] border border-[#E2DBEA] hover:border-[#C8B8D7] focus:border-[#652297] focus:bg-white rounded-2xl p-4 text-xs sm:text-sm text-[#141010] placeholder:text-[#9F96AC] outline-none transition-colors resize-none"
                />
              </div>

              {/* Row 7: City & State */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 text-left">
                <div>
                  <label className="block text-xs sm:text-[13px] font-semibold text-[#141010] mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Enter city"
                    className="w-full bg-[#FAF8FC] border border-[#E2DBEA] hover:border-[#C8B8D7] focus:border-[#652297] focus:bg-white rounded-2xl px-4 py-3 sm:py-3.5 text-xs sm:text-sm text-[#141010] placeholder:text-[#9F96AC] outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-[13px] font-semibold text-[#141010] mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Enter state"
                    className="w-full bg-[#FAF8FC] border border-[#E2DBEA] hover:border-[#C8B8D7] focus:border-[#652297] focus:bg-white rounded-2xl px-4 py-3 sm:py-3.5 text-xs sm:text-sm text-[#141010] placeholder:text-[#9F96AC] outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Row 8: Country & Pincode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 text-left">
                <div>
                  <label className="block text-xs sm:text-[13px] font-semibold text-[#141010] mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Enter Country"
                    className="w-full bg-[#FAF8FC] border border-[#E2DBEA] hover:border-[#C8B8D7] focus:border-[#652297] focus:bg-white rounded-2xl px-4 py-3 sm:py-3.5 text-xs sm:text-sm text-[#141010] placeholder:text-[#9F96AC] outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-[13px] font-semibold text-[#141010] mb-2">
                    Pincode
                  </label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="Enter pincode"
                    className="w-full bg-[#FAF8FC] border border-[#E2DBEA] hover:border-[#C8B8D7] focus:border-[#652297] focus:bg-white rounded-2xl px-4 py-3 sm:py-3.5 text-xs sm:text-sm text-[#141010] placeholder:text-[#9F96AC] outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Row 9: Action Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-4 sm:pt-6">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleSavePersonalInfo}
                  className="bg-[#652297] hover:bg-[#531b7d] hover-brand-gradient text-white font-semibold text-xs sm:text-[14px] px-6 py-3 rounded-full shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-60"
                >
                  {isSaving ? "Saving..." : "Save Personal Info"}
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleSaveAddress}
                  className="bg-[#141010] hover:bg-black hover-brand-gradient text-white font-semibold text-xs sm:text-[14px] px-6 py-3 rounded-full shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-60"
                >
                  {isSaving ? "Saving..." : "Save Address"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 2: PROFESSIONAL                                                 */}
        {/* =================================================================== */}
        {activeTab === "professional" && (
          <div className="bg-white rounded-[28px] sm:rounded-[32px] border border-[#ECE4F2] shadow-sm p-6 sm:p-9 md:p-11 lg:p-12 w-full text-[#141010] animate-in fade-in duration-200 profile-page-card">
            <div className="flex items-center gap-3.5 mb-6 sm:mb-7 profile-page-card-header">
              <div className="w-10 h-10 rounded-full bg-[#F5EDF9] text-[#652297] flex items-center justify-center shrink-0 profile-page-card-icon">
                <Briefcase className="w-5 h-5 stroke-[2.2]" />
              </div>
              <h2 className="text-xl sm:text-[22px] font-bold text-[#141010] profile-page-card-title">
                Professional Information
              </h2>
            </div>

            <div className="space-y-5 text-left profile-page-form">
              {/* Row 1: Current Job Title & Current Company */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="block text-xs sm:text-[13px] font-semibold text-[#141010] mb-2">
                    Current Job Title
                  </label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder=""
                    className="w-full bg-[#FAF8FC] border border-[#E2DBEA] hover:border-[#C8B8D7] focus:border-[#652297] focus:bg-white rounded-2xl px-4 py-3 sm:py-3.5 text-xs sm:text-sm text-[#141010] outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-[13px] font-semibold text-[#141010] mb-2">
                    Current Company
                  </label>
                  <input
                    type="text"
                    value={currentCompany}
                    onChange={(e) => setCurrentCompany(e.target.value)}
                    placeholder=""
                    className="w-full bg-[#FAF8FC] border border-[#E2DBEA] hover:border-[#C8B8D7] focus:border-[#652297] focus:bg-white rounded-2xl px-4 py-3 sm:py-3.5 text-xs sm:text-sm text-[#141010] outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Row 2: Total Experience */}
              <div>
                <label className="block text-xs sm:text-[13px] font-semibold text-[#141010] mb-2">
                  Total Experience
                </label>
                <input
                  type="text"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  placeholder="e.g., 5 years"
                  className="w-full bg-[#FAF8FC] border border-[#E2DBEA] hover:border-[#C8B8D7] focus:border-[#652297] focus:bg-white rounded-2xl px-4 py-3 sm:py-3.5 text-xs sm:text-sm text-[#141010] placeholder:text-[#9F96AC] outline-none transition-colors"
                />
              </div>

              {/* Row 3: Skills (comma separated) */}
              <div>
                <label className="block text-xs sm:text-[13px] font-semibold text-[#141010] mb-2">
                  Skills (comma separated)
                </label>
                <textarea
                  rows={3}
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="React, Node.js, Python, AWS..."
                  className="w-full bg-[#FAF8FC] border border-[#E2DBEA] hover:border-[#C8B8D7] focus:border-[#652297] focus:bg-white rounded-2xl p-4 text-xs sm:text-sm text-[#141010] placeholder:text-[#9F96AC] outline-none transition-colors resize-none"
                />
              </div>

              {/* Row 4: LinkedIn URL */}
              <div>
                <label className="block text-xs sm:text-[13px] font-semibold text-[#141010] mb-2">
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/yourprofile"
                  className="w-full bg-[#FAF8FC] border border-[#E2DBEA] hover:border-[#C8B8D7] focus:border-[#652297] focus:bg-white rounded-2xl px-4 py-3 sm:py-3.5 text-xs sm:text-sm text-[#141010] placeholder:text-[#9F96AC] outline-none transition-colors"
                />
              </div>

              {/* Row 5: GitHub URL */}
              <div>
                <label className="block text-xs sm:text-[13px] font-semibold text-[#141010] mb-2">
                  GitHub URL
                </label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/yourusername"
                  className="w-full bg-[#FAF8FC] border border-[#E2DBEA] hover:border-[#C8B8D7] focus:border-[#652297] focus:bg-white rounded-2xl px-4 py-3 sm:py-3.5 text-xs sm:text-sm text-[#141010] placeholder:text-[#9F96AC] outline-none transition-colors"
                />
              </div>

              {/* Row 6: Portfolio URL */}
              <div>
                <label className="block text-xs sm:text-[13px] font-semibold text-[#141010] mb-2">
                  Portfolio URL
                </label>
                <input
                  type="url"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https://yourportfolio.com"
                  className="w-full bg-[#FAF8FC] border border-[#E2DBEA] hover:border-[#C8B8D7] focus:border-[#652297] focus:bg-white rounded-2xl px-4 py-3 sm:py-3.5 text-xs sm:text-sm text-[#141010] placeholder:text-[#9F96AC] outline-none transition-colors"
                />
              </div>

              {/* Work Experience Section */}
              <div className="pt-2">
                <h3 className="text-base sm:text-[17px] font-bold text-[#141010] mb-3">
                  Work Experience
                </h3>

                <div className="space-y-4">
                  {workExperiences.map((exp) => (
                    <div
                      key={exp.id}
                      className="rounded-[24px] bg-[#FAF8FC] border border-[#ECE4F2] p-5 sm:p-6 space-y-4 relative"
                    >
                      {workExperiences.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveExperience(exp.id)}
                          className="absolute right-4 top-4 text-[#8E869B] hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                          title="Remove experience"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}

                      {/* Row 1: Job Title & Company Name */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input
                          type="text"
                          value={exp.jobTitle}
                          onChange={(e) =>
                            handleUpdateExperience(exp.id, "jobTitle", e.target.value)
                          }
                          placeholder="Job Title"
                          className="w-full bg-white border border-[#E2DBEA] hover:border-[#C8B8D7] focus:border-[#652297] rounded-2xl px-4 py-3 sm:py-3.5 text-xs sm:text-sm text-[#141010] placeholder:text-[#9F96AC] outline-none transition-colors"
                        />
                        <input
                          type="text"
                          value={exp.companyName}
                          onChange={(e) =>
                            handleUpdateExperience(exp.id, "companyName", e.target.value)
                          }
                          placeholder="Company Name"
                          className="w-full bg-white border border-[#E2DBEA] hover:border-[#C8B8D7] focus:border-[#652297] rounded-2xl px-4 py-3 sm:py-3.5 text-xs sm:text-sm text-[#141010] placeholder:text-[#9F96AC] outline-none transition-colors"
                        />
                      </div>

                      {/* Row 2: Location, Start Date, End Date */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <input
                          type="text"
                          value={exp.location}
                          onChange={(e) =>
                            handleUpdateExperience(exp.id, "location", e.target.value)
                          }
                          placeholder="Location"
                          className="w-full bg-white border border-[#E2DBEA] hover:border-[#C8B8D7] focus:border-[#652297] rounded-2xl px-4 py-3 sm:py-3.5 text-xs sm:text-sm text-[#141010] placeholder:text-[#9F96AC] outline-none transition-colors"
                        />
                        <div className="relative">
                          <input
                            type="text"
                            value={exp.startDate}
                            onChange={(e) =>
                              handleUpdateExperience(exp.id, "startDate", e.target.value)
                            }
                            placeholder="mm/dd/yyyy"
                            className="w-full bg-white border border-[#E2DBEA] hover:border-[#C8B8D7] focus:border-[#652297] rounded-2xl pl-4 pr-10 py-3 sm:py-3.5 text-xs sm:text-sm text-[#141010] placeholder:text-[#9F96AC] outline-none transition-colors"
                          />
                          <Calendar className="w-4 h-4 text-[#8E869B] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                        <div className="relative">
                          <input
                            type="text"
                            value={exp.endDate}
                            onChange={(e) =>
                              handleUpdateExperience(exp.id, "endDate", e.target.value)
                            }
                            placeholder="mm/dd/yyyy"
                            className="w-full bg-white border border-[#E2DBEA] hover:border-[#C8B8D7] focus:border-[#652297] rounded-2xl pl-4 pr-10 py-3 sm:py-3.5 text-xs sm:text-sm text-[#141010] placeholder:text-[#9F96AC] outline-none transition-colors"
                          />
                          <Calendar className="w-4 h-4 text-[#8E869B] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>

                      {/* Row 3: Description */}
                      <div>
                        <textarea
                          rows={3}
                          value={exp.description}
                          onChange={(e) =>
                            handleUpdateExperience(exp.id, "description", e.target.value)
                          }
                          placeholder="Description"
                          className="w-full bg-white border border-[#E2DBEA] hover:border-[#C8B8D7] focus:border-[#652297] rounded-2xl p-4 text-xs sm:text-sm text-[#141010] placeholder:text-[#9F96AC] outline-none transition-colors resize-none"
                        />
                      </div>

                      {/* Add Experience Button */}
                      <div>
                        <button
                          type="button"
                          onClick={handleAddExperience}
                          className="bg-[#EAF7ED] hover:bg-[#DCF2E3] text-[#1E7E34] font-semibold text-xs sm:text-[13px] px-5 py-2.5 rounded-full inline-flex items-center transition-all cursor-pointer"
                        >
                          Add Experience
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="flex justify-end pt-4 sm:pt-6">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleSaveProfessional}
                  className="bg-[#652297] hover:bg-[#531b7d] hover-brand-gradient text-white font-semibold text-xs sm:text-[14px] px-6 py-3 rounded-full shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-60"
                >
                  {isSaving ? "Saving..." : "Save Professional Info"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 3: EDUCATION                                                    */}
        {/* =================================================================== */}
        {activeTab === "education" && (
          <div className="bg-white rounded-[28px] sm:rounded-[32px] border border-[#ECE4F2] shadow-sm p-6 sm:p-9 md:p-11 lg:p-12 w-full text-[#141010] animate-in fade-in duration-200 profile-page-card">
            <div className="flex items-center gap-3.5 mb-6 sm:mb-7 profile-page-card-header">
              <div className="w-10 h-10 rounded-full bg-[#F5EDF9] text-[#652297] flex items-center justify-center shrink-0 profile-page-card-icon">
                <GraduationCap className="w-5 h-5 stroke-[2.2]" />
              </div>
              <h2 className="text-xl sm:text-[22px] font-bold text-[#141010] profile-page-card-title">
                Education Background
              </h2>
            </div>

            <div className="space-y-5 text-left profile-page-form">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="block text-xs sm:text-[13px] font-semibold text-[#141010] mb-2">
                    Highest Qualification
                  </label>
                  <input
                    type="text"
                    value={highestDegree}
                    onChange={(e) => setHighestDegree(e.target.value)}
                    placeholder="e.g. Bachelor of Technology (B.Tech)"
                    className="w-full bg-[#FAF8FC] border border-[#E2DBEA] hover:border-[#C8B8D7] focus:border-[#652297] focus:bg-white rounded-2xl px-4 py-3 sm:py-3.5 text-xs sm:text-sm text-[#141010] outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-[13px] font-semibold text-[#141010] mb-2">
                    Field of Study / Specialization
                  </label>
                  <input
                    type="text"
                    value={fieldOfStudy}
                    onChange={(e) => setFieldOfStudy(e.target.value)}
                    placeholder="e.g. Computer Science & AI"
                    className="w-full bg-[#FAF8FC] border border-[#E2DBEA] hover:border-[#C8B8D7] focus:border-[#652297] focus:bg-white rounded-2xl px-4 py-3 sm:py-3.5 text-xs sm:text-sm text-[#141010] outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-[13px] font-semibold text-[#141010] mb-2">
                  College / University
                </label>
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="e.g. National Institute of Technology"
                  className="w-full bg-[#FAF8FC] border border-[#E2DBEA] hover:border-[#C8B8D7] focus:border-[#652297] focus:bg-white rounded-2xl px-4 py-3 sm:py-3.5 text-xs sm:text-sm text-[#141010] outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="block text-xs sm:text-[13px] font-semibold text-[#141010] mb-2">
                    Graduation Year
                  </label>
                  <input
                    type="text"
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value)}
                    placeholder="e.g. 2024"
                    className="w-full bg-[#FAF8FC] border border-[#E2DBEA] hover:border-[#C8B8D7] focus:border-[#652297] focus:bg-white rounded-2xl px-4 py-3 sm:py-3.5 text-xs sm:text-sm text-[#141010] outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-[13px] font-semibold text-[#141010] mb-2">
                    Grade / Percentage / CGPA
                  </label>
                  <input
                    type="text"
                    value={gradeScore}
                    onChange={(e) => setGradeScore(e.target.value)}
                    placeholder="e.g. 8.7 CGPA or 82%"
                    className="w-full bg-[#FAF8FC] border border-[#E2DBEA] hover:border-[#C8B8D7] focus:border-[#652297] focus:bg-white rounded-2xl px-4 py-3 sm:py-3.5 text-xs sm:text-sm text-[#141010] outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleSaveEducation}
                  className="bg-[#652297] hover:bg-[#531b7d] hover-brand-gradient text-white font-semibold text-xs sm:text-[14px] px-6 py-3 rounded-full shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-60"
                >
                  {isSaving ? "Saving..." : "Save Education Info"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 4: CERTS                                                        */}
        {/* =================================================================== */}
        {activeTab === "certs" && (
          <div className="bg-white rounded-[28px] sm:rounded-[32px] border border-[#ECE4F2] shadow-sm p-6 sm:p-9 md:p-11 lg:p-12 w-full text-[#141010] animate-in fade-in duration-200 profile-page-card">
            <div className="flex items-center gap-3.5 mb-6 sm:mb-7 profile-page-card-header">
              <div className="w-10 h-10 rounded-full bg-[#F5EDF9] text-[#652297] flex items-center justify-center shrink-0 profile-page-card-icon">
                <Award className="w-5 h-5 stroke-[2.2]" />
              </div>
              <h2 className="text-xl sm:text-[22px] font-bold text-[#141010] profile-page-card-title">
                Certifications & Badges
              </h2>
            </div>

            <div className="space-y-5 text-left mb-8 profile-page-form">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="block text-xs sm:text-[13px] font-semibold text-[#141010] mb-2">
                    Certification Name
                  </label>
                  <input
                    type="text"
                    value={certName}
                    onChange={(e) => setCertName(e.target.value)}
                    placeholder="e.g. AWS Certified Solutions Architect"
                    className="w-full bg-[#FAF8FC] border border-[#E2DBEA] hover:border-[#C8B8D7] focus:border-[#652297] focus:bg-white rounded-2xl px-4 py-3 sm:py-3.5 text-xs sm:text-sm text-[#141010] outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-[13px] font-semibold text-[#141010] mb-2">
                    Issuing Organization
                  </label>
                  <input
                    type="text"
                    value={issuingOrg}
                    onChange={(e) => setIssuingOrg(e.target.value)}
                    placeholder="e.g. Amazon Web Services / Google Cloud"
                    className="w-full bg-[#FAF8FC] border border-[#E2DBEA] hover:border-[#C8B8D7] focus:border-[#652297] focus:bg-white rounded-2xl px-4 py-3 sm:py-3.5 text-xs sm:text-sm text-[#141010] outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="block text-xs sm:text-[13px] font-semibold text-[#141010] mb-2">
                    Issue Date / Year
                  </label>
                  <input
                    type="text"
                    value={certIssueDate}
                    onChange={(e) => setCertIssueDate(e.target.value)}
                    placeholder="e.g. March 2025"
                    className="w-full bg-[#FAF8FC] border border-[#E2DBEA] hover:border-[#C8B8D7] focus:border-[#652297] focus:bg-white rounded-2xl px-4 py-3 sm:py-3.5 text-xs sm:text-sm text-[#141010] outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-[13px] font-semibold text-[#141010] mb-2">
                    Credential URL / Verification Link
                  </label>
                  <input
                    type="url"
                    value={certUrl}
                    onChange={(e) => setCertUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-[#FAF8FC] border border-[#E2DBEA] hover:border-[#C8B8D7] focus:border-[#652297] focus:bg-white rounded-2xl px-4 py-3 sm:py-3.5 text-xs sm:text-sm text-[#141010] outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleAddCert}
                  className="bg-[#652297] hover:bg-[#531b7d] hover-brand-gradient text-white font-semibold text-xs sm:text-[13px] px-5 py-2.5 rounded-full inline-flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Certification</span>
                </button>
              </div>
            </div>

            {/* List of Saved Certs */}
            {savedCerts.length > 0 && (
              <div className="border-t border-[#ECE4F2] pt-6 text-left">
                <h3 className="text-sm font-bold text-[#141010] mb-3">Saved Certifications</h3>
                <div className="space-y-3">
                  {savedCerts.map((cert, index) => (
                    <div
                      key={index}
                      className="p-3.5 bg-[#FAF8FC] border border-[#ECE4F2] rounded-2xl flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-[#141010]">
                          {cert.name}
                        </div>
                        <div className="text-[11px] text-[#6B617B]">
                          {cert.org} &bull; {cert.date}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteCert(index)}
                        className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 5: JOBS (APPLICATIONS & STATUS)                                 */}
        {/* =================================================================== */}
        {activeTab === "jobs" && (
          <div className="bg-white rounded-[28px] sm:rounded-[32px] border border-[#ECE4F2] shadow-sm p-6 sm:p-9 md:p-11 lg:p-12 w-full text-[#141010] animate-in fade-in duration-200 profile-page-card">
            <div className="flex items-center gap-3.5 mb-6 sm:mb-7 profile-page-card-header">
              <div className="w-10 h-10 rounded-full bg-[#F5EDF9] text-[#652297] flex items-center justify-center shrink-0 profile-page-card-icon">
                <FileText className="w-5 h-5 stroke-[2.2]" />
              </div>
              <h2 className="text-xl sm:text-[22px] font-bold text-[#141010] profile-page-card-title">
                Application History & Status
              </h2>
            </div>

            {/* Active application card */}
            <div className="space-y-4 text-left profile-page-form">
              <div className="p-5 rounded-2xl bg-[#FAF8FC] border border-[#ECE4F2] hover:border-[#652297]/30 transition-all">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-[#141010]">
                      AI Engineer - Generative AI & Agentic Systems
                    </h3>
                    <p className="text-xs text-[#6B617B]">Netopsys Technologies &bull; Hyderabad</p>
                  </div>
                  <span className="text-[11px] font-bold text-[#652297] bg-[#F5EDF9] border border-[#E7D6F1] px-3 py-1 rounded-full whitespace-nowrap">
                    Under Review
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-[#867D94] pt-2 border-t border-[#ECE4F2]/70">
                  <span>Applied on: Oct 2026</span>
                  <span>&bull;</span>
                  <span>Status: Profile Shortlisted</span>
                </div>
              </div>

              <div className="text-center pt-6">
                <p className="text-xs sm:text-sm text-[#6B617B] mb-3">
                  Want to explore more career opportunities with us?
                </p>
                <Link
                  to="/careers"
                  className="bg-[#652297] hover:bg-[#531b7d] hover-brand-gradient text-white font-semibold text-xs sm:text-sm px-6 py-2.5 rounded-full inline-block shadow-sm transition-all"
                >
                  Explore Careers
                </Link>
              </div>
            </div>
          </div>
        )}
          </div>
        </div>
      </main>

      {/* Website Footer */}
      <Footer />
    </div>
  );
}
