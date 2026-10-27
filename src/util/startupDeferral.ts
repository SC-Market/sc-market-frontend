/**
 * Startup deferral: work the first page load can do without until the page
 * has shown its content.
 *
 * On the first page load a signed-in visitor's chrome (notification and
 * order badges, unread chats, the shops list, push status, the cached
 * profile's refetch) used to send its requests in the same instant as the
 * page's own query. On a phone link they competed with it, and every
 * response re-rendered part of the app while the page was still rendering
 * (measured at 4x CPU / Fast 4G: shell-to-ready ~2.0 s signed in vs ~0.55 s
 * logged out). That work now waits for this gate.
 *
 * The gate opens once, for the rest of the page's life, at whichever comes
 * first:
 * - the page is ready (`main[data-ready]`, PageReadyProvider calls
 *   openStartupGate()), or
 * - STARTUP_DEFER_TIMEOUT_MS after the app's first commit, at the next idle
 *   moment (a page that never settles, an error page).
 *
 * entry.client.tsx arms it before the first render. Unarmed (tests, the
 * server render) it is open, so nothing is ever deferred there.
 */
import { useSyncExternalStore } from "react"

export const STARTUP_DEFER_TIMEOUT_MS = 2000

let armed = false
let open = true
let fallbackStarted = false
const listeners = new Set<() => void>()
const waiters: Array<() => void> = []

/** Called once by entry.client.tsx before the first render. */
export function armStartupDeferral(): void {
  armed = true
  open = false
}

export function isStartupGateOpen(): boolean {
  return open
}

/** Open the gate (idempotent). */
export function openStartupGate(): void {
  if (open) return
  open = true
  for (const listener of [...listeners]) listener()
  for (const resolve of waiters.splice(0)) resolve()
}

/**
 * The app has committed its first render: start the fallback timer. Called
 * by PageReadyProvider on mount.
 */
export function noteAppCommitted(): void {
  if (!armed || open || fallbackStarted) return
  fallbackStarted = true
  window.setTimeout(() => {
    const idle = window.requestIdleCallback
    if (idle) idle(() => openStartupGate(), { timeout: 500 })
    else openStartupGate()
  }, STARTUP_DEFER_TIMEOUT_MS)
}

/** Resolves when the gate opens (at once if it is open). */
export function whenStartupGateOpen(): Promise<void> {
  if (open) return Promise.resolve()
  return new Promise((resolve) => waiters.push(resolve))
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

// Server and hydration renders: closed. Nothing deferred is ever needed for
// the HTML, and the hydration render must not start it before the gate opens.
const serverSnapshot = () => false

/**
 * Whether deferrable startup work may run now. Use it in the `skip` of a
 * query the first paint doesn't need:
 *
 *   const startupDone = useStartupGateOpen()
 *   useGetMyChatsQuery(undefined, { skip: !isLoggedIn || !startupDone })
 *
 * Whatever the query renders must hold its place until then (a badge that
 * appears without moving anything, a reserved slot), so opening the gate
 * shifts nothing.
 */
export function useStartupGateOpen(): boolean {
  return useSyncExternalStore(subscribe, isStartupGateOpen, serverSnapshot)
}

/** Test-only: back to the unarmed (open) state. */
export function resetStartupDeferralForTests(): void {
  armed = false
  open = true
  fallbackStarted = false
  listeners.clear()
  waiters.splice(0)
}
