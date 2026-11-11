import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ChevronRight,
  Shield,
  Database,
  Lock,
  Briefcase,
  Share2,
  Cookie,
  UserCheck,
  RefreshCw,
  Mail,
  ArrowRight,
  FileText,
} from "lucide-react";
import Navbar from "../componenets/navbar.tsx";
import Footer from "../componenets/footer.tsx";
import BackToHeroButton from "../componenets/back-to-hero.tsx";

interface PolicySection {
  number: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  content: string;
  highlight?: string;
}

const PRIVACY_SECTIONS: PolicySection[] = [
  {
    number: "1",
    title: "Information We Collect",
    icon: Database,
    content:
      "We collect personal information that you voluntarily provide to us when registering on our portal, expressing interest in our services, or submitting a job application. This includes your name, email address, phone number, professional experience, resumes, certifications, and technical profile details.",
    highlight: "Collected Information",
  },
  {
    number: "2",
    title: "How We Use Your Information",
    icon: Briefcase,
    content:
      "Your information is utilized solely to deliver and optimize our services, process job applications, evaluate candidate credentials, coordinate interview schedules, and respond to your direct inquiries. We do not use your personal information for unauthorized automated decision-making.",
    highlight: "Operational Purpose",
  },
  {
    number: "3",
    title: "Data Security and Safeguards",
    icon: Lock,
    content:
      "We implement industry-standard administrative, physical, and technical security safeguards—including TLS/SSL data transmission encryption, secured cloud storage, and restricted role-based internal access controls—to protect your personal information against unauthorized access, loss, or disclosure.",
    highlight: "Robust Encryption",
  },
  {
    number: "4",
    title: "Candidate & Applicant Data",
    icon: UserCheck,
    content:
      "All candidate data, including employment history and certification documents, is stored securely and processed strictly for recruitment evaluation and background verification purposes. Candidate information is retained only as long as necessary to fulfill hiring processes or legal requirements.",
    highlight: "Recruitment Privacy",
  },
  {
    number: "5",
    title: "Third-Party Sharing & Disclosure",
    icon: Share2,
    content:
      "Netopsys does not sell, rent, or trade your personal data to advertisers or third parties. We may disclose your information only to trusted service partners (such as secure cloud hosting and verification services) bound by stringent confidentiality agreements, or when required by legal mandate.",
    highlight: "No Data Monetization",
  },
  {
    number: "6",
    title: "Cookies and Tracking Technologies",
    icon: Cookie,
    content:
      "Our website utilizes essential session cookies to authenticate administrators and candidates, remember security preferences, and analyze anonymized site traffic performance. You may configure your browser to decline cookies, though certain interactive features may have limited functionality.",
    highlight: "Cookie Controls",
  },
  {
    number: "7",
    title: "Your Rights and Choices",
    icon: Shield,
    content:
      "You have the right to request access to the personal data we hold about you, request corrections to inaccurate records, or request the deletion of your account and submitted application details. You can exercise these rights at any time by contacting our data protection team.",
    highlight: "User Rights",
  },
  {
    number: "8",
    title: "Modifications to This Policy",
    icon: RefreshCw,
    content:
      "We reserve the right to revise this Privacy Policy periodically to align with evolving regulatory frameworks and technology enhancements. The 'Last Updated' date at the bottom of this page reflects the most recent revision.",
    highlight: "Policy Revisions",
  },
  {
    number: "9",
    title: "Contact Us",
    icon: Mail,
    content:
      "If you have questions, concerns, or requests regarding this Privacy Policy or how your personal information is managed, please contact our team through our website contact form or email our support desk.",
    highlight: "Support & Inquiries",
  },
];

export default function PrivacyPolicyPage() {
  useEffect(() => {
    document.title = "Privacy Policy | Netopsys AI";
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
          {/* Breadcrumb Navigation: Home > Privacy Policy */}
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
                <span className="text-[#693092] font-semibold">Privacy Policy</span>
              </li>
            </ol>
          </nav>

          {/* Header Section */}
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 legal-page-header">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#EADBFA] text-[#693092] text-xs sm:text-[13px] font-semibold shadow-xs mb-4 legal-page-badge">
              <FileText className="w-4 h-4 text-[#BE3093]" />
              <span>Data Protection &amp; Transparency</span>
            </div>

            <h1 className="font-light tracking-[-0.035em] text-[#141010] text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] leading-[1.1] mb-4 sm:mb-5 legal-page-title">
              Privacy <span className="text-[#693092] font-normal">Policy</span>
            </h1>

            <p className="text-[#554E62] leading-relaxed font-normal text-sm sm:text-base md:text-[16.5px] legal-page-desc">
              Welcome to Netopsys. We respect your privacy and are committed to safeguarding
              your personal data. This policy details how we collect, protect, and manage your information.
            </p>
          </div>

          {/* Main Card with Structured Sections */}
          <div className="bg-white rounded-[28px] sm:rounded-[34px] border border-[#E9DFEE] shadow-[0_20px_60px_-15px_rgba(93,35,129,0.06)] overflow-hidden p-6 sm:p-10 md:p-12 lg:p-14 legal-page-card">
            <div className="space-y-8 sm:space-y-10 legal-page-sections">
              {PRIVACY_SECTIONS.map((sec, index) => {
                const IconComponent = sec.icon;
                return (
                  <div
                    key={sec.number}
                    className={`relative flex flex-col md:flex-row items-start gap-4 sm:gap-6 legal-page-section-item ${
                      index !== PRIVACY_SECTIONS.length - 1
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

            {/* Bottom Metadata & Terms Link */}
            <div className="mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-[#F0E6F4] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-[#7E7A8D] legal-page-footer-meta">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-medium">Last updated: January 2026</span>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  to="/terms&conditions"
                  className="text-[#693092] hover:text-[#5D2381] font-semibold underline underline-offset-4 cursor-pointer"
                >
                  Terms &amp; Conditions
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

