import { useState, useEffect, type FormEvent } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import netopsysLogo from "../assets/netopsys-ai-logo.png";
import { toast } from "../componenets/toast.tsx";
import { preloadRecaptcha, executeRecaptcha } from "../utils/recaptcha.ts";

export default function SuperAdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Determine if URL is specifically /superadmin or /admin
  const isSuperRoute = location.pathname.includes("superadmin");

  useEffect(() => {
    preloadRecaptcha();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    // Client-side validation
    if (!email.trim()) {
      setErrorMessage("Please enter your admin email address.");
      return;
    }
    if (!password) {
      setErrorMessage("Please enter your password.");
      return;
    }

    setIsLoading(true);

    try {
      const captchaToken = await executeRecaptcha("superadmin_login_submit").catch((err) => {
        console.warn("reCAPTCHA execution note:", err);
        return "";
      });

      const response = await fetch("/api/auth/superadmin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
          captchaToken,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Authentication failed. Please verify your email and password."
        );
      }

      // Success
      setSuccessMessage(data.message || "Access verified! Redirecting to Dashboard...");
      toast.success(data.message || "Signed in successfully! Redirecting to Dashboard...", {
        title: "Authenticated",
      });

      // Save token and user details to localStorage
      if (data.token) {
        localStorage.setItem("netopsys_admin_token", data.token);
      }
      if (data.user) {
        localStorage.setItem("netopsys_admin_user", JSON.stringify(data.user));
      }

      // Notify other components (sidebar, navbar)
      window.dispatchEvent(new Event("admin-auth-change"));

      // Smooth redirect based on role or route
      const userRole = String(data.user?.role || "").toUpperCase();
      const isSuper =
        isSuperRoute ||
        userRole === "SUPERADMIN" ||
        userRole === "SUPER_ADMIN";

      const redirectPath = sessionStorage.getItem("netopsys_redirect_after_login");
      sessionStorage.removeItem("netopsys_redirect_after_login");

      setTimeout(() => {
        if (redirectPath && redirectPath.startsWith("/superadmin") && isSuper) {
          navigate(redirectPath);
        } else if (redirectPath && redirectPath.startsWith("/admin") && !redirectPath.includes("login")) {
          navigate(redirectPath);
        } else if (isSuper) {
          navigate("/superadmin/dashboard");
        } else {
          navigate("/admin/dashboard");
        }
      }, 700);
    } catch (err: unknown) {
      const error = err as Error;
      const msg =
        error.message || "Unable to reach server. Please ensure the backend is running on port 5000.";
      setErrorMessage(msg);
      toast.error(msg, { title: "Authentication Failed" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F6EFF9] text-[#141010] font-['Onest',sans-serif] flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 antialiased selection:bg-[#5E2282] selection:text-white relative">
      
      {/* Main 2-Panel Card matching screenshot */}
      <div className="w-full max-w-[840px] bg-white rounded-[28px] sm:rounded-[32px] border border-[#E2D4EC] shadow-[0_20px_50px_-15px_rgba(93,35,129,0.1)] overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[440px] sm:min-h-[480px]">
        {/* Left Column: Soft Purple #EFE3F8 */}
        <div className="md:col-span-5 bg-[#EFE3F8] p-8 sm:p-12 lg:p-14 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#E6D9EE]">
          {/* Top Purple Pill Bar */}
          <div className="w-10 h-2.5 rounded-full bg-[#BE95D4] select-none" />

          {/* Title: Sign In to Portal */}
          <div className="my-auto py-6 sm:py-8">
            <Link to="/" className="inline-block mb-6 cursor-pointer" title="Netopsys Homepage">
              <img
                src={netopsysLogo}
                alt="Netopsys AI"
                className="h-12 sm:h-14 md:h-16 w-auto max-w-[240px] object-contain select-none hover:opacity-90 transition-opacity"
              />
            </Link>
            <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-bold text-[#141010] leading-[1.15] tracking-tight">
              Sign In to <br />
              <span className="text-[#5E2282]">Portal</span>
            </h1>
          </div>

          {/* Bottom space balance */}
          <div className="hidden md:block" />
        </div>

        {/* Right Column: Crisp White with Form */}
        <div className="md:col-span-7 bg-white p-8 sm:p-12 lg:p-14 flex flex-col justify-center">

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed font-medium">{errorMessage}</div>
            </div>
          )}

          {/* Success Message Alert */}
          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="flex-1 font-semibold">{successMessage}</div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4 sm:space-y-5">
            {/* Admin Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs sm:text-[13px] font-bold text-[#141010] mb-2 select-none"
              >
                Admin Email<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8E869B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  autoComplete="off"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email"
                  className="w-full bg-[#FAF8FC] border border-[#E5DBEC] hover:border-[#CBBBDC] focus:border-[#5E2282] focus:bg-white rounded-xl pl-10 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm text-[#141010] placeholder:text-[#A19AA8] outline-none shadow-2xs transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs sm:text-[13px] font-bold text-[#141010] mb-2 select-none"
              >
                Password<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8E869B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Password"
                  className="w-full bg-[#FAF8FC] border border-[#E5DBEC] hover:border-[#CBBBDC] focus:border-[#5E2282] focus:bg-white rounded-xl pl-10 pr-10 py-2.5 sm:py-3 text-xs sm:text-sm text-[#141010] placeholder:text-[#A19AA8] outline-none shadow-2xs transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8E869B] hover:text-[#5E2282] transition-colors cursor-pointer p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 hover-brand-gradient bg-[#5B1E78] hover:bg-[#4D1865] text-white py-3 sm:py-3.5 px-6 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
