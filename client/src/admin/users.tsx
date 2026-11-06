import { useState, useMemo, useEffect } from "react";
import {
  // Search,
  Eye,
  Ban,
  CheckCircle,
  Download,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Mail,
  Calendar,
  ShieldCheck,
  Loader2,
  RefreshCw,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  ExternalLink,
  Globe,
  Building,
  Clock,
  Sparkles,
  User,
  CheckCircle2,
} from "lucide-react";
import AdminSidebar from "./sidebar.tsx";
import netopsysLogo from "../assets/netopsys-ai-logo.png";
import { toast } from "../componenets/toast.tsx";

export interface RegisteredUser {
  id: string;
  sNo: number;
  initials: string;
  name: string;
  email: string;
  registeredDate: string;
  verificationStatus: "verified" | "Unverified";
  accountStatus: "Active" | "Blocked";
  phone?: string;
  city?: string;
  address?: string;
  role?: string;
}

export interface DetailedUserProfile {
  id: string;
  dbId?: number;
  firstName?: string;
  lastName?: string;
  name: string;
  email: string;
  initials: string;
  registeredDate: string;
  mobileNumber?: string;
  phone?: string;
  isEmailVerified?: boolean;
  verificationStatus: "verified" | "Unverified";
  accountStatus: "Active" | "Blocked";
  dob?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  jobTitle?: string;
  currentCompany?: string;
  experienceYears?: string;
  skills?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  highestDegree?: string;
  fieldOfStudy?: string;
  institution?: string;
  graduationYear?: string;
  gradeScore?: string;
  workExperiences?: Array<{
    id: string;
    jobTitle: string;
    companyName: string;
    location?: string;
    startDate: string;
    endDate?: string;
    description?: string;
  }>;
  savedCerts?: Array<{
    id?: string;
    name: string;
    org: string;
    date: string;
    url?: string;
  }>;
}

const ITEMS_PER_PAGE = 9;

