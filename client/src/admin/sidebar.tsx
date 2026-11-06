import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutGrid,
  Briefcase,
  Tag,
  FileText,
  Users,
  Calendar,
  LogOut,
  X,
  FolderKanban,
  UsersRound,
  ShieldCheck,
  Mail,
} from "lucide-react";
import netopsysLogo from "../assets/netopsys-ai-logo.png";

// Custom Blogs icon matching the calendar with pencil in the reference screenshot
export function BlogsIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Top calendar rings */}
      <path d="M8 2v3" />
      <path d="M16 2v3" />
      {/* Main calendar box */}
      <rect width="18" height="18" x="3" y="4.5" rx="3" />
      {/* Horizontal divider */}
      <path d="M3 10.5h18" />
      {/* Calendar text line */}
      <path d="M7.5 15h3.5" />
      {/* Pencil writing at bottom right */}
      <path d="M16 13.5l3.5-3.5a1.2 1.2 0 0 1 1.7 1.7L17.7 15.2l-2.7.8.8-2.5z" />
    </svg>
  );
}

export type SidebarTab =
  | "Dashboard"
  | "Job Postings"
  | "Categories"
  | "Applications"
  | "Users"
  | "Interview Slots"
  | "Projects"
  | "Teams"
  | "Blogs"
  | "Blog"
  | "Subscribers"
  | "Permissions";

export interface SidebarItemConfig {
  name: SidebarTab;
  pageId: string;
  icon: React.ComponentType<{ className?: string }>;
  adminPath: string;
  superadminPath: string;
}

export const SIDEBAR_JOB_MANAGEMENT_ITEMS: SidebarItemConfig[] = [
  {
    name: "Job Postings",
    pageId: "job-postings",
    icon: Briefcase,
    adminPath: "/admin/job-postings",
    superadminPath: "/superadmin/job-postings",
  },
  {
    name: "Categories",
    pageId: "categories",
    icon: Tag,
    adminPath: "/admin/category",
    superadminPath: "/superadmin/category",
  },
  {
    name: "Applications",
    pageId: "applications",
    icon: FileText,
    adminPath: "/admin/applications",
    superadminPath: "/superadmin/applications",
  },
  {
    name: "Users",
    pageId: "users",
    icon: Users,
    adminPath: "/admin/users",
    superadminPath: "/superadmin/users",
  },
  {
    name: "Interview Slots",
    pageId: "interview-slots",
    icon: Calendar,
    adminPath: "/admin/interview-slots",
    superadminPath: "/superadmin/interview-slots",
  },
  {
    name: "Projects",
    pageId: "projects",
    icon: FolderKanban,
    adminPath: "/admin/projects",
    superadminPath: "/superadmin/projects",
  },
  {
    name: "Teams",
    pageId: "teams",
    icon: UsersRound,
    adminPath: "/admin/teams",
    superadminPath: "/superadmin/teams",
  },
  {
    name: "Blog",
    pageId: "blogs",
    icon: BlogsIcon,
    adminPath: "/admin/blogs",
    superadminPath: "/superadmin/blogs",
  },
  {
    name: "Subscribers",
    pageId: "subscribers",
    icon: Mail,
    adminPath: "/admin/subscribers",
    superadminPath: "/superadmin/subscribers",
  },
];

