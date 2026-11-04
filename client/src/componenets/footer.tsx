import { useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Send, Mail, Loader2 } from "lucide-react";
import netopsysLogo from "../assets/netopsys-logo.png";
import { toast } from "./toast.tsx";
import FallingToolsPhysics from "./FallingToolsPhysics.tsx";

export default function Footer() {
  const navigate = useNavigate();
  const location = useLocation();
  const footerRef = useRef<HTMLElement>(null);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [isSubmittingNewsletter, setIsSubmittingNewsletter] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = newsletterEmail.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address.", { title: "Invalid Email" });
      return;
    }

    try {
      setIsSubmittingNewsletter(true);
      const res = await fetch("/api/subscribers/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to subscribe.");
      }

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
    } catch (err: any) {
      toast.error(err.message || "Failed to subscribe. Please try again later.", {
        title: "Subscription Error",
      });
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
      className="relative w-full bg-[#000000] text-white pt-12 sm:pt-16 lg:pt-20 pb-0 select-none overflow-x-clip border-t border-white/[0.06]"
    >
      {/* Subtle ambient lighting */}
      <div className="absolute top-0 left-1/3 w-[500px] h-[300px] rounded-full bg-[#693092]/10 blur-[160px] pointer-events-none" />

      {/* 2D Physics Falling Tools spanning from the very top of the footer navigation columns all the way down to the floor */}
      <FallingToolsPhysics>
        {/* Top 5-Column Navigation Layout */}
        <div className="relative z-20 pointer-events-auto w-full max-w-[2100px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-14 2xl:px-18">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 sm:gap-6 xl:gap-8 pb-12 sm:pb-16 text-left">
            {/* Column 1: Brand Info */}
            <div className="flex flex-col items-start pr-0 lg:pr-4">
              {/* Brand Logo */}
              <a
                href="#home"
                onClick={(e) => handleSmoothScroll(e, "home")}
                className="flex items-center group cursor-pointer mb-4"
              >
                <img
                  src={netopsysLogo}
                  alt="Netopsys Logo"
                  className="h-7 sm:h-8 w-auto object-contain transition-opacity duration-200 group-hover:opacity-90"
                />
              </a>

              {/* Tagline */}
              <p className="text-[#9B94AA] text-sm sm:text-[14px] leading-relaxed max-w-[280px] mb-6 font-normal">
                Transforming businesses with cutting-edge AI and machine learning solutions.
              </p>

              {/* Social Media Circular Buttons */}
              <div className="flex items-center gap-2.5 sm:gap-3">
                {/* Facebook */}
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Netopsys on Facebook"
                  className="w-8 h-8 rounded-full border border-white/15 hover:border-white/40 bg-white/[0.02] hover:bg-white/[0.08] text-[#9CA3AF] hover:text-white flex items-center justify-center transition-all duration-200"
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
                  className="w-8 h-8 rounded-full border border-white/15 hover:border-white/40 bg-white/[0.02] hover:bg-white/[0.08] text-[#9CA3AF] hover:text-white flex items-center justify-center transition-all duration-200"
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
                  className="w-8 h-8 rounded-full border border-white/15 hover:border-white/40 bg-white/[0.02] hover:bg-white/[0.08] text-[#9CA3AF] hover:text-white flex items-center justify-center transition-all duration-200"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" />
                  </svg>
                </a>

                {/* Email (Beside LinkedIn) */}
                <a
                  href="mailto:helpdesk@netopsys.net"
                  aria-label="Email Netopsys"
                  className="w-8 h-8 rounded-full border border-white/15 hover:border-white/40 bg-white/[0.02] hover:bg-white/[0.08] text-[#9CA3AF] hover:text-white flex items-center justify-center transition-all duration-200"
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
                    href="#services"
                    onClick={(e) => handleSmoothScroll(e, "services")}
                    className="text-[#9B94AA] hover:text-white text-xs sm:text-[13.5px] md:text-[14px] transition-colors block"
                  >
                    Machine Learning
                  </a>
                </li>
                <li>
                  <a
                    href="#services"
                    onClick={(e) => handleSmoothScroll(e, "services")}
                    className="text-[#9B94AA] hover:text-white text-xs sm:text-[13.5px] md:text-[14px] transition-colors block"
                  >
                    NLP Solutions
                  </a>
                </li>
                <li>
                  <a
                    href="#services"
                    onClick={(e) => handleSmoothScroll(e, "services")}
                    className="text-[#9B94AA] hover:text-white text-xs sm:text-[13.5px] md:text-[14px] transition-colors block"
                  >
                    Computer Vision
                  </a>
                </li>
                <li>
                  <a
                    href="#services"
                    onClick={(e) => handleSmoothScroll(e, "services")}
                    className="text-[#9B94AA] hover:text-white text-xs sm:text-[13.5px] md:text-[14px] transition-colors block"
                  >
                    AI Automation
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
                    className="text-[#9B94AA] hover:text-white text-xs sm:text-[13.5px] md:text-[14px] transition-colors block"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#portfolio"
                    onClick={(e) => handleSmoothScroll(e, "portfolio")}
                    className="text-[#9B94AA] hover:text-white text-xs sm:text-[13.5px] md:text-[14px] transition-colors block"
                  >
                    Portfolio
                  </a>
                </li>
                <li>
                  <a
                    href="#about"
                    onClick={(e) => handleSmoothScroll(e, "about")}
                    className="text-[#9B94AA] hover:text-white text-xs sm:text-[13.5px] md:text-[14px] transition-colors block"
                  >
                    Technologies
                  </a>
                </li>
                <li>
                  <a
                    href="#careers"
                    onClick={(e) => handleSmoothScroll(e, "careers")}
                    className="text-[#9B94AA] hover:text-white text-xs sm:text-[13.5px] md:text-[14px] transition-colors block"
                  >
                    Careers
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 4: Resources */}
            <div>
              <h4 className="text-white font-medium text-sm sm:text-[15px] tracking-tight mb-4">
                Resources
              </h4>
              <ul className="space-y-2.5">
                <li>
                  <a
                    href="#portfolio"
                    onClick={(e) => handleSmoothScroll(e, "portfolio")}
                    className="text-[#9B94AA] hover:text-white text-xs sm:text-[13.5px] md:text-[14px] transition-colors block"
                  >
                    AI Assessment Platform
                  </a>
                </li>
                <li>
                  <a
                    href="#portfolio"
                    onClick={(e) => handleSmoothScroll(e, "portfolio")}
                    className="text-[#9B94AA] hover:text-white text-xs sm:text-[13.5px] md:text-[14px] transition-colors block"
                  >
                    ERP Solutions
                  </a>
                </li>
                <li>
                  <a
                    href="#portfolio"
                    onClick={(e) => handleSmoothScroll(e, "portfolio")}
                    className="text-[#9B94AA] hover:text-white text-xs sm:text-[13.5px] md:text-[14px] transition-colors block"
                  >
                    Recruitment Platform
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 5: Stay Connected */}
            <div className="sm:col-span-2 md:col-span-1 lg:col-span-1">
              <h4 className="text-white font-medium text-sm sm:text-[15px] tracking-tight mb-2 sm:mb-2.5">
                Stay Connected
              </h4>
              <p className="text-[#9B94AA] text-xs sm:text-[13px] leading-relaxed mb-4 max-w-[280px]">
                Get AI insights, product updates, and company news straight to your inbox.
              </p>
              <form onSubmit={handleNewsletterSubmit} className="flex items-center gap-2 max-w-sm pointer-events-auto relative z-20">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Your email address"
                  className="w-full min-w-0 bg-[#100D16] border border-white/15 focus:border-[#BE3093] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-[#6C667A] outline-none transition-colors select-text cursor-text pointer-events-auto relative z-20"
                />
                <button
                  type="submit"
                  disabled={isSubmittingNewsletter}
                  aria-label="Subscribe"
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#BE3093] hover:bg-[#a82981] disabled:opacity-60 disabled:cursor-not-allowed text-white flex items-center justify-center shrink-0 transition-colors cursor-pointer shadow-md pointer-events-auto relative z-20"
                >
                  {isSubmittingNewsletter ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <Send className="w-4 h-4 -rotate-12" />
                  )}
                </button>
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
      </FallingToolsPhysics>

      {/* Bottom Container: Divider & Legal Copyright Notice */}
      <div className="relative w-full max-w-[2100px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-14 2xl:px-18">
        {/* Horizontal Divider Line */}
        <div className="w-full h-[1px] bg-white/[0.08] mb-5 sm:mb-6 mt-1 sm:mt-2" />

        {/* Legal & Copyright Notice */}
        <div className="text-center text-[#7E7A8D] text-xs sm:text-[13px] leading-relaxed pb-8 sm:pb-10 relative">
          <p>
            © 2026 Netopsys Pte. Ltd. (Singapore) &amp; Netopsys AI Pvt. Ltd. (India). All rights reserved. Powered by{" "}
            <span className="text-[#38BDF8] hover:underline cursor-pointer">
              RSV Infotech Pte. Ltd.
            </span>
          </p>
          <p className="mt-1 text-[#666173] text-[11.5px] sm:text-[12.5px]">
            All company names, product names, and logos are trademarks of their respective owners.
          </p>
          <div className="mt-2.5 flex items-center justify-center gap-6 text-xs text-[#9B94AA]">
            <a
              href="/privacy-policy"
              onClick={(e) => {
                e.preventDefault();
                navigate("/privacy-policy");
                window.scrollTo({ top: 0, behavior: "instant" });
              }}
              className="hover:text-white transition-colors underline cursor-pointer"
            >
              Privacy Policy
            </a>
            <a
              href="/terms-conditions"
              onClick={(e) => {
                e.preventDefault();
                navigate("/terms-conditions");
                window.scrollTo({ top: 0, behavior: "instant" });
              }}
              className="hover:text-white transition-colors underline cursor-pointer"
            >
              Terms &amp; Conditions
            </a>
          </div>

        </div>
      </div>
    </footer>
  );
}