export default function UsersPage() {
  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const searchQuery = "";
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Selected User Modal for View Details
  const [selectedUser, setSelectedUser] = useState<RegisteredUser | null>(null);
  const [detailedProfile, setDetailedProfile] = useState<DetailedUserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<"personal" | "professional" | "education" | "certs">("personal");

  // Open user details smoothly without any blank flicker or blinking
  const handleOpenDetails = (user: RegisteredUser) => {
    // 1. Immediately seed detailed profile with known user information
    setSelectedUser(user);
    setDetailedProfile({
      ...user,
      jobTitle: user.role,
      phone: user.phone,
      city: user.city,
      address: user.address,
    });
    setActiveModalTab("personal");
    setIsLoadingProfile(true);

    // 2. Fetch complete details in the background and update seamlessly
    fetch(`/api/users/profile?email=${encodeURIComponent(user.email)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && data.profile) {
          setDetailedProfile((prev) => ({
            ...user,
            ...prev,
            ...data.profile,
            name: data.profile.name || user.name,
            initials: data.profile.initials || user.initials,
            accountStatus: user.accountStatus,
            verificationStatus: data.profile.verificationStatus || user.verificationStatus,
          }));
        }
      })
      .catch((err) => {
        console.error("Failed to load user profile details:", err);
      })
      .finally(() => {
        setIsLoadingProfile(false);
      });
  };

  const handleCloseDetails = () => {
    setSelectedUser(null);
    setDetailedProfile(null);
    setIsLoadingProfile(false);
  };

  // Fetch real registered users from PostgreSQL database (strictly unique by email)
  const fetchUsers = async () => {
    setIsLoading(true);
    setFetchError("");
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.users)) {
        // Guarantee no duplicates by email
        const seen = new Set<string>();
        const uniqueUsers: RegisteredUser[] = [];

        data.users.forEach((u: RegisteredUser) => {
          const emailKey = (u.email || "").trim().toLowerCase();
          if (emailKey && !seen.has(emailKey)) {
            seen.add(emailKey);
            uniqueUsers.push({
              ...u,
              email: emailKey,
            });
          }
        });

        // Re-index serial numbers cleanly
        const indexed = uniqueUsers.map((u, idx) => ({
          ...u,
          sNo: idx + 1,
        }));

        setUsers(indexed);
      } else {
        throw new Error(data.message || "Failed to load users from database");
      }
    } catch (err: unknown) {
      console.error("Error loading users from database:", err);
      setFetchError("Unable to load registered users from database.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const q = searchQuery.toLowerCase();
    return users.filter(
      (u) =>
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.registeredDate && u.registeredDate.toLowerCase().includes(q)) ||
        (u.verificationStatus && u.verificationStatus.toLowerCase().includes(q)) ||
        (u.accountStatus && u.accountStatus.toLowerCase().includes(q))
    );
  }, [users, searchQuery]);

  // Pagination calculation
  const totalUsers = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalUsers / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedUsers = useMemo(() => {
    return filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredUsers, startIndex]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ["S.No", "User Name", "Email", "Registered Date", "Verification Status", "Account Status"];
    const rows = filteredUsers.map((u) => [
      u.sNo,
      `"${u.name}"`,
      `"${u.email}"`,
      `"${u.registeredDate}"`,
      `"${u.verificationStatus}"`,
      `"${u.accountStatus}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `registered_users_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Toggle Block Status in Database & Local State
  const handleToggleBlock = async (id: string) => {
    // Optimistic UI update
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? {
              ...u,
              accountStatus: u.accountStatus === "Active" ? "Blocked" : "Active",
            }
          : u
      )
    );

    try {
      const res = await fetch(`/api/admin/users/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (res.ok && data.success && data.accountStatus) {
        setUsers((prev) =>
          prev.map((u) => (u.id === id ? { ...u, accountStatus: data.accountStatus } : u))
        );
        toast.success(`User status changed to ${data.accountStatus}.`, { title: "Status Updated" });
      }
    } catch (err) {
      console.error("Failed to toggle user status in database:", err);
      toast.error("Failed to update user status in database.");
      fetchUsers();
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#F5EEFA] text-[#141010] font-['Onest',sans-serif] overflow-hidden antialiased">
      {/* Reusable Admin Sidebar with 'Users' active */}
      <AdminSidebar
        activeTab="Users"
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
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
            AD
          </div>
        </header>

        {/* Scrollable View */}
        <main className="flex-1 overflow-y-auto px-5 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-8">
          {/* Header Row: Title & Subtitle on left, Search Bar on right */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-[26px] sm:text-[28px] font-bold text-[#141010] tracking-tight">
                Users
              </h1>
              <p className="text-[13px] sm:text-[13.5px] text-[#716A7E] font-normal mt-0.5">
                View and manage the registered users
              </p>
            </div>

          </div>

          {/* White Card Table Container matching screenshot */}
          <div className="bg-white rounded-2xl sm:rounded-[22px] border border-[#ECE4F2] shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
            {/* Card Header: Title & Action Buttons */}
            <div className="p-5 sm:p-6 flex items-center justify-between border-b border-[#ECE4F2]">
              <div className="flex items-center gap-3">
                <h2 className="text-[17px] sm:text-[18px] font-bold text-[#141010] tracking-tight">
                  Registered Users ({totalUsers})
                </h2>
                {isLoading && (
                  <Loader2 className="w-4 h-4 text-[#5D2381] animate-spin" />
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* <button
                  type="button"
                  onClick={fetchUsers}
                  disabled={isLoading}
                  title="Refresh users from database"
                  className="p-2 rounded-xl border border-[#E2DBEA] bg-white text-[#5D2381] hover:bg-[#F9F5FC] transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 stroke-[2] ${isLoading ? "animate-spin" : ""}`} />
                </button> */}
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#E2DBEA] bg-white text-[13px] font-semibold text-[#5D2381] hover:bg-[#F9F5FC] transition-colors cursor-pointer shadow-2xs"
                >
                  <Download className="w-4 h-4 stroke-[2]" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto table-responsive-container">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-[#ECE4F2] text-[12.5px] font-medium text-[#7D7589]">
                    <th className="py-4 px-6 font-semibold">S.No</th>
                    <th className="py-4 px-6 font-semibold">User Name</th>
                    <th className="py-4 px-6 font-semibold">Email</th>
                    <th className="py-4 px-6 font-semibold">Registered Date</th>
                    <th className="py-4 px-6 font-semibold">Status</th>
                    <th className="py-4 px-6 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1EBF5] text-[13.5px]">
                  {isLoading && (
                    <tr>
                      <td colSpan={6} className="py-16 text-center text-[#5D2381]">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Loader2 className="w-6 h-6 animate-spin text-[#5D2381]" />
                          <span className="text-xs font-semibold text-[#716A7E]">Loading registered users from database...</span>
                        </div>
                      </td>
                    </tr>
                  )}

                  {!isLoading && fetchError && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-red-500">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <span className="text-xs font-medium">{fetchError}</span>
                          <button
                            type="button"
                            onClick={fetchUsers}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#5D2381] bg-[#F1E3FA] hover:bg-[#E8D4F5] rounded-xl cursor-pointer"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Retry</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}

                  {!isLoading && !fetchError && paginatedUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-[#FAF8FC] transition-colors group"
                    >
                      {/* S.No */}
                      <td className="py-4.5 px-6 text-[#716A7E] font-medium text-sm">
                        {user.sNo}
                      </td>

                      {/* User Name with circular avatar badge */}
                      <td className="py-4.5 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8.5 h-8.5 rounded-full bg-[#EDE4F5] text-[#5D2381] font-bold text-xs flex items-center justify-center shrink-0">
                            {user.initials}
                          </div>
                          <span className="font-bold text-[#141010] text-[14.5px]">
                            {user.name}
                          </span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-4.5 px-6 text-[#4A4458] font-normal text-[13.5px]">
                        {user.email}
                      </td>

                      {/* Registered Date */}
                      <td className="py-4.5 px-6 text-[#4A4458] font-normal text-[13.5px]">
                        {user.registeredDate}
                      </td>

                      {/* Status Badges (Exact match to 1st image, scaled to larger table) */}
                      <td className="py-4.5 px-6">
                        <div className="flex items-center gap-2.5">
                          {/* Verification Badge - uniform 76x25 pill button */}
                          {user.verificationStatus === "verified" ? (
                            <span className="w-[76px] h-[25px] inline-flex items-center justify-center rounded-full text-[12px] font-bold bg-[#DCF4E8] text-[#157347] tracking-tight select-none">
                              Verified
                            </span>
                          ) : (
                            <span className="w-[76px] h-[25px] inline-flex items-center justify-center rounded-full text-[12px] font-bold bg-[#FEF1D6] text-[#8E5B15] tracking-tight select-none">
                              Unverified
                            </span>
                          )}

                          {/* Account Status Badge - compact 56x25 pill button */}
                          {user.accountStatus === "Active" ? (
                            <span className="w-[56px] h-[25px] inline-flex items-center justify-center rounded-full text-[12px] font-bold bg-[#F1E3FA] text-[#692F95] tracking-tight select-none">
                              Active
                            </span>
                          ) : (
                            <span className="w-[60px] h-[25px] inline-flex items-center justify-center rounded-full text-[12px] font-bold bg-[#FEE2E2] text-[#DC2626] tracking-tight select-none">
                              Blocked
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions: View Details & Block buttons */}
                      <td className="py-4.5 px-6 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          {/* View Details Button */}
                          <button
                            onClick={() => handleOpenDetails(user)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#E2DBEA] bg-white text-[12.5px] font-semibold text-[#141010] hover:bg-gray-50 hover:border-[#D5CBE0] transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 stroke-[2] text-[#5D2381]" />
                            <span>View Details</span>
                          </button>

                          {/* Block / Unblock Button */}
                          <button
                            onClick={() => handleToggleBlock(user.id)}
                            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-[12.5px] font-semibold transition-colors cursor-pointer ${
                              user.accountStatus === "Active"
                                ? "border-[#FBD5D5] bg-white text-[#EF4444] hover:bg-[#FFF5F5]"
                                : "border-[#DCFCE7] bg-white text-[#15803D] hover:bg-[#F0FDF4]"
                            }`}
                          >
                            {user.accountStatus === "Active" ? (
                              <>
                                <Ban className="w-3.5 h-3.5 stroke-[2] text-[#EF4444]" />
                                <span>Block</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-3.5 h-3.5 stroke-[2] text-[#15803D]" />
                                <span>Unblock</span>
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {!isLoading && !fetchError && paginatedUsers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-16 text-center text-[#716A7E]">
                        {searchQuery ? (
                          <span>No users found matching "{searchQuery}"</span>
                        ) : (
                          <span>No registered accounts found in the database.</span>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer Pagination Bar */}
            <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#ECE4F2]">
              <div className="text-[13px] text-[#716A7E]">
                Showing {totalUsers > 0 ? startIndex + 1 : 0}-{Math.min(startIndex + ITEMS_PER_PAGE, totalUsers)} of {totalUsers} users
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center gap-1.5">
                {/* Previous Button */}
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border text-[12.5px] font-medium transition-colors ${
                    currentPage === 1
                      ? "border-[#ECE4F2] bg-white text-gray-300 cursor-not-allowed"
                      : "border-[#E2DBEA] bg-white text-[#4A4458] hover:bg-gray-50 cursor-pointer"
                  }`}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                {/* Page Number Buttons */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-xl text-[12.5px] font-semibold transition-all cursor-pointer ${
                      currentPage === pageNum
                        ? "bg-[#5D2381] text-white shadow-xs"
                        : "border border-[#E2DBEA] bg-white text-[#4A4458] hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                {/* Next Button */}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border text-[12.5px] font-medium transition-colors ${
                    currentPage === totalPages
                      ? "border-[#ECE4F2] bg-white text-gray-300 cursor-not-allowed"
                      : "border-[#E2DBEA] bg-white text-[#4A4458] hover:bg-gray-50 cursor-pointer"
                  }`}
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* =========================================================================
          MODAL: VIEW USER DETAILS (FULL CANDIDATE PROFILE)
      ========================================================================= */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-5 md:p-6">
          <div className="bg-white rounded-[24px] sm:rounded-[28px] max-w-3xl w-full max-h-[90vh] flex flex-col border border-[#ECE4F2] shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-[#ECE4F2] shrink-0 bg-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#F6EEFA] text-[#5D2381] flex items-center justify-center">
                  <User className="w-4.5 h-4.5 stroke-[2.2]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-[17px] sm:text-[18px] font-bold text-[#141010] tracking-tight">
                      Candidate Profile Details
                    </h3>
                    {isLoadingProfile && (
                      <Loader2 className="w-3.5 h-3.5 text-[#5D2381] animate-spin shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-[#716A7E]">
                    Complete information saved by the candidate
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseDetails}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-[#716A7E] hover:bg-gray-100 hover:text-[#141010] transition-colors cursor-pointer"
                title="Close modal"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Profile Overview Banner */}
            <div className="p-5 sm:p-6 bg-[#FAF6FC] border-b border-[#ECE0F5] shrink-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#E6D4EF] text-[#5D2381] font-bold text-xl flex items-center justify-center shrink-0 shadow-inner">
                    {detailedProfile?.initials || selectedUser.initials}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-[18px] sm:text-[20px] font-bold text-[#141010] truncate">
                      {detailedProfile?.name || selectedUser.name}
                    </h4>
                    <p className="text-xs sm:text-[13px] text-[#5D2381] font-medium flex items-center gap-1.5 mt-0.5">
                      <Briefcase className="w-3.5 h-3.5 shrink-0" />
                      <span>{detailedProfile?.jobTitle || selectedUser.role || "Candidate"}</span>
                      {detailedProfile?.currentCompany && (
                        <span>@ {detailedProfile.currentCompany}</span>
                      )}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#716A7E] mt-1.5">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-[#8C8498]" />
                        {detailedProfile?.email || selectedUser.email}
                      </span>
                      {(detailedProfile?.phone || selectedUser.phone) && (detailedProfile?.phone || selectedUser.phone) !== "N/A" && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-[#8C8498]" />
                          {detailedProfile?.phone || selectedUser.phone}
                        </span>
                      )}
                      {(detailedProfile?.city || selectedUser.city) && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#8C8498]" />
                          {[detailedProfile?.city || selectedUser.city, detailedProfile?.state].filter(Boolean).join(", ")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex sm:flex-col items-start sm:items-end gap-2 shrink-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 select-none ${
                        (detailedProfile?.verificationStatus || selectedUser.verificationStatus) === "verified"
                          ? "bg-[#DCF4E8] text-[#157347]"
                          : "bg-[#FEF1D6] text-[#8E5B15]"
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span className="capitalize">{detailedProfile?.verificationStatus || selectedUser.verificationStatus}</span>
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center select-none ${
                        (detailedProfile?.accountStatus || selectedUser.accountStatus) === "Active"
                          ? "bg-[#F1E3FA] text-[#692F95]"
                          : "bg-[#FEE2E2] text-[#DC2626]"
                      }`}
                    >
                      {detailedProfile?.accountStatus || selectedUser.accountStatus}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#8C8498] flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Registered: {selectedUser.registeredDate}
                  </span>
                </div>
              </div>
            </div>

            {/* Sub-Tabs Navigation matching Profile Page */}
            <div className="flex items-center gap-1.5 px-6 pt-3 pb-2.5 border-b border-[#ECE4F2] bg-white shrink-0 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveModalTab("personal")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-[13px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeModalTab === "personal"
                    ? "bg-[#5D2381] text-white shadow-xs"
                    : "text-[#554E62] hover:bg-[#F8F4FA] hover:text-[#141010]"
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Personal</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModalTab("professional")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-[13px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeModalTab === "professional"
                    ? "bg-[#5D2381] text-white shadow-xs"
                    : "text-[#554E62] hover:bg-[#F8F4FA] hover:text-[#141010]"
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Professional</span>
                {detailedProfile?.workExperiences && detailedProfile.workExperiences.length > 0 && (
                  <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center ${
                    activeModalTab === "professional" ? "bg-white/25 text-white" : "bg-[#ECE4F2] text-[#5D2381]"
                  }`}>
                    {detailedProfile.workExperiences.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveModalTab("education")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-[13px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeModalTab === "education"
                    ? "bg-[#5D2381] text-white shadow-xs"
                    : "text-[#554E62] hover:bg-[#F8F4FA] hover:text-[#141010]"
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Education</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModalTab("certs")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-[13px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeModalTab === "certs"
                    ? "bg-[#5D2381] text-white shadow-xs"
                    : "text-[#554E62] hover:bg-[#F8F4FA] hover:text-[#141010]"
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Certifications</span>
                {detailedProfile?.savedCerts && detailedProfile.savedCerts.length > 0 && (
                  <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center ${
                    activeModalTab === "certs" ? "bg-white/25 text-white" : "bg-[#ECE4F2] text-[#5D2381]"
                  }`}>
                    {detailedProfile.savedCerts.length}
                  </span>
                )}
              </button>
            </div>

            {/* Scrollable Tab Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-white">
              {/* TAB 1: PERSONAL INFORMATION */}
              {activeModalTab === "personal" && (
                <div className="space-y-5">
                      <div>
                        <h5 className="text-[14px] font-bold text-[#141010] mb-3 flex items-center gap-2">
                          <User className="w-4 h-4 text-[#5D2381]" />
                          <span>Personal & Contact Details</span>
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          <div className="p-3.5 rounded-2xl bg-[#FAF8FB] border border-[#EFE8F4]">
                            <span className="text-[11px] font-semibold text-[#8C8498] uppercase tracking-wider block">First Name</span>
                            <span className="text-[13.5px] font-semibold text-[#141010] mt-0.5 block">{detailedProfile?.firstName || selectedUser.name.split(" ")[0] || "N/A"}</span>
                          </div>
                          <div className="p-3.5 rounded-2xl bg-[#FAF8FB] border border-[#EFE8F4]">
                            <span className="text-[11px] font-semibold text-[#8C8498] uppercase tracking-wider block">Last Name</span>
                            <span className="text-[13.5px] font-semibold text-[#141010] mt-0.5 block">{detailedProfile?.lastName || selectedUser.name.split(" ").slice(1).join(" ") || "N/A"}</span>
                          </div>
                          <div className="p-3.5 rounded-2xl bg-[#FAF8FB] border border-[#EFE8F4]">
                            <span className="text-[11px] font-semibold text-[#8C8498] uppercase tracking-wider block">Email Address</span>
                            <span className="text-[13.5px] font-semibold text-[#141010] mt-0.5 flex items-center gap-1.5 truncate">
                              {detailedProfile?.email || selectedUser.email}
                              {detailedProfile?.isEmailVerified && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              )}
                            </span>
                          </div>
                          <div className="p-3.5 rounded-2xl bg-[#FAF8FB] border border-[#EFE8F4]">
                            <span className="text-[11px] font-semibold text-[#8C8498] uppercase tracking-wider block">Mobile Number</span>
                            <span className="text-[13.5px] font-semibold text-[#141010] mt-0.5 block">{detailedProfile?.mobileNumber || detailedProfile?.phone || selectedUser.phone || "N/A"}</span>
                          </div>
                          <div className="p-3.5 rounded-2xl bg-[#FAF8FB] border border-[#EFE8F4]">
                            <span className="text-[11px] font-semibold text-[#8C8498] uppercase tracking-wider block">Date of Birth</span>
                            <span className="text-[13.5px] font-semibold text-[#141010] mt-0.5 block">{detailedProfile?.dob || "N/A"}</span>
                          </div>
                          <div className="p-3.5 rounded-2xl bg-[#FAF8FB] border border-[#EFE8F4]">
                            <span className="text-[11px] font-semibold text-[#8C8498] uppercase tracking-wider block">Gender</span>
                            <span className="text-[13.5px] font-semibold text-[#141010] mt-0.5 capitalize block">{detailedProfile?.gender || "N/A"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Address Section */}
                      <div className="pt-2">
                        <h5 className="text-[14px] font-bold text-[#141010] mb-3 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-[#5D2381]" />
                          <span>Residential Address</span>
                        </h5>
                        <div className="p-4 rounded-2xl bg-[#FAF8FB] border border-[#EFE8F4] space-y-3">
                          <div>
                            <span className="text-[11px] font-semibold text-[#8C8498] uppercase tracking-wider block">Street Address</span>
                            <p className="text-[13.5px] font-medium text-[#141010] mt-0.5 leading-relaxed">
                              {detailedProfile?.address || selectedUser.address || "No street address provided"}
                            </p>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-[#ECE4F2]">
                            <div>
                              <span className="text-[11px] font-semibold text-[#8C8498] uppercase tracking-wider block">City</span>
                              <span className="text-[13px] font-semibold text-[#141010] mt-0.5 block">{detailedProfile?.city || selectedUser.city || "N/A"}</span>
                            </div>
                            <div>
                              <span className="text-[11px] font-semibold text-[#8C8498] uppercase tracking-wider block">State</span>
                              <span className="text-[13px] font-semibold text-[#141010] mt-0.5 block">{detailedProfile?.state || "N/A"}</span>
                            </div>
                            <div>
                              <span className="text-[11px] font-semibold text-[#8C8498] uppercase tracking-wider block">Country</span>
                              <span className="text-[13px] font-semibold text-[#141010] mt-0.5 block">{detailedProfile?.country || "N/A"}</span>
                            </div>
                            <div>
                              <span className="text-[11px] font-semibold text-[#8C8498] uppercase tracking-wider block">Pincode</span>
                              <span className="text-[13px] font-semibold text-[#141010] mt-0.5 block">{detailedProfile?.pincode || "N/A"}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

              {/* TAB 2: PROFESSIONAL INFORMATION */}
              {activeModalTab === "professional" && (
                <div className="space-y-5">
                      <div>
                        <h5 className="text-[14px] font-bold text-[#141010] mb-3 flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-[#5D2381]" />
                          <span>Professional Overview</span>
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                          <div className="p-3.5 rounded-2xl bg-[#FAF8FB] border border-[#EFE8F4]">
                            <span className="text-[11px] font-semibold text-[#8C8498] uppercase tracking-wider block">Current Job Title</span>
                            <span className="text-[13.5px] font-semibold text-[#141010] mt-0.5 block">{detailedProfile?.jobTitle || selectedUser.role || "N/A"}</span>
                          </div>
                          <div className="p-3.5 rounded-2xl bg-[#FAF8FB] border border-[#EFE8F4]">
                            <span className="text-[11px] font-semibold text-[#8C8498] uppercase tracking-wider block">Current Company</span>
                            <span className="text-[13.5px] font-semibold text-[#141010] mt-0.5 block">{detailedProfile?.currentCompany || "N/A"}</span>
                          </div>
                          <div className="p-3.5 rounded-2xl bg-[#FAF8FB] border border-[#EFE8F4]">
                            <span className="text-[11px] font-semibold text-[#8C8498] uppercase tracking-wider block">Total Experience</span>
                            <span className="text-[13.5px] font-semibold text-[#141010] mt-0.5 block">{detailedProfile?.experienceYears || "N/A"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Skills */}
                      <div>
                        <h5 className="text-[14px] font-bold text-[#141010] mb-2.5 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-[#5D2381]" />
                          <span>Key Skills</span>
                        </h5>
                        <div className="p-4 rounded-2xl bg-[#FAF8FB] border border-[#EFE8F4]">
                          {detailedProfile?.skills ? (
                            <div className="flex flex-wrap gap-2">
                              {detailedProfile.skills.split(",").map((s, idx) => {
                                const clean = s.trim();
                                if (!clean) return null;
                                return (
                                  <span
                                    key={idx}
                                    className="px-3 py-1 rounded-full text-xs font-semibold bg-[#F2E6F8] text-[#5D2381] border border-[#E3D3EE]"
                                  >
                                    {clean}
                                  </span>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-xs text-[#716A7E]">No skills specified.</p>
                          )}
                        </div>
                      </div>

                      {/* Social & Portfolio Links */}
                      <div>
                        <h5 className="text-[14px] font-bold text-[#141010] mb-2.5 flex items-center gap-2">
                          <Globe className="w-4 h-4 text-[#5D2381]" />
                          <span>Portfolio & Social Links</span>
                        </h5>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="p-3.5 rounded-2xl bg-[#FAF8FB] border border-[#EFE8F4]">
                            <span className="text-[11px] font-semibold text-[#8C8498] uppercase tracking-wider block">LinkedIn</span>
                            {detailedProfile?.linkedinUrl ? (
                              <a
                                href={detailedProfile.linkedinUrl.startsWith("http") ? detailedProfile.linkedinUrl : `https://${detailedProfile.linkedinUrl}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[13px] font-semibold text-[#5D2381] hover:underline inline-flex items-center gap-1 mt-1 truncate max-w-full"
                              >
                                <span className="truncate">View Profile</span>
                                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                              </a>
                            ) : (
                              <span className="text-xs text-[#8C8498] mt-1 block">Not added</span>
                            )}
                          </div>

                          <div className="p-3.5 rounded-2xl bg-[#FAF8FB] border border-[#EFE8F4]">
                            <span className="text-[11px] font-semibold text-[#8C8498] uppercase tracking-wider block">GitHub</span>
                            {detailedProfile?.githubUrl ? (
                              <a
                                href={detailedProfile.githubUrl.startsWith("http") ? detailedProfile.githubUrl : `https://${detailedProfile.githubUrl}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[13px] font-semibold text-[#5D2381] hover:underline inline-flex items-center gap-1 mt-1 truncate max-w-full"
                              >
                                <span className="truncate">View GitHub</span>
                                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                              </a>
                            ) : (
                              <span className="text-xs text-[#8C8498] mt-1 block">Not added</span>
                            )}
                          </div>

                          <div className="p-3.5 rounded-2xl bg-[#FAF8FB] border border-[#EFE8F4]">
                            <span className="text-[11px] font-semibold text-[#8C8498] uppercase tracking-wider block">Portfolio</span>
                            {detailedProfile?.portfolioUrl ? (
                              <a
                                href={detailedProfile.portfolioUrl.startsWith("http") ? detailedProfile.portfolioUrl : `https://${detailedProfile.portfolioUrl}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[13px] font-semibold text-[#5D2381] hover:underline inline-flex items-center gap-1 mt-1 truncate max-w-full"
                              >
                                <span className="truncate">View Portfolio</span>
                                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                              </a>
                            ) : (
                              <span className="text-xs text-[#8C8498] mt-1 block">Not added</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Work Experience Timeline */}
                      <div>
                        <h5 className="text-[14px] font-bold text-[#141010] mb-3 flex items-center gap-2">
                          <Building className="w-4 h-4 text-[#5D2381]" />
                          <span>Work Experience History</span>
                        </h5>
                        {detailedProfile?.workExperiences && detailedProfile.workExperiences.length > 0 ? (
                          <div className="space-y-3">
                            {detailedProfile.workExperiences.map((w, idx) => (
                              <div
                                key={w.id || idx}
                                className="p-4 rounded-2xl bg-[#FAF8FB] border border-[#EFE8F4] relative"
                              >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                                  <h6 className="text-[14px] font-bold text-[#141010]">
                                    {w.jobTitle || "Untitled Role"}{" "}
                                    <span className="text-[#5D2381] font-semibold">
                                      @ {w.companyName || "Company"}
                                    </span>
                                  </h6>
                                  <span className="text-xs font-semibold text-[#716A7E] flex items-center gap-1 shrink-0">
                                    <Clock className="w-3.5 h-3.5" />
                                    {w.startDate || "N/A"} - {w.endDate || "Present"}
                                  </span>
                                </div>
                                {w.location && (
                                  <p className="text-xs text-[#8C8498] flex items-center gap-1 mb-2">
                                    <MapPin className="w-3 h-3" />
                                    {w.location}
                                  </p>
                                )}
                                {w.description && (
                                  <p className="text-xs sm:text-[13px] text-[#4A4458] leading-relaxed pt-1.5 border-t border-[#ECE4F2]">
                                    {w.description}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-5 rounded-2xl bg-[#FAF8FB] border border-[#EFE8F4] text-center text-xs text-[#716A7E]">
                            No work experience records added by this candidate.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

              {/* TAB 3: EDUCATION */}
              {activeModalTab === "education" && (
                <div className="space-y-4">
                  <div>
                    <h5 className="text-[14px] font-bold text-[#141010] mb-3 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-[#5D2381]" />
                      <span>Educational Qualifications</span>
                    </h5>
                    <div className="p-5 rounded-2xl bg-[#FAF8FB] border border-[#EFE8F4] space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <span className="text-[11px] font-semibold text-[#8C8498] uppercase tracking-wider block">Highest Degree</span>
                          <span className="text-[14px] font-bold text-[#141010] mt-0.5 block">{detailedProfile?.highestDegree || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-[11px] font-semibold text-[#8C8498] uppercase tracking-wider block">Field of Study / Major</span>
                          <span className="text-[14px] font-semibold text-[#141010] mt-0.5 block">{detailedProfile?.fieldOfStudy || "N/A"}</span>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-[#ECE4F2] grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-1">
                          <span className="text-[11px] font-semibold text-[#8C8498] uppercase tracking-wider block">Institution / University</span>
                          <span className="text-[13.5px] font-semibold text-[#141010] mt-0.5 block">{detailedProfile?.institution || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-[11px] font-semibold text-[#8C8498] uppercase tracking-wider block">Graduation Year</span>
                          <span className="text-[13.5px] font-semibold text-[#141010] mt-0.5 block">{detailedProfile?.graduationYear || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-[11px] font-semibold text-[#8C8498] uppercase tracking-wider block">Grade / CGPA</span>
                          <span className="text-[13.5px] font-semibold text-[#141010] mt-0.5 block">{detailedProfile?.gradeScore || "N/A"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: CERTIFICATIONS */}
              {activeModalTab === "certs" && (
                <div className="space-y-4">
                  <div>
                    <h5 className="text-[14px] font-bold text-[#141010] mb-3 flex items-center gap-2">
                      <Award className="w-4 h-4 text-[#5D2381]" />
                      <span>Certifications & Credentials</span>
                    </h5>
                    {detailedProfile?.savedCerts && detailedProfile.savedCerts.length > 0 ? (
                      <div className="space-y-3">
                        {detailedProfile.savedCerts.map((c, idx) => (
                          <div
                            key={c.id || idx}
                            className="p-4 rounded-2xl bg-[#FAF8FB] border border-[#EFE8F4] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div className="min-w-0">
                              <h6 className="text-[14px] font-bold text-[#141010] truncate">
                                {c.name}
                              </h6>
                              <p className="text-xs text-[#5D2381] font-semibold mt-0.5">
                                {c.org}
                              </p>
                              {c.date && (
                                <p className="text-[11px] text-[#8C8498] flex items-center gap-1 mt-1">
                                  <Calendar className="w-3 h-3" />
                                  Issued: {c.date}
                                </p>
                              )}
                            </div>
                            {c.url ? (
                              <a
                                href={c.url.startsWith("http") ? c.url : `https://${c.url}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3.5 py-1.5 rounded-xl border border-[#DCD3E4] bg-white text-xs font-semibold text-[#5D2381] hover:bg-[#F8F4FA] inline-flex items-center gap-1.5 shrink-0"
                              >
                                <span>Verify Credential</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            ) : (
                              <span className="text-xs text-[#8C8498] italic">No URL provided</span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 rounded-2xl bg-[#FAF8FB] border border-[#EFE8F4] text-center text-xs text-[#716A7E]">
                        No certifications or credentials added by this candidate.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-[#ECE4F2] bg-[#FAF8FB] shrink-0">

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCloseDetails}
                  className="px-5 py-2.5 rounded-xl border border-[#D5CBE0] text-xs font-semibold text-[#4A4458] hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleToggleBlock(selectedUser.id);
                    setSelectedUser((u) =>
                      u ? { ...u, accountStatus: u.accountStatus === "Active" ? "Blocked" : "Active" } : null
                    );
                    setDetailedProfile((p) =>
                      p ? { ...p, accountStatus: p.accountStatus === "Active" ? "Blocked" : "Active" } : null
                    );
                  }}
                  className={`px-5 py-2.5 rounded-xl text-xs font-semibold text-white transition-all cursor-pointer ${
                    (detailedProfile?.accountStatus || selectedUser.accountStatus) === "Active"
                      ? "bg-[#DC2626] hover:bg-[#B91C1C]"
                      : "bg-[#16A34A] hover:bg-[#15803D]"
                  }`}
                >
                  {(detailedProfile?.accountStatus || selectedUser.accountStatus) === "Active"
                    ? "Block Account"
                    : "Unblock Account"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
