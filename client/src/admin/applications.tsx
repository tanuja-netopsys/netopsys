import { useState, useMemo, useEffect, useRef } from "react";
import {
  // Search,
  ChevronDown,
  ChevronUp,
  Download,
  Menu,
  Check,
  CheckCircle2,
} from "lucide-react";
import AdminSidebar from "./sidebar.tsx";
import netopsysLogo from "../assets/netopsys-ai-logo.png";
import { toast } from "../componenets/toast.tsx";

// ============================================================================
// DATA TYPES
// ============================================================================

export type ApplicationStatus =
  | "Pending"
  | "Under Review"
  | "Shortlisted"
  | "Reschedule"
  | "Interview Scheduled"
  | "Interview Completed"
  | "Selected"
  | "Rejected";

export interface QuestionAnswer {
  id: string;
  question: string;
  answer?: string;
  type: "text" | "email";
  date: string;
}

export interface ScreeningDetails {
  fullName: string;
  dob: string;
  gender: string;
  location: string;
  workFromOffice: string;
  expDocuments: string;
  bankStatements: string;
  submitted: string;
  education: string;
  currentCtc: string;
  expectedCtc: string;
  bgCheck: string;
  noticePeriod: string;
  willingToRelocate: string;
}

export interface CandidateApplication {
  id: string;
  initials: string;
  fullName: string;
  email: string;
  jobCode: string;
  jobTitle: string;
  status: ApplicationStatus;
  appliedDate: string;
  coverLetter: string;
  resumeUrl?: string;
  remarks?: string;
  questions?: QuestionAnswer[];
  screeningDetails?: ScreeningDetails;
}

// Fallback helper to guarantee complete screening details for every candidate application
export function getScreeningDetails(app: CandidateApplication): ScreeningDetails {
  if (app.screeningDetails) return app.screeningDetails;
  return {
    fullName: app.fullName,
    dob: "1998-08-15",
    gender: "Not specified",
    location: "Bengaluru, Karnataka",
    workFromOffice: "Yes",
    expDocuments: "Yes",
    bankStatements: "Yes",
    submitted: `${app.appliedDate}, 10:30:00 AM`,
    education: "B.Tech (CSE)",
    currentCtc: "5.0 LPA",
    expectedCtc: "8-10 LPA",
    bgCheck: "Yes",
    noticePeriod: "30 DAYS",
    willingToRelocate: "Yes",
  };
}

// ============================================================================
// STATUS CONFIGURATION (Color Badges matching Screenshot)
// ============================================================================

interface StatusBadgeConfig {
  label: ApplicationStatus;
  dotColor: string;
  badgeBg: string;
  textColor: string;
  borderColor: string;
}

const STATUS_CONFIGS: Record<ApplicationStatus, StatusBadgeConfig> = {
  Pending: {
    label: "Pending",
    dotColor: "bg-[#D97706]",
    badgeBg: "bg-[#FEF6EC]",
    textColor: "text-[#D97706]",
    borderColor: "border-[#FDE68A]",
  },
  "Under Review": {
    label: "Under Review",
    dotColor: "bg-[#6366F1]",
    badgeBg: "bg-[#EDE9FE]",
    textColor: "text-[#6366F1]",
    borderColor: "border-[#DDD6FE]",
  },
  Shortlisted: {
    label: "Shortlisted",
    dotColor: "bg-[#059669]",
    badgeBg: "bg-[#ECFDF5]",
    textColor: "text-[#059669]",
    borderColor: "border-[#A7F3D0]",
  },
  Reschedule: {
    label: "Reschedule",
    dotColor: "bg-[#EA580C]",
    badgeBg: "bg-[#FFF7ED]",
    textColor: "text-[#EA580C]",
    borderColor: "border-[#FFEDD5]",
  },
  "Interview Scheduled": {
    label: "Interview Scheduled",
    dotColor: "bg-[#7C3AED]",
    badgeBg: "bg-[#F3E8FF]",
    textColor: "text-[#7C3AED]",
    borderColor: "border-[#E9D5FF]",
  },
  "Interview Completed": {
    label: "Interview Completed",
    dotColor: "bg-[#0D9488]",
    badgeBg: "bg-[#CCFBF1]",
    textColor: "text-[#0D9488]",
    borderColor: "border-[#99F6E4]",
  },
  Selected: {
    label: "Selected",
    dotColor: "bg-[#16A34A]",
    badgeBg: "bg-[#DCFCE7]",
    textColor: "text-[#16A34A]",
    borderColor: "border-[#BBF7D0]",
  },
  Rejected: {
    label: "Rejected",
    dotColor: "bg-[#DC2626]",
    badgeBg: "bg-[#FEE2E2]",
    textColor: "text-[#DC2626]",
    borderColor: "border-[#FECACA]",
  },
};

// ============================================================================
// INITIAL SAMPLE CANDIDATES (Matching Screenshot Exactly)
// ============================================================================