export interface AdminSidebarProps {
  activeTab: SidebarTab | string;
  onTabChange?: (tab: SidebarTab) => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function AdminSidebar({
  activeTab,
  onTabChange,
  isMobileOpen = false,
  onCloseMobile,
}: AdminSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const [adminUser, setAdminUser] = useState<{ name: string; email: string; role: string }>(() => {
    try {
      const stored = localStorage.getItem("netopsys_admin_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        const email = String(parsed.email || "").toLowerCase();
        let role = parsed.role;
        const isSuper =
          email === "superadmin@netopsys.in" ||
          role === "SUPERADMIN" ||
          role === "SUPER_ADMIN";

        if (isSuper) {
          return {
            name: parsed.name || "Netopsys Super Admin",
            email: parsed.email || "superadmin@netopsys.in",
            role: "SUPERADMIN",
          };
        }

        if (email === "admin@netopsys.in" || (email.startsWith("admin@") && !email.includes("superadmin"))) {
          role = "ADMIN";
        }
        return {
          name: parsed.name || "Admin User",
          email: parsed.email || "admin@netopsys.in",
          role: role || "ADMIN",
        };
      }
    } catch {
      // ignore
    }

    if (typeof window !== "undefined" && window.location.pathname.startsWith("/superadmin")) {
      return {
        name: "Netopsys Super Admin",
        email: "superadmin@netopsys.in",
        role: "SUPERADMIN",
      };
    }

    return {
      name: "Admin User",
      email: "admin@netopsys.in",
      role: "ADMIN",
    };
  });

  useEffect(() => {
    const loadUser = () => {
      try {
        const stored = localStorage.getItem("netopsys_admin_user");
        if (stored) {
          const parsed = JSON.parse(stored);
          const email = String(parsed.email || "").toLowerCase();
          let role = parsed.role;
          const isSuper =
            email === "superadmin@netopsys.in" ||
            role === "SUPERADMIN" ||
            role === "SUPER_ADMIN";

          if (isSuper) {
            setAdminUser({
              name: parsed.name || "Netopsys Super Admin",
              email: parsed.email || "superadmin@netopsys.in",
              role: "SUPERADMIN",
            });
            return;
          }

          if (email === "admin@netopsys.in" || (email.startsWith("admin@") && !email.includes("superadmin"))) {
            role = "ADMIN";
          }
          setAdminUser({
            name: parsed.name || "Admin User",
            email: parsed.email || "admin@netopsys.in",
            role: role || "ADMIN",
          });
          return;
        }
      } catch {
        // ignore
      }

      if (window.location.pathname.startsWith("/superadmin")) {
        setAdminUser({
          name: "Netopsys Super Admin",
          email: "superadmin@netopsys.in",
          role: "SUPERADMIN",
        });
      }
    };
    loadUser();
    window.addEventListener("admin-auth-change", loadUser);
    return () => window.removeEventListener("admin-auth-change", loadUser);
  }, []);

  // Real-time user-specific and role permissions state
  const [permissionsByUser, setPermissionsByUser] = useState<Record<string, Record<string, { enabled: boolean }>>>(() => {
    try {
      const stored = localStorage.getItem("netopsys_admin_permissions_by_user");
      if (stored) return JSON.parse(stored);
    } catch {}
    return {};
  });

  const [permissionsByRole, setPermissionsByRole] = useState<Record<string, Record<string, { enabled: boolean }>>>(() => {
    try {
      const stored = localStorage.getItem("netopsys_admin_permissions");
      if (stored) return JSON.parse(stored);
    } catch {}
    return {};
  });

  useEffect(() => {
    const loadPermissions = () => {
      try {
        const storedUser = localStorage.getItem("netopsys_admin_permissions_by_user");
        if (storedUser) setPermissionsByUser(JSON.parse(storedUser));
        const storedRole = localStorage.getItem("netopsys_admin_permissions");
        if (storedRole) setPermissionsByRole(JSON.parse(storedRole));
      } catch {}

      fetch("/api/admin/permissions")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.success) {
            if (data.permissionsByUser) {
              setPermissionsByUser(data.permissionsByUser);
              localStorage.setItem("netopsys_admin_permissions_by_user", JSON.stringify(data.permissionsByUser));
            }
            if (data.permissionsByRole) {
              setPermissionsByRole(data.permissionsByRole);
              localStorage.setItem("netopsys_admin_permissions", JSON.stringify(data.permissionsByRole));
            }
          }
        })
        .catch(() => {});
    };

