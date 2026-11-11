import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ChevronRight,
  Cookie,
  ShieldCheck,
  BarChart3,
  Sliders,
  Globe,
  Settings,
  Layers,
  RefreshCw,
  Mail,
  ArrowRight,
  Clock,
  CheckCircle2,
} from "lucide-react";
import Navbar from "../componenets/navbar.tsx";
import Footer from "../componenets/footer.tsx";
import BackToHeroButton from "../componenets/back-to-hero.tsx";
import { openCookiePreferences } from "../utils/cookie-consent.ts";

interface CookieCategoryDetail {
  category: string;
  badge: string;
  badgeColor: string;
  cookies: string;
  provider: string;
  duration: string;
  purpose: string;
  status: string;
}

const COOKIE_DURATION_TABLE: CookieCategoryDetail[] = [
  {
    category: "Essential",
    badge: "Strictly Necessary",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    cookies: "_GRECAPTCHA, rc::a-c, netopsys_cookie_consent, netopsys_admin_token, career_user",
    provider: "Google LLC, Netopsys AI",
    duration: "_GRECAPTCHA: 6 months | Consent: 1 year | Auth: Session / 30 days",
    purpose: "Prevents automated spam on contact forms, preserves consent choices, and maintains user/admin authentication.",
    status: "Always Active",
  },
  {
    category: "Functional",
    badge: "Personalization",
    badgeColor: "bg-purple-50 text-[#693092] border-purple-200",
    cookies: "career_profile_details, display_scale_prefs",
    provider: "Netopsys AI",
    duration: "Persistent Local Storage (until cleared)",
    purpose: "Remembers display scaling calibration (100% and 150% scales) and cached candidate profile drafts.",
    status: "Optional (User Controlled)",
  },
  {
    category: "Analytics",
    badge: "Performance",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    cookies: "Aggregated performance telemetry",
    provider: "Netopsys AI",
    duration: "Session to 13 months (when consented)",
    purpose: "Measures platform latency, load speeds, and error rates using anonymized metrics. Never loaded without consent.",
    status: "Optional (Disabled by Default)",
  },
  {
    category: "Marketing",
    badge: "Campaigns",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    cookies: "None (no advertising networks deployed)",
    provider: "None",
    duration: "None",
    purpose: "Netopsys AI does not currently use advertising or retargeting cookies. Reserved strictly for future opt-in features.",
    status: "Disabled",
  },
];

interface PolicySection {
  number: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  content: string;
  highlight?: string;
  isCategoriesTable?: boolean;
}

