import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldAlert,
  Check,
  X,
  LayoutGrid,
  Briefcase,
  Tag,
  FileText,
  Users,
  Calendar,
  FolderKanban,
  UsersRound,
  Menu,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Trash2,
  UserPlus,
  Lock,
  Mail,
  User,
  Pencil,
} from "lucide-react";
import AdminSidebar, { BlogsIcon } from "./sidebar.tsx";
import { toast } from "../componenets/toast.tsx";

// ============================================================================
// 1. DATA STRUCTURES & DEFINITIONS
// ============================================================================

export interface PagePermissionConfig {
  id: string;
  name: string;
  path: string;
  category: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultAccess: {
    SUPERADMIN: boolean;
    ADMIN: boolean;
    HR_ADMIN: boolean;
    CONTENT_MANAGER: boolean;
    INTERVIEWER: boolean;
    SUB_ADMIN: boolean;
  };
  supportedActions: {
    key: string;
    label: string;
  }[];
}

export const ADMIN_PAGES_LIST: PagePermissionConfig[] = [
  {
    id: "dashboard",
    name: "Dashboard",
    path: "/admin/dashboard",
    category: "Overview & Analytics",
    description: "Analytics, applicant pipeline flow charts, and portal statistics.",
    icon: LayoutGrid,
    defaultAccess: {
      SUPERADMIN: true,
      ADMIN: true,
      HR_ADMIN: true,
      CONTENT_MANAGER: true,
      INTERVIEWER: true,
      SUB_ADMIN: true,
    },
    supportedActions: [
      { key: "view", label: "View Analytics" },
      { key: "export", label: "Export Reports" },
    ],
  },
  {
    id: "job-postings",
    name: "Job Postings",
    path: "/admin/job-postings",
    category: "Careers & Hiring",
    description: "Create and publish career openings, role summaries, and requirements.",
    icon: Briefcase,
    defaultAccess: {
      SUPERADMIN: true,
      ADMIN: true,
      HR_ADMIN: true,
      CONTENT_MANAGER: false,
      INTERVIEWER: false,
      SUB_ADMIN: true,
    },
    supportedActions: [
      { key: "view", label: "View Postings" },
      { key: "create", label: "Create Role" },
      { key: "edit", label: "Edit Details" },
      { key: "delete", label: "Delete Role" },
    ],
  },
  {
    id: "categories",
    name: "Job Categories",
    path: "/admin/category",
    category: "Careers & Hiring",
    description: "Organize recruitment departments and employment classification tags.",
    icon: Tag,
    defaultAccess: {
      SUPERADMIN: true,
      ADMIN: true,
      HR_ADMIN: true,
      CONTENT_MANAGER: false,
      INTERVIEWER: false,
      SUB_ADMIN: false,
    },
    supportedActions: [
      { key: "view", label: "View Categories" },
      { key: "create", label: "Add Category" },
      { key: "edit", label: "Edit Name" },
      { key: "delete", label: "Delete Category" },
    ],
  },
  {
    id: "applications",
    name: "Candidate Applications",
    path: "/admin/applications",
    category: "Candidate Pipeline",
    description: "Review applicant resumes, screening answers, and advance candidates.",
    icon: FileText,
    defaultAccess: {
      SUPERADMIN: true,
      ADMIN: true,
      HR_ADMIN: true,
      CONTENT_MANAGER: false,
      INTERVIEWER: true,
      SUB_ADMIN: true,
    },
    supportedActions: [
      { key: "view", label: "View Applications" },
      { key: "evaluate", label: "Evaluate Answers" },
      { key: "update_status", label: "Change Status" },
      { key: "download_resume", label: "Download Resumes" },
    ],
  },
  {
    id: "users",
    name: "Users",
    path: "/admin/users",
    category: "User Directory",
    description: "Manage registered candidate accounts, verified credentials, and statuses.",
    icon: Users,
    defaultAccess: {
      SUPERADMIN: true,
      ADMIN: true,
      HR_ADMIN: true,
      CONTENT_MANAGER: false,
      INTERVIEWER: false,
      SUB_ADMIN: false,
    },
    supportedActions: [
      { key: "view", label: "View Users" },
      { key: "verify", label: "Verify Status" },
      { key: "block_unblock", label: "Block / Unblock" },
      { key: "export_data", label: "Export Profiles" },
    ],
  },
  {
    id: "interview-slots",
    name: "Interview Slots",
    path: "/admin/interview-slots",
    category: "Interviews & Scheduling",
    description: "Configure interview calendar dates, Meet links, and slot bookings.",
    icon: Calendar,
    defaultAccess: {
      SUPERADMIN: true,
      ADMIN: true,
      HR_ADMIN: true,
      CONTENT_MANAGER: false,
      INTERVIEWER: true,
      SUB_ADMIN: true,
    },
    supportedActions: [
      { key: "view", label: "View Calendar" },
      { key: "add_slots", label: "Add Available Dates" },
      { key: "edit_rounds", label: "Configure Rounds" },
      { key: "cancel_reschedule", label: "Reschedule / Cancel" },
    ],
  },
  {
    id: "projects",
    name: "Projects",
    path: "/admin/projects",
    category: "Content & Editorial",
    description: "Create, showcase, and edit enterprise case studies and tech stacks.",
    icon: FolderKanban,
    defaultAccess: {
      SUPERADMIN: true,
      ADMIN: true,
      HR_ADMIN: false,
      CONTENT_MANAGER: true,
      INTERVIEWER: false,
      SUB_ADMIN: false,
    },
    supportedActions: [
      { key: "view", label: "View Projects" },
      { key: "create", label: "Add Project" },
      { key: "edit", label: "Edit Case Study" },
      { key: "delete", label: "Remove Project" },
    ],
  },
  {
    id: "teams",
    name: "Team Members",
    path: "/admin/teams",
    category: "Organization",
    description: "Manage leadership profiles, core engineering staff, avatars, and bios.",
    icon: UsersRound,
    defaultAccess: {
      SUPERADMIN: true,
      ADMIN: true,
      HR_ADMIN: true,
      CONTENT_MANAGER: true,
      INTERVIEWER: false,
      SUB_ADMIN: false,
    },
    supportedActions: [
      { key: "view", label: "View Team" },
      { key: "create", label: "Add Member" },
      { key: "edit", label: "Edit Bio & Photo" },
      { key: "delete", label: "Remove Member" },
    ],
  },
  {
    id: "blogs",
    name: "Blogs & Articles",
    path: "/admin/blogs",
    category: "Content & Editorial",
    description: "Draft, edit with Word Document Sheet editor, and publish articles.",
    icon: BlogsIcon,
    defaultAccess: {
      SUPERADMIN: true,
      ADMIN: true,
      HR_ADMIN: false,
      CONTENT_MANAGER: true,
      INTERVIEWER: false,
      SUB_ADMIN: false,
    },
    supportedActions: [
      { key: "view", label: "View Articles" },
      { key: "create", label: "New Blog Post" },
      { key: "edit", label: "Edit Sheet" },
      { key: "delete", label: "Delete Post" },
    ],
  },
  {
    id: "subscribers",
    name: "Email Subscribers",
    path: "/admin/subscribers",
    category: "Communication & Marketing",
    description: "Manage newsletter and job alert subscribers and automated notifications.",
    icon: Mail,
    defaultAccess: {
      SUPERADMIN: true,
      ADMIN: true,
      HR_ADMIN: true,
      CONTENT_MANAGER: true,
      INTERVIEWER: false,
      SUB_ADMIN: false,
    },
    supportedActions: [
      { key: "view", label: "View Subscribers" },
      { key: "create", label: "Test Dispatch" },
      { key: "edit", label: "Toggle Status" },
      { key: "delete", label: "Remove Subscriber" },
    ],
  },
];

