/**
 * Netopsys AI - Cookie Consent Management Utility
 * Handles persistent user consent for Essential, Functional, Analytics, and Marketing cookies.
 */

export interface CookieConsentPreferences {
  essential: true; // Strictly necessary (always enabled)
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
  version: string;
}

export const CONSENT_STORAGE_KEY = "netopsys_cookie_consent";
export const CONSENT_VERSION = "1.0.0";
export const CONSENT_EVENT_NAME = "netopsys_cookie_consent_updated";
export const OPEN_PREFERENCES_EVENT_NAME = "netopsys_open_cookie_preferences";

/**
 * Default consent state for a new visitor (only essential is active)
 */
export const DEFAULT_CONSENT: CookieConsentPreferences = {
  essential: true,
  functional: false,
  analytics: false,
  marketing: false,
  timestamp: "",
  version: CONSENT_VERSION,
};

/**
 * Retrieve saved cookie consent preferences from localStorage
 */
export function getSavedCookieConsent(): CookieConsentPreferences | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.essential === true) {
      return parsed as CookieConsentPreferences;
    }
  } catch (err) {
    console.warn("Failed to read cookie consent from storage:", err);
  }
  return null;
}

/**
 * Save cookie consent preferences and dispatch update event
 */
export function saveCookieConsent(
  prefs: Pick<CookieConsentPreferences, "functional" | "analytics" | "marketing">
): CookieConsentPreferences {
  const fullConsent: CookieConsentPreferences = {
    essential: true,
    functional: Boolean(prefs.functional),
    analytics: Boolean(prefs.analytics),
    marketing: Boolean(prefs.marketing),
    timestamp: new Date().toISOString(),
    version: CONSENT_VERSION,
  };

  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(fullConsent));
  } catch (err) {
    console.error("Failed to persist cookie consent:", err);
  }

  // Notify the app of consent update
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(CONSENT_EVENT_NAME, { detail: fullConsent })
    );
  }

  return fullConsent;
}

/**
 * Check if the user has given consent for a specific category
 */
export function hasConsentFor(
  category: "essential" | "functional" | "analytics" | "marketing"
): boolean {
  if (category === "essential") return true;
  const consent = getSavedCookieConsent();
  if (!consent) return false;
  return Boolean(consent[category]);
}

/**
 * Trigger the Cookie Preferences modal to open from anywhere in the app
 */
export function openCookiePreferences(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(OPEN_PREFERENCES_EVENT_NAME));
  }
}

