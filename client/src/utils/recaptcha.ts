/**
 * Google reCAPTCHA v3 Client Utility
 * Handles lazy/preloaded script injection and automatic invisible token generation.
 */

interface GrecaptchaInstance {
  ready: (callback: () => void) => void;
  execute: (siteKey: string, options: { action: string }) => Promise<string>;
}

interface GrecaptchaGlobal extends GrecaptchaInstance {
  enterprise?: GrecaptchaInstance;
}

declare global {
  interface Window {
    grecaptcha?: GrecaptchaGlobal;
  }
}

const SCRIPT_ID = "google-recaptcha-v3-script";
let scriptLoadPromise: Promise<void> | null = null;

function getSiteKey(): string {
  const key = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
  if (!key || typeof key !== "string" || !key.trim()) {
    throw new Error("reCAPTCHA site key is missing. Please configure VITE_RECAPTCHA_SITE_KEY.");
  }
  return key.trim();
}

function isEnterpriseMode(): boolean {
  return import.meta.env.VITE_RECAPTCHA_USE_ENTERPRISE === "true";
}

function getGrecaptchaClient(): GrecaptchaInstance | null {
  if (typeof window === "undefined" || !window.grecaptcha) return null;
  if (isEnterpriseMode() && window.grecaptcha.enterprise) {
    return window.grecaptcha.enterprise;
  }
  return window.grecaptcha;
}

/**
 * Load the Google reCAPTCHA v3 script once and wait until grecaptcha is ready.
 */
export function loadRecaptchaScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("reCAPTCHA requires a browser environment."));
  }

  const siteKey = getSiteKey();
  const existingClient = getGrecaptchaClient();
  if (existingClient && typeof existingClient.ready === "function") {
    return new Promise((resolve) => {
      existingClient.ready(() => resolve());
    });
  }

  if (scriptLoadPromise) {
    return scriptLoadPromise;
  }

  scriptLoadPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existingScript) {
      const checkReady = () => {
        const client = getGrecaptchaClient();
        if (client && typeof client.ready === "function") {
          client.ready(() => resolve());
        } else {
          setTimeout(checkReady, 50);
        }
      };
      checkReady();
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    const baseUrl = isEnterpriseMode()
      ? "https://www.google.com/recaptcha/enterprise.js"
      : "https://www.google.com/recaptcha/api.js";
    script.src = `${baseUrl}?render=${encodeURIComponent(siteKey)}`;
    script.async = true;
    script.defer = true;

    const timeoutId = window.setTimeout(() => {
      scriptLoadPromise = null;
      reject(new Error("Timed out connecting to Google reCAPTCHA service."));
    }, 12000);

    script.onload = () => {
      const client = getGrecaptchaClient();
      if (!client || typeof client.ready !== "function") {
        window.clearTimeout(timeoutId);
        scriptLoadPromise = null;
        reject(new Error("Google reCAPTCHA failed to initialize cleanly."));
        return;
      }
      client.ready(() => {
        window.clearTimeout(timeoutId);
        resolve();
      });
    };

    script.onerror = () => {
      window.clearTimeout(timeoutId);
      script.remove();
      scriptLoadPromise = null;
      reject(new Error("Unable to load Google reCAPTCHA service. Check your connection or ad blocker."));
    };

    document.head.appendChild(script);
  });

  return scriptLoadPromise;
}

/**
 * Preload reCAPTCHA v3 script silently when a form mounts.
 */
export function preloadRecaptcha(): void {
  if (typeof window === "undefined") return;
  if (!import.meta.env.VITE_RECAPTCHA_SITE_KEY) return;
  loadRecaptchaScript().catch(() => {
    // Silent preload failure; executeRecaptcha will handle and report on submit if still blocked
  });
}

/**
 * Generate a fresh reCAPTCHA v3 token automatically for the given action.
 */
export async function executeRecaptcha(action = "contact_form_submit"): Promise<string> {
  const siteKey = getSiteKey();
  await loadRecaptchaScript();

  const client = getGrecaptchaClient();
  if (!client || typeof client.execute !== "function") {
    throw new Error("reCAPTCHA client is unavailable. Please refresh the page and try again.");
  }

  return new Promise<string>((resolve, reject) => {
    client.ready(() => {
      client
        .execute(siteKey, { action })
        .then((token) => {
          if (!token || typeof token !== "string") {
            reject(new Error("Failed to obtain reCAPTCHA verification token."));
          } else {
            resolve(token);
          }
        })
        .catch((err) => {
          reject(
            err instanceof Error
              ? err
              : new Error("reCAPTCHA execution failed. Please try again.")
          );
        });
    });
  });
}

