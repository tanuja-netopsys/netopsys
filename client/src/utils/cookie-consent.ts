/**
 * Netopsys AI - Cookie Consent Management Utility
 * Handles persistent user consent for Essential, Functional, Analytics, and Marketing cookies
 * using localStorage + a persistent browser cookie with a 6-month (180-day) expiry window.
 */

export interface CookieConsentPreferences {
  essential: true; // Strictly necessary (always enabled)
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
  expiresAt: string;
  version: string;
}

export const CONSENT_STORAGE_KEY = "netopsys_cookie_consent";
export const CONSENT_VERSION = "1.0.0";
export const CONSENT_DURATION_DAYS = 180; // ~6 months
export const CONSENT_DURATION_SECONDS = CONSENT_DURATION_DAYS * 24 * 60 * 60;
export const CONSENT_DURATION_MS = CONSENT_DURATION_SECONDS * 1000;
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
  expiresAt: "",
  version: CONSENT_VERSION,
};

function readCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null;
  try {
    const cookies = document.cookie ? document.cookie.split("; ") : [];
    const prefix = `${name}=`;
    for (const entry of cookies) {
      if (entry.startsWith(prefix)) {
        return decodeURIComponent(entry.slice(prefix.length));
      }
    }
  } catch {
    // Ignore cookie read errors in restricted environments
  }
  return null;
}

function writeCookieValue(name: string, value: string, maxAgeSeconds: number): void {
  if (typeof document === "undefined") return;
  try {
    const expiresDate = new Date(Date.now() + maxAgeSeconds * 1000).toUTCString();
    const secureAttr =
      typeof window !== "undefined" && window.location?.protocol === "https:"
        ? "; Secure"
        : "";
    document.cookie = `${name}=${encodeURIComponent(
      value
    )}; Max-Age=${Math.max(0, Math.floor(maxAgeSeconds))}; Expires=${expiresDate}; Path=/; SameSite=Lax${secureAttr}`;
  } catch {
    // Ignore cookie write errors in restricted environments
  }
}

export function clearCookieConsent(): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(CONSENT_STORAGE_KEY);
    } catch {
      // Ignore storage access errors
    }
  }
  if (typeof document !== "undefined") {
    try {
      const secureAttr =
        typeof window !== "undefined" && window.location?.protocol === "https:"
          ? "; Secure"
          : "";
      document.cookie = `${CONSENT_STORAGE_KEY}=; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/; SameSite=Lax${secureAttr}`;
    } catch {
      // Ignore cookie errors
    }
  }
}

function parseAndValidateConsent(raw: string | null): CookieConsentPreferences | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<CookieConsentPreferences> | null;
    if (
      !parsed ||
      typeof parsed !== "object" ||
      parsed.essential !== true ||
      typeof parsed.functional !== "boolean" ||
      typeof parsed.analytics !== "boolean" ||
      typeof parsed.marketing !== "boolean" ||
      parsed.version !== CONSENT_VERSION
    ) {
      return null;
    }

    const now = Date.now();
    const createdMs = parsed.timestamp ? Date.parse(parsed.timestamp) : NaN;
    const explicitExpiresMs = parsed.expiresAt ? Date.parse(parsed.expiresAt) : NaN;

    const expiryMs = Number.isFinite(explicitExpiresMs)
      ? explicitExpiresMs
      : Number.isFinite(createdMs)
      ? createdMs + CONSENT_DURATION_MS
      : NaN;

    if (!Number.isFinite(expiryMs) || now >= expiryMs) {
      return null;
    }

    return {
      essential: true,
      functional: parsed.functional,
      analytics: parsed.analytics,
      marketing: parsed.marketing,
      timestamp: Number.isFinite(createdMs)
        ? new Date(createdMs).toISOString()
        : new Date(expiryMs - CONSENT_DURATION_MS).toISOString(),
      expiresAt: new Date(expiryMs).toISOString(),
      version: CONSENT_VERSION,
    };
  } catch {
    return null;
  }
}

/**
 * Retrieve valid, non-expired cookie consent preferences from persistent storage.
 * Returns null if no consent exists, consent is corrupted, or consent has expired (> 6 months).
 */
export function getSavedCookieConsent(): CookieConsentPreferences | null {
  if (typeof window === "undefined") return null;

  let localStorageReadable = false;
  let localRaw: string | null = null;

  try {
    localRaw = localStorage.getItem(CONSENT_STORAGE_KEY);
    localStorageReadable = true;
  } catch (err) {
    console.warn("Failed to read cookie consent from localStorage:", err);
  }

  if (localStorageReadable) {
    if (!localRaw) {
      // No saved consent in localStorage (first visit or explicitly cleared) -> keep cookie aligned
      if (readCookieValue(CONSENT_STORAGE_KEY)) {
        clearCookieConsent();
      }
      return null;
    }

    const validated = parseAndValidateConsent(localRaw);
    if (!validated) {
      // Expired or malformed record -> clear both stores so popup shows cleanly
      clearCookieConsent();
      return null;
    }

    // Keep persistent browser cookie synced if missing
    if (!readCookieValue(CONSENT_STORAGE_KEY)) {
      const remainingSeconds = Math.max(
        1,
        Math.floor((Date.parse(validated.expiresAt) - Date.now()) / 1000)
      );
      writeCookieValue(CONSENT_STORAGE_KEY, JSON.stringify(validated), remainingSeconds);
    }

    return validated;
  }

  // Fallback when localStorage is blocked/disabled: read persistent browser cookie
  const cookieRaw = readCookieValue(CONSENT_STORAGE_KEY);
  const validatedCookie = parseAndValidateConsent(cookieRaw);
  if (!validatedCookie && cookieRaw) {
    clearCookieConsent();
  }
  return validatedCookie;
}

/**
 * Save cookie consent preferences persistently (localStorage + browser cookie, 6 months)
 * and dispatch update event.
 */
export function saveCookieConsent(
  prefs: Pick<CookieConsentPreferences, "functional" | "analytics" | "marketing">
): CookieConsentPreferences {
  const nowMs = Date.now();
  const fullConsent: CookieConsentPreferences = {
    essential: true,
    functional: Boolean(prefs.functional),
    analytics: Boolean(prefs.analytics),
    marketing: Boolean(prefs.marketing),
    timestamp: new Date(nowMs).toISOString(),
    expiresAt: new Date(nowMs + CONSENT_DURATION_MS).toISOString(),
    version: CONSENT_VERSION,
  };

  const serialized = JSON.stringify(fullConsent);

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, serialized);
    } catch (err) {
      console.error("Failed to persist cookie consent in localStorage:", err);
    }
  }

  writeCookieValue(CONSENT_STORAGE_KEY, serialized, CONSENT_DURATION_SECONDS);

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(CONSENT_EVENT_NAME, { detail: fullConsent })
    );
  }

  return fullConsent;
}

/**
 * Check if the user has given valid, non-expired consent for a specific category.
 * Essential cookies are always enabled.
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
