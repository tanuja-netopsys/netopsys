import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import {
  // Search,
  Plus,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  Trash2,
  X,
  Menu,
  Check,
  AlertCircle,
} from "lucide-react";
import netopsysLogo from "../assets/netopsys-ai-logo.png";
import AdminSidebar from "./sidebar.tsx";
import NewJobModal, { type NewJobFormData } from "./new-job-modal.tsx";
import { toast } from "../componenets/toast.tsx";

// ============================================================================
// TYPES
// ============================================================================

export interface InterviewSlotItem {
  id: string;
  time: string; // e.g., "09:00 AM – 09:30 AM"
}

export interface GeneratedSession {
  id: string;
  dateStr: string; // YYYY-MM-DD
  dayFormatted: string; // "Tue, 27 Oct 2026"
  monthShort: string; // "OCT"
  dayNumber: string; // "27"
  startTime: string; // "09:00 AM"
  endTime: string; // "01:00 PM"
  intervalMinutes: number; // 30
  slots: InterviewSlotItem[];
  isExpanded: boolean;
}

// Initial sessions matching the screenshot exactly (3 Generated Sessions)
const INITIAL_SESSIONS: GeneratedSession[] = [
  {
    id: "session-1",
    dateStr: "2026-10-29",
    dayFormatted: "Thu, 29 Oct 2026",
    monthShort: "OCT",
    dayNumber: "29",
    startTime: "09:30 AM",
    endTime: "12:30 PM",
    intervalMinutes: 30,
    isExpanded: false,
    slots: [
      { id: "s1-1", time: "09:30 AM – 10:00 AM" },
      { id: "s1-2", time: "10:00 AM – 10:30 AM" },
      { id: "s1-3", time: "10:30 AM – 11:00 AM" },
      { id: "s1-4", time: "11:00 AM – 11:30 AM" },
      { id: "s1-5", time: "11:30 AM – 12:00 PM" },
      { id: "s1-6", time: "12:00 PM – 12:30 PM" },
    ],
  },
  {
    id: "session-2",
    dateStr: "2026-10-27",
    dayFormatted: "Tue, 27 Oct 2026",
    monthShort: "OCT",
    dayNumber: "27",
    startTime: "09:00 AM",
    endTime: "01:00 PM",
    intervalMinutes: 30,
    isExpanded: false,
    slots: [
      { id: "s2-1", time: "09:00 AM – 09:30 AM" },
      { id: "s2-2", time: "09:30 AM – 10:00 AM" },
      { id: "s2-3", time: "10:00 AM – 10:30 AM" },
      { id: "s2-4", time: "10:30 AM – 11:00 AM" },
      { id: "s2-5", time: "11:00 AM – 11:30 AM" },
      { id: "s2-6", time: "11:30 AM – 12:00 PM" },
      { id: "s2-7", time: "12:00 PM – 12:30 PM" },
      { id: "s2-8", time: "12:30 PM – 01:00 PM" },
    ],
  },
  {
    id: "session-3",
    dateStr: "2026-10-28",
    dayFormatted: "Wed, 28 Oct 2026",
    monthShort: "OCT",
    dayNumber: "28",
    startTime: "09:00 AM",
    endTime: "01:00 PM",
    intervalMinutes: 30,
    isExpanded: false,
    slots: [
      { id: "s3-1", time: "09:00 AM – 09:40 AM" },
      { id: "s3-2", time: "09:40 AM – 10:20 AM" },
      { id: "s3-3", time: "10:20 AM – 11:00 AM" },
      { id: "s3-4", time: "11:00 AM – 11:40 AM" },
      { id: "s3-5", time: "11:40 AM – 12:20 PM" },
      { id: "s3-6", time: "12:20 PM – 01:00 PM" },
    ],
  },
];

const INTERVAL_OPTIONS = [
  { label: "15 Mins", value: 15 },
  { label: "20 Mins", value: 20 },
  { label: "30 Mins", value: 30 },
  { label: "45 Mins", value: 45 },
  { label: "60 Mins", value: 60 },
];

