import { useState, useEffect, useRef, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Lock,
  Eye,
  EyeOff,
  X,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Mail,
  RotateCcw,
} from "lucide-react";
import { toast } from "../componenets/toast.tsx";
import { preloadRecaptcha, executeRecaptcha } from "../utils/recaptcha.ts";

export interface CareerUser {
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

export interface LoginModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onLoginSuccess?: (user: CareerUser) => void;
  initialMode?: "signin" | "create";
}

interface LeftIllustrationProps {
  eyeMode?: "normal" | "peek" | "closed";
}

/**
 * High-fidelity Left Illustration matching user reference image:
 * - 3 Overlapping circles logo at top-left (Amber #FBAE42, Pink #D13B89, Purple #5E2282)
 * - 4 Geometric character figures (Yellow dome, Tall purple bar, Navy bar, Pink bar) with cute eyes & smiles
 * - Floating playful geometric accents (Orange dot, Purple ring, Purple plus sign)
 * - Soft ground shadow ellipse
 * - Dynamic interactive reactions:
 *    - "normal": both eyes open and track cursor smoothly
 *    - "peek": one eye closed, one eye open & tracking (when typing password without view option)
 *    - "closed": both eyes closed (when password view option is turned on)
 */
function LeftIllustration({ eyeMode = "normal" }: LeftIllustrationProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const mousePosRef = useRef({ x: 0, y: 0, hasMoved: false });

  // Pupil references and their eye center coordinates in SVG space + max allowed offset
  const pupils = [
    // Character 1 (Purple tall bar)
    { id: "p1-l", eyeX: 106, eyeY: 86, maxD: 3.6 },
    { id: "p1-r", eyeX: 142, eyeY: 86, maxD: 3.6 },
    // Character 2 (Navy-Indigo bar)
    { id: "p2-l", eyeX: 185, eyeY: 162, maxD: 3.0 },
    { id: "p2-r", eyeX: 214, eyeY: 162, maxD: 3.0 },
    // Character 3 (Yellow dome)
    { id: "p3-l", eyeX: 76, eyeY: 202, maxD: 3.5 },
    { id: "p3-r", eyeX: 112, eyeY: 202, maxD: 3.5 },
    // Character 4 (Magenta bar)
    { id: "p4-l", eyeX: 242, eyeY: 260, maxD: 2.3 },
    { id: "p4-r", eyeX: 261, eyeY: 260, maxD: 2.3 },
  ];

  const updatePupils = () => {
    if (!mousePosRef.current.hasMoved || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    pupils.forEach(({ id, eyeX, eyeY, maxD }) => {
      const el = svgRef.current?.querySelector<SVGCircleElement>(`#${id}`);
      if (!el) return;

      // Calculate screen coordinates of the eye center
      const screenX = rect.left + (eyeX / 340) * rect.width;
      const screenY = rect.top + (eyeY / 380) * rect.height;

      const dx = mousePosRef.current.x - screenX;
      const dy = mousePosRef.current.y - screenY;
      const dist = Math.hypot(dx, dy);

      if (dist < 1) {
        el.style.transform = "translate(0px, 0px)";
        return;
      }

      const angle = Math.atan2(dy, dx);
      const magnitude = Math.min(maxD, (dist / 140) * maxD);
      const offsetX = Math.cos(angle) * magnitude;
      const offsetY = Math.sin(angle) * magnitude;

      el.style.transform = `translate(${offsetX.toFixed(2)}px, ${offsetY.toFixed(2)}px)`;
    });
  };

  useEffect(() => {
    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY, hasMoved: true };
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(updatePupils);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // When eyeMode changes (e.g. peek to normal or closed), immediately position active pupils
  useEffect(() => {
    const timer = requestAnimationFrame(updatePupils);
    return () => cancelAnimationFrame(timer);
  }, [eyeMode]);

  return (
    <div className="w-full h-full flex flex-col justify-between select-none">
      {/* Top 3 Overlapping Spheres Logo */}
      <div className="pt-2 pl-2">
        <svg width="48" height="26" viewBox="0 0 54 26" fill="none">
          <circle cx="12" cy="13" r="11" fill="#FBAE42" />
          <circle cx="25" cy="13" r="11" fill="#D13B89" />
          <circle cx="38" cy="13" r="11" fill="#5E2282" />
        </svg>
      </div>

      {/* Main Character Group SVG Illustration with Interactive Dynamic Eyes */}
      <div className="w-full flex items-end justify-center mt-auto pb-0">
        <svg
          ref={svgRef}
          viewBox="0 0 340 380"
          className="w-full h-auto max-h-[380px] sm:max-h-[440px] overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Soft Ground Ellipse */}
          <ellipse cx="145" cy="360" rx="135" ry="9" fill="#E2D4F0" />

          {/* Floating Accents */}
          {/* Amber Dot in upper left */}
          <circle cx="28" cy="46" r="6" fill="#FBAE42" />

          {/* Purple Ring in upper right */}
          <circle
            cx="290"
            cy="65"
            r="8.5"
            stroke="#5E2282"
            strokeWidth="2.4"
            fill="none"
          />

          {/* Purple Plus symbol on far right */}
          <path
            d="M 290 280 L 300 280 M 295 275 L 295 285"
            stroke="#9A38C2"
            strokeWidth="2.8"
            strokeLinecap="round"
          />

          {/* -------------------------------------------------------------
              Character 1 (Back): Tall Purple Rounded Bar
          -------------------------------------------------------------- */}
          <g>
            <rect
              x="76"
              y="36"
              width="95"
              height="324"
              rx="22"
              fill="#5E1F8C"
            />
            {/* Left Eye */}
            {eyeMode === "closed" || eyeMode === "peek" ? (
              <path
                d="M 98 86 Q 106 94 114 86"
                stroke="#FFFFFF"
                strokeWidth="2.6"
                strokeLinecap="round"
                fill="none"
              />
            ) : (
              <>
                <circle cx="106" cy="86" r="8.5" fill="#FFFFFF" />
                <circle
                  id="p1-l"
                  cx="106"
                  cy="86"
                  r="4.2"
                  fill="#141010"
                  className="transition-transform duration-75 ease-out"
                />
              </>
            )}

            {/* Right Eye */}
            {eyeMode === "closed" ? (
              <path
                d="M 134 86 Q 142 94 150 86"
                stroke="#FFFFFF"
                strokeWidth="2.6"
                strokeLinecap="round"
                fill="none"
              />
            ) : (
              <>
                <circle cx="142" cy="86" r="8.5" fill="#FFFFFF" />
                <circle
                  id="p1-r"
                  cx="142"
                  cy="86"
                  r="4.2"
                  fill="#141010"
                  className="transition-transform duration-75 ease-out"
                />
              </>
            )}

            {/* Mouth */}
            <path
              d="M 121 110 Q 125 116 129 110"
              stroke="#141010"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
          </g>

          {/* -------------------------------------------------------------
              Character 2 (Middle): Dark Navy-Indigo Rounded Bar
          -------------------------------------------------------------- */}
          <g>
            <rect
              x="160"
              y="120"
              width="78"
              height="240"
              rx="20"
              fill="#180C2E"
            />
            {/* Left Eye */}
            {eyeMode === "closed" || eyeMode === "peek" ? (
              <path
                d="M 178 162 Q 185 169 192 162"
                stroke="#FFFFFF"
                strokeWidth="2.4"
                strokeLinecap="round"
                fill="none"
              />
            ) : (
              <>
                <circle cx="185" cy="162" r="7.5" fill="#FFFFFF" />
                <circle
                  id="p2-l"
                  cx="185"
                  cy="162"
                  r="3.8"
                  fill="#141010"
                  className="transition-transform duration-75 ease-out"
                />
              </>
            )}

            {/* Right Eye */}
            {eyeMode === "closed" ? (
              <path
                d="M 207 162 Q 214 169 221 162"
                stroke="#FFFFFF"
                strokeWidth="2.4"
                strokeLinecap="round"
                fill="none"
              />
            ) : (
              <>
                <circle cx="214" cy="162" r="7.5" fill="#FFFFFF" />
                <circle
                  id="p2-r"
                  cx="214"
                  cy="162"
                  r="3.8"
                  fill="#141010"
                  className="transition-transform duration-75 ease-out"
                />
              </>
            )}

            {/* Mouth */}
            <path
              d="M 197 182 Q 200.5 187 204 182"
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
          </g>

          {/* -------------------------------------------------------------
              Character 3 (Front Left): Yellow/Amber Dome Half-Circle
          -------------------------------------------------------------- */}
          <g>
            <path
              d="M 10 360 L 10 254 A 84 84 0 0 1 178 254 L 178 360 Z"
              fill="#FBAE42"
            />
            {/* Left Eye */}
            {eyeMode === "closed" || eyeMode === "peek" ? (
              <path
                d="M 68 202 Q 76 209 84 202"
                stroke="#141010"
                strokeWidth="2.6"
                strokeLinecap="round"
                fill="none"
              />
            ) : (
              <>
                <circle cx="76" cy="202" r="8.5" fill="#FFFFFF" />
                <circle
                  id="p3-l"
                  cx="76"
                  cy="202"
                  r="4.5"
                  fill="#141010"
                  className="transition-transform duration-75 ease-out"
                />
              </>
            )}

            {/* Right Eye */}
            {eyeMode === "closed" ? (
              <path
                d="M 104 202 Q 112 209 120 202"
                stroke="#141010"
                strokeWidth="2.6"
                strokeLinecap="round"
                fill="none"
              />
            ) : (
              <>
                <circle cx="112" cy="202" r="8.5" fill="#FFFFFF" />
                <circle
                  id="p3-r"
                  cx="112"
                  cy="202"
                  r="4.5"
                  fill="#141010"
                  className="transition-transform duration-75 ease-out"
                />
              </>
            )}

            {/* Mouth */}
            <path
              d="M 91 222 Q 96 228 101 222"
              stroke="#141010"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />
          </g>

          {/* -------------------------------------------------------------
              Character 4 (Right): Bright Magenta Rounded Bar
          -------------------------------------------------------------- */}
          <g>
            <rect
              x="222"
              y="228"
              width="58"
              height="132"
              rx="18"
              fill="#CF36E0"
            />
            {/* Left Eye */}
            {eyeMode === "closed" || eyeMode === "peek" ? (
              <path
                d="M 236 260 Q 242 266 248 260"
                stroke="#141010"
                strokeWidth="2.2"
                strokeLinecap="round"
                fill="none"
              />
            ) : (
              <>
                <circle cx="242" cy="260" r="6" fill="#FFFFFF" />
                <circle
                  id="p4-l"
                  cx="242"
                  cy="260"
                  r="3"
                  fill="#141010"
                  className="transition-transform duration-75 ease-out"
                />
              </>
            )}

            {/* Right Eye */}
            {eyeMode === "closed" ? (
              <path
                d="M 255 260 Q 261 266 267 260"
                stroke="#141010"
                strokeWidth="2.2"
                strokeLinecap="round"
                fill="none"
              />
            ) : (
              <>
                <circle cx="261" cy="260" r="6" fill="#FFFFFF" />
                <circle
                  id="p4-r"
                  cx="261"
                  cy="260"
                  r="3"
                  fill="#141010"
                  className="transition-transform duration-75 ease-out"
                />
              </>
            )}

            {/* Mouth */}
            <path
              d="M 249 276 Q 252 281 255 276"
              stroke="#141010"
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        </svg>
      </div>
    </div>
  );
}

export default function LoginPage({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = "signin",
}: LoginModalProps) {
  const navigate = useNavigate();
  const isModal = isOpen !== undefined;

  const [mode, setMode] = useState<"signin" | "create" | "forgot">(initialMode);

  // Sign In Form States
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [showSignInPassword, setShowSignInPassword] = useState(false);

  // Create Account Form States
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Forgot Password Flow States
  const [forgotStep, setForgotStep] = useState<"email" | "otp" | "newPassword" | "success">("email");
  const [forgotEmail, setForgotEmail] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  // Status States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Track currently active/focused field for interactive character eye reactions
  const [activeField, setActiveField] = useState<string | null>(null);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const interval = setInterval(() => {
      setResendCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCountdown]);

  // Auto-hiding scrollbar logic for Create Account view
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const createScrollRef = useRef<HTMLDivElement | null>(null);

  const handleCreateScroll = () => {
    setIsScrolling(true);
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 1000);
  };

  useEffect(() => {
    if (mode === "create" && createScrollRef.current) {
      createScrollRef.current.scrollTop = 0;
    }
  }, [mode]);

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Determine character eye reaction mode:
   * - "normal": both eyes open and seeing/tracking cursor (default, or when in email/general inputs)
   * - "peek": one eye closed and one eye open/seeing (when entering password without view option)
   * - "closed": both eyes closed (when viewing password via view option)
   */
  const getEyeMode = (): "normal" | "peek" | "closed" => {
    if (mode === "signin") {
      if (activeField === "password") {
        return showSignInPassword ? "closed" : "peek";
      }
      return "normal";
    } else if (mode === "create") {
      if (activeField === "createPassword") {
        return showCreatePassword ? "closed" : "peek";
      }
      if (activeField === "confirmPassword") {
        return showConfirmPassword ? "closed" : "peek";
      }
      return "normal";
    } else if (mode === "forgot") {
      if (activeField === "newPassword") {
        return showNewPassword ? "closed" : "peek";
      }
      if (activeField === "confirmNewPassword") {
        return showConfirmNewPassword ? "closed" : "peek";
      }
      return "normal";
    }
    return "normal";
  };

  const resetForm = () => {
    setSignInEmail("");
    setSignInPassword("");
    setShowSignInPassword(false);
    setFirstName("");
    setLastName("");
    setCreateEmail("");
    setMobileNumber("");
    setCreatePassword("");
    setConfirmPassword("");
    setShowCreatePassword(false);
    setShowConfirmPassword(false);
    setForgotEmail("");
    setOtpDigits(["", "", "", "", "", ""]);
    setNewPassword("");
    setConfirmNewPassword("");
    setShowNewPassword(false);
    setShowConfirmNewPassword(false);
    setForgotStep("email");
    setResendCountdown(0);
    setErrorMessage("");
    setSuccessMessage("");
    setActiveField(null);
    setMode(initialMode);
  };

  useEffect(() => {
    resetForm();
    if (isOpen) {
      preloadRecaptcha();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleLogoutReset = () => {
      const user = localStorage.getItem("career_user");
      if (!user) {
        resetForm();
      }
    };
    window.addEventListener("career_user_change", handleLogoutReset);
    return () => window.removeEventListener("career_user_change", handleLogoutReset);
  }, []);

  const getInitials = (name: string, email: string) => {
    const clean = name.trim();
    if (clean) {
      const parts = clean.split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return clean.slice(0, 2).toUpperCase();
    }
    return email.slice(0, 2).toUpperCase();
  };

  const buildCareerUser = (backendUser: {
    name: string;
    email: string;
    phone?: string | null;
    role?: string;
    registeredDate?: string;
    verificationStatus?: string;
    isEmailVerified?: boolean;
    emailVerified?: boolean;
    accountStatus?: string;
  }): CareerUser => {
    const isVerified = Boolean(
      backendUser.isEmailVerified ??
        backendUser.emailVerified ??
        backendUser.verificationStatus === "verified"
    );

    return {
      name: backendUser.name,
      email: backendUser.email,
      initials: getInitials(backendUser.name, backendUser.email),
      phone: backendUser.phone || "",
      role: backendUser.role || "",
      registeredDate: backendUser.registeredDate || "",
      verificationStatus:
        backendUser.verificationStatus || (isVerified ? "verified" : "Unverified"),
      isEmailVerified: isVerified,
      accountStatus: backendUser.accountStatus || "",
    };
  };

  const handleFinishLogin = (user: CareerUser) => {
    try {
      localStorage.setItem("career_user", JSON.stringify(user));
    } catch {
      // ignore
    }
    resetForm();
    window.dispatchEvent(new Event("career_user_change"));
    if (onLoginSuccess) {
      onLoginSuccess(user);
    }
    if (onClose) {
      onClose();
    }
    if (!isModal) {
      navigate("/careers");
    }
  };

  const handleClose = () => {
    resetForm();
    if (onClose) {
      onClose();
    }
  };

  // Sign In Submission
  const handleSignInSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!signInEmail.trim()) {
      setErrorMessage("Please enter your email.");
      return;
    }
    if (!signInPassword) {
      setErrorMessage("Please enter your password.");
      return;
    }

    setIsLoading(true);

    try {
      const captchaToken = await executeRecaptcha("login_submit").catch((err) => {
        console.warn("reCAPTCHA execution note:", err);
        return "";
      });

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: signInEmail.trim(),
          password: signInPassword,
          captchaToken,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success || !data?.user) {
        throw new Error(
          data?.message || "Invalid email or password."
        );
      }

      setSuccessMessage(data.message || "Signed in successfully!");
      toast.success(data.message || "Signed in successfully! Welcome back.", { title: "Signed In" });
      setTimeout(() => {
        handleFinishLogin(buildCareerUser(data.user));
      }, 500);
    } catch (err: unknown) {
      const error = err as Error;
      const msg = error.message || "Invalid email or password.";
      setErrorMessage(msg);
      toast.error(msg, { title: "Sign In Failed" });
    } finally {
      setIsLoading(false);
    }
  };

  // OTP Digits Input Helpers
  const handleOtpDigitChange = (index: number, val: string) => {
    const cleaned = val.replace(/\D/g, "");
    const char = cleaned.slice(-1);
    const updated = [...otpDigits];
    updated[index] = char;
    setOtpDigits(updated);
    setErrorMessage("");

    if (char && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasteData) return;
    const updated = [...otpDigits];
    for (let i = 0; i < pasteData.length; i++) {
      updated[i] = pasteData[i];
    }
    setOtpDigits(updated);
    setErrorMessage("");
    const targetIdx = Math.min(pasteData.length, 5);
    otpInputRefs.current[targetIdx]?.focus();
  };

  // 1. Send OTP to email
  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!forgotEmail.trim()) {
      setErrorMessage("Please enter your registered email address.");
      return;
    }

    setIsLoading(true);
    try {
      const captchaToken = await executeRecaptcha("forgot_password_submit").catch((err) => {
        console.warn("reCAPTCHA execution note:", err);
        return "";
      });

      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail.trim(), captchaToken }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMessage(data.message || `A verification code has been sent to ${forgotEmail.trim()}.`);
        toast.success(data.message || "Verification code sent! Please check your inbox.", { title: "OTP Sent" });
        setForgotStep("otp");
        setResendCountdown(60);
        setOtpDigits(["", "", "", "", "", ""]);
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 150);
        return;
      }

      const msg = data.message || "This email is not registered. Please register first.";
      setErrorMessage(msg);
      toast.error(msg, { title: "Email Not Registered" });
    } catch (err: unknown) {
      const error = err as Error;
      const msg = error.message || "Failed to send verification code. Please check your email.";
      setErrorMessage(msg);
      toast.error(msg, { title: "Error" });
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Resend OTP
  const handleResendOtp = async () => {
    if (resendCountdown > 0 || isLoading) return;
    setErrorMessage("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      const captchaToken = await executeRecaptcha("forgot_password_submit").catch((err) => {
        console.warn("reCAPTCHA execution note:", err);
        return "";
      });

      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail.trim(), captchaToken }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMessage(`A fresh verification code has been sent to ${forgotEmail.trim()}.`);
        toast.success("Verification code resent! Please check your inbox.", { title: "OTP Resent" });
        setResendCountdown(60);
        setOtpDigits(["", "", "", "", "", ""]);
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 150);
        return;
      }

      const msg = data.message || "This email is not registered. Please register first.";
      setErrorMessage(msg);
      toast.error(msg, { title: "Email Not Registered" });
    } catch (err: unknown) {
      const error = err as Error;
      const msg = error.message || "Failed to resend code.";
      setErrorMessage(msg);
      toast.error(msg, { title: "Error" });
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Verify OTP
  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const fullOtp = otpDigits.join("").trim();
    if (fullOtp.length < 6) {
      setErrorMessage("Please enter the complete 6-digit verification code.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/verify-reset-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotEmail.trim(),
          otp: fullOtp,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMessage("Code verified! Now create your new password.");
        toast.success("Verification code confirmed.", { title: "Verified" });
        setForgotStep("newPassword");
        return;
      }

      throw new Error(data.message || "Invalid or expired verification code.");
    } catch (err: unknown) {
      const error = err as Error;
      const msg = error.message || "Invalid or expired verification code.";
      setErrorMessage(msg);
      toast.error(msg, { title: "Verification Failed" });
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Reset Password Submit
  const handleResetPasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!newPassword) {
      setErrorMessage("Please enter a new password.");
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotEmail.trim(),
          otp: otpDigits.join("").trim(),
          newPassword,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMessage(data.message || "Password reset successfully!");
        toast.success("Password reset successfully! You can now sign in.", { title: "Password Reset" });
        setForgotStep("success");
        return;
      }

      throw new Error(data.message || "Failed to reset password.");
    } catch (err: unknown) {
      const error = err as Error;
      const msg = error.message || "Failed to reset password.";
      setErrorMessage(msg);
      toast.error(msg, { title: "Reset Failed" });
    } finally {
      setIsLoading(false);
    }
  };

  // Create Account Submission
  const handleCreateSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!firstName.trim()) {
      setErrorMessage("Please enter your first name.");
      return;
    }
    if (!lastName.trim()) {
      setErrorMessage("Please enter your last name.");
      return;
    }
    if (!createEmail.trim()) {
      setErrorMessage("Please enter your email.");
      return;
    }
    if (!createPassword) {
      setErrorMessage("Please enter a password.");
      return;
    }
    if (createPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }
    if (createPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const captchaToken = await executeRecaptcha("register_submit").catch((err) => {
        console.warn("reCAPTCHA execution note:", err);
        return "";
      });

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: createEmail.trim(),
          mobileNumber: mobileNumber.trim(),
          password: createPassword,
          captchaToken,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success || !data?.user) {
        throw new Error(
          data?.message || "Failed to create account."
        );
      }

      setSuccessMessage(data.message || "Account created successfully!");
      toast.success(data.message || "Account created successfully! Welcome to Netopsys.", { title: "Account Created" });
      setTimeout(() => {
        handleFinishLogin(buildCareerUser(data.user));
      }, 500);
    } catch (err: unknown) {
      const error = err as Error;
      const msg = error.message || "Unable to create account. Please try again.";
      setErrorMessage(msg);
      toast.error(msg, { title: "Registration Failed" });
    } finally {
      setIsLoading(false);
    }
  };

  // Main Card Content matching the screenshot layout
  const cardContent = (
    <div className="w-full max-w-[800px] lg:max-w-[840px] md:h-[580px] lg:h-[590px] max-h-[95vh] bg-white rounded-[28px] sm:rounded-[32px] border border-[#E5DAEE] shadow-[0_24px_60px_-15px_rgba(93,35,129,0.12)] overflow-hidden grid grid-cols-1 md:grid-cols-12 relative font-['Onest',sans-serif] text-[#141010]">
      {/* Scrollbar auto-hide styles */}
      <style>{`
        .login-custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .login-custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .login-custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: transparent;
          border-radius: 9999px;
          transition: background-color 0.25s ease;
        }
        .login-custom-scrollbar.is-scrolling::-webkit-scrollbar-thumb {
          background-color: rgba(94, 34, 130, 0.45);
        }
        .login-custom-scrollbar.is-scrolling::-webkit-scrollbar-thumb:hover {
          background-color: rgba(94, 34, 130, 0.75);
        }
        .login-custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: transparent transparent;
          transition: scrollbar-color 0.25s ease;
        }
        .login-custom-scrollbar.is-scrolling {
          scrollbar-color: rgba(94, 34, 130, 0.45) transparent;
        }
      `}</style>

      {/* Optional Top-Right Close Button */}
      {(isModal || onClose) && (
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-5 top-5 z-20 w-8 h-8 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-500 hover:text-black transition-colors cursor-pointer shadow-2xs"
          aria-label="Close"
        >
          <X className="w-4 h-4 stroke-[2]" />
        </button>
      )}

      {/* Left Column: Soft Purple #EFE3F8 with Character Graphics */}
      <div className="hidden md:flex md:col-span-5 bg-[#EFE3F8] pt-6 lg:pt-7 px-6 lg:px-7 pb-3 lg:pb-4 flex-col justify-between overflow-hidden relative select-none border-r border-[#E6D9EE] h-full">
        <LeftIllustration eyeMode={getEyeMode()} />
      </div>

      {/* Right Column: Clean White Form Side */}
      <div className="md:col-span-7 bg-white p-7 sm:p-9 lg:p-10 flex flex-col h-full overflow-hidden">
        {/* Top Fixed Area: Tabs Switcher & Alerts */}
        <div className="shrink-0">
          {/* Top Tabs Switcher / Back Header */}
          {mode === "forgot" ? (
            <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-6">
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setForgotStep("email");
                  setActiveField(null);
                  setErrorMessage("");
                  setSuccessMessage("");
                }}
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#5E2282] hover:text-[#431660] transition-colors cursor-pointer group"
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                Back to Sign in
              </button>

              <span className="text-[11px] sm:text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#FAF5FD] text-[#5E2282] border border-[#EEDBFA]">
                {forgotStep === "email" && "Step 1 of 3"}
                {forgotStep === "otp" && "Step 2 of 3"}
                {forgotStep === "newPassword" && "Step 3 of 3"}
                {forgotStep === "success" && "Complete"}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-6 border-b border-gray-100 pb-2 mb-6">
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setActiveField(null);
                  setErrorMessage("");
                  setSuccessMessage("");
                }}
                className={`text-sm sm:text-[15px] pb-1.5 transition-colors cursor-pointer relative ${
                  mode === "signin"
                    ? "text-[#141010] font-bold"
                    : "text-[#716A7E] font-medium hover:text-[#141010]"
                }`}
              >
                Sign in
                {mode === "signin" && (
                  <span className="absolute bottom-[-9px] left-0 right-0 h-[2.5px] bg-[#5E2282] rounded-full" />
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode("create");
                  setActiveField(null);
                  setErrorMessage("");
                  setSuccessMessage("");
                }}
                className={`text-sm sm:text-[15px] pb-1.5 transition-colors cursor-pointer relative ${
                  mode === "create"
                    ? "text-[#141010] font-bold"
                    : "text-[#716A7E] font-medium hover:text-[#141010]"
                }`}
              >
                Create account
                {mode === "create" && (
                  <span className="absolute bottom-[-9px] left-0 right-0 h-[2.5px] bg-[#5E2282] rounded-full" />
                )}
              </button>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="flex-1 font-semibold">{successMessage}</div>
            </div>
          )}
        </div>

        {/* =================================================================
            VIEW 1: SIGN IN (Image 1) - Fits perfectly without scrolling
        ================================================================== */}
        {mode === "signin" && (
          <div className="flex-1 flex flex-col justify-between overflow-hidden">
            <div>
              <h2 className="text-3xl sm:text-[34px] font-bold text-[#141010] tracking-tight mb-6">
                Sign in
              </h2>

              <form onSubmit={handleSignInSubmit} className="space-y-4">
                {/* Email Field */}
                <div>
                  <label className="block text-xs sm:text-[13px] font-bold text-[#5E2282] mb-1.5 select-none">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={signInEmail}
                    onFocus={() => setActiveField("email")}
                    onChange={(e) => {
                      setActiveField("email");
                      setSignInEmail(e.target.value);
                    }}
                    placeholder="Email"
                    className="w-full bg-[#FAF8FC] border border-[#E5DBEC] hover:border-[#CBBBDC] focus:border-[#5E2282] focus:bg-white rounded-2xl px-4 py-3 text-xs sm:text-sm text-[#141010] placeholder:text-[#A19AA8] outline-none shadow-2xs transition-colors"
                  />
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-xs sm:text-[13px] font-bold text-[#5E2282] mb-1.5 select-none">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#8E869B] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showSignInPassword ? "text" : "password"}
                      required
                      value={signInPassword}
                      onFocus={() => setActiveField("password")}
                      onChange={(e) => {
                        setActiveField("password");
                        setSignInPassword(e.target.value);
                      }}
                      placeholder="Password"
                      className="w-full bg-[#FAF8FC] border border-[#E5DBEC] hover:border-[#CBBBDC] focus:border-[#5E2282] focus:bg-white rounded-2xl pl-11 pr-11 py-3 text-xs sm:text-sm text-[#141010] placeholder:text-[#A19AA8] outline-none shadow-2xs transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setActiveField("password");
                        setShowSignInPassword(!showSignInPassword);
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8E869B] hover:text-[#5E2282] transition-colors cursor-pointer p-1"
                      aria-label={showSignInPassword ? "Hide password" : "Show password"}
                    >
                      {showSignInPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Forgot Password link */}
                <div className="text-right pt-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("forgot");
                      setForgotStep("email");
                      if (signInEmail.trim()) {
                        setForgotEmail(signInEmail.trim());
                      }
                      setActiveField("forgotEmail");
                      setErrorMessage("");
                      setSuccessMessage("");
                    }}
                    className="text-xs sm:text-[13px] font-bold text-[#5E2282] hover:underline cursor-pointer select-none"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Sign In Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-3 hover-brand-gradient bg-[#5E2282] hover:bg-[#4D1865] text-white py-3.5 px-6 rounded-2xl font-bold text-sm sm:text-[15px] shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Signing in..." : "Sign in"}
                </button>
              </form>
            </div>

            {/* Bottom Switcher */}
            <div className="text-center mt-5 text-xs sm:text-[13px] text-[#554E62]">
              New to Netopsys?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("create");
                  setActiveField(null);
                  setErrorMessage("");
                  setSuccessMessage("");
                }}
                className="text-[#5E2282] font-bold hover:underline cursor-pointer ml-1"
              >
                Create account
              </button>
            </div>
          </div>
        )}

        {/* =================================================================
            VIEW 2: CREATE ACCOUNT (Image 2) - Auto-hide scrollbar on scroll
        ================================================================== */}
        {mode === "create" && (
          <div
            ref={createScrollRef}
            onScroll={handleCreateScroll}
            className={`flex-1 overflow-y-auto pr-2 -mr-2 login-custom-scrollbar ${
              isScrolling ? "is-scrolling" : ""
            }`}
          >
            <h2 className="text-3xl sm:text-[34px] font-bold text-[#141010] tracking-tight mb-5">
              Create account
            </h2>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
              {/* First Name & Last Name (2 columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#5E2282] mb-1 select-none">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onFocus={() => setActiveField("firstName")}
                    onChange={(e) => {
                      setActiveField("firstName");
                      setFirstName(e.target.value);
                    }}
                    placeholder="First name"
                    className="w-full bg-[#FAF8FC] border border-[#E5DBEC] hover:border-[#CBBBDC] focus:border-[#5E2282] focus:bg-white rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-[#141010] placeholder:text-[#A19AA8] outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5E2282] mb-1 select-none">
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onFocus={() => setActiveField("lastName")}
                    onChange={(e) => {
                      setActiveField("lastName");
                      setLastName(e.target.value);
                    }}
                    placeholder="Last name"
                    className="w-full bg-[#FAF8FC] border border-[#E5DBEC] hover:border-[#CBBBDC] focus:border-[#5E2282] focus:bg-white rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-[#141010] placeholder:text-[#A19AA8] outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-xs font-bold text-[#5E2282] mb-1 select-none">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={createEmail}
                  onFocus={() => setActiveField("createEmail")}
                  onChange={(e) => {
                    setActiveField("createEmail");
                    setCreateEmail(e.target.value);
                  }}
                  placeholder="Email"
                  className="w-full bg-[#FAF8FC] border border-[#E5DBEC] hover:border-[#CBBBDC] focus:border-[#5E2282] focus:bg-white rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-[#141010] placeholder:text-[#A19AA8] outline-none transition-colors"
                />
              </div>

              {/* Mobile Number Field */}
              <div>
                <label className="block text-xs font-bold text-[#5E2282] mb-1 select-none">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={mobileNumber}
                  onFocus={() => setActiveField("mobileNumber")}
                  onChange={(e) => {
                    setActiveField("mobileNumber");
                    setMobileNumber(e.target.value);
                  }}
                  placeholder="Mobile number"
                  className="w-full bg-[#FAF8FC] border border-[#E5DBEC] hover:border-[#CBBBDC] focus:border-[#5E2282] focus:bg-white rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-[#141010] placeholder:text-[#A19AA8] outline-none transition-colors"
                />
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-xs font-bold text-[#5E2282] mb-1 select-none">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8E869B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showCreatePassword ? "text" : "password"}
                    required
                    value={createPassword}
                    onFocus={() => setActiveField("createPassword")}
                    onChange={(e) => {
                      setActiveField("createPassword");
                      setCreatePassword(e.target.value);
                    }}
                    placeholder="Enter Password"
                    className="w-full bg-[#FAF8FC] border border-[#E5DBEC] hover:border-[#CBBBDC] focus:border-[#5E2282] focus:bg-white rounded-2xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-[#141010] placeholder:text-[#A19AA8] outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setActiveField("createPassword");
                      setShowCreatePassword(!showCreatePassword);
                    }}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8E869B] hover:text-[#5E2282] transition-colors cursor-pointer p-1"
                    aria-label={showCreatePassword ? "Hide password" : "Show password"}
                  >
                    {showCreatePassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-xs font-bold text-[#5E2282] mb-1 select-none">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8E869B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onFocus={() => setActiveField("confirmPassword")}
                    onChange={(e) => {
                      setActiveField("confirmPassword");
                      setConfirmPassword(e.target.value);
                    }}
                    placeholder="Confirm Password"
                    className="w-full bg-[#FAF8FC] border border-[#E5DBEC] hover:border-[#CBBBDC] focus:border-[#5E2282] focus:bg-white rounded-2xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-[#141010] placeholder:text-[#A19AA8] outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setActiveField("confirmPassword");
                      setShowConfirmPassword(!showConfirmPassword);
                    }}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8E869B] hover:text-[#5E2282] transition-colors cursor-pointer p-1"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Create Account Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-3 hover-brand-gradient bg-[#5E2282] hover:bg-[#4D1865] text-white py-3.5 px-6 rounded-2xl font-bold text-sm sm:text-[15px] shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Creating account..." : "Create account"}
              </button>
            </form>

            {/* Bottom Switcher */}
            <div className="text-center mt-4 pb-2 text-xs sm:text-[13px] text-[#554E62]">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setActiveField(null);
                  setErrorMessage("");
                  setSuccessMessage("");
                }}
                className="text-[#5E2282] font-bold hover:underline cursor-pointer ml-1"
              >
                Sign in
              </button>
            </div>
          </div>
        )}

        {/* =================================================================
            VIEW 3: FORGOT PASSWORD (Enter Email -> OTP -> New Password)
        ================================================================== */}
        {mode === "forgot" && (
          <div className="flex-1 flex flex-col justify-between overflow-hidden">
            {/* Step 1: Enter Email */}
            {forgotStep === "email" && (
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h2 className="text-2xl sm:text-[30px] font-bold text-[#141010] tracking-tight mb-2">
                    Forgot password?
                  </h2>
                  <p className="text-xs sm:text-[13px] text-[#716A7E] mb-6 leading-relaxed">
                    Enter your registered email address and we'll send a 6-digit verification code to reset your password.
                  </p>

                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <div>
                      <label className="block text-xs sm:text-[13px] font-bold text-[#5E2282] mb-1.5 select-none">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-[#8E869B] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="email"
                          required
                          autoFocus
                          value={forgotEmail}
                          onFocus={() => setActiveField("forgotEmail")}
                          onChange={(e) => {
                            setActiveField("forgotEmail");
                            setForgotEmail(e.target.value);
                          }}
                          placeholder="Enter your registered email"
                          className="w-full bg-[#FAF8FC] border border-[#E5DBEC] hover:border-[#CBBBDC] focus:border-[#5E2282] focus:bg-white rounded-2xl pl-11 pr-4 py-3 text-xs sm:text-sm text-[#141010] placeholder:text-[#A19AA8] outline-none shadow-2xs transition-colors"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full mt-4 hover-brand-gradient bg-[#5E2282] hover:bg-[#4D1865] text-white py-3.5 px-6 rounded-2xl font-bold text-sm sm:text-[15px] shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? "Sending Verification Code..." : "Send Verification Code"}
                    </button>
                  </form>
                </div>

                {/* Bottom Switchers */}
                <div className="space-y-2 mt-5 text-center text-xs sm:text-[13px] text-[#554E62]">
                  <div>
                    Remember your password?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setMode("signin");
                        setActiveField(null);
                        setErrorMessage("");
                        setSuccessMessage("");
                      }}
                      className="text-[#5E2282] font-bold hover:underline cursor-pointer ml-1"
                    >
                      Sign in
                    </button>
                  </div>
                  <div>
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setMode("create");
                        setActiveField(null);
                        setErrorMessage("");
                        setSuccessMessage("");
                      }}
                      className="text-[#5E2282] font-bold hover:underline cursor-pointer ml-1"
                    >
                      Register here
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Enter 6-digit OTP */}
            {forgotStep === "otp" && (
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h2 className="text-2xl sm:text-[30px] font-bold text-[#141010] tracking-tight mb-2">
                    Enter Verification Code
                  </h2>
                  <p className="text-xs sm:text-[13px] text-[#716A7E] mb-6 leading-relaxed">
                    We've sent a 6-digit code to <strong className="text-[#141010]">{forgotEmail}</strong>. Please check your inbox or spam folder.
                  </p>

                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div>
                      <label className="block text-xs sm:text-[13px] font-bold text-[#5E2282] mb-2 select-none">
                        6-Digit Verification Code
                      </label>
                      <div className="flex justify-between gap-2 sm:gap-2.5">
                        {otpDigits.map((digit, idx) => (
                          <input
                            key={idx}
                            ref={(el) => {
                              otpInputRefs.current[idx] = el;
                            }}
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            maxLength={1}
                            value={digit}
                            onFocus={() => setActiveField("otp")}
                            onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                            onPaste={handleOtpPaste}
                            className="w-10 sm:w-12 h-12 sm:h-14 text-center text-lg sm:text-2xl font-bold font-mono text-[#5E2282] bg-[#FAF8FC] border border-[#E5DBEC] focus:border-[#5E2282] focus:bg-white rounded-2xl outline-none shadow-2xs transition-all"
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs sm:text-[13px] pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setForgotStep("email");
                          setErrorMessage("");
                        }}
                        className="text-[#716A7E] hover:text-[#5E2282] underline cursor-pointer"
                      >
                        Change email
                      </button>

                      {resendCountdown > 0 ? (
                        <span className="text-[#8E869B] text-xs">
                          Resend in <strong className="text-[#5E2282]">{resendCountdown}s</strong>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          disabled={isLoading}
                          className="text-[#5E2282] font-bold hover:underline cursor-pointer inline-flex items-center gap-1"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Resend OTP
                        </button>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || otpDigits.join("").length < 6}
                      className="w-full mt-3 hover-brand-gradient bg-[#5E2282] hover:bg-[#4D1865] text-white py-3.5 px-6 rounded-2xl font-bold text-sm sm:text-[15px] shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? "Verifying Code..." : "Verify & Continue"}
                    </button>
                  </form>
                </div>

                <div className="text-center mt-5 text-xs sm:text-[13px] text-[#554E62]">
                  Need help?{" "}
                  <a
                    href="mailto:helpdesk@netopsys.net"
                    className="text-[#5E2282] font-bold hover:underline ml-1"
                  >
                    Contact Support
                  </a>
                </div>
              </div>
            )}

            {/* Step 3: Enter New Password */}
            {forgotStep === "newPassword" && (
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h2 className="text-2xl sm:text-[30px] font-bold text-[#141010] tracking-tight mb-2">
                    Create New Password
                  </h2>
                  <p className="text-xs sm:text-[13px] text-[#716A7E] mb-5 leading-relaxed">
                    Set a strong new password for <span className="font-semibold text-[#141010]">{forgotEmail}</span>.
                  </p>

                  <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                    {/* New Password Field */}
                    <div>
                      <label className="block text-xs sm:text-[13px] font-bold text-[#5E2282] mb-1.5 select-none">
                        New Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-[#8E869B] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type={showNewPassword ? "text" : "password"}
                          required
                          autoFocus
                          value={newPassword}
                          onFocus={() => setActiveField("newPassword")}
                          onChange={(e) => {
                            setActiveField("newPassword");
                            setNewPassword(e.target.value);
                          }}
                          placeholder="At least 6 characters"
                          className="w-full bg-[#FAF8FC] border border-[#E5DBEC] hover:border-[#CBBBDC] focus:border-[#5E2282] focus:bg-white rounded-2xl pl-11 pr-11 py-3 text-xs sm:text-sm text-[#141010] placeholder:text-[#A19AA8] outline-none shadow-2xs transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setActiveField("newPassword");
                            setShowNewPassword(!showNewPassword);
                          }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8E869B] hover:text-[#5E2282] p-1 cursor-pointer"
                          aria-label={showNewPassword ? "Hide password" : "Show password"}
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm New Password Field */}
                    <div>
                      <label className="block text-xs sm:text-[13px] font-bold text-[#5E2282] mb-1.5 select-none">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-[#8E869B] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type={showConfirmNewPassword ? "text" : "password"}
                          required
                          value={confirmNewPassword}
                          onFocus={() => setActiveField("confirmNewPassword")}
                          onChange={(e) => {
                            setActiveField("confirmNewPassword");
                            setConfirmNewPassword(e.target.value);
                          }}
                          placeholder="Re-enter new password"
                          className="w-full bg-[#FAF8FC] border border-[#E5DBEC] hover:border-[#CBBBDC] focus:border-[#5E2282] focus:bg-white rounded-2xl pl-11 pr-11 py-3 text-xs sm:text-sm text-[#141010] placeholder:text-[#A19AA8] outline-none shadow-2xs transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setActiveField("confirmNewPassword");
                            setShowConfirmNewPassword(!showConfirmNewPassword);
                          }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8E869B] hover:text-[#5E2282] p-1 cursor-pointer"
                          aria-label={showConfirmNewPassword ? "Hide password" : "Show password"}
                        >
                          {showConfirmNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full mt-2 hover-brand-gradient bg-[#5E2282] hover:bg-[#4D1865] text-white py-3.5 px-6 rounded-2xl font-bold text-sm sm:text-[15px] shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? "Updating Password..." : "Reset Password"}
                    </button>
                  </form>
                </div>

                <div className="text-center mt-5 text-xs sm:text-[13px] text-[#554E62]">
                  Cancel and{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signin");
                      setActiveField(null);
                      setErrorMessage("");
                      setSuccessMessage("");
                    }}
                    className="text-[#5E2282] font-bold hover:underline cursor-pointer ml-1"
                  >
                    Return to sign in
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Success View */}
            {forgotStep === "success" && (
              <div className="flex-1 flex flex-col justify-center items-center text-center py-4">
                <div className="w-16 h-16 mb-4 rounded-full bg-[#FAF5FD] border-2 border-[#5E2282] text-[#5E2282] flex items-center justify-center shadow-md animate-in zoom-in-75 duration-300">
                  <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
                </div>

                <h2 className="text-2xl sm:text-[28px] font-bold text-[#141010] tracking-tight mb-2">
                  Password Reset Successful!
                </h2>

                <p className="text-xs sm:text-[13.5px] text-[#716A7E] max-w-sm mb-7 leading-relaxed">
                  Your password has been successfully updated. You can now sign in with your new credentials.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setMode("signin");
                    setSignInEmail(forgotEmail);
                    setSignInPassword("");
                    setErrorMessage("");
                    setSuccessMessage("Password reset successfully! Please sign in.");
                    setActiveField(null);
                  }}
                  className="w-full bg-[#5E2282] hover:bg-[#4D1865] hover-brand-gradient text-white py-3.5 px-6 rounded-2xl font-bold text-sm sm:text-[15px] shadow-sm hover:shadow transition-all cursor-pointer"
                >
                  Sign In Now
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // If used as modal
  if (isModal) {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
        <div
          className="fixed inset-0"
          onClick={handleClose}
          aria-hidden="true"
        />
        <div className="relative z-10 max-h-[95vh] overflow-y-auto rounded-[32px]">
          {cardContent}
        </div>
      </div>
    );
  }

  // If used as standalone page (/login or /careers/login)
  return (
    <div className="min-h-screen w-full bg-[#F6EFF9] text-[#141010] font-['Onest',sans-serif] flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 antialiased selection:bg-[#5E2282] selection:text-white relative">
      {cardContent}
    </div>
  );
}
