import { useEffect, useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  children: ReactNode;
  requireSuperAdmin?: boolean;
  moduleId?: string;
}

export default function ProtectedRoute({
  children,
  requireSuperAdmin = false,
  moduleId,
}: ProtectedRouteProps) {
  const location = useLocation();

  const [authState, setAuthState] = useState<{
    isAuthenticated: boolean;
    isSuperAdmin: boolean;
    userEmail: string;
    userRole: string;
  }>(() => {
    try {
      const token = localStorage.getItem("netopsys_admin_token");
      const userStr = localStorage.getItem("netopsys_admin_user");
      if (!token || !userStr) {
        return { isAuthenticated: false, isSuperAdmin: false, userEmail: "", userRole: "" };
      }
      const user = JSON.parse(userStr);
      const role = String(user.role || "").toUpperCase();
      const email = String(user.email || "").toLowerCase();
      const isSuper =
        role === "SUPERADMIN" ||
        role === "SUPER_ADMIN";

      return {
        isAuthenticated: true,
        isSuperAdmin: isSuper,
        userEmail: email,
        userRole: role,
      };
    } catch {
      return { isAuthenticated: false, isSuperAdmin: false, userEmail: "", userRole: "" };
    }
  });

  // Re-verify auth when storage changes or navigation happens
  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem("netopsys_admin_token");
        const userStr = localStorage.getItem("netopsys_admin_user");
        if (!token || !userStr) {
          setAuthState({ isAuthenticated: false, isSuperAdmin: false, userEmail: "", userRole: "" });
          return;
        }
        const user = JSON.parse(userStr);
        const role = String(user.role || "").toUpperCase();
        const email = String(user.email || "").toLowerCase();
        const isSuper =
          role === "SUPERADMIN" ||
          role === "SUPER_ADMIN";

        setAuthState({
          isAuthenticated: true,
          isSuperAdmin: isSuper,
          userEmail: email,
          userRole: role,
        });
      } catch {
        setAuthState({ isAuthenticated: false, isSuperAdmin: false, userEmail: "", userRole: "" });
      }
    };

    checkAuth();
    window.addEventListener("admin-auth-change", checkAuth);
    return () => window.removeEventListener("admin-auth-change", checkAuth);
  }, [location.pathname]);

  // 1. Not Authenticated: Immediately redirect to corresponding Login page
  if (!authState.isAuthenticated) {
    const isSuperPath = location.pathname.startsWith("/superadmin");
    const targetLogin = isSuperPath ? "/superadmin/login" : "/admin/login";
    try {
      sessionStorage.setItem("netopsys_redirect_after_login", location.pathname);
    } catch {
      // ignore sessionStorage restrictions
    }
    return <Navigate to={targetLogin} state={{ from: location }} replace />;
  }

  // 2. Route strictly requires Super Admin, but user is standard Admin
  if (requireSuperAdmin && !authState.isSuperAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // 3. Module-level permission check for standard admins
  if (moduleId && !authState.isSuperAdmin) {
    let isModuleDisabled = false;
    try {
      const permsByUser = JSON.parse(localStorage.getItem("netopsys_admin_permissions_by_user") || "{}");
      const userPerms = permsByUser[authState.userEmail];
      if (userPerms && userPerms[moduleId] && userPerms[moduleId].enabled === false) {
        isModuleDisabled = true;
      }
    } catch {
      isModuleDisabled = false;
    }
    if (isModuleDisabled) {
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  return <>{children}</>;
}

