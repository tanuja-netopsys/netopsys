import { useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Send, Mail, Loader2, Check } from "lucide-react";
import netopsysLogo from "../assets/netopsys-logo.webp";
import { toast } from "./toast.tsx";
import { openCookiePreferences } from "../utils/cookie-consent.ts";
import { preloadRecaptcha, executeRecaptcha } from "../utils/recaptcha.ts";

export default function Footer() {
  const navigate = useNavigate();
  const location = useLocation();
  const footerRef = useRef<HTMLElement>(null);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [isSubmittingNewsletter, setIsSubmittingNewsletter] = useState(false);
  const [isRocketLaunching, setIsRocketLaunching] = useState(false);
  const [isSubscribedSuccess, setIsSubscribedSuccess] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = newsletterEmail.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address.", { title: "Invalid Email" });
      return;
    }

    try {
      // Trigger rocket launch animation immediately on submit
      setIsRocketLaunching(true);
      setIsSubmittingNewsletter(true);

      // Generate invisible reCAPTCHA v3 token for newsletter subscription
      const captchaToken = await executeRecaptcha("newsletter_subscribe").catch((err) => {
        console.warn("reCAPTCHA execution note:", err);
        return "";
      });

      const res = await fetch("/api/subscribers/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, captchaToken }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to subscribe.");
      }

      setIsSubscribedSuccess(true);
      if (data.alreadySubscribed) {
        toast.info(data.message || "You are already subscribed to Netopsys updates!", {
          title: "Already Subscribed",
        });
      } else {
        toast.success(data.message || "Thank you for subscribing to Netopsys updates!", {
          title: "Subscribed!",
        });
      }
      setNewsletterEmail("");
      setTimeout(() => {
        setIsRocketLaunching(false);
        setIsSubscribedSuccess(false);
      }, 2600);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to subscribe. Please try again later.";
      toast.error(message, {
        title: "Subscription Error",
      });
      setIsRocketLaunching(false);
    } finally {
      setIsSubmittingNewsletter(false);
    }
  };

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    if (targetId === "about-page" || targetId === "about") {
      if (location.pathname !== "/about") {
        navigate("/about");
      }
      window.scrollTo({ top: 0, behavior: "instant" });
      return;
    }
    if (targetId === "portfolio-page" || targetId === "portfolio") {
      if (location.pathname !== "/portfolio") {
        navigate("/portfolio");
      }
      window.scrollTo({ top: 0, behavior: "instant" });
      return;
    }
    if (targetId.startsWith("services/") || targetId === "services") {
      if (targetId === "services") {
        if (location.pathname !== "/services") {
          navigate("/services");
        }
      } else {
        navigate(`/${targetId}`);
      }
      window.scrollTo({ top: 0, behavior: "instant" });
      return;
    }
    if (
      targetId === "privacy-policy" ||
      targetId === "privacypolicy" ||
      targetId === "terms-conditions" ||
      targetId === "terms-and-conditions" ||
      targetId === "terms&conditions" ||
      targetId === "cookie-policy" ||
      targetId === "cookiepolicy"
    ) {
      if (location.pathname !== `/${targetId}`) {
        navigate(`/${targetId}`);
      }
      window.scrollTo({ top: 0, behavior: "instant" });
      return;
    }
    if (location.pathname !== "/") {
      navigate(`/#${targetId}`);
    } else {
      const elem = document.getElementById(targetId);
      if (elem) {
        elem.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <footer
      ref={footerRef}
      className="relative w-full bg-[#000000] text-white pt-12 sm:pt-16 lg:pt-20 pb-0 overflow-x-clip border-t border-white/[0.06]"
    >
      {/* Subtle ambient lighting */}
      <div className="absolute top-0 left-1/3 w-[500px] h-[300px] rounded-full bg-[#693092]/10 blur-[160px] pointer-events-none" />

      {/* Footer Main Content & Big Watermark */}
      <div className="relative w-full overflow-hidden pb-2">
        {/* Top 5-Column Navigation Layout */}
        <div className="relative z-30 pointer-events-auto select-auto w-full max-w-[2100px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-14 2xl:px-18">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-8 sm:gap-6 xl:gap-8 pb-12 sm:pb-16 text-left">
            {/* Column 1: Brand Info */}
            <div className="flex flex-col items-start pr-0 lg:pr-4">
              {/* Brand Logo */}
              <a
                href="#home"
                onClick={(e) => handleSmoothScroll(e, "home")}
                className="flex items-center group cursor-pointer mb-4 pointer-events-auto"
              >
                <img
                  src={netopsysLogo}
                  alt="Netopsys Logo"
                  width={180}
                  height={32}
                  loading="lazy"
                  decoding="async"
                  className="h-7 sm:h-8 w-auto object-contain transition-opacity duration-200 group-hover:opacity-90"
                />
              </a>

              {/* Tagline */}
              <p className="text-[#9B94AA] text-sm sm:text-[14px] leading-relaxed max-w-[280px] mb-6 font-normal">
                Transforming businesses with cutting-edge AI and machine learning solutions.
              </p>

              {/* Social Media Circular Buttons */}
              <div className="flex items-center gap-2.5 sm:gap-3 pointer-events-auto relative z-30">
                {/* Facebook */}
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Netopsys on Facebook"
                  className="w-8 h-8 rounded-full border border-white/15 hover:border-white/40 bg-white/[0.02] hover:bg-white/[0.08] text-[#9CA3AF] hover:text-white flex items-center justify-center transition-all duration-200 cursor-pointer pointer-events-auto"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>

                {/* Instagram */}
                <a
                  href="https://www.instagram.com/netopsysai.in?exln=MWplNHB1bWJpczQw"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Netopsys on Instagram"
                  className="w-8 h-8 rounded-full border border-white/15 hover:border-white/40 bg-white/[0.02] hover:bg-white/[0.08] text-[#9CA3AF] hover:text-white flex items-center justify-center transition-all duration-200 cursor-pointer pointer-events-auto"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                  </svg>
                </a>

                {/* LinkedIn */}
                <a
                  href="https://www.linkedin.com/company/netopsysai/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Netopsys on LinkedIn"
                  className="w-8 h-8 rounded-full border border-white/15 hover:border-white/40 bg-white/[0.02] hover:bg-white/[0.08] text-[#9CA3AF] hover:text-white flex items-center justify-center transition-all duration-200 cursor-pointer pointer-events-auto"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" />
                  </svg>
                </a>

                {/* Email (Beside LinkedIn) */}
                <a
                  href="mailto:connectme@netopsys.in"
                  aria-label="Email Netopsys"
                  className="w-8 h-8 rounded-full border border-white/15 hover:border-white/40 bg-white/[0.02] hover:bg-white/[0.08] text-[#9CA3AF] hover:text-white flex items-center justify-center transition-all duration-200 cursor-pointer pointer-events-auto"
                >
                  <Mail className="w-3.5 h-3.5 stroke-[1.8]" />
                </a>
              </div>
            </div>

            {/* Column 2: Services */}
            <div>
              <h4 className="text-white font-medium text-sm sm:text-[15px] tracking-tight mb-4">
                Services
              </h4>
              <ul className="space-y-2.5">
                <li>
                  <a
                    href="/services/custom-software-development"
                    onClick={(e) => handleSmoothScroll(e, "services/custom-software-development")}
                    className="text-[#9B94AA] hover:text-white text-xs sm:text-[13.5px] md:text-[14px] transition-colors block cursor-pointer pointer-events-auto"
                  >
                    Custom Software Development
                  </a>
                </li>
                <li>
                  <a
                    href="/services/web-and-mobile-applications"
                    onClick={(e) => handleSmoothScroll(e, "services/web-and-mobile-applications")}
                    className="text-[#9B94AA] hover:text-white text-xs sm:text-[13.5px] md:text-[14px] transition-colors block cursor-pointer pointer-events-auto"
                  >
                    Web & Mobile Applications
                  </a>
                </li>
                <li>
                  <a
                    href="/services/cloud-solutions"
                    onClick={(e) => handleSmoothScroll(e, "services/cloud-solutions")}
                    className="text-[#9B94AA] hover:text-white text-xs sm:text-[13.5px] md:text-[14px] transition-colors block cursor-pointer pointer-events-auto"
                  >
                    Cloud Solutions
                  </a>
                </li>
                <li>
                  <a
                    href="/services/security"
                    onClick={(e) => handleSmoothScroll(e, "services/security")}
                    className="text-[#9B94AA] hover:text-white text-xs sm:text-[13.5px] md:text-[14px] transition-colors block cursor-pointer pointer-events-auto"
                  >
                    Security
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Company */}
            <div>
              <h4 className="text-white font-medium text-sm sm:text-[15px] tracking-tight mb-4">
                Company
              </h4>
              <ul className="space-y-2.5">
                <li>
                  <a
                    href="#about"
                    onClick={(e) => handleSmoothScroll(e, "about")}
                    className="text-[#9B94AA] hover:text-white text-xs sm:text-[13.5px] md:text-[14px] transition-colors block cursor-pointer pointer-events-auto"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#portfolio"
                    onClick={(e) => handleSmoothScroll(e, "portfolio")}
                    className="text-[#9B94AA] hover:text-white text-xs sm:text-[13.5px] md:text-[14px] transition-colors block cursor-pointer pointer-events-auto"
                  >
                    Portfolio
                  </a>
                </li>
                <li>
                  <a
                    href="#team"
                    onClick={(e) => handleSmoothScroll(e, "team")}
                    className="text-[#9B94AA] hover:text-white text-xs sm:text-[13.5px] md:text-[14px] transition-colors block cursor-pointer pointer-events-auto"
                  >
                    Team
                  </a>
                </li>
                <li>
                  <a
                    href="#careers"
                    onClick={(e) => handleSmoothScroll(e, "careers")}
                    className="text-[#9B94AA] hover:text-white text-xs sm:text-[13.5px] md:text-[14px] transition-colors block cursor-pointer pointer-events-auto"
                  >
                    Careers
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 4: Legal */}
            <div>
              <h4 className="text-white font-medium text-sm sm:text-[15px] tracking-tight mb-4">
                Legal
              </h4>
              <ul className="space-y-2.5">
                <li>
                  <a
                    href="/privacy-policy"
                    onClick={(e) => handleSmoothScroll(e, "privacy-policy")}
                    className="text-[#9B94AA] hover:text-white text-xs sm:text-[13.5px] md:text-[14px] transition-colors block cursor-pointer pointer-events-auto"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="/terms-conditions"
                    onClick={(e) => handleSmoothScroll(e, "terms-conditions")}
                    className="text-[#9B94AA] hover:text-white text-xs sm:text-[13.5px] md:text-[14px] transition-colors block cursor-pointer pointer-events-auto"
                  >
                    Terms &amp; Conditions
                  </a>
                </li>
                <li>
                  <a
                    href="/cookie-policy"
                    onClick={(e) => handleSmoothScroll(e, "cookie-policy")}
                    className="text-[#9B94AA] hover:text-white text-xs sm:text-[13.5px] md:text-[14px] transition-colors block cursor-pointer pointer-events-auto"
                  >
                    Cookie Policy
                  </a>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      openCookiePreferences();
                    }}
                    className="text-[#9B94AA] hover:text-white text-xs sm:text-[13.5px] md:text-[14px] transition-colors block cursor-pointer pointer-events-auto text-left"
                  >
                    Cookie Settings
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 5: Stay Connected */}
            <div className="sm:col-span-2 md:col-span-1 lg:col-span-1 relative z-30 pointer-events-auto">
              <h4 className="text-white font-medium text-sm sm:text-[15px] tracking-tight mb-2 sm:mb-2.5">
                Stay Connected
              </h4>
              <p className="text-[#9B94AA] text-xs sm:text-[13px] leading-relaxed mb-4 max-w-[280px]">
                Get AI insights, product updates, and company news straight to your inbox.
              </p>
              <form onSubmit={handleNewsletterSubmit} className="flex items-center gap-2 max-w-sm pointer-events-auto relative z-30">
                <input
                  type="email"
                  value={newsletterEmail}
                  onFocus={() => preloadRecaptcha()}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Your email address"
                  className="w-full min-w-0 bg-[#100D16] border border-white/15 focus:border-[#BE3093] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-[#6C667A] outline-none transition-colors select-text cursor-text pointer-events-auto relative z-30 focus:ring-1 focus:ring-[#BE3093]"
                />
                <div className="relative shrink-0">
                  <button
                    type="submit"
                    disabled={isSubmittingNewsletter}
                    aria-label="Subscribe"
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#BE3093] hover:bg-[#a82981] hover-brand-gradient disabled:opacity-70 disabled:cursor-not-allowed text-white flex items-center justify-center shrink-0 transition-colors cursor-pointer shadow-md pointer-events-auto relative z-30 group"
                  >
                    {isSubscribedSuccess ? (
                      <Check className="w-4 h-4 text-emerald-300 stroke-[2.5] animate-in zoom-in-75 duration-200" />
                    ) : isSubmittingNewsletter ? (
                      <Loader2 className="w-4 h-4 animate-spin text-white/90" />
                    ) : (
                      <Send className="w-4 h-4 -rotate-12 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    )}
                  </button>

                  {/* Paper Rocket (Paper Airplane) Flight Animation moving Right & Top */}
                  {isRocketLaunching && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-50">
                      <div className="animate-paper-rocket flex items-center justify-center">
                        <div className="relative flex items-center justify-center">
                          {/* Crisp Origami Paper Rocket */}
                          <svg
                            width="28"
                            height="28"
                            viewBox="0 0 24 24"
                            fill="none"
                            className="drop-shadow-[0_2px_10px_rgba(255,255,255,0.7)]"
                          >
                            {/* Main Top Wing */}
                            <path
                              d="M 2 12 L 22 2 L 15 22 L 11 13 Z"
                              fill="#FFFFFF"
                              stroke="#FFFFFF"
                              strokeWidth="0.8"
                              strokeLinejoin="round"
                            />
                            {/* Folded Shaded Bottom Wing */}
                            <path
                              d="M 11 13 L 22 2 L 15 22 Z"
                              fill="#EADCF5"
                              stroke="#EADCF5"
                              strokeWidth="0.6"
                              strokeLinejoin="round"
                            />
                            {/* Center Paper Crease */}
                            <line
                              x1="2"
                              y1="12"
                              x2="22"
                              y2="2"
                              stroke="#C6A8E0"
                              strokeWidth="0.8"
                            />
                          </svg>

                          {/* Dotted Air Breeze Trail behind the paper rocket */}
                          <svg
                            className="absolute -bottom-3 -left-7 w-9 h-7 overflow-visible pointer-events-none opacity-85"
                            viewBox="0 0 32 24"
                            fill="none"
                          >
                            <path
                              d="M 0 22 Q 10 24 16 15 Q 22 6 32 2"
                              stroke="#FFFFFF"
                              strokeWidth="1.6"
                              strokeDasharray="2.5 3"
                              strokeLinecap="round"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Big Watermark NETOPSYS AI */}
        <div className="w-full flex justify-center items-center select-none pointer-events-none overflow-hidden -mt-10 sm:-mt-14 md:-mt-16 mb-0 px-1 sm:px-2 relative z-0">
          <div
            className="font-black uppercase text-center inline-flex items-start justify-center whitespace-nowrap select-none"
            style={{
              fontFamily: "'Onest', sans-serif",
              fontWeight: 900,
              fontStyle: "normal",
              fontSize: "16.4vw",
              lineHeight: "88%",
              letterSpacing: "0.01em",
              opacity: 0.38,
            }}
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#3d5482] to-[#141e30]">
              NETOPSYS
            </span>
            <span
              className="text-[0.32em] font-black tracking-tight ml-1 sm:ml-1.5 text-transparent bg-clip-text bg-gradient-to-b from-[#3d5482] to-[#141e30] self-start"
              style={{ transform: "translateY(-30%)" }}
            >
              AI
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Container: Divider & Legal Copyright Notice */}
      <div className="relative w-full max-w-[2100px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-14 2xl:px-18">
        {/* Horizontal Divider Line */}
        <div className="w-full h-[1px] bg-white/[0.08] mb-5 sm:mb-6 mt-1 sm:mt-2" />

        {/* Legal & Copyright Notice */}
        <div className="text-center text-[#7E7A8D] text-xs sm:text-[13px] leading-relaxed pb-8 sm:pb-10 relative">
          <p>
            © 2026 Netopsys Pte. Ltd. (Singapore) &amp; Netopsys AI Pvt. Ltd. (India). All rights reserved. Powered by{" "}
            <a
              href="https://myrsv.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#38BDF8] hover:underline cursor-pointer"
            >
              RSV Infotech Pte. Ltd.
            </a>
          </p>
          <p className="mt-1 text-[#666173] text-[11.5px] sm:text-[12.5px]">
            All company names, product names, and logos are trademarks of their respective owners.
          </p>
        </div>
      </div>
    </footer>
  );
}

