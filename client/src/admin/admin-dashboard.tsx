import { useState, useMemo, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Briefcase,
  FileText,
  Users,
  Calendar,
  // Search,
  Plus,
  Menu,
  // RefreshCw,
} from "lucide-react";
import netopsysLogo from "../assets/netopsys-ai-logo.png";
import NewJobModal, { type NewJobFormData } from "./new-job-modal.tsx";
import AdminSidebar from "./sidebar.tsx";
import { toast } from "../componenets/toast.tsx";

// ============================================================================
// DATA TYPES & INTERFACES (Exported for API and shared components compatibility)
// ============================================================================

export interface JobPosting {
  id: string;
  jobCode: string;
  title: string;
  category: string;
  location: string;
  employmentType: string;
  experience: string;
  summary: string;
  description: string;
  requirements: string;
  isActive: boolean;
}

export interface CategoryItem {
  id: string;
  name: string;
  description: string;
}

export type ApplicationStatus =
  | "Pending"
  | "Under Review"
  | "Shortlisted"
  | "Reschedule"
  | "Interview Scheduled"
  | "Interview Completed"
  | "Selected"
  | "Rejected"
  | "New"
  | "Interview";

export interface ApplicationItem {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  status: ApplicationStatus;
  appliedDate: string;
  resumeUrl?: string;
  portfolioUrl?: string;
  notes?: string;
}

export interface TimeSlot {
  id: string;
  time: string;
  isActive: boolean;
}

export interface InterviewRound {
  id: string;
  name: string;
  duration: string;
  slots: TimeSlot[];
}

export interface InterviewBooking {
  id: string;
  candidateName: string;
  candidateEmail: string;
  roundName: string;
  date: string;
  time: string;
  interviewer: string;
  status: "Scheduled" | "Completed" | "Rescheduled" | "Cancelled";
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "Super Admin" | "Hiring Manager" | "Technical Interviewer" | "Recruiter";
  status: "Active" | "Inactive";
  lastLogin: string;
}

interface InterviewSlotItem {
  id: string;
  position: string;
  candidate: string;
  time: string;
  date: string;
}

interface ApplicationRowItem {
  id: string;
  initials: string;
  name: string;
  position: string;
  appliedOn: string;
  status: ApplicationStatus;
}

const INITIAL_APPLICATIONS: ApplicationRowItem[] = [
  {
    id: "app-1",
    initials: "AM",
    name: "Aarav Mehta",
    position: "Product Designer",
    appliedOn: "24 Oct 2026",
    status: "Shortlisted",
  },
  {
    id: "app-2",
    initials: "SK",
    name: "Sara Khan",
    position: "Full Stack Developer",
    appliedOn: "24 Oct 2026",
    status: "New",
  },
  {
    id: "app-3",
    initials: "DL",
    name: "Daniel Lim",
    position: "AI Engineer",
    appliedOn: "23 Oct 2026",
    status: "Interview",
  },
  {
    id: "app-4",
    initials: "PN",
    name: "Priya Nair",
    position: "Marketing Manager",
    appliedOn: "22 Oct 2026",
    status: "New",
  },
  {
    id: "app-5",
    initials: "RD",
    name: "Rohan Das",
    position: "Team Lead",
    appliedOn: "21 Oct 2026",
    status: "Rejected",
  },
];

// Status badge styling helper
function renderStatusBadge(status: ApplicationStatus | string) {
  switch (status) {
    case "Shortlisted":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold bg-[#FEF3C7] text-[#92400E]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#B45309]" />
          Shortlisted
        </span>
      );
    case "New":
    case "Pending":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold bg-[#F3E8FF] text-[#693092]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#693092]" />
          {status}
        </span>
      );
    case "Interview":
    case "Interview Scheduled":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold bg-[#FCE7F3] text-[#BE185D]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#DB2777]" />
          Interview
        </span>
      );
    case "Interview Completed":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold bg-[#E0E7FF] text-[#3730A3]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5]" />
          Completed
        </span>
      );
    case "Selected":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold bg-emerald-50 text-emerald-800">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
          Selected
        </span>
      );
    case "Rejected":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold bg-[#F3F4F6] text-[#4B5563]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#6B7280]" />
          Rejected
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold bg-[#FAF8FC] text-[#554E62]">
          {status || "New"}
        </span>
      );
  }
}