const INITIAL_APPLICATIONS: CandidateApplication[] = [
  {
    id: "app-1",
    initials: "AR",
    fullName: "Ananya Rao",
    email: "ananya.rao@example.com",
    jobCode: "NET-AI-001",
    jobTitle: "AI Engineer - Generative AI & Agentic Systems",
    status: "Pending",
    appliedDate: "10/6/2026",
    coverLetter: `Dear Hiring Team,\nI hope this email finds you well. I'm writing to express my interest in AI/ML Engineer opportunities at NetOpsys AI. I'm an AI/ML Engineer with 1.5+ years of hands-on experience building production Machine Learning, Generative AI, and Agentic AI solutions.\nWhat I've built:\nA production RAG chatbot (LangChain, pgvector) with hybrid search and re-ranking, achieving`,
    resumeUrl: "#",
    remarks: "",
    questions: [],
    screeningDetails: {
      fullName: "Ananya Rao",
      dob: "1998-05-14",
      gender: "Female",
      location: "Bengaluru Karnataka",
      workFromOffice: "Yes",
      expDocuments: "Yes",
      bankStatements: "Yes",
      submitted: "10/6/2026, 11:24:05 AM",
      education: "M.Tech (AI & ML)",
      currentCtc: "6.5 LPA",
      expectedCtc: "9-11 LPA",
      bgCheck: "Yes",
      noticePeriod: "15 DAYS",
      willingToRelocate: "Yes",
    },
  },
  {
    id: "app-2",
    initials: "RM",
    fullName: "Rohan Mehta",
    email: "rohan.mehta@example.com",
    jobCode: "NET-AI-001",
    jobTitle: "AI Engineer - Generative AI & Agentic Systems",
    status: "Under Review",
    appliedDate: "11/6/2026",
    coverLetter: `Hello NetOpsys AI Team,\nI am an AI researcher and developer with hands-on expertise building enterprise agentic workflows, multi-agent frameworks like AutoGen and CrewAI, and deploying high-performance LLM microservices with FastAPI and vLLM.`,
    resumeUrl: "#",
    remarks: "",
    questions: [],
    screeningDetails: {
      fullName: "Rohan Mehta",
      dob: "1997-09-22",
      gender: "Male",
      location: "Hyderabad Telangana",
      workFromOffice: "Yes",
      expDocuments: "Yes",
      bankStatements: "Yes",
      submitted: "11/6/2026, 02:45:12 PM",
      education: "B.Tech (CSE)",
      currentCtc: "8.0 LPA",
      expectedCtc: "12-14 LPA",
      bgCheck: "Yes",
      noticePeriod: "30 DAYS",
      willingToRelocate: "Yes",
    },
  },
  {
    id: "app-3",
    initials: "PN",
    fullName: "Priya Nair",
    email: "priya.nair@example.com",
    jobCode: "NET-AI-001",
    jobTitle: "AI Engineer - Generative AI & Agentic Systems",
    status: "Shortlisted",
    appliedDate: "10/5/2026",
    coverLetter: `Dear Hiring Team,\nI hope this email finds you well. I'm writing to express my interest in AI/ML Engineer opportunities at NetOpsys AI. I'm an AI/ML Engineer with 1.5+ years of hands-on experience building production Machine Learning, Generative AI, and Agentic AI solutions.\nWhat I've built:\nA production RAG chatbot (LangChain, pgvector) with hybrid search and re-ranking, achieving`,
    resumeUrl: "#",
    remarks: "",
    questions: [],
    screeningDetails: {
      fullName: "Priya Nair",
      dob: "1999-11-02",
      gender: "Female",
      location: "Kochi Kerala",
      workFromOffice: "Yes",
      expDocuments: "Yes",
      bankStatements: "Yes",
      submitted: "20/5/2026, 3:15:18 PM",
      education: "B.Tech (CSE)",
      currentCtc: "5.2",
      expectedCtc: "7-9 LPA",
      bgCheck: "Yes",
      noticePeriod: "30 DAYS",
      willingToRelocate: "Yes",
    },
  },
  {
    id: "app-4",
    initials: "KR",
    fullName: "Karthik Reddy",
    email: "karthik.reddy@example.com",
    jobCode: "NET-AI-001",
    jobTitle: "AI Engineer - Generative AI & Agentic Systems",
    status: "Reschedule",
    appliedDate: "09/6/2026",
    coverLetter: `Hi Team,\nI am reaching out to explore AI engineer openings. I have designed real-time agentic pipelines and tool-calling architectures for automated customer engagement and data analytics.`,
    resumeUrl: "#",
    remarks: "",
    questions: [],
    screeningDetails: {
      fullName: "Karthik Reddy",
      dob: "1996-12-18",
      gender: "Male",
      location: "Visakhapatnam Andhra Pradesh",
      workFromOffice: "Yes",
      expDocuments: "Yes",
      bankStatements: "Yes",
      submitted: "09/6/2026, 09:12:44 AM",
      education: "B.Tech (IT)",
      currentCtc: "7.2 LPA",
      expectedCtc: "10-12 LPA",
      bgCheck: "Yes",
      noticePeriod: "Immediate",
      willingToRelocate: "Yes",
    },
  },
  {
    id: "app-5",
    initials: "RV",
    fullName: "Rahul Verma",
    email: "rahul.verma@example.com",
    jobCode: "NET-AI-001",
    jobTitle: "AI Engineer - Generative AI & Agentic Systems",
    status: "Interview Scheduled",
    appliedDate: "08/6/2026",
    coverLetter: `Greetings NetOpsys Team,\nI specialize in cloud-native scalable ML systems, Kubernetes orchestration for GPU workloads, and low-latency inference endpoints with TensorRT-LLM.`,
    resumeUrl: "#",
    remarks: "",
    questions: [],
    screeningDetails: {
      fullName: "Rahul Verma",
      dob: "1995-04-30",
      gender: "Male",
      location: "Pune Maharashtra",
      workFromOffice: "Yes",
      expDocuments: "Yes",
      bankStatements: "Yes",
      submitted: "08/6/2026, 04:30:20 PM",
      education: "B.E (Computer Science)",
      currentCtc: "9.5 LPA",
      expectedCtc: "13-15 LPA",
      bgCheck: "Yes",
      noticePeriod: "60 DAYS",
      willingToRelocate: "Yes",
    },
  },
  {
    id: "app-6",
    initials: "SP",
    fullName: "Sneha Patel",
    email: "sneha.patel@example.com",
    jobCode: "NET-AI-001",
    jobTitle: "AI Engineer - Generative AI & Agentic Systems",
    status: "Interview Completed",
    appliedDate: "07/6/2026",
    coverLetter: `Dear NetOpsys Leadership,\nExperienced in architecting enterprise graph-RAG solutions, semantic cache layers, and evaluation pipelines using Ragas and LangSmith.`,
    resumeUrl: "#",
    remarks: "",
    questions: [],
    screeningDetails: {
      fullName: "Sneha Patel",
      dob: "1998-07-11",
      gender: "Female",
      location: "Ahmedabad Gujarat",
      workFromOffice: "Yes",
      expDocuments: "Yes",
      bankStatements: "Yes",
      submitted: "07/6/2026, 01:20:15 PM",
      education: "M.S (Software Engineering)",
      currentCtc: "6.0 LPA",
      expectedCtc: "8-10 LPA",
      bgCheck: "Yes",
      noticePeriod: "30 DAYS",
      willingToRelocate: "Yes",
    },
  },
  {
    id: "app-7",
    initials: "VS",
    fullName: "Vikram Shah",
    email: "vikram.shah@example.com",
    jobCode: "NET-AI-001",
    jobTitle: "AI Engineer - Generative AI & Agentic Systems",
    status: "Selected",
    appliedDate: "05/6/2026",
    coverLetter: `Dear NetOpsys AI,\nProven track record of designing distributed AI agent workflows and integrating multi-modal foundational models into production SaaS platforms.`,
    resumeUrl: "#",
    remarks: "",
    questions: [],
    screeningDetails: {
      fullName: "Vikram Shah",
      dob: "1996-03-08",
      gender: "Male",
      location: "Mumbai Maharashtra",
      workFromOffice: "Yes",
      expDocuments: "Yes",
      bankStatements: "Yes",
      submitted: "05/6/2026, 10:05:55 AM",
      education: "B.Tech (CSE)",
      currentCtc: "11.0 LPA",
      expectedCtc: "15-18 LPA",
      bgCheck: "Yes",
      noticePeriod: "30 DAYS",
      willingToRelocate: "Yes",
    },
  },
  {
    id: "app-8",
    initials: "AK",
    fullName: "Aisha Khan",
    email: "aisha.khan@example.com",
    jobCode: "NET-AI-001",
    jobTitle: "AI Engineer - Generative AI & Agentic Systems",
    status: "Rejected",
    appliedDate: "04/6/2026",
    coverLetter: `Hi Team,\nApplication for the AI engineering position. Background in full-stack web development and recent completion of deep learning certifications.`,
    resumeUrl: "#",
    remarks: "",
    questions: [],
    screeningDetails: {
      fullName: "Aisha Khan",
      dob: "2000-01-25",
      gender: "Female",
      location: "Delhi NCR",
      workFromOffice: "Yes",
      expDocuments: "Yes",
      bankStatements: "Yes",
      submitted: "04/6/2026, 12:40:10 PM",
      education: "B.Sc (Computer Science)",
      currentCtc: "3.8 LPA",
      expectedCtc: "5-7 LPA",
      bgCheck: "Yes",
      noticePeriod: "Immediate",
      willingToRelocate: "Yes",
    },
  },
];

