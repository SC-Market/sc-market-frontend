/**
 * Utility for delaying third-party script loading until page is interactive.
 * 
 * This module provides functions to defer non-critical script loading until
 * after the page has become interactive, improving initial load performance.
 * 
 * Requirements: 7.2 - Delay analytics loading until page interactive
 */

/**
 * Execute a callback when the page becomes interactive.
 * Uses requestIdleCallback if available, otherwise falls back to setTimeout.
 * 
 * @param callback - Function to execute when page is interactive
 * @param timeout - Maximum time to wait in milliseconds (default: 2000)
 * 
 * @example
 * onPageInteractive(() => {
 *   // Load analytics
 *   initializeAnalytics()
 * })
 */
export function onPageInteractive(
  callback: () => void,
  timeout: number = 2000
): void {
  // Check if page is already interactive
  if (document.readyState === 'complete') {
    // Page already loaded, use requestIdleCallback or setTimeout
    if ('requestIdleCallback' in window) {
      requestIdleCallback(callback, { timeout })
    } else {
      setTimeout(callback, 0)
    }
    return
  }

  // Wait for page to become interactive
  const onLoad = () => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(callback, { timeout })
    } else {
      setTimeout(callback, timeout)
    }
  }

  if (document.readyState === 'loading') {
    // Page still loading, wait for DOMContentLoaded
    window.addEventListener('DOMContentLoaded', onLoad, { once: true })
  } else {
    // Page interactive but not complete, wait for load
    window.addEventListener('load', onLoad, { once: true })
  }
}

/**
 * Delay execution until after First Input Delay (FID) or a timeout.
 * This ensures analytics don't interfere with user interactions.
 * 
 * @param callback - Function to execute after FID
 * @param maxDelay - Maximum delay in milliseconds (default: 3000)
 * 
 * @example
 * delayUntilInteraction(() => {
 *   // Load heavy analytics scripts
 *   loadAnalyticsScripts()
 * })
 */
export function delayUntilInteraction(
  callback: () => void,
  maxDelay: number = 3000
): void {
  let executed = false
  
  const execute = () => {
    if (executed) return
    executed = true
    callback()
  }

  // Execute on first user interaction
  const interactionEvents = ['mousedown', 'keydown', 'touchstart', 'pointerdown']
  
  const onInteraction = () => {
    // Use requestIdleCallback to avoid blocking the interaction
    if ('requestIdleCallback' in window) {
      requestIdleCallback(execute, { timeout: 1000 })
    } else {
      setTimeout(execute, 0)
    }
    
    // Remove listeners
    interactionEvents.forEach(event => {
      document.removeEventListener(event, onInteraction)
    })
  }

  // Add interaction listeners
  interactionEvents.forEach(event => {
    document.addEventListener(event, onInteraction, { once: true, passive: true })
  })

  // Fallback: execute after max delay even without interaction
  setTimeout(execute, maxDelay)
}

/**
 * Delay execution until the browser is idle.
 * Uses requestIdleCallback with a timeout fallback.
 * 
 * @param callback - Function to execute during idle time
 * @param timeout - Maximum time to wait in milliseconds (default: 2000)
 * 
 * @example
 * onBrowserIdle(() => {
 *   // Load non-critical scripts
 *   loadNonCriticalScripts()
 * })
 */
export function onBrowserIdle(
  callback: () => void,
  timeout: number = 2000
): void {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(callback, { timeout })
  } else {
    setTimeout(callback, timeout)
  }
}

/**
 * Check if the page is currently interactive.
 * 
 * @returns true if page is interactive or complete
 */
export function isPageInteractive(): boolean {
  return document.readyState === 'interactive' || document.readyState === 'complete'
}

/**
 * Wait for a specific performance timing before executing callback.
 * 
 * @param timing - Performance timing to wait for ('load', 'domcontentloaded', 'firstcontentfulpaint')
 * @param callback - Function to execute after timing
 * 
 * @example
 * waitForTiming('load', () => {
 *   // Execute after page load
 *   initializeNonCriticalFeatures()
 * })
 */
export function waitForTiming(
  timing: 'load' | 'domcontentloaded' | 'firstcontentfulpaint',
  callback: () => void
): void {
  if (timing === 'load') {
    if (document.readyState === 'complete') {
      callback()
    } else {
      window.addEventListener('load', callback, { once: true })
    }
  } else if (timing === 'domcontentloaded') {
    if (document.readyState !== 'loading') {
      callback()
    } else {
      document.addEventListener('DOMContentLoaded', callback, { once: true })
    }
  } else if (timing === 'firstcontentfulpaint') {
    // Use PerformanceObserver to detect FCP
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              callback()
              observer.disconnect()
            }
          }
        })
        observer.observe({ entryTypes: ['paint'] })
      } catch (e) {
        // Fallback to load event
        waitForTiming('load', callback)
      }
    } else {
      // Fallback to load event
      waitForTiming('load', callback)
    }
  }
}