    loadPermissions();
    window.addEventListener("admin-permissions-change", loadPermissions);
    return () => window.removeEventListener("admin-permissions-change", loadPermissions);
  }, []);

  const isSuperAdmin = useMemo(() => {
    const role = (adminUser.role || "").toUpperCase();
    const email = (adminUser.email || "").toLowerCase();

    // Standard admin credentials are NEVER superadmin
    if (email === "admin@netopsys.in" || role === "ADMIN") {
      return false;
    }

    // Only genuine superadmin credentials
    return role === "SUPERADMIN" || role === "SUPER_ADMIN" || email === "superadmin@netopsys.in";
  }, [adminUser.role, adminUser.email]);

  // Which Job Management items should be visible in the sidebar:
  // - Super Admin sees ALL modules!
  // - Admin sees ONLY modules permitted specifically for this user account!
  const visibleJobItems = useMemo(() => {
    if (isSuperAdmin) {
      return SIDEBAR_JOB_MANAGEMENT_ITEMS;
    }

    const currentEmail = (adminUser.email || "").toLowerCase();
    // 1. Strictly prioritize user's own specific permissions
    // 2. Fall back to role permissions if user-specific permissions not configured
    const activePerms =
      permissionsByUser[currentEmail] ||
      permissionsByRole[adminUser.role] ||
      permissionsByRole["ADMIN"] ||
      {};

    return SIDEBAR_JOB_MANAGEMENT_ITEMS.filter((item) => {
      const pagePerm = activePerms[item.pageId];
      if (pagePerm !== undefined && typeof pagePerm.enabled === "boolean") {
        return pagePerm.enabled;
      }
      return true;
    });
  }, [isSuperAdmin, adminUser.email, adminUser.role, permissionsByUser, permissionsByRole]);

  // Route protection guard:
  // - If Admin attempts to visit Permissions, block and redirect immediately to /admin/dashboard
  // - If Admin visits an unauthorized module URL directly, redirect back to /admin/dashboard
  useEffect(() => {
    // Block non-superadmins from accessing permissions page under any URL
    if (!isSuperAdmin) {
      if (
        location.pathname.includes("/permissions") ||
        location.pathname.includes("/permission") ||
        activeTab === "Permissions"
      ) {
        navigate("/admin/dashboard", { replace: true });
        return;
      }
    }

    // SuperAdmin users NEVER get blocked or redirected
    if (isSuperAdmin) return;

    const currentEmail = (adminUser.email || "").toLowerCase();
    const activePerms =
      permissionsByUser[currentEmail] ||
      permissionsByRole[adminUser.role] ||
      permissionsByRole["ADMIN"];

    if (!activePerms) return;

    const currentItem = SIDEBAR_JOB_MANAGEMENT_ITEMS.find(
      (item) => item.name === activeTab || (item.name === "Blog" && activeTab === "Blogs")
    );

    if (currentItem) {
      const pagePerm = activePerms[currentItem.pageId];
      if (pagePerm && pagePerm.enabled === false) {
        navigate("/admin/dashboard", { replace: true });
      }
    }
  }, [isSuperAdmin, adminUser.email, adminUser.role, permissionsByUser, permissionsByRole, activeTab, navigate, location.pathname]);

  const handleLogout = () => {
    try {
      localStorage.removeItem("netopsys_admin_token");
      localStorage.removeItem("netopsys_admin_user");
      fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    } catch {
      // ignore
    }
    const isSuper = location.pathname.startsWith("/superadmin") || isSuperAdmin;
    navigate(isSuper ? "/superadmin/login" : "/admin/login");
  };

  const handleItemClick = (item: SidebarItemConfig) => {
    if (onCloseMobile) {
      onCloseMobile();
    }

    const isSuper = location.pathname.startsWith("/superadmin") || isSuperAdmin;
    const targetPath = isSuper ? item.superadminPath : item.adminPath;

    if (location.pathname === targetPath) {
      if (onTabChange) onTabChange(item.name);
      return;
    }

    navigate(targetPath, { state: { targetTab: item.name } });
  };

  const handleDashboardClick = () => {
    if (onCloseMobile) onCloseMobile();
    const isSuper = location.pathname.startsWith("/superadmin") || isSuperAdmin;
    const targetPath = isSuper ? "/superadmin/dashboard" : "/admin/dashboard";
    if (location.pathname === targetPath) {
      if (onTabChange) onTabChange("Dashboard");
    } else {
      navigate(targetPath);
    }
  };

  const isDashboardActive =
    activeTab === "Dashboard" ||
    location.pathname === "/superadmin/dashboard" ||
    location.pathname === "/admin/dashboard" ||
    location.pathname === "/admin-panel" ||
    location.pathname === "/admin-dashboard";

  const isPermissionsActive =
    activeTab === "Permissions" ||
    location.pathname === "/superadmin/permissions" ||
    location.pathname === "/admin/permissions";

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-30 lg:hidden"
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 h-screen max-h-screen min-h-0 w-64 min-w-[256px] shrink-0 bg-white border-r border-[#ECE4F2] flex flex-col z-40 select-none overflow-hidden transition-transform duration-300 ease-in-out ${
          isMobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand Logo Header */}
        <div className="px-5 pt-6 pb-4 shrink-0 flex items-center justify-between">
          <img
            src={netopsysLogo}
            alt="Netopsys AI"
            className="h-10 sm:h-11 w-auto object-contain cursor-pointer"
            onClick={() => navigate(isSuperAdmin ? "/superadmin/dashboard" : "/admin/dashboard")}
          />
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1 rounded-lg text-gray-500 hover:bg-gray-100 cursor-pointer"
              aria-label="Close Sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Scrollable Navigation Body */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4.5 py-2 space-y-4 [scrollbar-width:thin] [scrollbar-color:#D8CCE5_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-[#D8CCE5] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#BE95D4]">
          {/* Section 1: Overview */}
          <div>
            <div className="text-[13px] font-medium text-[#7D7589] px-3 mb-2 tracking-normal">
              Overview
            </div>
            <button
              onClick={handleDashboardClick}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-[15px] transition-all duration-200 cursor-pointer relative overflow-hidden group ${
                isDashboardActive
                  ? "bg-[#F1E4F8] text-[#5D2381] font-bold"
                  : "text-[#4A4458] hover:bg-[#F1E4F8]/60 hover:text-[#5D2381] font-medium"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <LayoutGrid
                  className={`w-5 h-5 transition-colors ${
                    isDashboardActive
                      ? "stroke-[2.2] text-[#5D2381]"
                      : "stroke-[2] text-[#6B6377] group-hover:text-[#5D2381]"
                  }`}
                />
                <span className="tracking-tight">Dashboard</span>
              </div>
              {/* Active purple bar indicator */}
              {isDashboardActive && (
                <div className="absolute right-0 top-0 bottom-0 w-2 bg-[#5D2381] rounded-r-2xl" />
              )}
            </button>
          </div>

          {/* Section 2: Job Management */}
          <div>
            <div className="text-[13px] font-medium text-[#7D7589] px-3 mb-2 tracking-normal">
              Job Management
            </div>
            <div className="flex flex-col gap-1.5">
              {visibleJobItems.map((item) => {
                const isActive =
                  activeTab === item.name ||
                  location.pathname === item.superadminPath ||
                  location.pathname === item.adminPath ||
                  (item.name === "Blog" && (activeTab === "Blogs" || activeTab === "Blog" || location.pathname.includes("/blog"))) ||
                  (item.name === "Subscribers" && (activeTab === "Subscribers" || activeTab === "subscribers" || location.pathname.includes("/subscriber")));
                const IconComponent = item.icon;

                return (
                  <button
                    key={item.name}
                    onClick={() => handleItemClick(item)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-[15px] transition-all duration-200 cursor-pointer relative overflow-hidden group ${
                      isActive
                        ? "bg-[#F1E4F8] text-[#5D2381] font-bold"
                        : "text-[#4A4458] hover:bg-[#F1E4F8]/60 hover:text-[#5D2381] font-medium"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <IconComponent
                        className={`w-5 h-5 transition-colors ${
                          isActive
                            ? "stroke-[2.2] text-[#5D2381]"
                            : "stroke-[2] text-[#6B6377] group-hover:text-[#5D2381]"
                        }`}
                      />
                      <span className="tracking-tight">{item.name}</span>
                    </div>

                    {/* Active purple bar indicator */}
                    {isActive && (
                      <div className="absolute right-0 top-0 bottom-0 w-2 bg-[#5D2381] rounded-r-2xl" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Super Admin Portal Exclusive: Permissions */}
          {isSuperAdmin && (
            <div className="pt-1">
              <button
                onClick={() => {
                  if (onCloseMobile) onCloseMobile();
                  navigate("/superadmin/permissions");
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-[15px] transition-all duration-200 cursor-pointer relative overflow-hidden group ${
                  isPermissionsActive
                    ? "bg-[#F1E4F8] text-[#5D2381] font-bold"
                    : "text-[#4A4458] hover:bg-[#F1E4F8]/60 hover:text-[#5D2381] font-medium"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <ShieldCheck
                    className={`w-5 h-5 transition-colors ${
                      isPermissionsActive
                        ? "stroke-[2.2] text-[#5D2381]"
                        : "stroke-[2] text-[#6B6377] group-hover:text-[#5D2381]"
                    }`}
                  />
                  <span className="tracking-tight">Permissions</span>
                </div>

                {/* Active purple bar indicator */}
                {isPermissionsActive && (
                  <div className="absolute right-0 top-0 bottom-0 w-2 bg-[#5D2381] rounded-r-2xl" />
                )}
              </button>
            </div>
          )}
        </div>

        {/* Bottom Section: Admin User Card & Log out */}
        <div className="p-3 sm:p-4 border-t border-[#ECE4F2] shrink-0 mt-auto bg-white">
          {/* Admin User Card */}
          <div className="bg-[#F7F0FA] border border-[#EFE5F5] rounded-2xl p-3 flex items-center gap-3 mb-3">
            <div className="relative w-9 h-9 rounded-full bg-[#E6D4EF] text-[#5D2381] font-bold text-xs flex items-center justify-center flex-shrink-0">
              {adminUser.name
                .split(/\s+/)
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase() || "SA"}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#22C55E] border-2 border-white" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-bold text-[#141010] truncate">
                {adminUser.name}
              </div>
              <div className="text-[11.5px] text-[#867E93] truncate">
                {adminUser.email}
              </div>
            </div>
          </div>

          {/* Log out Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-[#E2DBEA] bg-white text-[12.5px] font-medium text-[#524A60] hover:bg-gray-50 hover:text-red-600 transition-colors cursor-pointer group"
          >
            <LogOut className="w-3.5 h-3.5 text-[#6B6377] group-hover:text-red-500 transition-colors" />
            <span>Log out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
