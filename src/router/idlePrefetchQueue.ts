/**
 * One gentle queue for speculative chunk prefetches (the "likely next page"
 * maps in routePrefetch.ts and componentPrefetch.ts).
 *
 * A dynamic import() also EVALUATES the chunk on the main thread, so firing a
 * page's whole prefetch list at once right after load (as the maps used to)
 * produced long tasks while the page was still rendering its own content, and
 * any tap in that window waited (INP). This queue:
 *
 * - starts only GRACE_MS after the window "load" event;
 * - runs ONE import at a time, each in its own requestIdleCallback slice, and
 *   only when the slice still has time left;
 * - backs off for INPUT_BACKOFF_MS after any pointer or key input, so it never
 *   competes with what the user is doing;
 * - does nothing with Save-Data on or on 2g / slow-2g connections.
 *
 * Failures (e.g. a chunk that 404s right after a deploy) stay silent: each
 * task catches its own error. Prefetching only warms the module cache; real
 * navigations still load through lazyWithRetry / retryDynamicImport.
 * Intent prefetches (hover, touchstart, focus) don't use this queue.
 */

export const GRACE_MS = 1000
export const INPUT_BACKOFF_MS = 1000
const MIN_SLICE_MS = 10

type Task = () => Promise<unknown>

const queue: { key: string; run: Task }[] = []
const seen = new Set<string>()
let started = false
let running = false
let lastInputAt = 0
let initialized = false

export function prefetchAllowed(): boolean {
  if (typeof navigator === "undefined") return false
  const connection = (
    navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string }
    }
  ).connection
  if (connection?.saveData) return false
  if (
    connection?.effectiveType &&
    ["slow-2g", "2g"].includes(connection.effectiveType)
  )
    return false
  return true
}

type IdleDeadlineLike = { timeRemaining(): number; didTimeout: boolean }

function onIdle(cb: (deadline: IdleDeadlineLike) => void) {
  if (typeof window.requestIdleCallback === "function") {
    // Some environments (happy-dom) call back without a deadline
    window.requestIdleCallback(
      (deadline?: IdleDeadlineLike) =>
        cb(
          deadline ?? {
            timeRemaining: () => MIN_SLICE_MS + 1,
            didTimeout: true,
          },
        ),
      { timeout: 10000 },
    )
  } else {
    window.setTimeout(
      () => cb({ timeRemaining: () => MIN_SLICE_MS + 1, didTimeout: false }),
      200,
    )
  }
}

function pump() {
  if (running || !started || queue.length === 0) return
  running = true
  onIdle((deadline) => {
    const sinceInput = Date.now() - lastInputAt
    if (sinceInput < INPUT_BACKOFF_MS) {
      running = false
      window.setTimeout(pump, INPUT_BACKOFF_MS - sinceInput)
      return
    }
    if (!deadline.didTimeout && deadline.timeRemaining() < MIN_SLICE_MS) {
      running = false
      pump()
      return
    }
    const task = queue.shift()!
    task
      .run()
      .catch(() => {})
      .finally(() => {
        running = false
        pump()
      })
  })
}

function init() {
  if (initialized || typeof window === "undefined") return
  initialized = true
  const markInput = () => {
    lastInputAt = Date.now()
  }
  for (const type of ["pointerdown", "keydown", "touchstart"])
    window.addEventListener(type, markInput, { capture: true, passive: true })
  const start = () =>
    window.setTimeout(() => {
      started = true
      pump()
    }, GRACE_MS)
  if (document.readyState === "complete") start()
  else window.addEventListener("load", start, { once: true })
}

/** Queue a speculative prefetch (deduplicated by key). */
export function enqueueIdlePrefetch(key: string, run: Task): void {
  if (!prefetchAllowed() || seen.has(key)) return
  seen.add(key)
  init()
  queue.push({ key, run })
  pump()
}

/** Test helper. */
export function resetIdlePrefetchQueue(): void {
  queue.length = 0
  seen.clear()
  started = false
  running = false
  lastInputAt = 0
  initialized = false
}
