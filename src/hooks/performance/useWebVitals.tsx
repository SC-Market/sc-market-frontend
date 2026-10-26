import { useEffect } from "react"
import type {
  CLSMetricWithAttribution,
  FCPMetricWithAttribution,
  INPMetricWithAttribution,
  LCPMetricWithAttribution,
  TTFBMetricWithAttribution,
} from "web-vitals/attribution"
import { CONSENT_COOKIE } from "../../util/consent/analyticsConsent"

/**
 * Tracks Core Web Vitals (LCP, INP, CLS, plus FCP and TTFB) and sends them to
 * Google Analytics 4 with their attribution, so field data shows WHAT is slow:
 * the element that shifted the most (CLS), the element and phase of the
 * slowest interaction (INP), and the LCP element and its load phases.
 *
 * Consent: analytics only. Nothing is measured or loaded unless the visitor
 * chose "Accept" (cookie_consent=all) before the page loaded, and each send
 * re-checks the choice and that GA is running. The data is timings and CSS
 * selectors of page elements (e.g. "main>div.MuiCard-root"); no text, values
 * or identifiers. Described in public/privacy.html (Analytics).
 */

type AttributedMetric =
  | CLSMetricWithAttribution
  | FCPMetricWithAttribution
  | INPMetricWithAttribution
  | LCPMetricWithAttribution
  | TTFBMetricWithAttribution

type Gtag = (
  command: "event",
  name: string,
  params: Record<string, string | number | boolean>,
) => void

const isDevelopment = (): boolean => {
  try {
    return import.meta.env.DEV === true
  } catch {
    return false
  }
}

function analyticsConsented(): boolean {
  return document.cookie
    .split(";")
    .some((c) => c.trim() === `${CONSENT_COOKIE}=all`)
}

/** GA4 caps string parameter values at 100 characters. */
const param = (value: string | undefined): string => (value ?? "").slice(0, 100)

const ms = (value: number | undefined): number => Math.round(value ?? 0)

/** The attribution fields sent for each metric (flat GA event params). */
export function attributionParams(
  metric: AttributedMetric,
): Record<string, string | number> {
  switch (metric.name) {
    case "CLS": {
      const a = metric.attribution
      return {
        debug_target: param(a.largestShiftTarget),
        debug_time: ms(a.largestShiftTime),
        debug_shift_value: Math.round((a.largestShiftValue ?? 0) * 1000),
        debug_load_state: param(a.loadState),
      }
    }
    case "INP": {
      const a = metric.attribution
      return {
        debug_target: param(a.interactionTarget),
        debug_event: param(a.interactionType),
        debug_input_delay: ms(a.inputDelay),
        debug_processing: ms(a.processingDuration),
        debug_presentation: ms(a.presentationDelay),
        debug_load_state: param(a.loadState),
      }
    }
    case "LCP": {
      const a = metric.attribution
      return {
        debug_target: param(a.element),
        // Path only: no query string (could carry tokens on CDN URLs)
        debug_url: param(a.url ? a.url.split("?")[0] : ""),
        debug_ttfb: ms(a.timeToFirstByte),
        debug_load_delay: ms(a.resourceLoadDelay),
        debug_load_time: ms(a.resourceLoadDuration),
        debug_render_delay: ms(a.elementRenderDelay),
      }
    }
    default:
      return {}
  }
}

function sendToAnalytics(metric: AttributedMetric) {
  const gtag = (window as Window & { gtag?: Gtag }).gtag
  if (gtag && analyticsConsented()) {
    try {
      gtag("event", metric.name, {
        event_category: "Web Vitals",
        event_label: metric.id,
        // CLS is a decimal; scale it so GA's integer value keeps precision
        value: Math.round(
          metric.name === "CLS" ? metric.value * 1000 : metric.value,
        ),
        non_interaction: true,
        metric_id: metric.id,
        metric_value: metric.value,
        metric_delta: metric.delta,
        metric_rating: metric.rating,
        ...attributionParams(metric),
      })
    } catch (error) {
      if (isDevelopment()) {
        console.warn("[Web Vitals] Failed to send to analytics:", error)
      }
    }
  }

  if (isDevelopment()) {
    console.log("[Web Vitals]", metric.name, metric.value, metric.attribution)
  }
}

export function useWebVitals() {
  useEffect(() => {
    // No analytics consent, no measurement: the attribution build is not even
    // downloaded. (A visitor who accepts mid-visit is measured from their next
    // page load, like GA's own page views.)
    if (!analyticsConsented() && !isDevelopment()) return

    let cancelled = false
    import("web-vitals/attribution")
      .then(({ onCLS, onINP, onLCP, onFCP, onTTFB }) => {
        if (cancelled) return
        // The observers are buffered, so starting after load misses nothing.
        onCLS(sendToAnalytics)
        onINP(sendToAnalytics)
        onLCP(sendToAnalytics)
        onFCP(sendToAnalytics)
        onTTFB(sendToAnalytics)
      })
      .catch(() => {
        // Optional instrumentation: a failed (e.g. stale) chunk is ignored.
      })
    return () => {
      cancelled = true
    }
  }, [])
}