const TIME_OPTIONS = [
  "08:00 AM",
  "08:30 AM",
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "01:00 PM",
  "01:30 PM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
  "04:30 PM",
  "05:00 PM",
  "05:30 PM",
  "06:00 PM",
];

// Helper: parse "09:00 AM" to total minutes from midnight
function parseTimeToMinutes(timeStr: string): number {
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return 0;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const modifier = match[3].toUpperCase();

  if (modifier === "PM" && hours < 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

// Helper: minutes to formatted "09:00 AM"
function minutesToFormattedTime(totalMinutes: number): string {
  const norm = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
  let hours = Math.floor(norm / 60);
  const minutes = norm % 60;
  const modifier = hours >= 12 ? "PM" : "AM";

  let displayHours = hours % 12;
  if (displayHours === 0) displayHours = 12;

  const hh = displayHours.toString().padStart(2, "0");
  const mm = minutes.toString().padStart(2, "0");

  return `${hh}:${mm} ${modifier}`;
}

// Helper: generate slots between start & end time with step
function generateTimeSlots(
  startTime: string,
  endTime: string,
  intervalMinutes: number
): InterviewSlotItem[] {
  const startMin = parseTimeToMinutes(startTime);
  const endMin = parseTimeToMinutes(endTime);

  if (endMin <= startMin || intervalMinutes <= 0) return [];

  const slots: InterviewSlotItem[] = [];
  let curr = startMin;

  while (curr + intervalMinutes <= endMin) {
    const sStr = minutesToFormattedTime(curr);
    const eStr = minutesToFormattedTime(curr + intervalMinutes);
    slots.push({
      id: `slot-${Date.now()}-${curr}`,
      time: `${sStr} – ${eStr}`,
    });
    curr += intervalMinutes;
  }

  return slots;
}

// Helper: format YYYY-MM-DD into "DD/MM/YYYY"
function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

// Helper: parse date to parts for card header
function getDateMeta(dateStr: string) {
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    const dateObj = new Date(year, month - 1, day);
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const dayName = dateObj.toLocaleDateString("en-US", { weekday: "short" });
    const monthShort = monthNames[month - 1]?.toUpperCase() || "OCT";
    const dayFormatted = `${dayName}, ${day} ${monthNames[month - 1]} ${year}`;
    const dayNumber = String(day).padStart(2, "0");

    return { dayFormatted, monthShort, dayNumber };
  } catch {
    return {
      dayFormatted: dateStr,
      monthShort: "OCT",
      dayNumber: "27",
    };
  }
}

export default function InterviewSlotsPage() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchQuery = "";

  // Check if navigated from dashboard "View all"
  const isFromViewAll = useMemo(() => {
    return Boolean(
      location.hash === "#generated-sessions" ||
      (location.state as any)?.scrollTo === "generated-sessions" ||
      (location.state as any)?.focusSessions ||
      (location.state as any)?.fromViewAll
    );
  }, [location.hash, location.state]);

  const [isSlotDetailsOpen, setIsSlotDetailsOpen] = useState(true);
  const mainScrollRef = useRef<HTMLElement>(null);
  const generatedSessionsRef = useRef<HTMLDivElement>(null);

  // Smooth scroll to generated sessions so user visibly sees the scroll
  const scrollToGeneratedSessions = useCallback((smooth = true) => {
    if (generatedSessionsRef.current) {
      generatedSessionsRef.current.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
        block: "start",
      });
    }
    if (mainScrollRef.current && generatedSessionsRef.current) {
      const targetTop = generatedSessionsRef.current.offsetTop - 16;
      mainScrollRef.current.scrollTo({
        top: Math.max(0, targetTop),
        behavior: smooth ? "smooth" : "auto",
      });
    }
  }, []);

  // Post a Job modal state
  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false);

  // Form State
  const [sessionDate, setSessionDate] = useState("");
  const [slotInterval, setSlotInterval] = useState(30);
  const [startTime, setStartTime] = useState("09:00 AM");
  const [endTime, setEndTime] = useState("01:00 PM");

  // Dropdown open states
  const [isIntervalDropdownOpen, setIsIntervalDropdownOpen] = useState(false);
  const [isStartTimeDropdownOpen, setIsStartTimeDropdownOpen] = useState(false);
  const [isEndTimeDropdownOpen, setIsEndTimeDropdownOpen] = useState(false);

  // Refs for closing dropdowns when clicking outside
  const intervalRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Sessions state with localStorage persistence
  const [sessions, setSessions] = useState<GeneratedSession[]>(() => {
    try {
      const saved = localStorage.getItem("netopsys_interview_sessions");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 3) return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_SESSIONS;
  });

  // Smoothly scroll down to generated sessions when coming from View All
  useEffect(() => {
    if (isFromViewAll) {
      const t1 = setTimeout(() => scrollToGeneratedSessions(true), 120);
      const t2 = setTimeout(() => scrollToGeneratedSessions(true), 350);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [isFromViewAll, scrollToGeneratedSessions]);

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem("netopsys_interview_sessions", JSON.stringify(sessions));
    } catch {
      // ignore
    }
  }, [sessions]);

  // Click outside dropdown handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (intervalRef.current && !intervalRef.current.contains(event.target as Node)) {
        setIsIntervalDropdownOpen(false);
      }
      if (startRef.current && !startRef.current.contains(event.target as Node)) {
        setIsStartTimeDropdownOpen(false);
      }
      if (endRef.current && !endRef.current.contains(event.target as Node)) {
        setIsEndTimeDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Modal State for "+ Add Slot"
  const [activeSessionForNewSlot, setActiveSessionForNewSlot] = useState<GeneratedSession | null>(
    null
  );
  const [customSlotStart, setCustomSlotStart] = useState("01:00 PM");
  const [customSlotEnd, setCustomSlotEnd] = useState("01:30 PM");

  // Delete confirmation modal state
  const [sessionToDelete, setSessionToDelete] = useState<GeneratedSession | null>(null);

  // Success toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Preview slot generation count
  const previewSlots = useMemo(() => {
    return generateTimeSlots(startTime, endTime, slotInterval);
  }, [startTime, endTime, slotInterval]);

  const previewCount = previewSlots.length;

  // Filtered sessions based on search
  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return sessions;
    const q = searchQuery.toLowerCase();
    return sessions.filter(
      (s) =>
        (s.dayFormatted && s.dayFormatted.toLowerCase().includes(q)) ||
        (s.dateStr && s.dateStr.toLowerCase().includes(q)) ||
        (s.monthShort && s.monthShort.toLowerCase().includes(q)) ||
        (Array.isArray(s.slots) && s.slots.some((slot) => slot && slot.time && slot.time.toLowerCase().includes(q)))
    );
  }, [sessions, searchQuery]);

  // Handlers
  const handleResetForm = () => {
    setSessionDate("");
    setSlotInterval(30);
    setStartTime("09:00 AM");
    setEndTime("01:00 PM");
  };

  const handleCreateSession = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const chosenDate = sessionDate || new Date().toISOString().split("T")[0];
    const { dayFormatted, monthShort, dayNumber } = getDateMeta(chosenDate);

    const generated = generateTimeSlots(startTime, endTime, slotInterval);
    if (generated.length === 0) {
      toast.warning("Please ensure End Time is later than Start Time.", { title: "Invalid Time Range" });
      return;
    }

    const newSession: GeneratedSession = {
      id: `session-${Date.now()}`,
      dateStr: chosenDate,
      dayFormatted,
      monthShort,
      dayNumber,
      startTime,
      endTime,
      intervalMinutes: slotInterval,
      slots: generated,
      isExpanded: true,
    };

    setSessions((prev) => [newSession, ...prev]);
    showToast(`Successfully created session with ${generated.length} slots for ${dayFormatted}!`);
    toast.success(`Created session with ${generated.length} slots for ${dayFormatted}!`, {
      title: "Session Created",
    });
    handleResetForm();
  };

  const handleToggleExpand = (sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, isExpanded: !s.isExpanded } : s))
    );
  };

  const handleRemoveSlot = (sessionId: string, slotId: string) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== sessionId) return s;
        return {
          ...s,
          slots: s.slots.filter((slot) => slot.id !== slotId),
        };
      })
    );
  };

  const handleOpenAddSlotModal = (session: GeneratedSession) => {
    setActiveSessionForNewSlot(session);
    setCustomSlotStart("01:00 PM");
    setCustomSlotEnd("01:30 PM");
  };

  const handleAddCustomSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSessionForNewSlot) return;

    const startMin = parseTimeToMinutes(customSlotStart);
    const endMin = parseTimeToMinutes(customSlotEnd);

    if (endMin <= startMin) {
      toast.warning("End time must be after Start time.", { title: "Invalid Time" });
      return;
    }

    const newSlotTime = `${customSlotStart} – ${customSlotEnd}`;
    const newSlot: InterviewSlotItem = {
      id: `custom-slot-${Date.now()}`,
      time: newSlotTime,
    };

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== activeSessionForNewSlot.id) return s;
        return {
          ...s,
          slots: [...s.slots, newSlot],
        };
      })
    );
    toast.success(`Slot (${newSlotTime}) added successfully!`, { title: "Slot Added" });

    showToast(`Slot added to ${activeSessionForNewSlot.dayFormatted}`);
    setActiveSessionForNewSlot(null);
  };

  const handleConfirmDeleteSession = () => {
    if (!sessionToDelete) return;
    setSessions((prev) => prev.filter((s) => s.id !== sessionToDelete.id));
    setSessionToDelete(null);
    showToast("Session removed successfully");
  };

  const handleSaveJob = (data: NewJobFormData) => {
    setIsPostJobModalOpen(false);
    showToast(`Job posting "${data.title}" saved successfully!`);
  };

  return (
    <div className="flex h-screen w-full bg-[#F5EEFA] text-[#141010] font-['Onest',sans-serif] overflow-hidden antialiased">
      {/* Sidebar with Interview Slots active */}
      <AdminSidebar
        activeTab="Interview Slots"
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* =====================================================================
          MAIN CONTENT AREA
      ===================================================================== */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header Bar */}
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

        {/* Scrollable Main View */}
        <main
          ref={mainScrollRef}
          className="flex-1 overflow-y-auto px-5 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-8 scroll-smooth"
        >
          {/* Top Row: Title, Search, Post a Job */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-[26px] sm:text-[28px] font-bold text-[#141010] tracking-tight">
                Interview Slots
              </h1>
              <p className="text-[13px] sm:text-[13.5px] text-[#716A7E] font-normal mt-0.5">
                Create and manage the interview slots
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => setIsSlotDetailsOpen((prev) => !prev)}
                className="bg-[#5D2381] hover:bg-[#4E1C6D] text-white px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-[13.5px] font-semibold flex items-center gap-2 shadow-sm hover:shadow transition-all cursor-pointer whitespace-nowrap"
              >
                <Plus
                  className={`w-4 h-4 stroke-[2.5] transition-transform duration-200 ${
                    isSlotDetailsOpen ? "rotate-45" : ""
                  }`}
                />
                <span>{isSlotDetailsOpen ? "Hide Create Form" : "+ Create New Session"}</span>
              </button>
            </div>
          </div>

          {/* ===================================================================
              SECTION 1: SLOT DETAILS CARD
          =================================================================== */}
          {isSlotDetailsOpen && (
            <div className="bg-white rounded-[24px] border border-[#ECE4F2] p-5 sm:p-7 md:p-8 mb-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-all">
            {/* Card Header */}
            <div className="flex items-center gap-3.5 mb-6">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#F6EEFA] flex items-center justify-center text-[#5D2381] shrink-0">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5 text-[#5D2381]"
                >
                  <rect width="18" height="18" x="3" y="3" rx="3" />
                  <path d="M7 8h10" />
                  <path d="M7 12h10" />
                  <path d="M7 16h6" />
                </svg>
              </div>
              <h2 className="text-[18px] sm:text-[19px] font-bold text-[#141010] tracking-tight">
                Slot Details
              </h2>
            </div>

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              {/* Field 1: Session Date* */}
              <div>
                <label className="block text-[13.5px] font-semibold text-[#141010] mb-2">
                  Session Date<span className="text-[#EF4444] ml-0.5">*</span>
                </label>
                <div
                  onClick={() => dateInputRef.current?.showPicker?.()}
                  className="relative flex items-center w-full px-4 py-3 bg-white border border-[#E2DBEA] rounded-2xl text-[14px] text-[#141010] focus-within:border-[#5D2381] focus-within:ring-1 focus-within:ring-[#5D2381] shadow-2xs cursor-pointer group"
                >
                  <Calendar className="w-5 h-5 text-[#5D2381] stroke-[2] mr-3 shrink-0" />
                  <input
                    ref={dateInputRef}
                    type="date"
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <span
                    className={`select-none ${
                      sessionDate ? "text-[#141010] font-medium" : "text-[#978FA4]"
                    }`}
                  >
                    {sessionDate ? formatDisplayDate(sessionDate) : "DD/MM/YYYY"}
                  </span>
                </div>
              </div>

              {/* Field 2: Slot Interval* */}
              <div className="relative" ref={intervalRef}>
                <label className="block text-[13.5px] font-semibold text-[#141010] mb-2">
                  Slot Interval<span className="text-[#EF4444] ml-0.5">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsIntervalDropdownOpen(!isIntervalDropdownOpen)}
                  className="flex items-center justify-between w-full px-4 py-3 bg-white border border-[#E2DBEA] rounded-2xl text-[14px] text-[#141010] focus:border-[#5D2381] focus:ring-1 focus:ring-[#5D2381] shadow-2xs cursor-pointer transition-colors"
                >
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-[#5D2381] stroke-[2] mr-3 shrink-0" />
                    <span className="font-medium text-[#141010]">{slotInterval} Mins</span>
                  </div>
                  <ChevronDown
                    className={`w-4.5 h-4.5 text-[#716A7E] shrink-0 transition-transform ${
                      isIntervalDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isIntervalDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-[#ECE4F2] rounded-2xl shadow-xl z-20 py-1.5 overflow-hidden">
                    {INTERVAL_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          setSlotInterval(opt.value);
                          setIsIntervalDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-[13.5px] transition-colors flex items-center justify-between cursor-pointer ${
                          slotInterval === opt.value
                            ? "bg-[#F1E4F8] text-[#5D2381] font-semibold"
                            : "text-[#3D3747] hover:bg-[#F9F5FB]"
                        }`}
                      >
                        <span>{opt.label}</span>
                        {slotInterval === opt.value && <Check className="w-4 h-4 text-[#5D2381]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Field 3: Interview Start Time* */}
              <div className="relative" ref={startRef}>
                <label className="block text-[13.5px] font-semibold text-[#141010] mb-2">
                  Interview Start Time<span className="text-[#EF4444] ml-0.5">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsStartTimeDropdownOpen(!isStartTimeDropdownOpen)}
                  className="flex items-center justify-between w-full px-4 py-3 bg-white border border-[#E2DBEA] rounded-2xl text-[14px] text-[#141010] focus:border-[#5D2381] focus:ring-1 focus:ring-[#5D2381] shadow-2xs cursor-pointer transition-colors"
                >
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-[#5D2381] stroke-[2] mr-3 shrink-0" />
                    <span className="font-medium text-[#141010]">{startTime}</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-[#716A7E] shrink-0 transition-transform ${
                      isStartTimeDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isStartTimeDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-[#ECE4F2] rounded-2xl shadow-xl z-20 max-h-56 overflow-y-auto py-1.5">
                    {TIME_OPTIONS.map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => {
                          setStartTime(time);
                          setIsStartTimeDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-[13.5px] transition-colors flex items-center justify-between cursor-pointer ${
                          startTime === time
                            ? "bg-[#F1E4F8] text-[#5D2381] font-semibold"
                            : "text-[#3D3747] hover:bg-[#F9F5FB]"
                        }`}
                      >
                        <span>{time}</span>
                        {startTime === time && <Check className="w-4 h-4 text-[#5D2381]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Field 4: Interview End Time* */}
              <div className="relative" ref={endRef}>
                <label className="block text-[13.5px] font-semibold text-[#141010] mb-2">
                  Interview End Time<span className="text-[#EF4444] ml-0.5">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsEndTimeDropdownOpen(!isEndTimeDropdownOpen)}
                  className="flex items-center justify-between w-full px-4 py-3 bg-white border border-[#E2DBEA] rounded-2xl text-[14px] text-[#141010] focus:border-[#5D2381] focus:ring-1 focus:ring-[#5D2381] shadow-2xs cursor-pointer transition-colors"
                >
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-[#5D2381] stroke-[2] mr-3 shrink-0" />
                    <span className="font-medium text-[#141010]">{endTime}</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-[#716A7E] shrink-0 transition-transform ${
                      isEndTimeDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isEndTimeDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-[#ECE4F2] rounded-2xl shadow-xl z-20 max-h-56 overflow-y-auto py-1.5">
                    {TIME_OPTIONS.map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => {
                          setEndTime(time);
                          setIsEndTimeDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-[13.5px] transition-colors flex items-center justify-between cursor-pointer ${
                          endTime === time
                            ? "bg-[#F1E4F8] text-[#5D2381] font-semibold"
                            : "text-[#3D3747] hover:bg-[#F9F5FB]"
                        }`}
                      >
                        <span>{time}</span>
                        {endTime === time && <Check className="w-4 h-4 text-[#5D2381]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Preview Generation */}
            <div className="mt-6">
              <h3 className="text-[14px] font-bold text-[#141010] tracking-tight">
                Preview Generation
              </h3>
              <p className="text-[13px] text-[#716A7E] font-normal mt-0.5">
                {previewCount > 0
                  ? `${previewCount} slots will be generated between ${startTime} and ${endTime}.`
                  : `Please ensure end time is later than start time.`}
              </p>
            </div>

            {/* Divider */}
            <div className="border-t border-[#ECE4F2] my-6" />

            {/* Actions: Cancel & Create Session */}
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  handleResetForm();
                  setIsSlotDetailsOpen(false);
                }}
                className="border border-[#5D2381] text-[#5D2381] hover:bg-[#F9F5FB] px-5 sm:px-7 py-2.5 rounded-2xl text-xs sm:text-[13.5px] font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleCreateSession()}
                className="bg-[#5D2381] hover:bg-[#4E1C6D] text-white px-5 sm:px-6 py-2.5 rounded-2xl text-xs sm:text-[13.5px] font-semibold flex items-center gap-1.5 shadow-sm hover:shadow transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Create Session</span>
              </button>
            </div>
          </div>
          )}

          {/* ===================================================================
              SECTION 2: GENERATED SESSIONS LIST
          =================================================================== */}
          <div id="generated-sessions" ref={generatedSessionsRef} className="scroll-mt-6">
            <h2 className="text-[19px] sm:text-[20px] font-bold text-[#141010] tracking-tight">
              Generated Sessions ({filteredSessions.length})
            </h2>
            <p className="text-[13px] text-[#716A7E] font-normal mt-1 mb-5">
              Click × on a slot to remove it, or use Add Slot to create a custom time for that day.
            </p>

            {filteredSessions.length === 0 ? (
              <div className="bg-white rounded-[22px] p-8 border border-[#ECE4F2] text-center text-[#716A7E] text-[13.5px]">
                No generated sessions match your search.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSessions.map((session) => (
                  <div
                    key={session.id}
                    className="bg-white rounded-[22px] border border-[#ECE4F2] p-4.5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-all h-auto min-w-0 break-words"
                  >
                    {/* Session Summary Header - Fully Responsive */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 min-w-0">
                      {/* Left: Date Badge & Details */}
                      <div
                        onClick={() => handleToggleExpand(session.id)}
                        className="flex items-center gap-3.5 sm:gap-4 cursor-pointer select-none group min-w-0 flex-1"
                      >
                        {/* Month / Day Badge */}
                        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#F4EBF9] flex flex-col items-center justify-center shrink-0 group-hover:bg-[#EFE2F6] transition-colors">
                          <span className="text-[9.5px] sm:text-[10px] font-bold text-[#5D2381] uppercase tracking-wider leading-none">
                            {session.monthShort}
                          </span>
                          <span className="text-base sm:text-[18px] font-extrabold text-[#5D2381] leading-tight mt-0.5">
                            {session.dayNumber}
                          </span>
                        </div>

                        {/* Title & Subtitle */}
                        <div className="min-w-0 flex-1 break-words">
                          <h3 className="text-sm sm:text-[15px] md:text-[16px] font-bold text-[#141010] tracking-tight group-hover:text-[#5D2381] transition-colors break-words">
                            {session.dayFormatted}
                          </h3>
                          <p className="text-xs sm:text-[13px] text-[#716A7E] font-normal mt-0.5 break-words">
                            {session.startTime} - {session.endTime} · {session.intervalMinutes} mins
                          </p>
                        </div>
                      </div>

                      {/* Right: Slot Count, Delete, Chevron */}
                      <div className="flex items-center justify-between sm:justify-end gap-2.5 sm:gap-3 w-full sm:w-auto pt-2.5 sm:pt-0 border-t border-[#F5EEFA] sm:border-t-0 shrink-0">
                        {/* Slots Badge */}
                        <span className="px-3 py-0.5 sm:px-3.5 sm:py-1 rounded-full text-xs font-semibold bg-[#E8F8EE] text-[#16A34A] border border-[#DCFCE7]">
                          {session.slots.length} slots
                        </span>

                        <div className="flex items-center gap-2">
                          {/* Delete Session Button */}
                          <button
                            onClick={() => setSessionToDelete(session)}
                            title="Delete session"
                            className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-xl border border-[#FCA5A5]/60 hover:bg-red-50 text-[#EF4444] hover:text-[#DC2626] flex items-center justify-center transition-colors cursor-pointer shadow-2xs group"
                          >
                            <Trash2 className="w-4 h-4 stroke-[1.8] group-hover:scale-105 transition-transform" />
                          </button>

                          {/* Chevron Collapse/Expand */}
                          <button
                            onClick={() => handleToggleExpand(session.id)}
                            className="p-1 text-[#4A4458] hover:text-[#5D2381] transition-colors cursor-pointer"
                            title={session.isExpanded ? "Collapse" : "Expand"}
                          >
                            {session.isExpanded ? (
                              <ChevronUp className="w-5 h-5 stroke-[2]" />
                            ) : (
                              <ChevronDown className="w-5 h-5 stroke-[2]" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Slots Body */}
                    {session.isExpanded && (
                      <div className="mt-6 pt-5 border-t border-[#F5EEFA]">
                        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 min-w-0">
                          {/* Slot Pills */}
                          {session.slots.map((slot) => (
                            <div
                              key={slot.id}
                              className="bg-white border border-[#E2DBEA] hover:border-[#C4B5D4] rounded-2xl px-3.5 py-2 sm:px-4 sm:py-2.5 text-[12.5px] sm:text-[13px] font-semibold text-[#141010] flex items-center gap-2 shadow-2xs transition-colors"
                            >
                              <span>{slot.time}</span>
                              <button
                                onClick={() => handleRemoveSlot(session.id, slot.id)}
                                className="text-[#EF4444] hover:text-[#DC2626] hover:bg-red-50 rounded-full p-0.5 transition-colors cursor-pointer ml-0.5"
                                title="Remove this slot"
                              >
                                <X className="w-3.5 h-3.5 stroke-[2.2]" />
                              </button>
                            </div>
                          ))}

                          {/* + Add Slot Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenAddSlotModal(session)}
                            className="border border-dashed border-[#5D2381] bg-white hover:bg-[#F9F5FB] text-[#5D2381] rounded-2xl px-4 py-2 sm:px-5 sm:py-2.5 text-[12.5px] sm:text-[13px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                          >
                            <Plus className="w-4 h-4 stroke-[2]" />
                            <span>Add Slot</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* =====================================================================
          MODAL: ADD CUSTOM SLOT
      ===================================================================== */}
      {activeSessionForNewSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-[24px] border border-[#ECE4F2] shadow-2xl w-full max-w-md p-6 sm:p-7 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setActiveSessionForNewSlot(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-1.5 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 stroke-[2]" />
            </button>

            <h3 className="text-[18px] font-bold text-[#141010] tracking-tight mb-1">
              Add Custom Slot
            </h3>
            <p className="text-[13px] text-[#716A7E] mb-5">
              Add a custom interview slot for{" "}
              <span className="font-semibold text-[#5D2381]">
                {activeSessionForNewSlot.dayFormatted}
              </span>
            </p>

            <form onSubmit={handleAddCustomSlot} className="space-y-4">
              <div>
                <label className="block text-[13px] font-semibold text-[#141010] mb-1.5">
                  Start Time
                </label>
                <div className="relative">
                  <select
                    value={customSlotStart}
                    onChange={(e) => setCustomSlotStart(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-[#E2DBEA] rounded-xl text-[13.5px] text-[#141010] focus:outline-none focus:border-[#5D2381] cursor-pointer"
                  >
                    {TIME_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-[#141010] mb-1.5">
                  End Time
                </label>
                <div className="relative">
                  <select
                    value={customSlotEnd}
                    onChange={(e) => setCustomSlotEnd(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-[#E2DBEA] rounded-xl text-[13.5px] text-[#141010] focus:outline-none focus:border-[#5D2381] cursor-pointer"
                  >
                    {TIME_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setActiveSessionForNewSlot(null)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#5D2381] hover:bg-[#4E1C6D] text-white px-5 py-2.5 rounded-xl text-[13px] font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[2]" />
                  <span>Add Slot</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: DELETE SESSION CONFIRMATION
      ===================================================================== */}
      {sessionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-[24px] border border-[#ECE4F2] shadow-2xl w-full max-w-sm p-6 relative">
            <div className="w-11 h-11 rounded-2xl bg-red-50 text-[#EF4444] flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 stroke-[2]" />
            </div>

            <h3 className="text-[17px] font-bold text-[#141010] mb-1">
              Delete Interview Session?
            </h3>
            <p className="text-[13px] text-[#716A7E] mb-6">
              Are you sure you want to delete the session for{" "}
              <strong className="text-[#141010]">{sessionToDelete.dayFormatted}</strong> (
              {sessionToDelete.slots.length} slots)? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSessionToDelete(null)}
                className="px-5 py-2 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteSession}
                className="bg-[#EF4444] hover:bg-[#DC2626] text-white px-5 py-2 rounded-xl text-[13px] font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          NEW JOB POSTING MODAL
      ===================================================================== */}
      <NewJobModal
        isOpen={isPostJobModalOpen}
        onClose={() => setIsPostJobModalOpen(false)}
        onSave={handleSaveJob}
        title="New Job Posting"
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#141010] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="w-5 h-5 rounded-full bg-[#22C55E] flex items-center justify-center shrink-0">
            <Check className="w-3 h-3 text-white stroke-[3]" />
          </div>
          <span className="text-[13px] font-medium">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
