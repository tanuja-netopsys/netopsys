import { useState, useEffect, useCallback } from "react";
import {
  Mail,
  Search,
  Download,
  Send,
  Trash2,
  CheckCircle2,
  XCircle,
  Menu,
  Loader2,
  RefreshCw,
  Bell,
  Briefcase,
  BookOpen,
  Calendar,
} from "lucide-react";
import AdminSidebar from "./sidebar.tsx";
import netopsysLogo from "../assets/netopsys-ai-logo.png";
import { toast } from "../componenets/toast.tsx";

interface SubscriberItem {
  id: number;
  email: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface NotificationLogItem {
  id: number;
  type: string;
  contentId: string;
  contentTitle: string;
  recipientEmail: string;
  status: string;
  errorMessage?: string;
  sentAt: string;
}

interface SubscriberStats {
  blogSubscribers: { total: number; active: number };
  jobSubscribers: { total: number; active: number };
  totalSubscribers: number;
  totalActiveSubscribers: number;
  totalEmailsSent: number;
}

export default function SubscribersAdminPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"blog" | "job" | "logs">("blog");

  // Search & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Data lists
  const [subscribers, setSubscribers] = useState<SubscriberItem[]>([]);
  const [logs, setLogs] = useState<NotificationLogItem[]>([]);
  const [stats, setStats] = useState<SubscriberStats | null>(null);

