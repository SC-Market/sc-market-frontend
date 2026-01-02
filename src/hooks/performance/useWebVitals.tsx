import { useEffect } from "react"
import { onCLS, onFID, onLCP, onFCP, onTTFB, onINP, Metric } from "web-vitals"

/**
 * Hook to track Core Web Vitals and send them to analytics
 *
 * Tracks:
 * - LCP (Largest Contentful Paint) - measures loading performance
 * - FID (First Input Delay) / INP (Interaction to Next Paint) - measures interactivity
 * - CLS (Cumulative Layout Shift) - measures visual stability
 * - FCP (First Contentful Paint) - measures initial render
 * - TTFB (Time to First Byte) - measures server response time
 *
 * Metrics are sent to Google Analytics 4 if available, and logged in development.
 * Core Web Vitals are performance metrics and don't contain personal data.
 */

// Helper to safely check if we're in development mode
// Vite provides import.meta.env.DEV for development mode detection
const isDevelopment = (): boolean => {
  try {
    // Vite replaces import.meta.env at build time
    return import.meta.env.DEV === true
  } catch {
    return false
  }
}

export function useWebVitals() {
  useEffect(() => {
    // Function to send metrics to analytics
    const sendToAnalytics = (metric: Metric) => {
      // Check if gtag is available (Google Analytics)
      // react-ga4 sets up gtag, so this will work if GA is initialized
      if (typeof window !== "undefined" && (window as any).gtag) {
        try {
          const gtag = (window as any).gtag

          // Send to Google Analytics 4
          // Using the recommended format for Core Web Vitals in GA4
          gtag("event", metric.name, {
            event_category: "Web Vitals",
            event_label: metric.id,
            // CLS is reported as a decimal, convert to integer for consistency
            value: Math.round(
              metric.name === "CLS" ? metric.value * 1000 : metric.value,
            ),
            non_interaction: true,
            // Include additional metric details as custom parameters
            metric_id: metric.id,
            metric_value: metric.value,
            metric_delta: metric.delta,
            // Include rating (good, needs-improvement, poor)
            metric_rating:
              metric.rating === "good"
                ? "good"
                : metric.rating === "needs-improvement"
                  ? "needs-improvement"
                  : "poor",
          })
        } catch (error) {
          // Silently fail if analytics is not properly configured
          if (isDevelopment()) {
            console.warn("[Web Vitals] Failed to send to analytics:", error)
          }
        }
      }

      // Also log to console in development for debugging
      if (isDevelopment()) {
        console.log("[Web Vitals]", {
          name: metric.name,
          value: metric.value,
          rating: metric.rating,
          delta: metric.delta,
          id: metric.id,
        })
      }
    }

    // Track Core Web Vitals
    // These callbacks will be invoked when each metric is ready
    // Metrics are reported once per page load/navigation
    onCLS(sendToAnalytics) // Cumulative Layout Shift
    onFID(sendToAnalytics) // First Input Delay (legacy, still tracked for compatibility)
    onINP(sendToAnalytics) // Interaction to Next Paint (replaces FID in 2024)
    onLCP(sendToAnalytics) // Largest Contentful Paint
    onFCP(sendToAnalytics) // First Contentful Paint
    onTTFB(sendToAnalytics) // Time to First Byte
  }, [])
}