export interface RoleConfig {
  id: string;
  name: string;
  badgeColor: string;
  description: string;
  isImmutable?: boolean;
}

export const ADMIN_ROLES: RoleConfig[] = [
  {
    id: "SUPERADMIN",
    name: "Super Admin",
    badgeColor: "bg-[#5D2381] text-white",
    description: "Master administrative access with unrevocable privileges across all pages.",
    isImmutable: true,
  },
  {
    id: "ADMIN",
    name: "Admin",
    badgeColor: "bg-indigo-100 text-indigo-800",
    description: "Standard Admin portal account with customizable module permissions.",
  },
  {
    id: "HR_ADMIN",
    name: "HR Admin",
    badgeColor: "bg-blue-100 text-blue-800",
    description: "Manages hiring pipeline: Jobs, Categories, Applications, and Interviews.",
  },
  {
    id: "CONTENT_MANAGER",
    name: "Content Manager",
    badgeColor: "bg-purple-100 text-[#5D2381]",
    description: "Responsible for Blogs, Portfolio case studies, and Team profiles.",
  },
  {
    id: "INTERVIEWER",
    name: "Technical Interviewer",
    badgeColor: "bg-amber-100 text-amber-800",
    description: "Evaluates candidate applications and manages interview slots.",
  },
  {
    id: "SUB_ADMIN",
    name: "Sub Admin",
    badgeColor: "bg-emerald-100 text-emerald-800",
    description: "Custom sub-admin with selected module access.",
  },
];

export type RolePermissionState = Record<
  string, // roleId
  Record<
    string, // pageId
    {
      enabled: boolean;
      actions: Record<string, boolean>;
    }
  >
>;

// Helper to generate initial user permissions map
function getDefaultModulePermissions(roleId: string = "ADMIN"): Record<string, boolean> {
  const map: Record<string, boolean> = {};
  ADMIN_PAGES_LIST.forEach((page) => {
    if (roleId === "SUPERADMIN") {
      map[page.id] = true;
    } else if (roleId === "ADMIN") {
      map[page.id] = true;
    } else {
      map[page.id] = Boolean(page.defaultAccess[roleId as keyof typeof page.defaultAccess]);
    }
  });
  return map;
}

// ============================================================================
// 2. MAIN PERMISSIONS PAGE COMPONENT
// ============================================================================

