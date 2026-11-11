import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ChevronRight,
  ShieldCheck,
  FileText,
  UserCheck,
  Briefcase,
  Lock,
  Award,
  CheckCircle2,
  RefreshCw,
  Mail,
  ArrowRight,
} from "lucide-react";
import Navbar from "../componenets/navbar.tsx";
import Footer from "../componenets/footer.tsx";
import BackToHeroButton from "../componenets/back-to-hero.tsx";

interface TermSection {
  number: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  content: string;
  highlight?: string;
}

const TERMS_SECTIONS: TermSection[] = [
  {
    number: "1",
    title: "Acceptance of Terms",
    icon: ShieldCheck,
    content:
      "By creating an account and using our career portal, you agree to these Terms and Conditions. If you do not agree to these terms, please do not use our services.",
    highlight: "Binding Agreement",
  },
  {
    number: "2",
    title: "User Registration",
    icon: UserCheck,
    content:
      "When you register for an account, you agree to provide accurate, current, and complete information. You are responsible for maintaining the confidentiality of your account credentials.",
    highlight: "Account Security",
  },
  {
    number: "3",
    title: "Job Applications",
    icon: Briefcase,
    content:
      "By submitting a job application through our portal, you confirm that all information provided is accurate and truthful. We reserve the right to verify any information provided and to reject applications containing false information.",
    highlight: "Application Integrity",
  },
  {
    number: "4",
    title: "Privacy and Data Protection",
    icon: Lock,
    content:
      "Your personal information will be handled in accordance with our Privacy Policy. We collect and process your data solely for the purpose of evaluating your job application and managing your account.",
    highlight: "Data Confidentiality",
  },
  {
    number: "5",
    title: "Intellectual Property",
    icon: Award,
    content:
      "All content on this website, including text, graphics, logos, and software, is the property of Netopsys and is protected by intellectual property laws.",
    highlight: "Proprietary Rights",
  },
  {
    number: "6",
    title: "Background Verification",
    icon: CheckCircle2,
    content:
      "By providing certification and work experience details, you consent to background verification of the provided information. Certificate numbers may be used to verify authenticity.",
    highlight: "Verification Consent",
  },
  {
    number: "7",
    title: "Modifications",
    icon: RefreshCw,
    content:
      "We reserve the right to modify these terms at any time. Continued use of our services after any modifications constitutes acceptance of the updated terms.",
    highlight: "Terms Updates",
  },
  {
    number: "8",
    title: "Contact",
    icon: Mail,
    content:
      "If you have any questions about these Terms and Conditions, please contact us through our website contact form.",
    highlight: "Support & Inquiries",
  },
];

export default function TermsAndConditionsPage() {
  useEffect(() => {
    document.title = "Terms & Conditions | Netopsys AI";
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
          {/* Breadcrumb Navigation: Home > Terms & Conditions */}
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
                <span className="text-[#693092] font-semibold">Terms &amp; Conditions</span>
              </li>
            </ol>
          </nav>

          {/* Header Section */}
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 legal-page-header">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#EADBFA] text-[#693092] text-xs sm:text-[13px] font-semibold shadow-xs mb-4 legal-page-badge">
              <FileText className="w-4 h-4 text-[#BE3093]" />
              <span>Legal Agreement &amp; Compliance</span>
            </div>

            <h1 className="font-light tracking-[-0.035em] text-[#141010] text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] leading-[1.1] mb-4 sm:mb-5 legal-page-title">
              Terms and <span className="text-[#693092] font-normal">Conditions</span>
            </h1>

            <p className="text-[#554E62] leading-relaxed font-normal text-sm sm:text-base md:text-[16.5px] legal-page-desc">
              Welcome to Netopsys. By accessing and using our website and services, you agree
              to be bound by the following terms and conditions.
            </p>
          </div>

          {/* Main Card with Structured Sections */}
          <div className="bg-white rounded-[28px] sm:rounded-[34px] border border-[#E9DFEE] shadow-[0_20px_60px_-15px_rgba(93,35,129,0.06)] overflow-hidden p-6 sm:p-10 md:p-12 lg:p-14 legal-page-card">
            <div className="space-y-8 sm:space-y-10 legal-page-sections">
              {TERMS_SECTIONS.map((sec, index) => {
                const IconComponent = sec.icon;
                return (
                  <div
                    key={sec.number}
                    className={`relative flex flex-col md:flex-row items-start gap-4 sm:gap-6 legal-page-section-item ${
                      index !== TERMS_SECTIONS.length - 1
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
                    <div className="flex-1 legal-page-section-body">
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

                      <p className="text-sm sm:text-[15px] md:text-[15.5px] text-[#554E62] leading-relaxed font-normal legal-page-section-content">
                        {sec.content}
                      </p>

                      {/* Interactive Contact Link for Section 8 */}
                      {sec.number === "8" && (
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

            {/* Bottom Metadata & Privacy Policy Link */}
            <div className="mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-[#F0E6F4] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-[#7E7A8D] legal-page-footer-meta">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-medium">Last updated: January 2026</span>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  to="/privacy-policy"
                  className="text-[#693092] hover:text-[#5D2381] font-semibold underline underline-offset-4 cursor-pointer"
                >
                  Privacy Policy
                </Link>
                <span className="text-[#D1C7DA]">•</span>
                <Link
                  to="/cookie-policy"
                  className="text-[#693092] hover:text-[#5D2381] font-semibold underline underline-offset-4 cursor-pointer"
                >
                  Cookie Policy
                </Link>
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

