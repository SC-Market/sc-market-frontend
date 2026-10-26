/**
 * The analytics consent choice (cookie "cookie_consent": "all" | "necessary").
 * "all" allows Google Analytics and BugSnag Performance; anything else allows
 * neither. Anonymous error reporting does not depend on it. The cookie bar
 * (components/alert/CookieConsent.tsx), Settings > Privacy and
 * public/privacy.html must agree.
 */

export const GA_TRACKING_ID = "G-KT8SEND6F2"
export const CONSENT_COOKIE = "cookie_consent"
export type ConsentChoice = "all" | "necessary"

export const CONSENT_COOKIE_OPTIONS = {
  path: "/",
  sameSite: "strict" as const,
  maxAge: 31536000, // 1 year in seconds
}

declare global {
  interface Window {
    [optOut: `ga-disable-${string}`]: boolean | undefined
  }
}

/** gtag.js's documented opt-out flag; stops collection once the script has loaded. */
export function setGoogleAnalyticsDisabled(disabled: boolean) {
  window[`ga-disable-${GA_TRACKING_ID}`] = disabled
}

/** Deletes the _ga and _ga_<id> cookies on this host and its parent domains. */
export function clearGoogleAnalyticsCookies() {
  const names = document.cookie
    .split(";")
    .map((c) => c.trim().split("=")[0])
    .filter((name) => name === "_ga" || name.startsWith("_ga_"))
  const parts = window.location.hostname.split(".")
  const domains = [""]
  for (let i = 0; i < parts.length - 1; i++) {
    domains.push(`; domain=.${parts.slice(i).join(".")}`)
  }
  for (const name of names) {
    for (const domain of domains) {
      document.cookie = `${name}=; path=/; max-age=0${domain}`
    }
  }
}

/**
 * Withdraw analytics consent: stop Google Analytics, delete its cookies, and
 * reload so BugSnag Performance (which has no stop API) is not running.
 */
export function revokeAnalytics() {
  setGoogleAnalyticsDisabled(true)
  clearGoogleAnalyticsCookies()
  window.location.reload()
}