export interface FilterTabConfig {
  label: string;
  value: string;
  count: number;
}

export default function ApplicationsPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchQuery = "";
  const [activeFilter, setActiveFilter] = useState("All");

  // State for all applications with localStorage persistence
  const [applications, setApplications] = useState<CandidateApplication[]>(() => {
    try {
      const saved = localStorage.getItem("netopsys_applications");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      localStorage.setItem("netopsys_applications", JSON.stringify(INITIAL_APPLICATIONS));
    } catch {
      // fallback
    }
    return INITIAL_APPLICATIONS;
  });

  // Ref flags to prevent self-triggering infinite re-render loop
  const isInternalUpdate = useRef(false);
  const isFirstMount = useRef(true);

  // Listen to external application changes (e.g. from Careers page modal submission)
  useEffect(() => {
    const handleSync = () => {
      // If the event originated from this component's own state change, ignore it
      if (isInternalUpdate.current) {
        isInternalUpdate.current = false;
        return;
      }
      try {
        const saved = localStorage.getItem("netopsys_applications");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setApplications((prev) => {
              if (JSON.stringify(prev) === saved) {
                return prev;
              }
              return parsed;
            });
          }
        }
      } catch {}
    };

    window.addEventListener("netopsys_applications_change", handleSync);
    return () => window.removeEventListener("netopsys_applications_change", handleSync);
  }, []);

  // Persist state updates to localStorage (only after user edits, skipping mount)
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    try {
      localStorage.setItem("netopsys_applications", JSON.stringify(applications));
      isInternalUpdate.current = true;
      window.dispatchEvent(new Event("netopsys_applications_change"));
    } catch {}
  }, [applications]);

  // Dynamic counts for each status tab based on actual applications state
  const filterTabs = useMemo<FilterTabConfig[]>(() => {
    const counts: Record<string, number> = {
      All: applications.length,
      Pending: 0,
      "Under Review": 0,
      Shortlisted: 0,
      Reschedule: 0,
      "Interview Scheduled": 0,
      "Interview Completed": 0,
      Selected: 0,
      Rejected: 0,
    };

    applications.forEach((app) => {
      if (counts[app.status] !== undefined) {
        counts[app.status] += 1;
      }
    });

    return [
      { label: "All Applications", value: "All", count: counts.All },
      { label: "Pending", value: "Pending", count: counts.Pending },
      { label: "Under Review", value: "Under Review", count: counts["Under Review"] },
      { label: "Shortlisted", value: "Shortlisted", count: counts.Shortlisted },
      { label: "Reschedule", value: "Reschedule", count: counts.Reschedule },
      {
        label: "Interview Scheduled",
        value: "Interview Scheduled",
        count: counts["Interview Scheduled"],
      },
      {
        label: "Interview Completed",
        value: "Interview Completed",
        count: counts["Interview Completed"],
      },
      { label: "Selected", value: "Selected", count: counts.Selected },
      { label: "Rejected", value: "Rejected", count: counts.Rejected },
    ];
  }, [applications]);

  // Expanded card tracking: all cards closed initially by default on load/refresh
  const [expandedCardIds, setExpandedCardIds] = useState<Record<string, boolean>>({});

  // Selected card tracking for bulk actions
  const [selectedCardIds, setSelectedCardIds] = useState<Record<string, boolean>>({});

  // Bulk update fields
  const [bulkStatus, setBulkStatus] = useState<ApplicationStatus | "">("");
  const [bulkRemarks, setBulkRemarks] = useState("");

  // Per-card edit forms (status, remarks, questions)
  const [cardStatusUpdates, setCardStatusUpdates] = useState<Record<string, ApplicationStatus>>({
    "app-1": "Pending",
  });
  const [cardRemarks, setCardRemarks] = useState<Record<string, string>>({});
  const [cardQuestions, setCardQuestions] = useState<Record<string, string>>({});

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    toast.success(msg, { title: "Application Updated" });
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Toggle card expand/collapse
  const toggleCardExpand = (id: string) => {
    setExpandedCardIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Toggle individual card checkbox
  const toggleCardSelection = (id: string) => {
    setSelectedCardIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Filtered applications based on active filter pill and search query
  const filteredApplications = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return applications.filter((app) => {
      const appStatus = (app.status || "").toLowerCase();
      const filterStatus = (activeFilter || "").toLowerCase();
      const matchesFilter = activeFilter === "All" || appStatus === filterStatus;
      const matchesSearch =
        !q ||
        (app.fullName && app.fullName.toLowerCase().includes(q)) ||
        (app.email && app.email.toLowerCase().includes(q)) ||
        (app.jobTitle && app.jobTitle.toLowerCase().includes(q)) ||
        (app.jobCode && app.jobCode.toLowerCase().includes(q));
      return matchesFilter && matchesSearch;
    });
  }, [applications, activeFilter, searchQuery]);

  // Bulk selection count
  const selectedCount = useMemo(() => {
    return filteredApplications.filter((app) => selectedCardIds[app.id]).length;
  }, [filteredApplications, selectedCardIds]);

  // Select all shown
  const handleSelectAllShown = () => {
    const allSelected =
      filteredApplications.length > 0 &&
      filteredApplications.every((app) => selectedCardIds[app.id]);

    const updated = { ...selectedCardIds };
    filteredApplications.forEach((app) => {
      updated[app.id] = !allSelected;
    });
    setSelectedCardIds(updated);
  };

  // Apply Bulk Status Update
  const handleApplyBulkUpdate = () => {
    if (selectedCount === 0) {
      showToast("Please select at least one candidate to update.");
      return;
    }
    if (!bulkStatus) {
      showToast("Please choose a new status for the selected candidates.");
      return;
    }
    if (bulkStatus === "Rejected" && !bulkRemarks.trim()) {
      showToast("Rejection reason is mandatory when rejecting candidates.");
      return;
    }

    setApplications((prev) =>
      prev.map((app) => {
        if (selectedCardIds[app.id]) {
          return {
            ...app,
            status: bulkStatus as ApplicationStatus,
            remarks: bulkRemarks.trim() ? bulkRemarks : app.remarks,
          };
        }
        return app;
      })
    );

    showToast(`Updated status to "${bulkStatus}" for ${selectedCount} candidate(s).`);
    setSelectedCardIds({});
    setBulkStatus("");
    setBulkRemarks("");
  };

  // Apply Single Application Status Update
  const handleSubmitStatusUpdate = (appId: string) => {
    const targetStatus = cardStatusUpdates[appId] || "Pending";
    const targetRemark = cardRemarks[appId] !== undefined ? cardRemarks[appId] : "";

    if (targetStatus === "Rejected" && !targetRemark.trim()) {
      showToast("Rejection reason is mandatory. Please provide a reason before submitting.");
      return;
    }

    setApplications((prev) =>
      prev.map((app) => {
        if (app.id === appId) {
          return {
            ...app,
            status: targetStatus,
            remarks: targetRemark.trim() ? targetRemark : app.remarks,
          };
        }
        return app;
      })
    );

    showToast(`Status updated to "${targetStatus}" successfully.`);
  };

  // Send Question
  const handleSendQuestion = (appId: string, type: "text" | "email") => {
    const text = (cardQuestions[appId] || "").trim();
    if (!text) {
      showToast("Please type a question before sending.");
      return;
    }

    setApplications((prev) =>
      prev.map((app) => {
        if (app.id === appId) {
          const newQ: QuestionAnswer = {
            id: `q-${Date.now()}`,
            question: text,
            type,
            date: new Date().toLocaleDateString(),
          };
          return {
            ...app,
            questions: [...(app.questions || []), newQ],
          };
        }
        return app;
      })
    );

    setCardQuestions((prev) => ({ ...prev, [appId]: "" }));
    showToast(type === "email" ? "Question sent & emailed to candidate." : "Question saved.");
  };

  return (
    <div className="flex h-screen w-full bg-[#F8F6FA] text-[#141010] font-sans overflow-hidden antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1E1B2E] text-white px-5 py-3 rounded-2xl shadow-xl text-xs sm:text-sm font-medium flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3 duration-200 border border-purple-500/30">
          <CheckCircle2 className="w-4 h-4 text-[#A855F7]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Admin Sidebar with 'Applications' active */}
      <AdminSidebar
        activeTab="Applications"
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Top Header Bar */}
        <header className="lg:hidden bg-white border-b border-[#ECE4F2] px-4 py-3 flex items-center justify-between shrink-0">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
          <img src={netopsysLogo} alt="Netopsys AI" className="h-8 w-auto object-contain" />
          <div className="w-7 h-7 rounded-full bg-[#E6D4EF] text-[#5D2381] font-bold text-xs flex items-center justify-center">
            AD
          </div>
        </header>

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-8 sm:py-6 lg:px-9 lg:py-7">
          {/* Top Page Header Row: Title & Subtitle on left, Search on right */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
            <div>
              <h1 className="text-[24px] sm:text-[27px] font-bold text-[#141010] tracking-tight">
                Applications
              </h1>
              <p className="text-[13px] text-[#716A7E] font-normal mt-0.5">
                Create and manage the job applications
              </p>
            </div>

    
          </div>

          {/* Status Filter Tabs (Horizontal Pill Badges) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-5 no-scrollbar scroll-smooth">
            {filterTabs.map((tab) => {
              const isActive = activeFilter === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveFilter(tab.value)}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[12.5px] font-medium transition-colors whitespace-nowrap cursor-pointer shrink-0 border ${
                    isActive
                      ? "bg-[#5D2381] text-white border-[#5D2381] shadow-2xs"
                      : "bg-white text-[#4A4458] border-[#E2DBEA] hover:bg-[#FAF7FC]"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full text-[11px] font-semibold ${
                      isActive ? "bg-[#7937A2] text-white" : "bg-[#F0EAF5] text-[#5D2381]"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Bulk Status Update Card matching screenshot */}
          <div className="bg-white rounded-2xl border border-[#ECE4F2] p-5 sm:p-6 mb-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-[15.5px] font-bold text-[#141010]">Bulk status update</h2>
                <p className="text-[12.5px] text-[#716A7E] font-normal mt-0.5">
                  {selectedCount} of {filteredApplications.length} shown selected. Use All
                  Applications to select across every status.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSelectAllShown}
                className="self-start sm:self-auto inline-flex items-center justify-center px-4 py-2 rounded-xl text-[12.5px] font-semibold text-[#5D2381] bg-[#F1E8F7] hover:bg-[#EADBFA] transition-colors cursor-pointer"
              >
                Select all shown ({filteredApplications.length})
              </button>
            </div>

            {/* Inputs Form Row */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-end">
              {/* New Status Select */}
              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-[#141010] mb-1.5">
                  New status
                </label>
                <div className="relative">
                  <select
                    value={bulkStatus}
                    onChange={(e) => setBulkStatus(e.target.value as ApplicationStatus)}
                    className="w-full appearance-none bg-white border border-[#D5CBE0] rounded-xl px-3.5 py-2.5 text-[13px] text-[#4A4458] focus:outline-none focus:border-[#5D2381] pr-9 cursor-pointer transition-colors"
                  >
                    <option value="">Choose a status</option>
                    <option value="Pending">Pending</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Reschedule">Reschedule</option>
                    <option value="Interview Scheduled">Interview Scheduled</option>
                    <option value="Interview Completed">Interview Completed</option>
                    <option value="Selected">Selected</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#8E869B] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Remarks Input */}
              <div className="md:col-span-6">
                <label className="block text-xs font-semibold text-[#141010] mb-1.5 flex items-center gap-1">
                  <span>Remarks to candidates</span>
                  {bulkStatus === "Rejected" ? (
                    <span className="text-[#DC2626] font-bold">(Rejection Reason Required)*</span>
                  ) : (
                    <span className="text-[#8E869B] font-normal">(optional)</span>
                  )}
                </label>
                <input
                  type="text"
                  placeholder={
                    bulkStatus === "Rejected"
                      ? "Enter rejection reason for selected candidates (Mandatory)..."
                      : "Same note to each selected candidate"
                  }
                  value={bulkRemarks}
                  onChange={(e) => setBulkRemarks(e.target.value)}
                  className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-[13px] text-[#141010] placeholder-[#A49BAF] focus:outline-none transition-colors ${
                    bulkStatus === "Rejected" && !bulkRemarks.trim()
                      ? "border-[#DC2626] focus:border-[#DC2626]"
                      : "border-[#D5CBE0] focus:border-[#5D2381]"
                  }`}
                />
              </div>

              {/* Review Update Button */}
              <div className="md:col-span-3">
                {(() => {
                  const isBulkRejectMissingReason =
                    bulkStatus === "Rejected" && !bulkRemarks.trim();
                  const isBulkDisabled =
                    selectedCount === 0 || !bulkStatus || isBulkRejectMissingReason;

                  return (
                    <button
                      type="button"
                      disabled={isBulkDisabled}
                      onClick={handleApplyBulkUpdate}
                      className={`w-full py-2.5 px-4 rounded-xl text-[13px] font-semibold transition-all text-center ${
                        isBulkDisabled
                          ? "bg-[#B495C9] opacity-60 text-white cursor-not-allowed hover:bg-[#B495C9]"
                          : "bg-[#5D2381] hover:bg-[#4E1C6D] hover-brand-gradient text-white shadow-xs cursor-pointer"
                      }`}
                    >
                      Review update ({selectedCount})
                    </button>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Applications Cards List */}
          <div className="space-y-3.5">
            {filteredApplications.map((app) => {
              const isExpanded = !!expandedCardIds[app.id];
              const isSelected = !!selectedCardIds[app.id];
              const statusCfg = STATUS_CONFIGS[app.status] || STATUS_CONFIGS.Pending;
              const currentUpdateStatus = cardStatusUpdates[app.id] || app.status;

              return (
                <div
                  key={app.id}
                  className="bg-white rounded-2xl border border-[#ECE4F2] shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all overflow-hidden"
                >
                  {/* Card Header Bar (Summary Row) */}
                  <div
                    onClick={() => toggleCardExpand(app.id)}
                    className="p-4 sm:p-5 flex items-center justify-between gap-3 cursor-pointer hover:bg-[#FDFCFE] transition-colors"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Checkbox */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCardSelection(app.id);
                        }}
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                          isSelected
                            ? "bg-[#5D2381] border-[#5D2381] text-white"
                            : "border-[#D5CBE0] bg-white hover:border-[#5D2381]"
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                      </button>

                      {/* Initials Circle Avatar */}
                      <div className="w-10 h-10 rounded-full bg-[#EADBFA] text-[#5D2381] font-bold text-xs sm:text-sm flex items-center justify-center shrink-0">
                        {app.initials}
                      </div>

                      {/* Candidate Name, Email & Job Info */}
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                          <span className="font-bold text-[14.5px] sm:text-[15px] text-[#141010]">
                            {app.fullName}
                          </span>
                          <span className="text-[12px] sm:text-[12.5px] text-[#8E869B]">
                            [{app.email}]
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#EDE4F5] text-[#5D2381]">
                            {app.jobCode}
                          </span>
                          <span className="text-[12.5px] text-[#544862] truncate">
                            {app.jobTitle}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Side: Status Badge & Accordion Toggle */}
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                      {/* Status Pill Badge matching screenshot */}
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusCfg.badgeBg} ${statusCfg.textColor} ${statusCfg.borderColor}`}
                      >
                        <span className={`w-2 h-2 rounded-full ${statusCfg.dotColor}`} />
                        <span>{statusCfg.label}</span>
                      </span>

                      {/* Expand / Collapse Chevron Button */}
                      <div
                        className="p-1.5 text-[#716A7E] hover:text-[#141010] hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                        title={isExpanded ? "Collapse application" : "Expand application"}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-[#716A7E]" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-[#716A7E]" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Card Body matching screenshot */}
                  {isExpanded && (
                    <div className="border-t border-[#F0E8F6] px-4 py-5 sm:px-6 sm:py-6 bg-white animate-in fade-in duration-150">
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* LEFT COLUMN: Applied Date, Cover Letter, Resume, Q&A */}
                        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
                          {/* Applied Date */}
                          <div className="text-[13px] font-semibold text-[#141010]">
                            Applied: {app.appliedDate}
                          </div>

                          {/* Cover Letter Section */}
                          <div>
                            <div className="text-xs font-semibold text-[#544862] mb-1.5">
                              Cover Letter:
                            </div>
                            <div className="relative bg-[#F8F5FA] border border-[#E9DFEE] rounded-xl p-4 text-[13px] text-[#4A4458] leading-relaxed max-h-[145px] overflow-y-auto pr-7">
                              <p className="whitespace-pre-line">{app.coverLetter}</p>
                              {/* Purple accent scrollbar replica */}
                              <div className="w-1.5 h-12 bg-[#8C5DAE] rounded-full absolute right-2.5 top-5 pointer-events-none opacity-80" />
                            </div>
                          </div>

                          {/* View Resume Button */}
                          <div>
                            <button
                              type="button"
                              onClick={() => showToast(`Opening resume for ${app.fullName}...`)}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5D2381] hover:text-[#431660] hover:underline cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5 stroke-[2.2]" />
                              <span>View Resume</span>
                            </button>
                          </div>

                          {/* Screening Details Block for Every Candidate */}
                          {(() => {
                            const screening = getScreeningDetails(app);
                            return (
                              <div className="bg-[#FAF7FC] border border-[#EADFF2] rounded-2xl p-4 sm:p-5">
                                <h3 className="text-[14.5px] sm:text-[15px] font-bold text-[#5D2381] mb-3.5">
                                  Screening Details
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1.5 text-[12.5px] sm:text-[13px]">
                                  {/* Left Column */}
                                  <div className="space-y-1.5">
                                    <div className="grid grid-cols-[135px_1fr] sm:grid-cols-[145px_1fr] items-baseline">
                                      <span className="text-[#8E869B]">Full Name</span>
                                      <span className="font-bold text-[#141010] truncate">
                                        {screening.fullName}
                                      </span>
                                    </div>
                                    <div className="grid grid-cols-[135px_1fr] sm:grid-cols-[145px_1fr] items-baseline">
                                      <span className="text-[#8E869B]">DOB</span>
                                      <span className="font-bold text-[#141010]">{screening.dob}</span>
                                    </div>
                                    <div className="grid grid-cols-[135px_1fr] sm:grid-cols-[145px_1fr] items-baseline">
                                      <span className="text-[#8E869B]">Gender</span>
                                      <span className="font-bold text-[#141010]">{screening.gender}</span>
                                    </div>
                                    <div className="grid grid-cols-[135px_1fr] sm:grid-cols-[145px_1fr] items-baseline">
                                      <span className="text-[#8E869B]">Location</span>
                                      <span className="font-bold text-[#141010] truncate">
                                        {screening.location}
                                      </span>
                                    </div>
                                    <div className="grid grid-cols-[135px_1fr] sm:grid-cols-[145px_1fr] items-baseline">
                                      <span className="text-[#8E869B]">Work From Office</span>
                                      <span className="font-bold text-[#141010]">{screening.workFromOffice}</span>
                                    </div>
                                    <div className="grid grid-cols-[135px_1fr] sm:grid-cols-[145px_1fr] items-baseline">
                                      <span className="text-[#8E869B]">Exp Documents</span>
                                      <span className="font-bold text-[#141010]">{screening.expDocuments}</span>
                                    </div>
                                    <div className="grid grid-cols-[135px_1fr] sm:grid-cols-[145px_1fr] items-baseline">
                                      <span className="text-[#8E869B]">Bank Statements</span>
                                      <span className="font-bold text-[#141010]">{screening.bankStatements}</span>
                                    </div>
                                    <div className="grid grid-cols-[135px_1fr] sm:grid-cols-[145px_1fr] items-baseline">
                                      <span className="text-[#8E869B]">Submitted</span>
                                      <span className="font-bold text-[#141010] text-[12px] sm:text-[12.5px]">
                                        {screening.submitted}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Right Column */}
                                  <div className="space-y-1.5">
                                    <div className="grid grid-cols-[135px_1fr] sm:grid-cols-[150px_1fr] items-baseline">
                                      <span className="text-[#8E869B]">Education</span>
                                      <span className="font-bold text-[#141010] truncate">
                                        {screening.education}
                                      </span>
                                    </div>
                                    <div className="grid grid-cols-[135px_1fr] sm:grid-cols-[150px_1fr] items-baseline">
                                      <span className="text-[#8E869B]">Current CTC</span>
                                      <span className="font-bold text-[#141010]">{screening.currentCtc}</span>
                                    </div>
                                    <div className="grid grid-cols-[135px_1fr] sm:grid-cols-[150px_1fr] items-baseline">
                                      <span className="text-[#8E869B]">Expected CTC</span>
                                      <span className="font-bold text-[#141010]">{screening.expectedCtc}</span>
                                    </div>
                                    <div className="grid grid-cols-[135px_1fr] sm:grid-cols-[150px_1fr] items-baseline">
                                      <span className="text-[#8E869B]">BG Check</span>
                                      <span className="font-bold text-[#141010]">{screening.bgCheck}</span>
                                    </div>
                                    <div className="grid grid-cols-[135px_1fr] sm:grid-cols-[150px_1fr] items-baseline">
                                      <span className="text-[#8E869B]">Notice Period</span>
                                      <span className="font-bold text-[#141010]">{screening.noticePeriod}</span>
                                    </div>
                                    <div className="grid grid-cols-[135px_1fr] sm:grid-cols-[150px_1fr] items-baseline">
                                      <span className="text-[#8E869B]">Willing to Relocate to Vizag</span>
                                      <span className="font-bold text-[#141010]">
                                        {screening.willingToRelocate}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}

                          {/* Questions & Answers Subcard */}
                          <div className="bg-[#FAF7FC] border border-[#EADFF2] rounded-2xl p-4 sm:p-5">
                            <div className="flex items-center gap-2">
                              <span className="w-4 h-4 rounded-full border-2 border-[#5D2381] inline-block shrink-0" />
                              <h3 className="text-[14px] font-bold text-[#5D2381]">
                                Questions & Answers
                              </h3>
                            </div>
                            <p className="text-xs text-[#8E869B] mt-0.5 ml-6.5">
                              {app.questions && app.questions.length > 0
                                ? `${app.questions.length} question(s) asked`
                                : "No questions yet. Add one below."}
                            </p>

                            {/* Render existing questions if any */}
                            {app.questions && app.questions.length > 0 && (
                              <div className="mt-3 space-y-2 ml-6.5">
                                {app.questions.map((q) => (
                                  <div
                                    key={q.id}
                                    className="p-2.5 bg-white border border-[#E9DFEE] rounded-xl text-xs text-[#4A4458]"
                                  >
                                    <div className="font-semibold text-[#141010]">
                                      Q: {q.question}
                                    </div>
                                    <div className="text-[11px] text-[#8E869B] mt-0.5">
                                      {q.date} • {q.type === "email" ? "Emailed" : "Direct note"}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Ask a question form */}
                            <div className="mt-3.5">
                              <label className="block text-xs font-semibold text-[#141010] mb-1.5">
                                Ask a question
                              </label>
                              <input
                                type="text"
                                placeholder="Type your question here..."
                                value={cardQuestions[app.id] || ""}
                                onChange={(e) =>
                                  setCardQuestions((prev) => ({
                                    ...prev,
                                    [app.id]: e.target.value,
                                  }))
                                }
                                className="w-full bg-white border border-[#D5CBE0] rounded-xl px-3.5 py-2 text-sm text-[#141010] placeholder-[#A49BAF] focus:outline-none focus:border-[#5D2381] transition-colors"
                              />

                              <div className="mt-3 flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleSendQuestion(app.id, "text")}
                                  className="px-4 py-1.5 rounded-xl text-xs font-semibold text-[#4A4458] bg-white border border-[#D5CBE0] hover:bg-gray-50 transition-colors cursor-pointer"
                                >
                                  Text answer
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSendQuestion(app.id, "email")}
                                  className="px-4 py-1.5 rounded-xl text-xs font-semibold text-[#5D2381] bg-[#EDE4F5] hover:bg-[#E2D2ED] transition-colors cursor-pointer"
                                >
                                  Send & Email
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* RIGHT COLUMN: Update Status, Remarks, Submit Button */}
                        <div className="lg:col-span-5 xl:col-span-4 space-y-4">
                          {/* Update Status Dropdown */}
                          <div>
                            <label className="block text-xs font-bold text-[#141010] mb-1.5">
                              Update Status
                            </label>
                            <div className="relative">
                              <select
                                value={currentUpdateStatus}
                                onChange={(e) =>
                                  setCardStatusUpdates((prev) => ({
                                    ...prev,
                                    [app.id]: e.target.value as ApplicationStatus,
                                  }))
                                }
                                className="w-full appearance-none bg-white border border-[#D5CBE0] rounded-xl px-3.5 py-2.5 text-[13.5px] font-medium text-[#141010] focus:outline-none focus:border-[#5D2381] pr-9 cursor-pointer transition-colors"
                              >
                                <option value="Pending">Pending</option>
                                <option value="Under Review">Under Review</option>
                                <option value="Shortlisted">Shortlisted</option>
                                <option value="Reschedule">Reschedule</option>
                                <option value="Interview Scheduled">Interview Scheduled</option>
                                <option value="Interview Completed">Interview Completed</option>
                                <option value="Selected">Selected</option>
                                <option value="Rejected">Rejected</option>
                              </select>
                              <ChevronDown className="w-4 h-4 text-[#8E869B] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                          </div>

                          {(() => {
                            const isRejected = currentUpdateStatus === "Rejected";
                            const remarksValue =
                              cardRemarks[app.id] !== undefined
                                ? cardRemarks[app.id]
                                : app.remarks || "";
                            const isReasonMissing = isRejected && !remarksValue.trim();

                            return (
                              <>
                                {/* Remarks to Candidate Textarea */}
                                <div>
                                  <label className="block text-xs font-bold text-[#141010] mb-1.5">
                                    {isRejected ? (
                                      <span className="flex items-center gap-1">
                                        <span>Rejection Reason</span>
                                        <span className="text-[#DC2626] font-bold">*</span>
                                        <span className="text-[11px] font-normal text-[#DC2626]">
                                          (Mandatory)
                                        </span>
                                      </span>
                                    ) : (
                                      <span>Remarks to Candidate (Optional)</span>
                                    )}
                                  </label>
                                  <textarea
                                    placeholder={
                                      isRejected
                                        ? "Please provide the reason for rejection (required)..."
                                        : "Add remarks for the candidate..."
                                    }
                                    value={remarksValue}
                                    onChange={(e) =>
                                      setCardRemarks((prev) => ({
                                        ...prev,
                                        [app.id]: e.target.value,
                                      }))
                                    }
                                    className={`w-full bg-white border rounded-xl p-3.5 text-[13px] text-[#141010] placeholder-[#A49BAF] min-h-[110px] focus:outline-none resize-none leading-relaxed transition-colors ${
                                      isReasonMissing
                                        ? "border-[#DC2626] focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626]/20"
                                        : "border-[#D5CBE0] focus:border-[#5D2381]"
                                    }`}
                                  />
                                  {isReasonMissing && (
                                    <p className="text-[11.5px] text-[#DC2626] font-medium mt-1">
                                      * Please enter a rejection reason before submitting status update.
                                    </p>
                                  )}
                                </div>

                                {/* Submit Status Update Button */}
                                <button
                                  type="button"
                                  disabled={isReasonMissing}
                                  onClick={() => handleSubmitStatusUpdate(app.id)}
                                  className={`w-full py-2.5 px-4 rounded-xl text-[13px] font-semibold text-white transition-all text-center shadow-xs ${
                                    isReasonMissing
                                      ? "bg-[#B495C9] opacity-60 cursor-not-allowed hover:bg-[#B495C9]"
                                      : "bg-[#5D2381] hover:bg-[#4E1C6D] hover-brand-gradient cursor-pointer"
                                  }`}
                                >
                                  Submit Status Update
                                </button>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {filteredApplications.length === 0 && (
              <div className="bg-white rounded-2xl border border-[#ECE4F2] p-12 text-center text-[#716A7E]">
                <p className="text-base font-semibold text-[#141010]">
                  No matching applications found
                </p>
                <p className="text-xs text-[#8E869B] mt-1">
                  Try adjusting your search query or switching to another status filter.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