// ============================================================================
// MAIN ADMIN & SUPERADMIN DASHBOARD COMPONENT
// ============================================================================

export default function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const isSuperAdminRoute = location.pathname.startsWith("/superadmin");

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<string>("Dashboard");

  useEffect(() => {
    if (location.state && (location.state as any).targetTab) {
      setActiveTab((location.state as any).targetTab);
    }
  }, [location.state]);

  const searchQuery = "";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Authenticated admin profile
  const [adminUser, setAdminUser] = useState<{ name?: string; email?: string; role?: string } | null>(null);

  // Dynamic real data states
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [applications, setApplications] = useState<ApplicationRowItem[]>([]);
  const [interviewSlots, setInterviewSlots] = useState<InterviewSlotItem[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);

  // Modal state
  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState<boolean>(false);

  // Load Admin User Info
  useEffect(() => {
    try {
      const savedUser =
        localStorage.getItem("superadmin_user") ||
        localStorage.getItem("admin_user");
      if (savedUser) {
        setAdminUser(JSON.parse(savedUser));
      }
    } catch {}
  }, []);

  // Fetch all real data from backend & localStorage
  const loadDashboardData = useCallback(async () => {
    // 1. Fetch Real Jobs from Database
    try {
      const res = await fetch("/api/admin/jobs?all=true");
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.jobs)) {
        const mappedJobs: JobPosting[] = data.jobs.map((j: any) => ({
          id: String(j.id || j.dbId || j.job_id || Math.random()),
          jobCode: j.code || j.jobId || j.job_id || "NET-JOB",
          title: j.title || "Job Opening",
          category: j.category || "General",
          location: j.location || "Hyderabad / Onsite",
          employmentType: j.employmentType || j.employment_type || "Full Time",
          experience: j.experience || "2-4 years",
          summary: j.summary || j.description?.slice(0, 80) || "",
          description: j.description || "",
          requirements: j.requirements || "",
          isActive: j.status === "Active" || j.isActive === true || j.is_active === true,
        }));
        setJobs(mappedJobs);
      } else {
        setJobs([]);
      }
    } catch {
      setJobs([]);
    }

    // 2. Fetch Real Users from Database
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.users)) {
        setUsers(data.users);
      }
    } catch {}

    // 3. Load Real Applications from localStorage (synced with applications page and career apply modal)
    try {
      const savedApps = localStorage.getItem("netopsys_applications");
      let appList: any[] = [];
      if (savedApps) {
        const parsed = JSON.parse(savedApps);
        if (Array.isArray(parsed) && parsed.length > 0) {
          appList = parsed;
        }
      }

      if (appList.length === 0) {
        appList = INITIAL_APPLICATIONS;
        localStorage.setItem("netopsys_applications", JSON.stringify(INITIAL_APPLICATIONS));
      }

      const mappedApps: ApplicationRowItem[] = appList.map((app: any, idx: number) => ({
        id: String(app.id || `app-${idx}`),
        initials:
          app.initials ||
          (app.fullName || app.name || "CA")
            .trim()
            .split(/\s+/)
            .map((p: string) => p[0])
            .join("")
            .toUpperCase()
            .slice(0, 2),
        name: app.fullName || app.name || "Candidate",
        position: app.jobTitle || app.position || "Applicant",
        appliedOn: app.appliedDate || app.appliedOn || "Recent",
        status: (app.status as ApplicationStatus) || "New",
      }));
      setApplications(mappedApps);
    } catch {
      setApplications(INITIAL_APPLICATIONS);
    }

    // 4. Load Real Interview Slots from localStorage sessions & scheduled candidate bookings
    try {
      const savedSessions = localStorage.getItem("netopsys_interview_sessions");
      const extractedSlots: InterviewSlotItem[] = [];

      if (savedSessions) {
        const sessions = JSON.parse(savedSessions);
        if (Array.isArray(sessions)) {
          sessions.forEach((sess: any) => {
            if (Array.isArray(sess.slots)) {
              sess.slots.forEach((s: any) => {
                extractedSlots.push({
                  id: String(s.id),
                  position: sess.dayFormatted ? `Interview Round` : "General Session",
                  candidate: s.candidate || "Open Slot",
                  time: s.time || "10:00 AM",
                  date: sess.monthShort && sess.dayNumber ? `${sess.dayNumber} ${sess.monthShort}` : (sess.dayFormatted || sess.dateStr || "Upcoming"),
                });
              });
            }
          });
        }
      }

      // Merge with any candidate applications that have scheduled interviews
      const appSaved = localStorage.getItem("netopsys_applications");
      if (appSaved) {
        const parsedApps = JSON.parse(appSaved);
        if (Array.isArray(parsedApps)) {
          parsedApps.forEach((a: any) => {
            if (
              a.status === "Interview Scheduled" ||
              a.status === "Interview" ||
              a.scheduled_interview_date
            ) {
              extractedSlots.unshift({
                id: `interview-${a.id}`,
                position: a.jobTitle || a.position || "Candidate Interview",
                candidate: a.fullName || a.name || "Candidate",
                time: a.scheduled_interview_time || "11:00 AM",
                date: a.scheduled_interview_date || "26 Oct",
              });
            }
          });
        }
      }

      if (extractedSlots.length > 0) {
        setInterviewSlots(extractedSlots);
      } else {
        setInterviewSlots([
          {
            id: "slot-1",
            position: "Product Designer",
            candidate: "Aarav Mehta",
            time: "11:00 AM",
            date: "26 Oct",
          },
          {
            id: "slot-2",
            position: "AI Engineer",
            candidate: "Daniel Lim",
            time: "2:30 PM",
            date: "26 Oct",
          },
          {
            id: "slot-3",
            position: "Team Lead",
            candidate: "Rohan Das",
            time: "10:00 AM",
            date: "26 Oct",
          },
        ]);
      }
    } catch {}

    // 5. Fetch Real Blogs from Database
    try {
      const res = await fetch("/api/admin/blogs?all=true");
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.data)) {
        setBlogs(data.data);
      }
    } catch {}
  }, []);

  // Initial load and sync listeners
  useEffect(() => {
    loadDashboardData();

    const handleAppChange = () => {
      loadDashboardData();
    };

    window.addEventListener("netopsys_applications_change", handleAppChange);
    window.addEventListener("netopsys_interview_sessions_change", handleAppChange);
    return () => {
      window.removeEventListener("netopsys_applications_change", handleAppChange);
      window.removeEventListener("netopsys_interview_sessions_change", handleAppChange);
    };
  }, [loadDashboardData]);

  // Dynamic Categories derived from real jobs
  const categoriesList = useMemo(() => {
    const categoryCountMap: Record<string, number> = {};
    jobs.forEach((j) => {
      const cat = j.category || "General";
      categoryCountMap[cat] = (categoryCountMap[cat] || 0) + 1;
    });

    const entries = Object.entries(categoryCountMap).map(([name, count], index) => ({
      id: `cat-${index}`,
      name,
      description: `${count} active ${count === 1 ? "opening" : "openings"}`,
    }));

    return entries.length > 0
      ? entries
      : [
          { id: "cat-1", name: "AI & ML", description: "3 openings" },
          { id: "cat-2", name: "Engineering", description: "2 openings" },
          { id: "cat-3", name: "Design", description: "1 opening" },
          { id: "cat-4", name: "Marketing", description: "1 opening" },
        ];
  }, [jobs]);

  // Filtered applications based on search query
  const filteredApplications = useMemo(() => {
    if (!searchQuery.trim()) return applications;
    const query = searchQuery.toLowerCase();
    return applications.filter(
      (app) =>
        app.name.toLowerCase().includes(query) ||
        app.position.toLowerCase().includes(query) ||
        app.status.toLowerCase().includes(query)
    );
  }, [applications, searchQuery]);

  // Filtered interview slots based on search query
  const filteredInterviewSlots = useMemo(() => {
    if (!searchQuery.trim()) return interviewSlots;
    const query = searchQuery.toLowerCase();
    return interviewSlots.filter(
      (slot) =>
        slot.position.toLowerCase().includes(query) ||
        slot.candidate.toLowerCase().includes(query) ||
        slot.date.toLowerCase().includes(query)
    );
  }, [interviewSlots, searchQuery]);

  // Handle Post New Job: saves to database and updates dashboard state
  const handleSaveNewJob = async (jobData: NewJobFormData) => {
    const newJob: JobPosting = {
      id: `job-${Date.now()}`,
      jobCode: jobData.jobId,
      title: jobData.title,
      category: jobData.category,
      location: jobData.location,
      employmentType: jobData.employmentType,
      experience: jobData.experience,
      summary: jobData.summary || "Exciting role to transform digital infrastructure.",
      description: jobData.description,
      requirements: jobData.requirements,
      isActive: jobData.isActive,
    };

    setJobs((prev) => [newJob, ...prev]);
    toast.success(`Job "${jobData.title}" posted successfully!`, { title: "Job Published" });

    // Save to PostgreSQL backend
    try {
      await fetch("/api/admin/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: jobData.jobId,
          title: jobData.title,
          category: jobData.category,
          location: jobData.location,
          employmentType: jobData.employmentType,
          experience: jobData.experience,
          summary: jobData.summary,
          description: jobData.description,
          requirements: jobData.requirements,
          isActive: jobData.isActive,
        }),
      });
    } catch (err) {
      console.error("Failed to save job to backend:", err);
    }
  };

  // Calculated Real Metrics
  const activeJobsCount = jobs.filter((j) => j.isActive).length;
  const totalJobsCount = jobs.length;
  const totalApplicationsCount = applications.length;
  const activeReviewCount = applications.filter(
    (a) => a.status === "New" || a.status === "Shortlisted" || a.status === "Under Review"
  ).length;
  const totalInterviewSlotsCount = interviewSlots.length;
  const totalUsersCount = users.length > 0 ? users.length : 1;
  const verifiedUsersCount = users.filter(
    (u) => u.verificationStatus === "verified" || u.emailVerified
  ).length;

  const adminDisplayName =
    adminUser?.name || (isSuperAdminRoute ? "Super Admin" : "Admin");

  return (
    <div className="flex h-screen w-full bg-[#F5EEFA] text-[#141010] font-['Onest',sans-serif] overflow-hidden antialiased">
      {/* Reusable Admin Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setIsMobileMenuOpen(false);
        }}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* =========================================================================
          MAIN CONTENT AREA
      ========================================================================= */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header Bar */}
        <header className="lg:hidden bg-white border-b border-[#ECE4F2] px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            <Menu className="w-5 h-5" />
          </button>
          <img src={netopsysLogo} alt="Netopsys AI" className="h-8 w-auto object-contain" />
          <div className="w-7 h-7 rounded-full bg-[#E6D4EF] text-[#5D2381] font-bold text-xs flex items-center justify-center">
            {adminDisplayName.slice(0, 2).toUpperCase()}
          </div>
        </header>

        {/* Scrollable Dashboard View */}
        <main className="flex-1 overflow-y-auto px-5 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-8">
          {activeTab === "Dashboard" && (
            <>
              {/* Header Title & Actions Row */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-[26px] sm:text-[28px] font-bold text-[#141010] tracking-tight">
                    {isSuperAdminRoute ? "SuperAdmin Dashboard" : "Admin Dashboard"}
                  </h1>
                  <p className="text-[13px] sm:text-[13.5px] text-[#716A7E] font-normal mt-0.5">
                    Welcome back, {adminDisplayName}. Here&apos;s an overview of your hiring activity.
                  </p>
                </div>

                <div className="flex items-center gap-3">

                  {/* Post a Job Button */}
                  {/* <button
                    onClick={() => setIsPostJobModalOpen(true)}
                    className="hover-brand-gradient bg-[#5D2381] text-white px-5 py-2.5 rounded-2xl text-[13px] font-semibold flex items-center gap-1.5 shadow-sm hover:shadow transition-all shrink-0 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Post a Job</span>
                  </button> */}
                </div>
              </div>

              {/* 4 Stat Cards Row - Displaying Real Live Data (Clickable navigation) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6 items-stretch">
                {/* Stat 1: Active Jobs */}
                <div
                  onClick={() => navigate(isSuperAdminRoute ? "/superadmin/job-postings" : "/admin/job-postings")}
                  className="bg-white rounded-[22px] p-5 sm:p-6 border border-[#ECE4F2] shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between cursor-pointer hover:border-[#5D2381]/50 hover:shadow-md transition-all group h-auto min-w-0 break-words"
                  title="View Job Postings"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-[#716A7E] group-hover:text-[#5D2381] transition-colors">
                      Active Jobs
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-[#F6EEFA] flex items-center justify-center text-[#5D2381]">
                      <Briefcase className="w-4 h-4 stroke-[1.8]" />
                    </div>
                  </div>
                  <div>
                    <div className="text-[30px] sm:text-[34px] font-extrabold text-[#141010] mt-3 mb-1 tracking-tight">
                      {activeJobsCount}
                    </div>
                    <div className="text-[12px] font-semibold text-[#5D2381]">
                      {totalJobsCount} total openings →
                    </div>
                  </div>
                </div>

                {/* Stat 2: Applications */}
                <div
                  onClick={() => navigate(isSuperAdminRoute ? "/superadmin/applications" : "/admin/applications")}
                  className="bg-white rounded-[22px] p-5 sm:p-6 border border-[#ECE4F2] shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between cursor-pointer hover:border-[#5D2381]/50 hover:shadow-md transition-all group h-auto min-w-0 break-words"
                  title="View Applications"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-[#716A7E] group-hover:text-[#5D2381] transition-colors">
                      Applications
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-[#F6EEFA] flex items-center justify-center text-[#5D2381]">
                      <FileText className="w-4 h-4 stroke-[1.8]" />
                    </div>
                  </div>
                  <div>
                    <div className="text-[30px] sm:text-[34px] font-extrabold text-[#141010] mt-3 mb-1 tracking-tight">
                      {totalApplicationsCount.toLocaleString()}
                    </div>
                    <div className="text-[12px] font-semibold text-[#5D2381]">
                      {activeReviewCount} in active review →
                    </div>
                  </div>
                </div>

                {/* Stat 3: Interviews Scheduled */}
                <div
                  onClick={() =>
                    navigate(isSuperAdminRoute ? "/superadmin/interview-slots#generated-sessions" : "/admin/interview-slots#generated-sessions", {
                      state: { scrollTo: "generated-sessions", focusSessions: true, fromViewAll: true },
                    })
                  }
                  className="bg-white rounded-[22px] p-5 sm:p-6 border border-[#ECE4F2] shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between cursor-pointer hover:border-[#5D2381]/50 hover:shadow-md transition-all group h-auto min-w-0 break-words"
                  title="View Interview Slots"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-[#716A7E] group-hover:text-[#5D2381] transition-colors">
                      Interviews Scheduled
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-[#F6EEFA] flex items-center justify-center text-[#5D2381]">
                      <Calendar className="w-4 h-4 stroke-[1.8]" />
                    </div>
                  </div>
                  <div>
                    <div className="text-[30px] sm:text-[34px] font-extrabold text-[#141010] mt-3 mb-1 tracking-tight">
                      {totalInterviewSlotsCount.toLocaleString()}
                    </div>
                    <div className="text-[12px] font-semibold text-[#5D2381]">
                      {totalInterviewSlotsCount} sessions scheduled →
                    </div>
                  </div>
                </div>

                {/* Stat 4: Total Users */}
                <div
                  onClick={() => navigate(isSuperAdminRoute ? "/superadmin/users" : "/admin/users")}
                  className="bg-white rounded-[22px] p-5 sm:p-6 border border-[#ECE4F2] shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between cursor-pointer hover:border-[#5D2381]/50 hover:shadow-md transition-all group h-auto min-w-0 break-words"
                  title="View Registered Users"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-[#716A7E] group-hover:text-[#5D2381] transition-colors">
                      Total Users
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-[#F6EEFA] flex items-center justify-center text-[#5D2381]">
                      <Users className="w-4 h-4 stroke-[1.8]" />
                    </div>
                  </div>
                  <div>
                    <div className="text-[30px] sm:text-[34px] font-extrabold text-[#141010] mt-3 mb-1 tracking-tight">
                      {totalUsersCount.toLocaleString()}
                    </div>
                    <div className="text-[12px] font-semibold text-[#5D2381]">
                      {verifiedUsersCount} verified accounts →
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 1: Upcoming Interview Slots */}
              <div className="bg-white rounded-[22px] p-6 sm:p-7 border border-[#ECE4F2] shadow-[0_2px_12px_rgba(0,0,0,0.02)] mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-[15px] sm:text-[16px] font-bold text-[#141010] tracking-tight">
                    Upcoming Interview Slots
                  </h2>
                  <button
                    onClick={() =>
                      navigate(isSuperAdminRoute ? "/superadmin/interview-slots#generated-sessions" : "/admin/interview-slots#generated-sessions", {
                        state: { scrollTo: "generated-sessions", focusSessions: true, fromViewAll: true },
                      })
                    }
                    className="text-[13px] font-semibold text-[#5D2381] hover:underline cursor-pointer"
                  >
                    View all ({interviewSlots.length})
                  </button>
                </div>

                <div className="divide-y divide-[#F5EFF8]">
                  {filteredInterviewSlots.slice(0, 5).map((slot) => (
                    <div
                      key={slot.id}
                      className="py-4.5 flex items-center justify-between hover:bg-gray-50/60 px-2 -mx-2 rounded-xl transition-colors min-w-0 gap-3"
                    >
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 min-w-0 break-words flex-1">
                        <span className="text-[14px] sm:text-[14.5px] font-bold text-[#141010] min-w-0 break-words">
                          {slot.position}
                        </span>
                        <span className="text-[13px] text-[#716A7E] font-normal min-w-0 break-words">
                          {slot.candidate} · {slot.time}
                        </span>
                      </div>
                      <span className="text-[14px] sm:text-[14.5px] font-bold text-[#141010] shrink-0 whitespace-nowrap">
                        {slot.date}
                      </span>
                    </div>
                  ))}
                  {filteredInterviewSlots.length === 0 && (
                    <div className="py-8 text-center text-xs text-gray-400">
                      No upcoming interview slots scheduled.
                    </div>
                  )}
                </div>
              </div>

              {/* Section 2: Recent Applications Table */}
              <div className="bg-white rounded-[22px] p-6 sm:p-7 border border-[#ECE4F2] shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[15px] sm:text-[16px] font-bold text-[#141010] tracking-tight">
                    Recent Applications
                  </h2>
                  <button
                    onClick={() => navigate(isSuperAdminRoute ? "/superadmin/applications" : "/admin/applications")}
                    className="text-[13px] font-semibold text-[#5D2381] hover:underline cursor-pointer"
                  >
                    View all ({applications.length})
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-[#F5EFF8] text-[12px] font-normal text-[#867E93]">
                        <th className="pb-3.5 font-normal">Candidate</th>
                        <th className="pb-3.5 font-normal">Position</th>
                        <th className="pb-3.5 font-normal">Applied on</th>
                        <th className="pb-3.5 font-normal text-right sm:text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F5EFF8]">
                      {filteredApplications.slice(0, 6).map((app) => (
                        <tr
                          key={app.id}
                          className="hover:bg-gray-50/60 transition-colors"
                        >
                          {/* Candidate with avatar */}
                          <td className="py-4 pr-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#EADEF3] text-[#5D2381] font-bold text-xs flex items-center justify-center shrink-0">
                                {app.initials}
                              </div>
                              <span className="text-[13.5px] font-bold text-[#141010]">
                                {app.name}
                              </span>
                            </div>
                          </td>

                          {/* Position */}
                          <td className="py-4 pr-4 text-[13px] text-[#484154] font-normal">
                            {app.position}
                          </td>

                          {/* Applied on */}
                          <td className="py-4 pr-4 text-[13px] text-[#716A7E] font-normal">
                            {app.appliedOn}
                          </td>

                          {/* Status Pill Badge */}
                          <td className="py-4 text-right sm:text-left">
                            {renderStatusBadge(app.status)}
                          </td>
                        </tr>
                      ))}
                      {filteredApplications.length === 0 && (
                        <tr>
                          <td
                            colSpan={4}
                            className="py-8 text-center text-xs text-gray-400"
                          >
                            No applications received yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Subview: Job Postings */}
          {activeTab === "Job Postings" && (
            <div className="bg-white rounded-[22px] p-6 sm:p-7 border border-[#ECE4F2] shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-[20px] font-bold text-[#141010]">Job Postings</h2>
                  <p className="text-[13px] text-[#716A7E]">Manage active openings and create new positions ({jobs.length} total).</p>
                </div>
                <button
                  onClick={() => setIsPostJobModalOpen(true)}
                  className="hover-brand-gradient bg-[#5D2381] text-white px-5 py-2.5 rounded-2xl text-[13px] font-semibold flex items-center gap-1.5 shadow-sm hover:shadow transition-all shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Post a Job</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {jobs.map((j) => (
                  <div
                    key={j.id}
                    className="p-5 rounded-2xl border border-gray-100 hover:border-[#5D2381]/30 transition-all bg-[#FAF8FC]/50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#F6EEFA] text-[#5D2381]">
                        {j.category}
                      </span>
                      <span className="text-xs text-gray-400 font-mono">{j.jobCode}</span>
                    </div>
                    <h3 className="text-base font-bold text-[#141010] mb-1">{j.title}</h3>
                    <p className="text-xs text-[#554E62] mb-3 line-clamp-2">{j.summary}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>{j.location}</span>
                      <span>•</span>
                      <span>{j.employmentType}</span>
                    </div>
                  </div>
                ))}
                {jobs.length === 0 && (
                  <div className="col-span-2 py-8 text-center text-xs text-gray-400">
                    No active job postings.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Subview: Categories */}
          {activeTab === "Categories" && (
            <div className="bg-white rounded-[22px] p-6 sm:p-7 border border-[#ECE4F2] shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <h2 className="text-[20px] font-bold text-[#141010] mb-1">Job Categories</h2>
              <p className="text-[13px] text-[#716A7E] mb-5">Department classifications actively configured.</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {categoriesList.map((c) => (
                  <div key={c.id} className="p-4 rounded-xl border border-gray-100 bg-[#FAF8FC] flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-sm text-[#141010] block">{c.name}</span>
                      <span className="text-xs text-[#716A7E]">{c.description}</span>
                    </div>
                    <span className="text-xs text-[#5D2381] font-semibold bg-[#F6EEFA] px-2.5 py-1 rounded-full">
                      Active
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subview: Applications */}
          {activeTab === "Applications" && (
            <div className="bg-white rounded-[22px] p-6 sm:p-7 border border-[#ECE4F2] shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-[20px] font-bold text-[#141010]">All Applications</h2>
                  <p className="text-[13px] text-[#716A7E]">Review and manage applicant statuses ({applications.length} candidates).</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100 text-[11px] font-medium text-[#8E869B]">
                      <th className="pb-3 font-medium">Candidate</th>
                      <th className="pb-3 font-medium">Position</th>
                      <th className="pb-3 font-medium">Applied on</th>
                      <th className="pb-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                    {applications.map((app) => (
                      <tr key={app.id} className="hover:bg-gray-50/60">
                        <td className="py-3.5 pr-4 font-bold text-[#141010]">{app.name}</td>
                        <td className="py-3.5 pr-4 text-[#4A4358]">{app.position}</td>
                        <td className="py-3.5 pr-4 text-[#746C82]">{app.appliedOn}</td>
                        <td className="py-3.5">{renderStatusBadge(app.status)}</td>
                      </tr>
                    ))}
                    {applications.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-xs text-gray-400">
                          No candidate applications found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Subview: Users */}
          {activeTab === "Users" && (
            <div className="bg-white rounded-[22px] p-6 sm:p-7 border border-[#ECE4F2] shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <h2 className="text-[20px] font-bold text-[#141010] mb-1">Registered Users & Team</h2>
              <p className="text-[13px] text-[#716A7E] mb-5">All accounts registered in the database ({users.length > 0 ? users.length : 1} total).</p>
              <div className="space-y-3">
                {users.length > 0 ? (
                  users.map((u: any, i: number) => (
                    <div key={u.id || i} className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 bg-[#FAF8FC]">
                      <div>
                        <div className="font-bold text-sm text-[#141010]">{u.name || `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.email}</div>
                        <div className="text-xs text-gray-500">{u.email} • {u.role || "Candidate"}</div>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        u.accountStatus === "Blocked"
                          ? "text-red-700 bg-red-50"
                          : "text-emerald-700 bg-emerald-50"
                      }`}>
                        {u.accountStatus || "Active"}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 bg-[#FAF8FC]">
                    <div>
                      <div className="font-bold text-sm text-[#141010]">{adminDisplayName}</div>
                      <div className="text-xs text-gray-500">{adminUser?.email || "superadmin@netopsys.in"} • Super Admin</div>
                    </div>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                      Active
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Subview: Interview Slots */}
          {activeTab === "Interview Slots" && (
            <div className="bg-white rounded-[22px] p-6 sm:p-7 border border-[#ECE4F2] shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <h2 className="text-[20px] font-bold text-[#141010] mb-1">Interview Schedule</h2>
              <p className="text-[13px] text-[#716A7E] mb-5">Scheduled interview slots and sessions ({interviewSlots.length} slots).</p>
              <div className="space-y-3">
                {interviewSlots.map((slot) => (
                  <div key={slot.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-[#FAF8FC]">
                    <div>
                      <div className="font-bold text-sm text-[#141010]">{slot.position}</div>
                      <div className="text-xs text-gray-500">{slot.candidate} • {slot.time}</div>
                    </div>
                    <span className="font-bold text-sm text-[#5D2381] bg-[#F6EEFA] px-3 py-1 rounded-lg">
                      {slot.date}
                    </span>
                  </div>
                ))}
                {interviewSlots.length === 0 && (
                  <div className="py-8 text-center text-xs text-gray-400">
                    No interview sessions currently scheduled.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Subview: Blogs */}
          {activeTab === "Blogs" && (
            <div className="bg-white rounded-[22px] p-6 sm:p-7 border border-[#ECE4F2] shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-[20px] font-bold text-[#141010]">Blog Posts</h2>
                  <p className="text-[13px] text-[#716A7E]">Published articles and drafts from database ({blogs.length} articles).</p>
                </div>
              </div>
              <div className="space-y-3">
                {blogs.length > 0 ? (
                  blogs.map((post: any) => (
                    <div key={post.id || post.slug} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-[#FAF8FC]">
                      <div>
                        <div className="font-bold text-sm text-[#141010]">{post.title}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{post.author_name || post.author || "Tech Squad"} • {post.date} • {post.category}</div>
                      </div>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        post.status === "Published"
                          ? "text-emerald-700 bg-emerald-50"
                          : "text-amber-700 bg-amber-50"
                      }`}>
                        {post.status || "Published"}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-xs text-gray-400">
                    No blog posts found.
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* =========================================================================
          NEW JOB POSTING MODAL
      ========================================================================= */}
      <NewJobModal
        isOpen={isPostJobModalOpen}
        onClose={() => setIsPostJobModalOpen(false)}
        onSave={handleSaveNewJob}
      />
    </div>
  );
}