const COOKIE_SECTIONS: PolicySection[] = [
  {
    number: "1",
    title: "What Are Cookies?",
    icon: Cookie,
    content:
      "Cookies are small text files downloaded and stored on your computer, smartphone, or tablet when you visit our website. They enable our web platform to recognize your device, maintain secure session context, prevent automated form abuse, and recall interface preferences across visits. Similar browser storage technologies, such as LocalStorage and SessionStorage, may also be utilized to securely store user settings without sending data back to servers on every network request.",
    highlight: "Device Identifiers",
  },
  {
    number: "2",
    title: "Strictly Necessary Cookies",
    icon: ShieldCheck,
    content:
      "Strictly necessary cookies and security tokens are essential for the safe and correct operation of the Netopsys AI website. In our project, these include authenticated session management (such as candidate login state and admin tokens), user consent records (netopsys_cookie_consent), and Google reCAPTCHA v2 security cookies (_GRECAPTCHA and associated session tokens rc::a, rc::b, rc::c) deployed on our contact and inquiry forms to distinguish human submissions from automated bot attacks and malicious spam. Because our platform cannot function securely without these safeguards, they are classified as Essential and do not require prior consent under applicable privacy regulations.",
    highlight: "Operational Security",
  },
  {
    number: "3",
    title: "Performance & Analytics Cookies",
    icon: BarChart3,
    content:
      "Performance and analytics cookies allow us to collect aggregated, anonymized metrics to evaluate how visitors navigate our portal, measure page loading speeds, monitor system latencies, and pinpoint technical errors. These cookies do not collect personal identifying information and are strictly consent-gated: Netopsys AI does not load optional analytics trackers or telemetry scripts until you provide explicit consent through our Cookie Consent banner or preferences dialog. If you choose 'Reject Optional' or disable the Analytics category, no analytics scripts will be executed on your browser.",
    highlight: "Aggregated Metrics",
  },
  {
    number: "4",
    title: "Functional & Preference Cookies",
    icon: Sliders,
    content:
      "Functional cookies and local storage items enable enhanced user experience capabilities. On the Netopsys AI platform, these items remember your customized display adjustments—such as display scaling calibration for standard 100% and high-DPI 150% scales—as well as active UI tab states and draft inputs on job application forms. Disabling functional cookies will not break core site navigation, but your customized preferences will reset when you refresh or revisit the portal.",
    highlight: "Personalized UX",
  },
  {
    number: "5",
    title: "Third-Party Cookies & Services",
    icon: Globe,
    content:
      "Netopsys AI integrates only essential, verified third-party technical services: (1) Google reCAPTCHA v2 (Google LLC), which places security cookies (_GRECAPTCHA) strictly to analyze hardware and interaction signals to prevent automated spam on contact forms, governed by Google's Privacy Policy and Terms of Service; and (2) Google Fonts (Google LLC), which delivers our typography without tracking cookies. Netopsys AI does not deploy third-party advertising networks, data brokers, or marketing retargeting trackers (such as Meta Pixel, Google Ads, or commercial ad networks). Any third-party integration is strictly bound by data privacy principles.",
    highlight: "Trusted Integrations",
  },
  {
    number: "6",
    title: "Managing Your Cookie Preferences",
    icon: Settings,
    content:
      "You have continuous, granular control over how cookies and tracking technologies are utilized during your visit. You can review, modify, or revoke your consent preferences at any time by clicking the 'Open Cookie Preferences' button below or the 'Cookie Settings' link available in our website footer. Additionally, you can configure your web browser (Google Chrome, Apple Safari, Mozilla Firefox, or Microsoft Edge) to block, restrict, or purge cookies via browser security settings. Please note that blocking essential cookies may disrupt form verification and authentication flows.",
    highlight: "Granular Controls",
  },
  {
    number: "7",
    title: "Cookie Categories and Duration",
    icon: Layers,
    content:
      "The table below provides a comprehensive breakdown of all cookie and local storage categories utilized by Netopsys AI, along with their specific technical purpose, provider, and lifecycle duration. Lifespans range from transient session cookies that expire when you close your browser to persistent items stored for up to 12 months to remember your consent decisions.",
    highlight: "Duration & Lifespans",
    isCategoriesTable: true,
  },
  {
    number: "8",
    title: "Updates to This Cookie Policy",
    icon: RefreshCw,
    content:
      "We may update this Cookie Policy periodically to reflect technological developments, platform updates, and evolving legal and regulatory frameworks (such as GDPR, CCPA, and Singapore PDPA). When material modifications occur, we will update the 'Last updated' date at the bottom of this document and prompt visitors for renewed consent if new categories or tracking purposes are introduced.",
    highlight: "Policy Maintenance",
  },
  {
    number: "9",
    title: "Contact Us",
    icon: Mail,
    content:
      "If you have questions, feedback, or inquiries regarding our use of cookies, tracking technologies, or data privacy safeguards, please reach out to our privacy compliance team via our contact form or official email channels. We are committed to responding promptly to all privacy inquiries.",
    highlight: "Support & Inquiries",
  },
];

