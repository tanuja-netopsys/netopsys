import { useState, useEffect, useRef } from "react";
import {
  Menu,
  X,
  LogIn,
  LogOut,
  User,
  ChevronDown,
  CheckCircle,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import netopsysLogo from "../assets/netopsys-logo.png";
import LoginPage from "../pages/login.tsx";

export interface NavbarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export interface CareerUser {
  name: string;
  email: string;
  initials: string;
  phone?: string;
  role?: string;
  registeredDate?: string;
  verificationStatus?: string;
  accountStatus?: string;
}

export default function Navbar({
  activeTab = "Home",
  onTabChange,
}: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const isServicesPage =
    location.pathname === "/services" ||
    location.pathname.startsWith("/services/") ||
    location.pathname.startsWith("/service");
  const isAboutPage = location.pathname === "/about";
  const isPortfolioPage = location.pathname === "/portfolio" || location.pathname.startsWith("/portfolio");
  const isCareersPage =
    location.pathname === "/careers" ||
    location.pathname.startsWith("/careers/") ||
    activeTab === "Careers";
  const isBlogsPage =
    location.pathname === "/blogs" ||
    location.pathname === "/blog" ||
    location.pathname.startsWith("/blogs/") ||
    location.pathname.startsWith("/blog/");

  const currentTab = isServicesPage
    ? "Services"
    : isAboutPage
    ? "About"
    : isPortfolioPage
    ? "Portfolio"
    : isBlogsPage
    ? "Blogs"
    : isCareersPage
    ? "Careers"
    : activeTab;

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Authentication & Profile States for Careers Page
  const [currentUser, setCurrentUser] = useState<CareerUser | null>(() => {
    try {
      const saved = localStorage.getItem("career_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const dropdownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleUserChange = () => {
      try {
        const saved = localStorage.getItem("career_user");
        setCurrentUser(saved ? JSON.parse(saved) : null);
      } catch {
        setCurrentUser(null);
      }
    };
    window.addEventListener("career_user_change", handleUserChange);
    return () => window.removeEventListener("career_user_change", handleUserChange);
  }, []);

  const handleDropdownMouseEnter = () => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setIsDropdownOpen(true);
  };

  const handleDropdownMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 150);
  };

  const handleLogin = (user: CareerUser) => {
    try {
      localStorage.setItem("career_user", JSON.stringify(user));
    } catch {
      // ignore storage error
    }
    setCurrentUser(user);
    setIsLoginModalOpen(false);
    window.dispatchEvent(new Event("career_user_change"));
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem("career_user");
    } catch {
      // ignore storage error
    }
    setCurrentUser(null);
    setIsDropdownOpen(false);
    setIsProfileModalOpen(false);
    setIsLoginModalOpen(false);
    window.dispatchEvent(new Event("career_user_change"));
  };

  // Exact links order from the design: Home, About, Services, Portfolio, Blogs, Careers
  const navLinks = [
    "Home",
    "About",
    "Services",
    "Portfolio",
    "Blogs",
    "Careers",
  ];

  const handleLinkClick = (link: string) => {
    setIsMobileMenuOpen(false);
    if (onTabChange) {
      onTabChange(link);
    }

    if (link === "Services") {
      if (location.pathname !== "/services") {
        navigate("/services");
      }
      window.scrollTo({ top: 0, behavior: "instant" });
      return;
    }

    if (link === "About") {
      if (location.pathname !== "/about") {
        navigate("/about");
      }
      window.scrollTo({ top: 0, behavior: "instant" });
      return;
    }

    if (link === "Portfolio") {
      if (location.pathname !== "/portfolio") {
        navigate("/portfolio");
      }
      window.scrollTo({ top: 0, behavior: "instant" });
      return;
    }

    if (link === "Blogs") {
      if (location.pathname !== "/blogs") {
        navigate("/blogs");
      }
      window.scrollTo({ top: 0, behavior: "instant" });
      return;
    }

    if (link === "Careers") {
      if (location.pathname !== "/careers") {
        navigate("/careers");
      }
      window.scrollTo({ top: 0, behavior: "instant" });
      return;
    }

    if (link === "Home") {
      if (location.pathname !== "/") {
        navigate("/");
      }
      window.scrollTo({ top: 0, behavior: "instant" });
      return;
    }

    const sectionId = link.toLowerCase();
    if (location.pathname !== "/") {
      navigate(`/#${sectionId}`);
    } else {
      const targetElement = document.getElementById(sectionId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handleGetStartedClick = () => {
    setIsMobileMenuOpen(false);
    if (location.pathname !== "/contact") {
      navigate("/contact");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <header className="nav-header-wrap fixed top-2.5 sm:top-3 md:top-3 xl:top-3.5 left-0 right-0 z-50 flex justify-center px-3 sm:px-4 pointer-events-none select-none">
        {/* Floating Dark Pill Navbar */}
        <nav className="nav-pill-wrap pointer-events-auto bg-[#0B0716] rounded-full px-4 sm:px-5 md:px-5 lg:px-5.5 xl:px-6 py-1.5 sm:py-2 md:py-2 lg:py-2 xl:py-2 flex items-center justify-between gap-3 sm:gap-4 md:gap-4 lg:gap-5.5 xl:gap-6 shadow-2xl shadow-black/30 border border-white/[0.06] transition-all duration-300">
          {/* Brand Logo */}
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              handleLinkClick("Home");
            }}
            className="flex items-center shrink-0 group cursor-pointer"
          >
            <img
              src={netopsysLogo}
              alt="Netopsys Logo"
              className="nav-logo-img h-5 sm:h-5.5 md:h-5.5 lg:h-6 xl:h-6 w-auto object-contain transition-all duration-200 group-hover:opacity-90"
            />
          </a>

          {/* Desktop Navigation Links */}
          <div className="nav-links-wrap hidden md:flex items-center md:gap-2.5 lg:gap-3.5 xl:gap-5">
            {navLinks.map((link) => {
              const isActive = currentTab === link;
              return (
                <button
                  key={link}
                  onClick={() => handleLinkClick(link)}
                  className={`nav-link-item whitespace-nowrap md:text-[12.5px] lg:text-[13px] xl:text-[13.5px] transition-colors cursor-pointer ${
                    isActive
                      ? "text-white font-medium"
                      : "text-white/80 hover:text-white font-normal"
                  }`}
                  style={{ fontFamily: "'Onest', sans-serif" }}
                >
                  {link}
                </button>
              );
            })}
          </div>

          {/* Right Action Items */}
          <div className="hidden sm:flex items-center gap-2 lg:gap-2.5 shrink-0">
            {/* User Profile Button (visible when logged in) OR Log in Button (Careers page when logged out) */}
            {currentUser ? (
              <div
                className="relative"
                onMouseEnter={handleDropdownMouseEnter}
                onMouseLeave={handleDropdownMouseLeave}
              >
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  className="bg-white/10 hover:bg-white/15 text-white whitespace-nowrap text-xs md:text-[12px] lg:text-[12.5px] font-medium px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full border border-white/15 transition-all cursor-pointer inline-flex items-center gap-2 shadow-sm"
                  style={{ fontFamily: "'Onest', sans-serif" }}
                >
                  <User className="w-3.5 h-3.5 text-white/90 shrink-0" />
                  <span className="max-w-[120px] truncate">{currentUser.name}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-white/70 transition-transform duration-200 ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Menu on Hover */}
                {isDropdownOpen && (
                  <div
                    className="absolute right-0 top-full pt-2 z-50 w-52 animate-in fade-in zoom-in-95 duration-150"
                    onMouseEnter={handleDropdownMouseEnter}
                    onMouseLeave={handleDropdownMouseLeave}
                  >
                    <div className="bg-[#140D26] text-white rounded-2xl p-2 shadow-2xl border border-white/15 backdrop-blur-md">
                      {/* User Preview */}
                      <div className="px-3 py-2 border-b border-white/10 mb-1">
                        <div className="text-[13px] font-semibold text-white truncate">
                          {currentUser.name}
                        </div>
                        <div className="text-[11px] text-white/60 truncate">
                          {currentUser.email}
                        </div>
                      </div>

                      {/* My Profile */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          navigate("/profile");
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/10 text-white/90 hover:text-white text-xs sm:text-[13px] font-medium flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <User className="w-4 h-4 text-[#FBAE42]" />
                        <span>My Profile</span>
                      </button>

                      {/* Logout */}
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-red-500/15 text-red-300 hover:text-red-200 text-xs sm:text-[13px] font-medium flex items-center gap-2.5 transition-colors cursor-pointer mt-0.5"
                      >
                        <LogOut className="w-4 h-4 text-red-400" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : isCareersPage ? (
              <button
                type="button"
                onClick={() => setIsLoginModalOpen(true)}
                className="hover-brand-gradient bg-white/10 hover:bg-white/20 text-white whitespace-nowrap text-xs md:text-[12px] lg:text-[12.5px] font-medium px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full border border-white/15 transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
                style={{ fontFamily: "'Onest', sans-serif" }}
              >
                <LogIn className="w-3.5 h-3.5 text-[#FBAE42]" />
                <span>Log in</span>
              </button>
            ) : null}

            {/* Let's Connect CTA - Hidden when logged in, visible when logged out */}
            {!currentUser && (
              <button
                onClick={handleGetStartedClick}
                className="nav-cta-btn hover-brand-gradient bg-[#FBAE42] text-[#141010] whitespace-nowrap text-xs md:text-[12px] lg:text-[12.5px] xl:text-[13px] font-semibold px-3.5 sm:px-4 md:px-3.5 lg:px-4 xl:px-4.5 py-1 sm:py-1.5 md:py-1.5 lg:py-1.5 xl:py-1.5 rounded-full shadow-sm cursor-pointer inline-flex items-center justify-center transition-all duration-200"
                style={{ fontFamily: "'Onest', sans-serif" }}
              >
                Let's Connect
              </button>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-white/90 hover:text-white p-1 rounded-full cursor-pointer"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>
        </nav>

        {/* Mobile Drawer Dropdown */}
        {isMobileMenuOpen && (
          <div className="pointer-events-auto absolute top-14 sm:top-16 left-4 right-4 bg-[#0B0716] rounded-2xl p-5 shadow-2xl border border-white/10 flex flex-col gap-3 animate-in fade-in duration-200">
            {navLinks.map((link) => (
              <button
                key={link}
                onClick={() => handleLinkClick(link)}
                className="text-left text-sm text-white/90 hover:text-white font-medium py-1.5 px-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                {link}
              </button>
            ))}

            {/* Mobile User Actions / Careers Login */}
            {currentUser ? (
              <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
                <div className="flex items-center gap-2.5 px-2 py-1">
                  <div className="w-6 h-6 rounded-full bg-[#EADBFA] text-[#693092] font-bold text-xs flex items-center justify-center">
                    {currentUser.initials}
                  </div>
                  <span className="text-sm font-medium text-white">{currentUser.name}</span>
                </div>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigate("/profile");
                  }}
                  className="text-left text-sm text-white/90 hover:text-white font-medium py-1.5 px-2 rounded-lg hover:bg-white/5 flex items-center gap-2"
                >
                  <User className="w-4 h-4 text-[#FBAE42]" />
                  <span>My Profile</span>
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="text-left text-sm text-red-300 hover:text-red-200 font-medium py-1.5 px-2 rounded-lg hover:bg-red-500/10 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4 text-red-400" />
                  <span>Logout</span>
                </button>
              </div>
            ) : isCareersPage ? (
              <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsLoginModalOpen(true);
                  }}
                  className="w-full bg-white/10 hover:bg-white/15 text-white text-sm font-semibold py-2 rounded-full border border-white/15 flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4 text-[#FBAE42]" />
                  <span>Log in</span>
                </button>
              </div>
            ) : null}

            {/* Mobile Let's Connect CTA - Hidden when logged in, visible when logged out */}
            {!currentUser && (
              <div className="pt-2 border-t border-white/10">
                <button
                  onClick={handleGetStartedClick}
                  className="w-full hover-brand-gradient bg-[#FBAE42] text-[#141010] text-sm font-semibold py-2.5 rounded-full shadow-md cursor-pointer inline-flex items-center justify-center"
                >
                  Let's Connect
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* =====================================================================
          LOGIN & CREATE ACCOUNT MODAL FOR CANDIDATES (FROM login.tsx)
      ===================================================================== */}
      {isLoginModalOpen && (
        <LoginPage
          key={isLoginModalOpen ? "modal-open" : "modal-closed"}
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onLoginSuccess={(user) => {
            handleLogin(user);
          }}
        />
      )}

      {/* =====================================================================
          MY PROFILE MODAL FOR LOGGED IN CANDIDATE
      ===================================================================== */}
      {isProfileModalOpen && currentUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#140D26] text-white rounded-3xl border border-white/15 shadow-2xl w-full max-w-md overflow-hidden relative animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#EADBFA]/15 flex items-center justify-center">
                  <User className="w-4 h-4 text-[#FBAE42]" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white">My Profile</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 stroke-[2.2]" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-5">
              {/* Profile Card */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.04] border border-white/10">
                <div className="w-14 h-14 rounded-full bg-[#EADBFA] text-[#693092] font-bold text-xl flex items-center justify-center shrink-0 shadow-sm">
                  {currentUser.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-base font-bold text-white truncate">{currentUser.name}</h4>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      <CheckCircle className="w-3 h-3" />
                      <span>Verified</span>
                    </span>
                  </div>
                  <p className="text-xs text-white/60 truncate">{currentUser.email}</p>
                  <p className="text-xs text-[#FBAE42] font-medium mt-1">
                    {currentUser.role || "Candidate"}
                  </p>
                </div>
              </div>

              {/* Contact & Status Details */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-white/50 block mb-1">Phone</span>
                  <span className="text-white font-medium">{currentUser.phone || "+91 98765 43211"}</span>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-white/50 block mb-1">Status</span>
                  <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Active
                  </span>
                </div>
              </div>

              {/* Application Status Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#2A1450] to-[#1E0F3A] border border-[#693092]/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-white/80">Application Status</span>
                  <span className="text-[11px] font-bold text-[#EADBFA] bg-[#693092]/50 px-2.5 py-0.5 rounded-full">
                    Shortlisted
                  </span>
                </div>
                <p className="text-xs font-medium text-white mb-1">
                  AI Engineer - Generative AI & Agentic Systems
                </p>
                <p className="text-[11px] text-white/60">Updated on 20 Oct 2026</p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-white/10 flex items-center justify-between bg-black/20">
              <button
                type="button"
                onClick={handleLogout}
                className="text-xs text-red-300 hover:text-red-200 font-medium flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-red-500/10 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(false)}
                className="hover-brand-gradient bg-white text-[#141010] hover:text-white font-semibold text-xs px-5 py-2.5 rounded-full transition-all cursor-pointer shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export { Navbar, Navbar as Header };