  // Loading & Action states
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [subscriberToDelete, setSubscriberToDelete] = useState<{ id: number; email: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Test notification modal
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [testType, setTestType] = useState<"blog" | "job">("blog");
  const [isSendingTest, setIsSendingTest] = useState(false);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/subscribers/stats");
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch {
      // ignore
    }
  }, []);

  // Fetch data depending on tab
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      if (activeTab === "logs") {
        const queryParams = new URLSearchParams({
          page: String(page),
          limit: "30",
          search: searchQuery.trim(),
        });
        const res = await fetch(`/api/admin/subscribers/logs?${queryParams}`);
        const data = await res.json();
        if (data.success) {
          setLogs(data.items || []);
          setTotalCount(data.total || 0);
          setTotalPages(data.totalPages || 1);
        }
      } else {
        const queryParams = new URLSearchParams({
          type: activeTab,
          page: String(page),
          limit: "30",
          search: searchQuery.trim(),
        });
        const res = await fetch(`/api/admin/subscribers?${queryParams}`);
        const data = await res.json();
        if (data.success) {
          setSubscribers(data.items || []);
          setTotalCount(data.total || 0);
          setTotalPages(data.totalPages || 1);
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load subscribers", { title: "Fetch Error" });
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, page, searchQuery]);

  useEffect(() => {
    fetchStats();
    fetchData();
  }, [fetchStats, fetchData]);

  // Reset page on tab/search change
  const handleTabChange = (tab: "blog" | "job" | "logs") => {
    setActiveTab(tab);
    setPage(1);
    setSearchQuery("");
  };

  // Toggle active status
  const handleToggleActive = async (sub: SubscriberItem) => {
    try {
      const res = await fetch(`/api/admin/subscribers/${activeTab}/${sub.id}/toggle`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !sub.isActive }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Toggle failed");

      setSubscribers((prev) =>
        prev.map((item) => (item.id === sub.id ? { ...item, isActive: !item.isActive } : item))
      );
      toast.success(data.message, { title: "Status Updated" });
      fetchStats();
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle status");
    }
  };

  // Delete subscriber
  const confirmDeleteSubscriber = async () => {
    if (!subscriberToDelete) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/admin/subscribers/${activeTab}/${subscriberToDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Delete failed");

      toast.success("Subscriber removed successfully", { title: "Deleted" });
      setSubscribers((prev) => prev.filter((item) => item.id !== subscriberToDelete.id));
      setSubscriberToDelete(null);
      fetchStats();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete subscriber");
    } finally {
      setIsDeleting(false);
    }
  };

  // Export CSV
  const handleExportCsv = async () => {
    if (activeTab === "logs") {
      toast.info("CSV export is available for Blog and Job subscriber lists.", { title: "Export Info" });
      return;
    }
    try {
      setIsExporting(true);
      const res = await fetch(`/api/admin/subscribers/export?type=${activeTab}`);
      if (!res.ok) throw new Error("Failed to export CSV");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `netopsys-${activeTab}-subscribers-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Subscriber list downloaded successfully!", { title: "Export Complete" });
    } catch (err: any) {
      toast.error(err.message || "Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  // Send Test Notification
  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testEmail)) {
      toast.error("Please provide a valid recipient email.");
      return;
    }
    try {
      setIsSendingTest(true);
      const res = await fetch("/api/admin/subscribers/test-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: testEmail, type: testType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Test send failed");

      toast.success(data.message, { title: "Test Sent" });
      setIsTestModalOpen(false);
      setTestEmail("");
      fetchStats();
    } catch (err: any) {
      toast.error(err.message || "Test dispatch failed");
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#FDFBFD] overflow-hidden font-sans">
      {/* Sidebar */}
      <AdminSidebar
        activeTab="subscribers"
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header Bar */}
        <header className="lg:hidden bg-white border-b border-[#ECE4F2] px-4 py-3 flex items-center justify-between shrink-0">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 cursor-pointer"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <img src={netopsysLogo} alt="Netopsys AI" className="h-7 sm:h-8 w-auto object-contain" />
          <div className="w-7 h-7 rounded-full bg-[#E6D4EF] text-[#5D2381] font-bold text-xs flex items-center justify-center">
            AD
          </div>
        </header>

        {/* Scrollable Body */}
        <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6 md:px-8 md:py-8 lg:px-10 lg:py-8">
          {/* Top Bar: Title & Primary Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-[26px] md:text-[28px] font-bold text-[#141010] tracking-tight">
                Email Subscribers
              </h1>
              <p className="text-xs sm:text-[13px] md:text-[13.5px] text-[#716A7E] font-normal mt-0.5">
                Manage automated blog and job alert subscriber lists and notification dispatches
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setIsTestModalOpen(true)}
                className="flex-1 sm:flex-none justify-center bg-white hover:bg-[#FAF6FD] border border-[#ECE4F2] text-[#5D2381] px-3.5 sm:px-4 py-2.5 rounded-2xl text-xs sm:text-[13px] font-semibold flex items-center gap-2 transition-colors cursor-pointer shadow-2xs whitespace-nowrap"
              >
                <Send className="w-3.5 h-3.5 text-[#5D2381] shrink-0" />
                <span>Test Notification</span>
              </button>

              <button
                type="button"
                onClick={handleExportCsv}
                disabled={isExporting || activeTab === "logs"}
                className="flex-1 sm:flex-none justify-center bg-[#5D2381] hover:bg-[#4E1C6D] disabled:opacity-60 text-white px-4 sm:px-4.5 py-2.5 rounded-2xl text-xs sm:text-[13px] font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-sm whitespace-nowrap"
              >
                {isExporting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                ) : (
                  <Download className="w-3.5 h-3.5 shrink-0" />
                )}
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Metric Cards - 1 col on mobile, 2 on tablet, 4 on desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 md:gap-5 mb-6 sm:mb-7">
            {/* 1. Total Subscribers */}
            <div className="bg-white rounded-[20px] sm:rounded-[22px] border border-[#ECE4F2] p-4.5 sm:p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-[12.5px] font-semibold text-[#716A7E]">Total Subscribers</span>
                <div className="w-8 h-8 rounded-xl bg-[#F6EEFA] flex items-center justify-center text-[#5D2381]">
                  <Mail className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2.5 sm:mt-3 flex items-baseline gap-2">
                <span className="text-2xl sm:text-[26px] md:text-[28px] font-extrabold text-[#141010] tracking-tight">
                  {stats ? stats.totalSubscribers : "..."}
                </span>
                <span className="text-xs font-semibold text-emerald-600">
                  {stats ? `${stats.totalActiveSubscribers} active` : ""}
                </span>
              </div>
            </div>

            {/* 2. Blog Subscribers */}
            <div className="bg-white rounded-[20px] sm:rounded-[22px] border border-[#ECE4F2] p-4.5 sm:p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-[12.5px] font-semibold text-[#716A7E]">Blog Subscribers</span>
                <div className="w-8 h-8 rounded-xl bg-[#FAF0F8] flex items-center justify-center text-[#BE3093]">
                  <BookOpen className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2.5 sm:mt-3 flex items-baseline gap-2">
                <span className="text-2xl sm:text-[26px] md:text-[28px] font-extrabold text-[#141010] tracking-tight">
                  {stats ? stats.blogSubscribers.active : "..."}
                </span>
                <span className="text-xs text-[#716A7E]">
                  {stats ? `of ${stats.blogSubscribers.total} total` : ""}
                </span>
              </div>
            </div>

            {/* 3. Job Alert Subscribers */}
            <div className="bg-white rounded-[20px] sm:rounded-[22px] border border-[#ECE4F2] p-4.5 sm:p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-[12.5px] font-semibold text-[#716A7E]">Job Subscribers</span>
                <div className="w-8 h-8 rounded-xl bg-[#EFF6FF] flex items-center justify-center text-[#2563EB]">
                  <Briefcase className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2.5 sm:mt-3 flex items-baseline gap-2">
                <span className="text-2xl sm:text-[26px] md:text-[28px] font-extrabold text-[#141010] tracking-tight">
                  {stats ? stats.jobSubscribers.active : "..."}
                </span>
                <span className="text-xs text-[#716A7E]">
                  {stats ? `of ${stats.jobSubscribers.total} total` : ""}
                </span>
              </div>
            </div>

            {/* 4. Notifications Delivered */}
            <div className="bg-white rounded-[20px] sm:rounded-[22px] border border-[#ECE4F2] p-4.5 sm:p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-[12.5px] font-semibold text-[#716A7E]">Emails Delivered</span>
                <div className="w-8 h-8 rounded-xl bg-[#F0FDF4] flex items-center justify-center text-[#16A34A]">
                  <Bell className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2.5 sm:mt-3 flex items-baseline gap-2">
                <span className="text-2xl sm:text-[26px] md:text-[28px] font-extrabold text-[#141010] tracking-tight">
                  {stats ? stats.totalEmailsSent : "..."}
                </span>
                <span className="text-xs font-semibold text-emerald-600">via Resend</span>
              </div>
            </div>
          </div>

          {/* Main Card with Tabs, Search, and Responsive Content */}
          <div className="bg-white rounded-[20px] sm:rounded-[24px] border border-[#ECE4F2] shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
            {/* Header: Tabs + Search Bar */}
            <div className="p-4 sm:p-5 md:p-6 border-b border-[#ECE4F2] flex flex-col md:flex-row md:items-center justify-between gap-3.5 sm:gap-4">
              {/* Tab Selector - Horizontally scrollable on mobile */}
              <div className="flex items-center gap-1 sm:gap-1.5 p-1 bg-[#FAF6FC] rounded-2xl border border-[#ECE4F2] overflow-x-auto max-w-full shrink-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                <button
                  type="button"
                  onClick={() => handleTabChange("blog")}
                  className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-[13px] font-semibold transition-all cursor-pointer flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 ${
                    activeTab === "blog"
                      ? "bg-white text-[#5D2381] shadow-xs"
                      : "text-[#716A7E] hover:text-[#141010]"
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 shrink-0" />
                  <span>Blog Subscribers</span>
                  {stats && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-[#F4EBF9] text-[#5D2381] font-bold">
                      {stats.blogSubscribers.total}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleTabChange("job")}
                  className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-[13px] font-semibold transition-all cursor-pointer flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 ${
                    activeTab === "job"
                      ? "bg-white text-[#5D2381] shadow-xs"
                      : "text-[#716A7E] hover:text-[#141010]"
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5 shrink-0" />
                  <span>Job Subscribers</span>
                  {stats && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-[#EFF6FF] text-[#2563EB] font-bold">
                      {stats.jobSubscribers.total}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleTabChange("logs")}
                  className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-[13px] font-semibold transition-all cursor-pointer flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 ${
                    activeTab === "logs"
                      ? "bg-white text-[#5D2381] shadow-xs"
                      : "text-[#716A7E] hover:text-[#141010]"
                  }`}
                >
                  <Bell className="w-3.5 h-3.5 shrink-0" />
                  <span>Notification Logs</span>
                </button>
              </div>

              {/* Search Bar + Refresh */}
              <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-72">
                  <Search className="w-4 h-4 text-[#8C849B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPage(1);
                    }}
                    placeholder={
                      activeTab === "logs" ? "Search recipient or title..." : "Search subscriber email..."
                    }
                    className="w-full bg-[#FAF7FC] border border-[#ECE4F2] focus:border-[#5D2381] focus:bg-white rounded-2xl py-2 pl-9 pr-3 text-xs sm:text-[13px] text-[#141010] placeholder:text-[#8C849B] outline-none transition-all"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => fetchData()}
                  title="Refresh list"
                  className="p-2.5 rounded-2xl border border-[#ECE4F2] text-[#716A7E] hover:text-[#5D2381] hover:bg-[#FAF6FC] transition-colors cursor-pointer shrink-0"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-[#5D2381]" : ""}`} />
                </button>
              </div>
            </div>

            {/* ===============================================================
                1. MOBILE CARD VIEW (< md breakpoint, under 768px)
                Provides a native card interface so mobile users never suffer 
                from cramped or cut-off tables
            =============================================================== */}
            <div className="block md:hidden">
              {isLoading ? (
                <div className="py-16 text-center text-[#716A7E]">
                  <Loader2 className="w-6 h-6 animate-spin text-[#5D2381] mx-auto mb-2" />
                  <span className="text-xs">Loading data...</span>
                </div>
              ) : activeTab === "logs" ? (
                /* Mobile Logs Cards */
                logs.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#716A7E]">No notification logs found.</div>
                ) : (
                  <div className="p-4 space-y-3 divide-y divide-[#F1EBF5]">
                    {logs.map((log) => (
                      <div key={log.id} className="pt-3 first:pt-0">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              log.type.includes("blog")
                                ? "bg-[#FAF0F8] text-[#BE3093]"
                                : "bg-[#EFF6FF] text-[#2563EB]"
                            }`}
                          >
                            {log.type}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                              log.status === "sent"
                                ? "bg-[#E8F8EE] text-[#16A34A]"
                                : "bg-[#FEE2E2] text-[#DC2626]"
                            }`}
                          >
                            {log.status === "sent" ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : (
                              <XCircle className="w-3 h-3" />
                            )}
                            <span className="capitalize">{log.status}</span>
                          </span>
                        </div>
                        <h4 className="text-xs sm:text-[13px] font-bold text-[#141010] line-clamp-2">
                          {log.contentTitle}
                        </h4>
                        <div className="mt-1.5 flex flex-wrap items-center justify-between gap-1 text-[11.5px] text-[#716A7E]">
                          <span className="truncate max-w-[200px]">{log.recipientEmail}</span>
                          <span className="shrink-0">
                            {new Date(log.sentAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                /* Mobile Subscribers Cards */
                subscribers.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#716A7E]">
                    No {activeTab === "blog" ? "blog" : "job"} subscribers found.
                  </div>
                ) : (
                  <div className="p-4 space-y-3">
                    {subscribers.map((sub) => (
                      <div
                        key={sub.id}
                        className="bg-[#FAF7FC] border border-[#ECE4F2] rounded-2xl p-3.5 space-y-2.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-full bg-[#EEDBFA] text-[#5D2381] font-bold text-xs flex items-center justify-center shrink-0">
                              {sub.email.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-bold text-[#141010] text-xs sm:text-[13px] truncate">
                              {sub.email}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSubscriberToDelete({ id: sub.id, email: sub.email })}
                            className="p-1 text-[#8C849B] hover:text-[#EF4444] rounded-lg transition-colors cursor-pointer shrink-0"
                            title="Remove subscriber"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#ECE4F2]/60 text-[11.5px]">
                          <div className="flex items-center gap-1.5 text-[#716A7E]">
                            <Calendar className="w-3 h-3" />
                            <span>
                              {new Date(sub.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10.5px] font-semibold ${
                                sub.isVerified
                                  ? "bg-[#E8F8EE] text-[#16A34A]"
                                  : "bg-[#FEF3C7] text-[#B45309]"
                              }`}
                            >
                              {sub.isVerified ? "Verified" : "Pending"}
                            </span>

                            <button
                              type="button"
                              onClick={() => handleToggleActive(sub)}
                              className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold cursor-pointer ${
                                sub.isActive
                                  ? "bg-[#E8F8EE] text-[#16A34A]"
                                  : "bg-[#F3F0F7] text-[#716A7E]"
                              }`}
                            >
                              {sub.isActive ? "Active" : "Unsubscribed"}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>

            {/* ===============================================================
                2. DESKTOP & TABLET TABLE VIEW (>= md breakpoint, 768px+)
            =============================================================== */}
            <div className="hidden md:block overflow-x-auto">
              {activeTab === "logs" ? (
                /* Desktop Logs Table */
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#ECE4F2] text-[12px] font-semibold text-[#7D7589] bg-[#FAF8FC]">
                      <th className="py-3.5 px-6">Type</th>
                      <th className="py-3.5 px-6">Content Title</th>
                      <th className="py-3.5 px-6">Recipient</th>
                      <th className="py-3.5 px-6">Status</th>
                      <th className="py-3.5 px-6 text-right">Sent Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1EBF5] text-[13px]">
                    {isLoading ? (
                      <tr>
                        <td colSpan={5} className="py-16 text-center text-[#716A7E]">
                          <Loader2 className="w-6 h-6 animate-spin text-[#5D2381] mx-auto mb-2" />
                          <span>Loading notification dispatch logs...</span>
                        </td>
                      </tr>
                    ) : logs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-16 text-center text-[#716A7E]">
                          No notification logs found.
                        </td>
                      </tr>
                    ) : (
                      logs.map((log) => (
                        <tr key={log.id} className="hover:bg-[#FAF8FC] transition-colors">
                          <td className="py-3.5 px-6">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase ${
                                log.type.includes("blog")
                                  ? "bg-[#FAF0F8] text-[#BE3093]"
                                  : "bg-[#EFF6FF] text-[#2563EB]"
                              }`}
                            >
                              {log.type}
                            </span>
                          </td>
                          <td className="py-3.5 px-6 font-semibold text-[#141010] max-w-xs truncate">
                            {log.contentTitle}
                          </td>
                          <td className="py-3.5 px-6 text-[#554E62]">{log.recipientEmail}</td>
                          <td className="py-3.5 px-6">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                log.status === "sent"
                                  ? "bg-[#E8F8EE] text-[#16A34A]"
                                  : "bg-[#FEE2E2] text-[#DC2626]"
                              }`}
                            >
                              {log.status === "sent" ? (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5" />
                              )}
                              <span className="capitalize">{log.status}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-6 text-right text-[#716A7E] text-xs">
                            {new Date(log.sentAt).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              ) : (
                /* Desktop Subscribers Table */
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#ECE4F2] text-[12px] font-semibold text-[#7D7589] bg-[#FAF8FC]">
                      <th className="py-3.5 px-6">S.No</th>
                      <th className="py-3.5 px-6">Subscriber Email</th>
                      <th className="py-3.5 px-6">Verification</th>
                      <th className="py-3.5 px-6">Status</th>
                      <th className="py-3.5 px-6">Subscribed Date</th>
                      <th className="py-3.5 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1EBF5] text-[13px]">
                    {isLoading ? (
                      <tr>
                        <td colSpan={6} className="py-16 text-center text-[#716A7E]">
                          <Loader2 className="w-6 h-6 animate-spin text-[#5D2381] mx-auto mb-2" />
                          <span>Loading subscriber list...</span>
                        </td>
                      </tr>
                    ) : subscribers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-16 text-center text-[#716A7E]">
                          No {activeTab === "blog" ? "blog" : "job"} subscribers found.
                        </td>
                      </tr>
                    ) : (
                      subscribers.map((sub, idx) => (
                        <tr key={sub.id} className="hover:bg-[#FAF8FC] transition-colors group">
                          <td className="py-4 px-6 text-[#716A7E] font-medium text-xs">
                            {(page - 1) * 30 + idx + 1}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#F4EBF9] text-[#5D2381] font-bold text-xs flex items-center justify-center shrink-0">
                                {sub.email.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-semibold text-[#141010] text-[13.5px]">
                                {sub.email}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                sub.isVerified
                                  ? "bg-[#E8F8EE] text-[#16A34A]"
                                  : "bg-[#FEF3C7] text-[#B45309]"
                              }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{sub.isVerified ? "Verified" : "Pending"}</span>
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <button
                              type="button"
                              onClick={() => handleToggleActive(sub)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                                sub.isActive
                                  ? "bg-[#E8F8EE] text-[#16A34A] hover:bg-[#D7F3E1]"
                                  : "bg-[#F3F0F7] text-[#716A7E] hover:bg-[#EAE4F1]"
                              }`}
                              title="Click to toggle active status"
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  sub.isActive ? "bg-[#16A34A]" : "bg-[#8C849B]"
                                }`}
                              />
                              <span>{sub.isActive ? "Active" : "Unsubscribed"}</span>
                            </button>
                          </td>
                          <td className="py-4 px-6 text-[#716A7E] text-xs">
                            {new Date(sub.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button
                              type="button"
                              onClick={() => setSubscriberToDelete({ id: sub.id, email: sub.email })}
                              className="p-1.5 text-[#8C849B] hover:text-[#EF4444] hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                              title="Remove subscriber"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-3.5 sm:p-4 border-t border-[#ECE4F2] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#716A7E]">
                <span>
                  Showing {(page - 1) * 30 + 1} - {Math.min(page * 30, totalCount)} of {totalCount}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 rounded-xl border border-[#ECE4F2] disabled:opacity-40 hover:bg-[#FAF6FC] cursor-pointer"
                  >
                    Previous
                  </button>
                  <span className="font-semibold text-[#141010]">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="px-3 py-1.5 rounded-xl border border-[#ECE4F2] disabled:opacity-40 hover:bg-[#FAF6FC] cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      {subscriberToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-5 sm:p-7 max-w-sm w-full border border-[#ECE4F2] shadow-xl text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#141010]">Remove Subscriber?</h3>
            <p className="text-xs sm:text-[13px] text-[#716A7E] mt-1.5 mb-6">
              Are you sure you want to remove <span className="font-semibold text-[#141010] break-all">{subscriberToDelete.email}</span> from this list?
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setSubscriberToDelete(null)}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-2xl border border-[#ECE4F2] text-[#4A4458] font-semibold text-xs hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDeleteSubscriber}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Test Email Modal */}
      {isTestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-5 sm:p-7 max-w-md w-full border border-[#ECE4F2] shadow-xl text-left animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#F6EEFA] text-[#5D2381] flex items-center justify-center shrink-0">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#141010]">Test Notification</h3>
                  <p className="text-xs text-[#716A7E]">Send a sample email to verify template styling</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSendTest} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#141010] mb-1.5">Template Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTestType("blog")}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border cursor-pointer ${
                      testType === "blog"
                        ? "border-[#5D2381] bg-[#FAF5FD] text-[#5D2381]"
                        : "border-[#ECE4F2] text-[#716A7E]"
                    }`}
                  >
                    Blog Welcome
                  </button>
                  <button
                    type="button"
                    onClick={() => setTestType("job")}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border cursor-pointer ${
                      testType === "job"
                        ? "border-[#5D2381] bg-[#FAF5FD] text-[#5D2381]"
                        : "border-[#ECE4F2] text-[#716A7E]"
                    }`}
                  >
                    Job Alert Welcome
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#141010] mb-1.5">Recipient Email Address</label>
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full bg-[#FAF7FC] border border-[#ECE4F2] focus:border-[#5D2381] focus:bg-white rounded-2xl py-2.5 px-3.5 text-xs sm:text-[13px] text-[#141010] outline-none transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTestModalOpen(false)}
                  className="px-4 py-2.5 rounded-2xl border border-[#ECE4F2] text-[#4A4458] font-semibold text-xs hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingTest}
                  className="px-5 py-2.5 rounded-2xl bg-[#5D2381] hover:bg-[#4E1C6D] text-white font-semibold text-xs shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  {isSendingTest && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Send Test Email</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