export default function CookiePolicyPage() {
  useEffect(() => {
    document.title = "Cookie Policy | Netopsys AI";
  }, []);

  return (
    <div
      className="min-h-screen w-full bg-[#F5EEF8] text-[#141010] flex flex-col overflow-x-clip selection:bg-[#693092] selection:text-white"
      style={{ fontFamily: "'Onest', sans-serif" }}
    >
      {/* Floating Brand Navbar */}
      <Navbar activeTab="" />

      {/* Main Page Content */}
      <main className="relative flex-1 w-full select-none pt-24 sm:pt-28 md:pt-30 pb-14 sm:pb-20 legal-page-main">
        {/* Subtle background tech grid */}
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(#693092 1px, transparent 1px), linear-gradient(90deg, #693092 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Ambient background glows */}
        <div className="absolute top-1/6 -right-48 w-96 h-96 rounded-full bg-[#BE3093]/10 blur-[140px] pointer-events-none" />
        <div className="absolute top-1/2 -left-48 w-96 h-96 rounded-full bg-[#693092]/10 blur-[140px] pointer-events-none" />

        <div className="relative w-full max-w-[1280px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 legal-page-container">
          {/* Breadcrumb Navigation: Home > Cookie Policy */}
          <nav aria-label="Breadcrumb" className="mb-6 sm:mb-8 legal-page-breadcrumb">
            <ol className="inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-[13.5px] font-medium">
              <li>
                <Link
                  to="/"
                  className="text-[#6C6377] hover:text-[#693092] transition-colors cursor-pointer"
                >
                  Home
                </Link>
              </li>
              <li className="text-[#9C94A8] flex items-center" aria-hidden="true">
                <ChevronRight className="w-3.5 h-3.5 stroke-[2.2]" />
              </li>
              <li>
                <span className="text-[#693092] font-semibold">Cookie Policy</span>
              </li>
            </ol>
          </nav>

          {/* Header Section */}
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 legal-page-header">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#EADBFA] text-[#693092] text-xs sm:text-[13px] font-semibold shadow-xs mb-4 legal-page-badge">
              <Cookie className="w-4 h-4 text-[#BE3093]" />
              <span>Cookie Usage &amp; Tracking Technologies</span>
            </div>

            <h1 className="font-light tracking-[-0.035em] text-[#141010] text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] leading-[1.1] mb-4 sm:mb-5 legal-page-title">
              Cookie <span className="text-[#693092] font-normal">Policy</span>
            </h1>

            <p className="text-[#554E62] leading-relaxed font-normal text-sm sm:text-base md:text-[16.5px] legal-page-desc">
              Welcome to Netopsys AI. This Cookie Policy provides clear, transparent information
              about how and why we utilize cookies, local storage, and Google reCAPTCHA v2
              to secure our platform, optimize system performance, and respect your privacy choices.
            </p>
          </div>

          {/* Main Card with Structured Sections */}
          <div className="bg-white rounded-[28px] sm:rounded-[34px] border border-[#E9DFEE] shadow-[0_20px_60px_-15px_rgba(93,35,129,0.06)] overflow-hidden p-6 sm:p-10 md:p-12 lg:p-14 legal-page-card">
            <div className="space-y-8 sm:space-y-10 legal-page-sections">
              {COOKIE_SECTIONS.map((sec, index) => {
                const IconComponent = sec.icon;
                return (
                  <div
                    key={sec.number}
                    className={`relative flex flex-col md:flex-row items-start gap-4 sm:gap-6 legal-page-section-item ${
                      index !== COOKIE_SECTIONS.length - 1
                        ? "pb-8 sm:pb-10 border-b border-[#F0E6F4]"
                        : ""
                    }`}
                  >
                    {/* Number Badge & Icon */}
                    <div className="flex items-center gap-3 md:flex-col md:items-center shrink-0 legal-page-icon-col">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#F6EEFA] border border-[#EADBFA] flex items-center justify-center text-[#5D2381] shadow-xs legal-page-icon">
                        <IconComponent className="w-6 h-6 stroke-[2]" />
                      </div>
                      <span className="hidden md:inline-block text-xs font-bold text-[#8E869B] tracking-wider uppercase legal-page-sec-num">
                        Section {sec.number}
                      </span>
                    </div>

                    {/* Content Details */}
                    <div className="flex-1 w-full legal-page-section-body">
                      <div className="flex flex-wrap items-center gap-2.5 mb-2 sm:mb-2.5">
                        <h2 className="text-lg sm:text-xl md:text-[21px] font-bold tracking-tight text-[#141010] legal-page-section-title">
                          {sec.number}. {sec.title}
                        </h2>
                        {sec.highlight && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#FAF5FC] border border-[#E6D8EE] text-[#693092] text-[11px] sm:text-xs font-semibold legal-page-highlight">
                            {sec.highlight}
                          </span>
                        )}
                      </div>

                      <p className="text-sm sm:text-[15px] md:text-[15.5px] text-[#554E62] leading-relaxed font-normal legal-page-section-content mb-3">
                        {sec.content}
                      </p>

                      {/* Interactive Preferences Button in Section 6 */}
                      {sec.number === "6" && (
                        <div className="mt-4 flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => openCookiePreferences()}
                            className="site-cta-btn inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#693092] hover:bg-[#5D2381] hover-brand-gradient text-white text-xs sm:text-sm font-semibold transition-all shadow-sm hover:shadow-md cursor-pointer group"
                          >
                            <Sliders className="w-4 h-4" />
                            <span>Open Cookie Preferences</span>
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                          </button>
                        </div>
                      )}

                      {/* Section 7: Cookie Categories and Duration Breakdown Table / Grid */}
                      {sec.isCategoriesTable && (
                        <div className="mt-4 overflow-x-auto">
                          <div className="min-w-full rounded-2xl border border-[#EADBFA] overflow-hidden shadow-xs bg-[#FAF6FD]/60">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 p-3.5 sm:p-4">
                              {COOKIE_DURATION_TABLE.map((cat) => (
                                <div
                                  key={cat.category}
                                  className="bg-white rounded-xl border border-[#EADBFA]/80 p-4 flex flex-col justify-between shadow-2xs"
                                >
                                  <div>
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                      <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-[#693092]" />
                                        <h3 className="font-bold text-[#141010] text-sm sm:text-[15px]">
                                          {cat.category} Cookies
                                        </h3>
                                      </div>
                                      <span
                                        className={`px-2 py-0.5 rounded-md text-[10.5px] font-semibold border ${cat.badgeColor}`}
                                      >
                                        {cat.status}
                                      </span>
                                    </div>

                                    <p className="text-[#554E62] text-xs leading-relaxed mb-3">
                                      {cat.purpose}
                                    </p>
                                  </div>

                                  <div className="pt-2.5 border-t border-[#F0E6F4] space-y-1.5 text-[11.5px] text-[#6C6377]">
                                    <div className="flex items-start gap-1.5">
                                      <span className="font-semibold text-[#141010] shrink-0">
                                        Identifiers:
                                      </span>
                                      <span className="font-mono text-[11px] text-[#5D2381] break-all">
                                        {cat.cookies}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <Clock className="w-3.5 h-3.5 text-[#8E869B] shrink-0" />
                                      <span className="font-semibold text-[#141010] shrink-0">
                                        Lifespan:
                                      </span>
                                      <span>{cat.duration}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Interactive Contact Link for Section 9 */}
                      {sec.number === "9" && (
                        <div className="mt-4 flex items-center gap-3">
                          <Link
                            to="/contact"
                            className="site-cta-btn inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#693092] hover:bg-[#5D2381] hover-brand-gradient text-white text-xs sm:text-sm font-semibold transition-all shadow-sm hover:shadow-md cursor-pointer group"
                          >
                            <span>Open Contact Form</span>
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Metadata & Legal Links */}
            <div className="mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-[#F0E6F4] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-[#7E7A8D] legal-page-footer-meta">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-medium">Last updated: January 2026</span>
              </div>

              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <Link
                  to="/privacy-policy"
                  className="text-[#693092] hover:text-[#5D2381] font-semibold underline underline-offset-4 cursor-pointer"
                >
                  Privacy Policy
                </Link>
                <span className="text-[#D1C7DA]">•</span>
                <Link
                  to="/terms-conditions"
                  className="text-[#693092] hover:text-[#5D2381] font-semibold underline underline-offset-4 cursor-pointer"
                >
                  Terms &amp; Conditions
                </Link>
                <span className="text-[#D1C7DA]">•</span>
                <button
                  type="button"
                  onClick={() => openCookiePreferences()}
                  className="text-[#693092] hover:text-[#5D2381] font-semibold underline underline-offset-4 cursor-pointer bg-transparent border-0 p-0 text-xs sm:text-sm"
                >
                  Cookie Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Brand Footer & Floating Scroll Button */}
      <Footer />
      <BackToHeroButton />
    </div>
  );
}
