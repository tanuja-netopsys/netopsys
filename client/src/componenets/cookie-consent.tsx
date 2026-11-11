import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Cookie,
  ShieldCheck,
  Sliders,
  BarChart3,
  Megaphone,
  X,
  ChevronRight,
  Info,
} from "lucide-react";
import {
  CONSENT_EVENT_NAME,
  CONSENT_STORAGE_KEY,
  getSavedCookieConsent,
  saveCookieConsent,
  OPEN_PREFERENCES_EVENT_NAME,
} from "../utils/cookie-consent.ts";

export default function CookieConsent() {
  const [hasCheckedConsent, setHasCheckedConsent] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Preference state within the modal
  const [functional, setFunctional] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const syncConsentState = () => {
      const saved = getSavedCookieConsent();
      if (!saved) {
        setFunctional(false);
        setAnalytics(false);
        setMarketing(false);
        setShowBanner(true);
      } else {
        setFunctional(saved.functional);
        setAnalytics(saved.analytics);
        setMarketing(saved.marketing);
        setShowBanner(false);
      }
      setHasCheckedConsent(true);
    };

    syncConsentState();

    // Listen for custom trigger to open preferences modal (e.g. from footer or policy page)
    const handleOpenModal = () => {
      const current = getSavedCookieConsent();
      if (current) {
        setFunctional(current.functional);
        setAnalytics(current.analytics);
        setMarketing(current.marketing);
      } else {
        setFunctional(false);
        setAnalytics(false);
        setMarketing(false);
      }
      setShowModal(true);
    };

    // Sync across tabs when localStorage is modified or cleared
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === null || e.key === CONSENT_STORAGE_KEY) {
        syncConsentState();
      }
    };

    window.addEventListener(OPEN_PREFERENCES_EVENT_NAME, handleOpenModal);
    window.addEventListener(CONSENT_EVENT_NAME, syncConsentState);
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener(OPEN_PREFERENCES_EVENT_NAME, handleOpenModal);
      window.removeEventListener(CONSENT_EVENT_NAME, syncConsentState);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleAcceptAll = () => {
    saveCookieConsent({
      functional: true,
      analytics: true,
      marketing: true,
    });
    setFunctional(true);
    setAnalytics(true);
    setMarketing(true);
    setShowBanner(false);
    setShowModal(false);
  };

  const handleRejectOptional = () => {
    saveCookieConsent({
      functional: false,
      analytics: false,
      marketing: false,
    });
    setFunctional(false);
    setAnalytics(false);
    setMarketing(false);
    setShowBanner(false);
    setShowModal(false);
  };

  const handleSavePreferences = () => {
    saveCookieConsent({
      functional,
      analytics,
      marketing,
    });
    setShowBanner(false);
    setShowModal(false);
  };

  const handleOpenCustomize = () => {
    const current = getSavedCookieConsent();
    if (current) {
      setFunctional(current.functional);
      setAnalytics(current.analytics);
      setMarketing(current.marketing);
    } else {
      setFunctional(false);
      setAnalytics(false);
      setMarketing(false);
    }
    setShowModal(true);
  };

  if (!hasCheckedConsent) return null;

  return (
    <>
      {/* 1. Floating Cookie Consent Banner (Only shown to first-time visitors before decision) */}
      {showBanner && !showModal && (
        <aside
          aria-label="Cookie consent banner"
          className="fixed bottom-3 sm:bottom-5 inset-x-3 sm:inset-x-5 md:inset-x-auto md:right-6 md:max-w-[580px] lg:max-w-[620px] max-h-[calc(100dvh-1.5rem)] overflow-y-auto z-[9990] bg-[#120D1B]/95 backdrop-blur-md border border-[#693092]/30 text-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.55),0_0_30px_rgba(105,48,146,0.18)] transition-all duration-300 animate-in fade-in slide-in-from-bottom-6"
          style={{ fontFamily: "'Onest', sans-serif" }}
        >
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#693092]/20 border border-[#BE3093]/30 flex items-center justify-center text-[#BE3093] shrink-0 mt-0.5">
              <Cookie className="w-4.5 h-4.5 sm:w-6 sm:h-6 stroke-[2]" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <h3 className="text-white font-semibold text-sm sm:text-base tracking-tight">
                  Cookie &amp; Privacy Choices
                </h3>
              </div>

              <p className="text-[#A79FB6] text-xs sm:text-[13px] leading-relaxed mb-3.5 sm:mb-4">
                We use essential cookies to maintain platform security, session authentication,
                and Google reCAPTCHA v2 bot protection. Optional functional, analytics, and
                marketing cookies are only activated with your consent. Learn more in our{" "}
                <Link
                  to="/cookie-policy"
                  className="text-[#BE3093] hover:text-[#d942ab] font-medium underline underline-offset-2 transition-colors"
                >
                  Cookie Policy
                </Link>
                .
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="min-h-[40px] px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#693092] to-[#BE3093] hover:from-[#58277c] hover:to-[#a82981] text-white text-xs sm:text-[13px] font-semibold transition-all shadow-md cursor-pointer hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]"
                >
                  Accept All
                </button>

                <button
                  type="button"
                  onClick={handleRejectOptional}
                  className="min-h-[40px] px-3.5 py-2 sm:py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-[#E2DCED] hover:text-white text-xs sm:text-[13px] font-medium transition-colors cursor-pointer"
                >
                  Reject Optional
                </button>

                <button
                  type="button"
                  onClick={handleOpenCustomize}
                  className="min-h-[40px] px-3 py-2 sm:py-2.5 rounded-xl text-[#BE3093] hover:text-[#d942ab] hover:bg-[#BE3093]/10 text-xs sm:text-[13px] font-medium transition-colors cursor-pointer inline-flex items-center gap-1"
                >
                  <span>Customize Preferences</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* 2. Detailed Cookie Preferences Modal (Accessible via Banner, Footer, or Cookie Policy page) */}
      {showModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-preferences-title"
          className="fixed inset-0 z-[10000] bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-200"
          style={{ fontFamily: "'Onest', sans-serif" }}
        >
          <div className="relative w-full max-w-2xl bg-[#120D1B] border border-[#693092]/40 rounded-2xl sm:rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_40px_rgba(105,48,146,0.22)] overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-white/[0.08] flex items-center justify-between gap-4 bg-[#161022]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#693092]/25 border border-[#BE3093]/40 flex items-center justify-center text-[#BE3093]">
                  <Sliders className="w-5 h-5 stroke-[2]" />
                </div>
                <div>
                  <h2
                    id="cookie-preferences-title"
                    className="text-white text-lg sm:text-xl font-bold tracking-tight"
                  >
                    Cookie Preferences
                  </h2>
                  <p className="text-[#A79FB6] text-xs sm:text-[13px]">
                    Customize how cookies and storage technologies are used on your device.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                aria-label="Close preferences"
                className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/[0.12] text-[#9CA3AF] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body: Scrollable list of categories */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-[13.5px]">
              {/* Category 1: Essential Cookies (Strictly Necessary) */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08]">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-semibold text-white text-sm sm:text-[15px]">
                      Essential Cookies
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    Always Active
                  </span>
                </div>
                <p className="text-[#A79FB6] text-xs sm:text-[13px] leading-relaxed mb-2.5">
                  Strictly necessary for security, core navigation, authentication (admin and candidate login),
                  and form protection via Google reCAPTCHA v2. These cookies cannot be turned off.
                </p>
                <div className="flex flex-wrap gap-1.5 text-[11px] text-[#C9BFD7]">
                  <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/10">
                    Google reCAPTCHA v2 (_GRECAPTCHA)
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/10">
                    Session &amp; Auth Tokens
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/10">
                    Consent State
                  </span>
                </div>
              </div>

              {/* Category 2: Functional Cookies */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08]">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <Sliders className="w-4 h-4 text-[#BE3093] shrink-0" />
                    <span className="font-semibold text-white text-sm sm:text-[15px]">
                      Functional Cookies
                    </span>
                  </div>
                  {/* Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={functional}
                      onChange={(e) => setFunctional(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#BE3093]" />
                  </label>
                </div>
                <p className="text-[#A79FB6] text-xs sm:text-[13px] leading-relaxed">
                  Remember your personalized interface choices, display scaling adjustments
                  (calibrated for 100% and 150% scales), and saved application form drafts.
                </p>
              </div>

              {/* Category 3: Analytics Cookies */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08]">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <BarChart3 className="w-4 h-4 text-[#BE3093] shrink-0" />
                    <span className="font-semibold text-white text-sm sm:text-[15px]">
                      Performance &amp; Analytics Cookies
                    </span>
                  </div>
                  {/* Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={analytics}
                      onChange={(e) => setAnalytics(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#BE3093]" />
                  </label>
                </div>
                <p className="text-[#A79FB6] text-xs sm:text-[13px] leading-relaxed">
                  Help us understand how visitors interact with our website through aggregated,
                  anonymized metrics such as load speed and page popularity. Disabled by default until you grant consent.
                </p>
              </div>

              {/* Category 4: Marketing Cookies */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08]">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <Megaphone className="w-4 h-4 text-[#BE3093] shrink-0" />
                    <span className="font-semibold text-white text-sm sm:text-[15px]">
                      Marketing Cookies
                    </span>
                  </div>
                  {/* Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={marketing}
                      onChange={(e) => setMarketing(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#BE3093]" />
                  </label>
                </div>
                <p className="text-[#A79FB6] text-xs sm:text-[13px] leading-relaxed">
                  Used for tailored communications and campaigns. Netopsys AI does not currently use
                  third-party ad networks or retargeting pixels; keeping this disabled ensures any future
                  promotional integrations remain strictly opt-in.
                </p>
              </div>

              {/* Informational Note */}
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#693092]/10 border border-[#BE3093]/20 text-[#C9BFD7] text-xs">
                <Info className="w-4 h-4 text-[#BE3093] shrink-0 mt-0.5" />
                <span>
                  You can update your cookie preferences at any time by clicking the{" "}
                  <strong>Cookie Settings</strong> link located in our website footer or on our{" "}
                  <Link
                    to="/cookie-policy"
                    onClick={() => setShowModal(false)}
                    className="text-[#BE3093] hover:underline"
                  >
                    Cookie Policy page
                  </Link>
                  .
                </span>
              </div>
            </div>

            {/* Modal Footer: Action Buttons */}
            <div className="p-4 sm:p-5 border-t border-white/[0.08] bg-[#161022] flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleRejectOptional}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-[#E2DCED] hover:text-white text-xs sm:text-[13px] font-medium transition-colors cursor-pointer text-center"
              >
                Reject Optional
              </button>

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={handleSavePreferences}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-[13px] font-semibold transition-colors cursor-pointer"
                >
                  Save Preferences
                </button>

                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#693092] to-[#BE3093] hover:from-[#58277c] hover:to-[#a82981] text-white text-xs sm:text-[13px] font-semibold transition-all shadow-md cursor-pointer hover:shadow-lg"
                >
                  Accept All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