export default function PermissionsPage() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Validate logged in user - strictly genuine Super Admin
  const isCurrentSuperAdmin = useMemo(() => {
    try {
      const stored = localStorage.getItem("netopsys_admin_user");
      if (stored) {
        const u = JSON.parse(stored);
        const role = String(u.role || "").toUpperCase();
        const email = String(u.email || "").toLowerCase();
        if (email === "admin@netopsys.in" || role === "ADMIN") return false;
        return role === "SUPERADMIN" || role === "SUPER_ADMIN";
      }
    } catch {}
    return false;
  }, []);

  // Strict route protection: Non-superadmin is immediately redirected back to dashboard
  useEffect(() => {
    if (!isCurrentSuperAdmin) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [isCurrentSuperAdmin, navigate]);

  // Admin users state
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const searchQuery = "";
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Dedicated user-specific permissions (email -> permissions matrix)
  const [permissionsByUser, setPermissionsByUser] = useState<Record<string, Record<string, { enabled: boolean; actions: Record<string, boolean> }>>>(() => {
    try {
      const saved = localStorage.getItem("netopsys_admin_permissions_by_user");
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  });

  // Modal 1: Add Administrator State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [newUserRole, setNewUserRole] = useState("ADMIN");
  const [newUserModuleCheckboxes, setNewUserModuleCheckboxes] = useState<Record<string, boolean>>(() => getDefaultModulePermissions("ADMIN"));
  const [isSubmittingNewUser, setIsSubmittingNewUser] = useState(false);
  const [addUserError, setAddUserError] = useState("");

  // Modal 2: Edit Administrator & Permissions State
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editUserName, setEditUserName] = useState("");
  const [editUserEmail, setEditUserEmail] = useState("");
  const [editUserRole, setEditUserRole] = useState("ADMIN");
  const [editUserPassword, setEditUserPassword] = useState("");
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [editUserModuleCheckboxes, setEditUserModuleCheckboxes] = useState<Record<string, boolean>>({});
  const [isSavingPermissions, setIsSavingPermissions] = useState(false);
  const [editUserError, setEditUserError] = useState("");

  // Modal 3: Delete Confirmation State
  const [userToDelete, setUserToDelete] = useState<any | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch admin users strictly from separate `admins` table
  const fetchAdminUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const res = await fetch("/api/admin/permissions/users");
      if (!res.ok) {
        console.warn(`Admin users fetch returned HTTP ${res.status}`);
        return;
      }
      const data = await res.json();
      if (data && data.success && Array.isArray(data.users)) {
        setAdminUsers(data.users);
      }
    } catch (err) {
      console.warn("Failed to fetch admin users from database:", err);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchAdminUsers();
  }, []);

  // Filtered users for search - strictly exclude Super Admin from created admin accounts table
  const filteredUsers = useMemo(() => {
    const nonSuperUsers = adminUsers.filter((u) => {
      const r = String(u.role || "").toUpperCase();
      return r !== "SUPERADMIN" && r !== "SUPER_ADMIN";
    });
    if (!searchQuery.trim()) return nonSuperUsers;
    const q = searchQuery.toLowerCase();
    return nonSuperUsers.filter(
      (u) =>
        u.email?.toLowerCase().includes(q) ||
        u.name?.toLowerCase().includes(q) ||
        u.role?.toLowerCase().includes(q)
    );
  }, [adminUsers, searchQuery]);

  // Open Add Admin Modal
  const handleOpenAddAdmin = () => {
    setNewUserName("");
    setNewUserEmail("");
    setNewUserPassword("");
    setShowPassword(false);
    setNewUserRole("ADMIN");
    setNewUserModuleCheckboxes(getDefaultModulePermissions("ADMIN"));
    setAddUserError("");
    setIsAddModalOpen(true);
  };

  // Open Edit Admin & Dynamic Permissions Modal
  const handleOpenEditAdmin = (user: any) => {
    setEditingUser(user);
    setEditUserName(user.name || "");
    setEditUserEmail(user.email || "");
    setEditUserRole(user.role || "ADMIN");
    setEditUserPassword(""); // Cleanly reset password field (leave blank to keep current)
    setShowEditPassword(false);
    setEditUserError("");

    const email = String(user.email || "").toLowerCase().trim();
    const existing = permissionsByUser[email];

    const map: Record<string, boolean> = {};
    ADMIN_PAGES_LIST.forEach((page) => {
      if (existing && existing[page.id] !== undefined) {
        map[page.id] = Boolean(existing[page.id]?.enabled);
      } else {
        // Fallback to role default
        map[page.id] =
          user.role === "SUPERADMIN"
            ? true
            : Boolean(page.defaultAccess[user.role as keyof typeof page.defaultAccess] ?? true);
      }
    });
    setEditUserModuleCheckboxes(map);
  };

  // Toggle module in Add User form
  const toggleNewUserModule = (pageId: string) => {
    setNewUserModuleCheckboxes((prev) => ({
      ...prev,
      [pageId]: !prev[pageId],
    }));
  };

  // Set all modules in Add User form
  const setAllNewUserModules = (enabled: boolean) => {
    const next: Record<string, boolean> = {};
    ADMIN_PAGES_LIST.forEach((page) => {
      next[page.id] = enabled;
    });
    setNewUserModuleCheckboxes(next);
  };

  // Toggle module in Edit User form
  const toggleEditUserModule = (pageId: string) => {
    setEditUserModuleCheckboxes((prev) => ({
      ...prev,
      [pageId]: !prev[pageId],
    }));
  };

  // Set all modules in Edit User form
  const setAllEditUserModules = (enabled: boolean) => {
    const next: Record<string, boolean> = {};
    ADMIN_PAGES_LIST.forEach((page) => {
      next[page.id] = enabled;
    });
    setEditUserModuleCheckboxes(next);
  };

  // Submit Add Admin
  const handleSaveNewAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail.trim() || !newUserPassword.trim()) {
      setAddUserError("Email and Password are required.");
      return;
    }

    setIsSubmittingNewUser(true);
    setAddUserError("");

    // Build permissions structure
    const builtPermissions: Record<string, { enabled: boolean; actions: Record<string, boolean> }> = {};
    ADMIN_PAGES_LIST.forEach((page) => {
      const isEnabled = Boolean(newUserModuleCheckboxes[page.id]);
      const actionsObj: Record<string, boolean> = {};
      page.supportedActions.forEach((act) => {
        actionsObj[act.key] = isEnabled;
      });
      builtPermissions[page.id] = {
        enabled: isEnabled,
        actions: actionsObj,
      };
    });

    try {
      const res = await fetch("/api/admin/permissions/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newUserEmail.trim(),
          password: newUserPassword,
          role: newUserRole,
          name: newUserName.trim() || undefined,
          permissions: builtPermissions,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to create administrator account.");
      }

      const cleanEmail = newUserEmail.trim().toLowerCase();
      const pwd = newUserPassword.trim();
      const updatedPerms = { ...permissionsByUser, [cleanEmail]: builtPermissions };
      setPermissionsByUser(updatedPerms);
      try {
        localStorage.setItem("netopsys_admin_permissions_by_user", JSON.stringify(updatedPerms));
        const localCache = JSON.parse(localStorage.getItem("netopsys_admin_passwords") || "{}");
        localCache[cleanEmail] = pwd;
        localStorage.setItem("netopsys_admin_passwords", JSON.stringify(localCache));
        window.dispatchEvent(new Event("admin-permissions-change"));
      } catch {}

      // Immediately add to admin users state so the UI updates instantaneously
      setAdminUsers((prev) => [
        {
          id: data.user?.id || Date.now(),
          name: newUserName.trim() || "Admin User",
          email: cleanEmail,
          role: newUserRole,
          password: pwd,
          createdAt: new Date().toISOString(),
          isActive: true,
        },
        ...prev.filter((u) => u.email.toLowerCase() !== cleanEmail),
      ]);

      showToast(`Administrator account "${cleanEmail}" created successfully!`);
      toast.success(`Administrator account "${cleanEmail}" created successfully!`, {
        title: "Account Created",
      });
      setIsAddModalOpen(false);
      fetchAdminUsers();
    } catch (err: any) {
      const msg = err.message || "An unexpected error occurred.";
      setAddUserError(msg);
      toast.error(msg, { title: "Error Creating Account" });
    } finally {
      setIsSubmittingNewUser(false);
    }
  };

  // Save Edited Administrator Details & Permissions
  const handleSaveEditUser = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editingUser) return;
    setIsSavingPermissions(true);
    setEditUserError("");

    const email = String(editingUser.email || "").toLowerCase().trim();
    const pwd = editUserPassword.trim();

    // Build permissions structure
    const builtPermissions: Record<string, { enabled: boolean; actions: Record<string, boolean> }> = {};
    ADMIN_PAGES_LIST.forEach((page) => {
      const isEnabled = Boolean(editUserModuleCheckboxes[page.id]);
      const actionsObj: Record<string, boolean> = {};
      page.supportedActions.forEach((act) => {
        actionsObj[act.key] = isEnabled;
      });
      builtPermissions[page.id] = {
        enabled: isEnabled,
        actions: actionsObj,
      };
    });

    // 1. Instant local persistence
    const updatedUsers = { ...permissionsByUser, [email]: builtPermissions };
    setPermissionsByUser(updatedUsers);
    try {
      localStorage.setItem("netopsys_admin_permissions_by_user", JSON.stringify(updatedUsers));
      if (pwd) {
        const localCache = JSON.parse(localStorage.getItem("netopsys_admin_passwords") || "{}");
        localCache[email] = pwd;
        localStorage.setItem("netopsys_admin_passwords", JSON.stringify(localCache));
      }
      window.dispatchEvent(new Event("admin-permissions-change"));
    } catch {}

    // 2. Immediately update in memory adminUsers state
    setAdminUsers((prev) =>
      prev.map((u) => {
        if (u.email.toLowerCase() === email) {
          return {
            ...u,
            name: editUserName.trim() || u.name,
            role: editUserRole,
            password: pwd || u.password,
          };
        }
        return u;
      })
    );

    // 3. Persist to Backend API
    try {
      // First update administrator details & credentials
      await fetch(`/api/admin/permissions/users/${editingUser.id || ""}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingUser.id,
          email: editingUser.email,
          name: editUserName.trim() || undefined,
          role: editUserRole,
          password: pwd || undefined,
          permissions: builtPermissions,
        }),
      });

      // Also persist to permissions endpoint
      await fetch("/api/admin/permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          permissions: builtPermissions,
        }),
      }).catch(() => {});

      showToast(`Administrator "${editingUser.email}" updated successfully!`);
      toast.success(`Administrator "${editingUser.email}" updated successfully!`, {
        title: "Permissions Saved",
      });
      setEditingUser(null);
      fetchAdminUsers();
    } catch (err: any) {
      console.warn("Backend permissions sync fallback:", err);
      showToast(`Permissions for "${editingUser.email}" updated locally.`);
      toast.info(`Permissions for "${editingUser.email}" saved locally.`, {
        title: "Updated Locally",
      });
      setEditingUser(null);
      fetchAdminUsers();
    } finally {
      setIsSavingPermissions(false);
    }
  };

  // Delete User
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeletingUser(true);
    const delEmail = String(userToDelete.email || "").toLowerCase().trim();
    try {
      const res = await fetch(`/api/admin/permissions/users/${userToDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete user.");
      }
      try {
        const localCache = JSON.parse(localStorage.getItem("netopsys_admin_passwords") || "{}");
        delete localCache[delEmail];
        localStorage.setItem("netopsys_admin_passwords", JSON.stringify(localCache));
      } catch {}
      setAdminUsers((prev) => prev.filter((u) => u.email.toLowerCase() !== delEmail));
      showToast(`User "${userToDelete.email}" deleted successfully.`);
      toast.success(`User "${userToDelete.email}" deleted successfully.`, { title: "User Deleted" });
      setUserToDelete(null);
      fetchAdminUsers();
    } catch (err: any) {
      const msg = err.message || "Failed to delete user";
      showToast(msg, "error");
      toast.error(msg, { title: "Delete Failed" });
    } finally {
      setIsDeletingUser(false);
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (String(role).toUpperCase()) {
      case "SUPERADMIN":
        return "bg-purple-100 text-[#5D2381] border border-purple-200";
      case "ADMIN":
        return "bg-indigo-50 text-indigo-700 border border-indigo-200";
      case "HR_ADMIN":
        return "bg-blue-50 text-blue-700 border border-blue-200";
      case "CONTENT_MANAGER":
        return "bg-amber-50 text-amber-700 border border-amber-200";
      case "INTERVIEWER":
        return "bg-teal-50 text-teal-700 border border-teal-200";
      default:
        return "bg-gray-100 text-gray-700 border border-gray-200";
    }
  };

  // Access Control Guard
  if (!isCurrentSuperAdmin) {
    return (
      <div className="flex h-screen w-full bg-[#FAF6FC] text-[#141010] font-sans overflow-hidden antialiased">
        <AdminSidebar activeTab="Permissions" isMobileOpen={isMobileMenuOpen} onCloseMobile={() => setIsMobileMenuOpen(false)} />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 border border-rose-200 shadow-sm">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#141010] mb-2">Super Admin Access Required</h2>
          <p className="text-xs sm:text-sm text-gray-500 max-w-md mb-6">
            The Permissions & Access Control Matrix is exclusively accessible by Super Admin credentials.
          </p>
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="px-5 py-2.5 rounded-xl bg-[#5D2381] hover:bg-[#4E1C6E] hover-brand-gradient text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-sm"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#FAF6FC] text-[#141010] font-sans overflow-hidden antialiased selection:bg-[#5D2381] selection:text-white">
      {/* Admin Sidebar Navigation */}
      <AdminSidebar
        activeTab="Permissions"
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Scrollable Main Content Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Mobile hamburger toggle (visible only on mobile/tablet) */}
          <div className="lg:hidden flex items-center justify-between pb-1">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 cursor-pointer bg-white border border-[#ECE4F2] shadow-2xs"
              aria-label="Open Navigation Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
          {/* Toast Notification */}
          {toastMessage && (
            <div
              className={`p-4 rounded-2xl flex items-center justify-between gap-3 shadow-xs animate-in fade-in duration-200 border ${
                toastMessage.type === "success"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-red-50 border-red-200 text-red-800"
              }`}
            >
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium">
                {toastMessage.type === "success" ? (
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4.5 h-4.5 text-red-600 shrink-0" />
                )}
                <span>{toastMessage.text}</span>
              </div>
              <button onClick={() => setToastMessage(null)} className="p-1 rounded-lg hover:bg-black/5 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}


          {/* Created Admin Users Table Card */}
          <div className="bg-white rounded-3xl border border-[#ECE4F2] shadow-xs overflow-hidden">
            {/* Table Controls Header */}
            <div className="p-5 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#141010] flex items-center gap-2">
                  <span>Created Admin Accounts</span>
                  <span className="text-xs font-normal text-gray-500">
                    ({filteredUsers.length} total)
                  </span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Admins and sub-admins created with custom or standard role permissions
                </p>
              </div>

              <div className="flex items-center gap-3">

                {/* Add User Button */}
                <button
                  type="button"
                  onClick={handleOpenAddAdmin}
                  className="hover-brand-gradient bg-[#5D2381] text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-xs transition-all shrink-0 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4 stroke-[2.2]" />
                  <span>Add Admin</span>
                </button>
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto table-responsive-container">
              <table className="w-full text-left border-collapse min-w-[640px]">
                <thead>
                  <tr className="bg-gray-50/75 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    <th className="py-3.5 px-6">Administrator</th>
                    <th className="py-3.5 px-6">Role</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6">Created On</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs text-[#141010]">
                  {isLoadingUsers ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-gray-400">
                        <div className="w-6 h-6 border-2 border-[#5D2381]/30 border-t-[#5D2381] rounded-full animate-spin mx-auto mb-2" />
                        <span>Loading admin users...</span>
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-gray-400">
                        <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <span className="font-semibold text-gray-600 block mb-1">No admin accounts found</span>
                        <span className="text-xs text-gray-400">Click &quot;+ Add User&quot; above to create a new administrator account.</span>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => {
                      const isSuper =
                        String(user.role).toUpperCase() === "SUPERADMIN" ||
                        String(user.role).toUpperCase() === "SUPER_ADMIN";
                      const initials = (user.name?.[0] || user.email?.[0] || "A").toUpperCase();

                      return (
                        <tr key={user.id || user.email} className="hover:bg-[#FAF6FC]/60 transition-colors">
                          {/* Avatar & User Details */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs ${
                                  isSuper ? "bg-[#5D2381] text-white" : "bg-[#F1E4F8] text-[#5D2381]"
                                }`}
                              >
                                {initials}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-[#141010] flex items-center gap-1.5 truncate">
                                  <span>{user.name || "Administrator"}</span>
                                  {isSuper && (
                                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-100 text-[#5D2381]">
                                      Master
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11.5px] text-gray-500 font-mono truncate">{user.email}</div>
                              </div>
                            </div>
                          </td>

                          {/* Role Badge */}
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${getRoleBadgeClass(user.role)}`}>
                              {user.role}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-4 px-6">
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span>Active</span>
                            </span>
                          </td>

                          {/* Created Date */}
                          <td className="py-4 px-6 text-gray-500 text-[11px]">
                            {user.createdAt
                              ? new Date(user.createdAt).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })
                              : "Recently"}
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-6 text-right">
                            <div className="inline-flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleOpenEditAdmin(user)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF2FD] hover:bg-[#F1E4F8] text-[#5D2381] text-xs font-semibold cursor-pointer border border-[#5D2381]/20 transition-all shadow-2xs hover:shadow"
                                title={`Edit administrator & permissions for ${user.email}`}
                              >
                                <Pencil className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </button>

                              {!isSuper && (
                                <button
                                  type="button"
                                  onClick={() => setUserToDelete(user)}
                                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 cursor-pointer transition-colors"
                                  title={`Delete ${user.email}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* =========================================================================
          MODAL 1: ADD ADMINISTRATOR (Clean Checkbox UI + Cancel and Save buttons at bottom)
      ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-[#ECE4F2] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] relative animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-[#ECE4F2] flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#F6EEFA] flex items-center justify-center text-[#5D2381] shrink-0">
                  <UserPlus className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#141010]">Add Administrator</h3>
                  <p className="text-xs text-[#716A7E]">Create login credentials and select portal permissions</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4 stroke-[2.2]" />
              </button>
            </div>

            {/* Modal Scrollable Form Body */}
            <form onSubmit={handleSaveNewAdmin} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              {/* Error Alert */}
              {addUserError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{addUserError}</span>
                </div>
              )}

              {/* Section 1: User Credentials */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#7D7589]">Account Credentials</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-semibold text-[#4A4458] mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        placeholder="e.g. Priya Sharma"
                        className="w-full bg-[#FAF8FC] border border-[#E2DBEA] focus:border-[#5D2381] rounded-xl pl-9 pr-3.5 py-2.5 text-xs sm:text-sm text-[#141010] outline-none"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-[#4A4458] mb-1.5">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        placeholder="e.g. priya@netopsys.in"
                        className="w-full bg-[#FAF8FC] border border-[#E2DBEA] focus:border-[#5D2381] rounded-xl pl-9 pr-3.5 py-2.5 text-xs sm:text-sm text-[#141010] outline-none"
                      />
                    </div>
                  </div>

                  {/* Password with view toggle (No auto-generate option) */}
                  <div>
                    <label className="block text-xs font-semibold text-[#4A4458] mb-1.5">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={newUserPassword}
                        onChange={(e) => setNewUserPassword(e.target.value)}
                        placeholder="Enter password"
                        className="w-full bg-[#FAF8FC] border border-[#E2DBEA] focus:border-[#5D2381] rounded-xl pl-9 pr-11 py-2.5 text-xs sm:text-sm text-[#141010] outline-none"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setShowPassword((prev) => !prev);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#5D2381] p-1.5 rounded-lg transition-colors cursor-pointer z-10"
                        title={showPassword ? "Hide password" : "Show password"}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="w-4.5 h-4.5 text-[#5D2381]" /> : <Eye className="w-4.5 h-4.5 text-gray-500" />}
                      </button>
                    </div>
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-xs font-semibold text-[#4A4458] mb-1.5">
                      Administrative Role
                    </label>
                    <select
                      value={newUserRole}
                      onChange={(e) => {
                        const role = e.target.value;
                        setNewUserRole(role);
                        setNewUserModuleCheckboxes(getDefaultModulePermissions(role));
                      }}
                      className="w-full bg-[#FAF8FC] border border-[#E2DBEA] focus:border-[#5D2381] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#141010] outline-none cursor-pointer"
                    >
                      <option value="ADMIN">Admin (Standard Administrator)</option>
                      <option value="HR_ADMIN">HR Admin (Hiring & Recruitment)</option>
                      <option value="CONTENT_MANAGER">Content Manager (Editorial & Blogs)</option>
                      <option value="INTERVIEWER">Technical Interviewer</option>
                      <option value="SUB_ADMIN">Sub Admin (Custom Modules)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Module Permissions Checkbox Type UI */}
              <div className="space-y-3 pt-4 border-t border-[#ECE4F2]">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#7D7589]">Module Permissions</h4>
                    <p className="text-[11.5px] text-[#716A7E]">Check the modules this administrator can access</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setAllNewUserModules(true)}
                      className="text-xs font-semibold text-[#5D2381] hover:underline cursor-pointer px-2 py-1 rounded-lg hover:bg-[#F6EEFA]"
                    >
                      Select All
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      type="button"
                      onClick={() => setAllNewUserModules(false)}
                      className="text-xs font-semibold text-gray-500 hover:text-gray-800 cursor-pointer px-2 py-1 rounded-lg hover:bg-gray-100"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>

                {/* Checkbox Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {ADMIN_PAGES_LIST.map((page) => {
                    const isChecked = Boolean(newUserModuleCheckboxes[page.id]);
                    const IconComp = page.icon;

                    return (
                      <div
                        key={page.id}
                        onClick={() => toggleNewUserModule(page.id)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 select-none ${
                          isChecked
                            ? "bg-[#FAF2FD] border-[#5D2381]/40 shadow-2xs"
                            : "bg-[#FAF8FC] border-[#E2DBEA] hover:border-[#C8B8D7]"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                              isChecked ? "bg-[#5D2381] text-white" : "bg-gray-200/70 text-gray-600"
                            }`}
                          >
                            <IconComp className="w-4.5 h-4.5" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-[#141010] truncate">{page.name}</div>
                            <div className="text-[10.5px] text-gray-500 truncate">{page.category}</div>
                          </div>
                        </div>

                        {/* Interactive Checkbox */}
                        <div
                          className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 border transition-all ${
                            isChecked
                              ? "bg-[#5D2381] border-[#5D2381] text-white shadow-2xs"
                              : "bg-white border-gray-300"
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Actions ("downg" / at the bottom) */}
              <div className="pt-4 border-t border-[#ECE4F2] flex items-center justify-end gap-3 sticky bottom-0 bg-white pb-1">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={isSubmittingNewUser}
                  className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-gray-600 hover:text-gray-800 rounded-xl hover:bg-gray-100 cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingNewUser}
                  className="hover-brand-gradient bg-[#5D2381] text-white px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-xs cursor-pointer inline-flex items-center gap-2 disabled:opacity-50 active:scale-95"
                >
                  {isSubmittingNewUser ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>{isSubmittingNewUser ? "Creating..." : "Save Admin"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: EDIT ADMINISTRATOR & PERMISSIONS (Clean Checkbox UI + Cancel and Save buttons at bottom)
      ========================================================================= */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-[#ECE4F2] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] relative animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-[#ECE4F2] flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#F6EEFA] flex items-center justify-center text-[#5D2381] shrink-0">
                  <Pencil className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#141010]">Edit Administrator & Permissions</h3>
                  <p className="text-xs text-[#716A7E]">Update credentials, role, and page permissions for {editingUser.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4 stroke-[2.2]" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <form onSubmit={handleSaveEditUser} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              {/* Error Alert */}
              {editUserError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{editUserError}</span>
                </div>
              )}

              {/* Section 1: User Credentials */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#7D7589]">Account Credentials</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-semibold text-[#4A4458] mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={editUserName}
                        onChange={(e) => setEditUserName(e.target.value)}
                        placeholder="Administrator Name"
                        className="w-full bg-[#FAF8FC] border border-[#E2DBEA] focus:border-[#5D2381] rounded-xl pl-9 pr-3.5 py-2.5 text-xs sm:text-sm text-[#141010] outline-none"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-[#4A4458] mb-1.5">
                      Email Address (Login)
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        disabled
                        value={editUserEmail}
                        className="w-full bg-[#F4F0F7] border border-[#E2DBEA] rounded-xl pl-9 pr-3.5 py-2.5 text-xs sm:text-sm text-[#7D7589] outline-none cursor-not-allowed font-mono"
                      />
                    </div>
                  </div>

                  {/* Reset Password Field (Optional on edit) */}
                  <div>
                    <label className="block text-xs font-semibold text-[#4A4458] mb-1.5">
                      Reset Password <span className="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <div className="relative flex items-center">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type={showEditPassword ? "text" : "password"}
                        value={editUserPassword}
                        onChange={(e) => setEditUserPassword(e.target.value)}
                        placeholder="Leave blank to keep current password"
                        autoComplete="new-password"
                        data-lpignore="true"
                        data-1p-ignore="true"
                        data-form-type="other"
                        spellCheck={false}
                        className="w-full bg-[#FAF8FC] border border-[#E2DBEA] focus:border-[#5D2381] rounded-xl pl-9 pr-11 py-2.5 text-xs sm:text-sm text-[#141010] placeholder:text-gray-400 outline-none"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setShowEditPassword((prev) => !prev);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#5D2381] p-1.5 rounded-lg transition-colors cursor-pointer z-10"
                        title={showEditPassword ? "Hide password" : "Show password"}
                        aria-label={showEditPassword ? "Hide password" : "Show password"}
                      >
                        {showEditPassword ? <EyeOff className="w-4.5 h-4.5 text-[#5D2381]" /> : <Eye className="w-4.5 h-4.5 text-gray-500" />}
                      </button>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">
                      Leave blank to keep existing password, or enter a new password to update.
                    </p>
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-xs font-semibold text-[#4A4458] mb-1.5">
                      Administrative Role
                    </label>
                    <select
                      value={editUserRole}
                      onChange={(e) => {
                        const role = e.target.value;
                        setEditUserRole(role);
                        setEditUserModuleCheckboxes(getDefaultModulePermissions(role));
                      }}
                      className="w-full bg-[#FAF8FC] border border-[#E2DBEA] focus:border-[#5D2381] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#141010] outline-none cursor-pointer"
                    >
                      <option value="ADMIN">Admin (Standard Administrator)</option>
                      <option value="HR_ADMIN">HR Admin (Hiring & Recruitment)</option>
                      <option value="CONTENT_MANAGER">Content Manager (Editorial & Blogs)</option>
                      <option value="INTERVIEWER">Technical Interviewer</option>
                      <option value="SUB_ADMIN">Sub Admin (Custom Modules)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Module Permissions Checkbox Grid */}
              <div className="space-y-3 pt-4 border-t border-[#ECE4F2]">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#7D7589]">Module Access</h4>
                    <p className="text-[11.5px] text-[#716A7E]">Select which sidebar pages this admin can view and manage</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setAllEditUserModules(true)}
                      className="text-xs font-semibold text-[#5D2381] hover:underline cursor-pointer px-2 py-1 rounded-lg hover:bg-[#F6EEFA]"
                    >
                      Select All
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      type="button"
                      onClick={() => setAllEditUserModules(false)}
                      className="text-xs font-semibold text-gray-500 hover:text-gray-800 cursor-pointer px-2 py-1 rounded-lg hover:bg-gray-100"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>

                {/* Checkbox Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {ADMIN_PAGES_LIST.map((page) => {
                    const isChecked = Boolean(editUserModuleCheckboxes[page.id]);
                    const IconComp = page.icon;

                    return (
                      <div
                        key={page.id}
                        onClick={() => toggleEditUserModule(page.id)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 select-none ${
                          isChecked
                            ? "bg-[#FAF2FD] border-[#5D2381]/40 shadow-2xs"
                            : "bg-[#FAF8FC] border-[#E2DBEA] hover:border-[#C8B8D7]"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                              isChecked ? "bg-[#5D2381] text-white" : "bg-gray-200/70 text-gray-600"
                            }`}
                          >
                            <IconComp className="w-4.5 h-4.5" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-[#141010] truncate">{page.name}</div>
                            <div className="text-[10.5px] text-gray-500 truncate">{page.category}</div>
                          </div>
                        </div>

                        {/* Interactive Checkbox */}
                        <div
                          className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 border transition-all ${
                            isChecked
                              ? "bg-[#5D2381] border-[#5D2381] text-white shadow-2xs"
                              : "bg-white border-gray-300"
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Actions ("downg" / at the bottom) */}
              <div className="pt-4 border-t border-[#ECE4F2] flex items-center justify-end gap-3 sticky bottom-0 bg-white pb-1">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  disabled={isSavingPermissions}
                  className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-gray-600 hover:text-gray-800 rounded-xl hover:bg-gray-100 cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingPermissions}
                  className="hover-brand-gradient bg-[#5D2381] text-white px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-xs cursor-pointer inline-flex items-center gap-2 disabled:opacity-50 active:scale-95"
                >
                  {isSavingPermissions ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>{isSavingPermissions ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: DELETE CONFIRMATION
      ========================================================================= */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-[#ECE4F2] shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 stroke-[2]" />
            </div>
            <h3 className="text-base font-bold text-[#141010] mb-1">Delete Administrator</h3>
            <p className="text-xs text-[#716A7E] mb-6">
              Are you sure you want to remove <strong className="text-[#141010]">{userToDelete.email}</strong>? Their portal access will be permanently revoked.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setUserToDelete(null)}
                disabled={isDeletingUser}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={isDeletingUser}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-700 shadow-sm cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50"
              >
                {isDeletingUser && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                <span>{isDeletingUser ? "Deleting..." : "Delete"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
