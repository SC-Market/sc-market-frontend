import { startTransition, useEffect, useState } from "react"

/**
 * True once the browser has been idle after mount (only while `enabled`).
 *
 * The mobile drawer mounts its whole navigation tree on the first tap of the
 * menu button, and that first render inserts ~110 new emotion style rules,
 * which is most of the tap's cost (INP): the first open measured ~500-850 ms at
 * 4x CPU on /market. Pre-mounting the drawer hidden during idle time, as a
 * transition so React renders it in interruptible slices, moves that work off
 * the tap; opening then only runs the slide-in.
 */
export function useWarmWhenIdle(enabled: boolean): boolean {
  const [warm, setWarm] = useState(false)
  useEffect(() => {
    if (!enabled || warm) return
    const warmUp = () => startTransition(() => setWarm(true))
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(warmUp, { timeout: 5000 })
      return () => window.cancelIdleCallback(id)
    }
    const id = window.setTimeout(warmUp, 2000)
    return () => window.clearTimeout(id)
  }, [enabled, warm])
  return warm
}
